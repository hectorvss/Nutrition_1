import type { Request, Response, NextFunction } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../db/index.js';
import { looksLikeApiKey, resolveApiKey, apiKeyAllowsUrl, scopeForUrl } from '../lib/apiKeys.js';

/**
 * Express Request enriquecido por verifyManager / verifyClient / authenticate.
 * Los middlewares cuelgan el `user` autenticado (Supabase Auth) en `req.user`.
 * Los handlers deberian usar este tipo en lugar de `req: any`.
 */
export interface AuthedRequest extends Request {
  user?: User;
  apiKey?: { managerId: string; scopes: string[]; keyId: string };
  viaApiKey?: boolean;
}

// Autentica una request de MANAGER por clave API personal (Bearer nfm_...).
// Devuelve true si la manejó (envió respuesta o llamó next); false si el token
// NO es una API key y hay que seguir con el flujo JWT normal.
async function tryApiKeyManager(req: AuthedRequest, res: Response, next: NextFunction, token: string): Promise<boolean> {
  if (!looksLikeApiKey(token)) return false;
  const resolved = await resolveApiKey(token);
  if (!resolved) { res.status(401).json({ error: 'Invalid or revoked API key' }); return true; }
  // Gestión de claves NUNCA por clave API (evita que una clave cree más claves).
  if ((req.originalUrl || '').includes('/api-keys')) {
    res.status(403).json({ error: 'api_key_management_forbidden', message: 'Las claves API se gestionan desde una sesión con login, no con otra clave API.' });
    return true;
  }
  if (!apiKeyAllowsUrl(req.originalUrl || '', resolved.scopes)) {
    res.status(403).json({ error: 'insufficient_scope', message: `Esta clave API no tiene permiso para "${scopeForUrl(req.originalUrl || '')}".` });
    return true;
  }
  req.user = { id: resolved.managerId, role: 'MANAGER' } as any;
  req.apiKey = resolved;
  req.viaApiKey = true;
  next();
  return true;
}

/**
 * Middleware que verifica que el token JWT es válido y el usuario tiene rol MANAGER.
 * Se usa en todas las rutas de /api/manager, /api/check-ins/manager, /api/onboarding/manager, etc.
 */
export const verifyManager = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    // Clave API personal (acceso programático / MCP). Si maneja la request, salimos.
    if (await tryApiKeyManager(req, res, next, token)) return;

    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = data.user;

    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('role, id')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('verifyManager: DB error', dbError);
      return res.status(500).json({ error: 'Error verifying user role' });
    }

    // DB is the source of truth for role. NEVER fall back to user_metadata —
    // it is user-mutable via supabase.auth.updateUser and would allow privilege escalation.
    if (!userData || userData.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol MANAGER' });
    }

    (user as any).role = userData.role;
    req.user = user;
    next();
  } catch (err) {
    console.error('verifyManager: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware que verifica que el token JWT es válido y el usuario tiene rol CLIENT.
 * Se usa en todas las rutas de /api/client, /api/check-ins/client, /api/onboarding/client, etc.
 */
export const verifyClient = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    // Validate the JWT through the anon client, same as verifyManager — using
    // the service-role client here would be a footgun if env vars get crossed.
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = data.user;

    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('verifyClient: DB error', dbError);
      return res.status(500).json({ error: 'Error verifying user role' });
    }

    // DB is the source of truth — never trust user_metadata for authorization.
    if (!userData || userData.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol CLIENT' });
    }

    (user as any).role = userData.role;
    req.user = user;
    next();
  } catch (err) {
    console.error('verifyClient: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware que acepta cualquier usuario autenticado (CLIENT o MANAGER).
 * Se usa en /api/messages que es bidireccional.
 */
export const authenticate = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    // Clave API personal de manager (p.ej. enviar mensajes vía API).
    if (await tryApiKeyManager(req, res, next, token)) return;

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Look up the app role from the users table so downstream handlers (e.g.
    // enforceMonthlyMessages in /api/messages) can distinguish managers from
    // clients. Without this, `req.user.role` is undefined and any check like
    // `req.user.role === 'MANAGER'` silently treats every caller as a client.
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    (data.user as any).role = userData?.role || null;
    req.user = data.user;
    next();
  } catch (err) {
    console.error('authenticate: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
