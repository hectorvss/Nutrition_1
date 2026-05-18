import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';

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

// GET / — recetas del manager + las globales, ordenadas por created_at desc
router.get('/', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .or(`manager_id.eq.${managerId},is_global.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
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
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST / — crea una receta del manager (is_global=false)
router.post('/', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const payload = pickRecipeFields(req.body);
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .insert({
        ...payload,
        manager_id: managerId,
        is_global: false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
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
    res.status(500).json({ error: 'Server error', message: error.message });
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
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

export default router;
