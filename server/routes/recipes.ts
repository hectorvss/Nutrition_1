import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';

const router = Router();

// Defensive: the auth middleware should always populate req.user.id with a
// valid Supabase UUID, but we interpolate it into PostgREST `.or()` strings
// below. Validate the shape before letting anything reach that path so a
// malformed identity (e.g. if the auth layer ever changes) can't inject
// filter syntax.
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const isUuid = (s: unknown): s is string => typeof s === 'string' && UUID_RE.test(s);

// Campos que el cliente puede establecer al crear/editar una receta.
// NUNCA se aceptan manager_id, is_global ni id desde el body.
const RECIPE_FIELDS = [
  'title', 'description', 'image_url', 'category', 'prep_time', 'servings',
  'calories', 'protein', 'carbs', 'fats', 'tags', 'ingredients', 'steps',
  // Bloques de ficha detallada (alta fidelidad).
  'difficulty', 'cook_time', 'fiber', 'sugar', 'saturated_fat', 'sodium',
  'allergens', 'diet_labels', 'equipment', 'tips', 'storage',
];

const pickRecipeFields = (body: any) => {
  const out: any = {};
  for (const key of RECIPE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
};

// Resolves the manager's UI language ('es' | 'en') from their profile.
const getManagerLanguage = async (managerId: string): Promise<string> => {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('language')
    .eq('user_id', managerId)
    .maybeSingle();
  return data?.language === 'en' ? 'en' : 'es';
};

// GET / — recetas del manager + las globales, en el idioma del manager
// Paginadas DESC por created_at con keyset cursor.
router.get('/', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  if (!isUuid(managerId)) return res.status(400).json({ error: 'Invalid user id' });
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const language = await getManagerLanguage(managerId);

    // Presets globales que este manager ya ha editado (tiene una copia propia).
    // Se ocultan para que el manager NUNCA vea el original junto a su versión
    // editada — solo ve su receta. El preset global sigue intacto para el resto.
    const { data: derived } = await supabaseAdmin
      .from('recipes')
      .select('source_recipe_id')
      .eq('manager_id', managerId)
      .not('source_recipe_id', 'is', null);
    const overriddenIds = Array.from(
      new Set((derived || []).map((r: any) => r.source_recipe_id).filter(Boolean))
    );

    let q = supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('language', language)
      .or(`manager_id.eq.${managerId},is_global.eq.true`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    if (overriddenIds.length) {
      q = q.not('id', 'in', `(${overriddenIds.map((id) => `"${id}"`).join(',')})`);
    }
    q = applyCursor(q, page.cursor, 'created_at', 'desc');
    const { data, error } = await q;

    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'created_at'));
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// GET /:id — una receta (del manager o global)
router.get('/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  if (!isUuid(managerId)) return res.status(400).json({ error: 'Invalid user id' });
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('id', req.params.id)
      .or(`manager_id.eq.${managerId},is_global.eq.true`)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Recipe not found' });
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST / — crea una receta del manager (is_global=false)
router.post('/', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const payload = pickRecipeFields(req.body);
    const language = await getManagerLanguage(managerId);
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .insert({
        ...payload,
        manager_id: managerId,
        is_global: false,
        language,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// PATCH /:id — actualiza la receta del manager; si la receta es un preset
// global, se clona en una copia propia del manager con los cambios aplicados
// (copy-on-write), dejando el preset intacto para el resto de coaches.
router.patch('/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const payload = pickRecipeFields(req.body);

    // 1. Intentar actualizar una receta propia del manager.
    const { data: own, error: ownErr } = await supabaseAdmin
      .from('recipes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('manager_id', managerId)
      .select();
    if (ownErr) throw ownErr;
    if (own && own.length) return res.json(own[0]);

    // 2. No es suya — copy-on-write desde el preset global.
    const { data: src, error: srcErr } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_global', true)
      .maybeSingle();
    if (srcErr) throw srcErr;
    if (!src) return res.status(404).json({ error: 'Recipe not found' });

    const language = await getManagerLanguage(managerId);
    const clone: any = {};
    for (const f of RECIPE_FIELDS) clone[f] = src[f];
    Object.assign(clone, payload);
    clone.manager_id = managerId;
    clone.is_global = false;
    clone.language = language;
    // Vínculo con el preset global de origen: GET / oculta ese preset a este
    // manager para que solo vea su versión editada (sin duplicados visibles).
    clone.source_recipe_id = req.params.id;

    const { data: created, error: insErr } = await supabaseAdmin
      .from('recipes')
      .insert(clone)
      .select()
      .single();
    if (insErr) throw insErr;
    res.json(created);
  } catch (error: any) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// DELETE /:id — borra una receta del manager
router.delete('/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .delete()
      .eq('id', req.params.id)
      .eq('manager_id', managerId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Recipe not found' });
    res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

export default router;
