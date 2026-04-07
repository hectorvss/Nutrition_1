import { supabase, supabaseAdmin } from '../db/index.js';

/**
 * Middleware que verifica que el token JWT es válido y el usuario tiene rol MANAGER.
 * Se usa en todas las rutas de /api/manager, /api/check-ins/manager, /api/onboarding/manager, etc.
 */
export const verifyManager = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
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

    const role = userData?.role || user.user_metadata?.role;

    if (role !== 'MANAGER') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol MANAGER' });
    }

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
export const verifyClient = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const { data, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = data.user;

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = userData?.role || user.user_metadata?.role;

    if (role !== 'CLIENT') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol CLIENT' });
    }

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
export const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error('authenticate: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};
