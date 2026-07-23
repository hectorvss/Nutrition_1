// CRUD de claves API personales del manager. Montado en /api/manager/api-keys.
// Solo accesible con sesión (JWT): el verifyManager compartido BLOQUEA gestionar
// claves usando otra clave API (evita escalada). La clave en claro se devuelve
// UNA sola vez al crearla.
import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { safeErr } from '../lib/http.js';
import { verifyManager, type AuthedRequest } from '../middleware/auth.js';
import { generateApiKey, API_SCOPES } from '../lib/apiKeys.js';

const router = Router();
router.use(verifyManager);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET / — lista de claves (sin la clave en claro; nunca se puede recuperar).
router.get('/', async (req: AuthedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, scopes, last_used_at, expires_at, revoked_at, created_at')
      .eq('manager_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ keys: data || [], scopes: API_SCOPES });
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST / — crea una clave. Devuelve la clave en claro SOLO en esta respuesta.
router.post('/', async (req: AuthedRequest, res) => {
  try {
    const name = typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim().slice(0, 80) : null;
    if (!name) return res.status(400).json({ error: 'name_required', message: 'Ponle un nombre a la clave.' });

    const rawScopes: string[] = Array.isArray(req.body?.scopes) ? req.body.scopes : [];
    let scopes = rawScopes.filter((s) => (API_SCOPES as readonly string[]).includes(s));
    if (scopes.length === 0) scopes = ['full']; // por defecto, acceso completo
    if (scopes.includes('full')) scopes = ['full'];

    let expires_at: string | null = null;
    const days = Number(req.body?.expires_in_days);
    if (Number.isFinite(days) && days > 0 && days <= 3650) {
      expires_at = new Date(Date.now() + days * 86400000).toISOString();
    }

    // Límite defensivo: máx. 20 claves vivas por manager.
    const { count } = await supabaseAdmin
      .from('api_keys').select('id', { count: 'exact', head: true })
      .eq('manager_id', req.user!.id).is('revoked_at', null);
    if ((count || 0) >= 20) return res.status(400).json({ error: 'too_many_keys', message: 'Has alcanzado el máximo de claves activas (20). Revoca alguna.' });

    const { plaintext, hash, prefix } = generateApiKey();
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({ manager_id: req.user!.id, name, key_hash: hash, key_prefix: prefix, scopes, expires_at })
      .select('id, name, key_prefix, scopes, expires_at, created_at')
      .single();
    if (error) throw error;

    res.json({ ...data, key: plaintext });
  } catch (error: any) {
    console.error('Error creating api key:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// POST /:id/revoke — desactiva una clave (irreversible).
router.post('/:id/revoke', async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin
      .from('api_keys').update({ revoked_at: new Date().toISOString() })
      .eq('id', id).eq('manager_id', req.user!.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

// DELETE /:id — elimina la fila por completo.
router.delete('/:id', async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(String(id))) return res.status(400).json({ error: 'Invalid id' });
    const { error } = await supabaseAdmin
      .from('api_keys').delete().eq('id', id).eq('manager_id', req.user!.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

export default router;
