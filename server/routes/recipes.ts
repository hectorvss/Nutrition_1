import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';

const router = Router();

// Campos que el cliente puede establecer al crear/editar una receta.
// NUNCA se aceptan manager_id, is_global ni id desde el body.
const RECIPE_FIELDS = [
  'title', 'description', 'image_url', 'category', 'prep_time', 'servings',
  'calories', 'protein', 'carbs', 'fats', 'tags', 'ingredients', 'steps'
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
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const language = await getManagerLanguage(managerId);
    let q = supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('language', language)
      .or(`manager_id.eq.${managerId},is_global.eq.true`)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
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

// PATCH /:id — actualiza una receta del manager (no se pueden editar globales)
router.patch('/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const payload = pickRecipeFields(req.body);
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('manager_id', managerId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Recipe not found' });
    res.json(data);
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
