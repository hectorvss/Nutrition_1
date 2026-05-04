import { Router } from 'express';
import crypto from 'crypto';
import { supabase, supabaseAdmin } from '../db/index.js';

const router = Router();

const timingSafeStrEqual = (a: string | undefined, b: string | undefined) => {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message || 'Invalid credentials' });
    }

    // Get role from our custom users table (bypassing RLS with Admin)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, manager_id')
      .eq('id', authData.user.id)
      .single();
      
    if (userError) {
       console.warn('User missing in custom table', userError);
    }

    // Update last_login if user is a CLIENT
    if (userData?.role === 'CLIENT') {
      await supabaseAdmin
        .from('clients_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', authData.user.id);
    }

    res.json({
      token: authData.session.access_token,
      user: userData || {
        id: authData.user.id,
        email: authData.user.email,
        role: 'CLIENT' // fallback
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user — protegido por rol
// - Para crear MANAGER: requiere cabecera x-setup-secret con SETUP_SECRET del .env
// - Para crear CLIENT: requiere JWT válido de un MANAGER autenticado
router.post('/setup', async (req: any, res) => {
  const { email, password, role = 'CLIENT', managerId } = req.body;
  const targetRole = (role || 'CLIENT').toUpperCase();

  try {
    if (targetRole === 'MANAGER') {
      // Solo se puede crear un manager con el secret de setup (onboarding inicial del sistema)
      const secret = req.headers['x-setup-secret'] as string | undefined;
      const validSecret = process.env.SETUP_SECRET;
      if (!validSecret) {
        return res.status(500).json({ error: 'Server misconfigured: SETUP_SECRET not set' });
      }
      if (!timingSafeStrEqual(secret, validSecret)) {
        return res.status(403).json({ error: 'Forbidden: se requiere x-setup-secret para crear managers' });
      }
      // Block reuse: once any MANAGER exists, refuse further manager creation via this endpoint.
      const { count: managerCount } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'MANAGER');
      if ((managerCount || 0) > 0) {
        return res.status(403).json({ error: 'Setup already completed: a manager already exists' });
      }
    } else {
      // Para crear clientes: el caller debe ser un MANAGER autenticado
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: se requiere autenticación para crear usuarios' });
      }

      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const { data: callerData } = await supabaseAdmin
        .from('users')
        .select('role, id')
        .eq('id', authData.user.id)
        .maybeSingle();

      // DB is the source of truth — never trust user_metadata for authorization.
      if (!callerData || callerData.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Forbidden: solo los managers pueden crear clientes' });
      }

      // El managerId del cliente es el caller si no se especifica
      req.body.managerId = managerId || callerData?.id || authData.user.id;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: targetRole }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (req.body.managerId && data.user) {
      await supabaseAdmin
        .from('users')
        .update({ manager_id: req.body.managerId })
        .eq('id', data.user.id);
    }

    res.json({ success: true, id: data.user?.id });
  } catch (error: any) {
    console.error('Setup error:', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

// GET /me — Endpoint para validar sesión y obtener rol desde el servidor
// El frontend lo usa al arrancar para no depender solo de localStorage
router.get('/me', async (req: any, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, email, role, manager_id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!userData) {
      // No row in users table = unprovisioned account. Reject — never derive role from JWT metadata.
      return res.status(403).json({ error: 'User not provisioned' });
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('GET /me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /forgot-password — Enviar email de reset via Supabase
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Formato de email inválido' });

  try {
    const redirectUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      // No revelamos si el email existe o no (seguridad)
    }

    // Siempre respondemos OK para no filtrar si el email existe
    res.json({ success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /reset-password — Cambiar contraseña con token de Supabase
router.post('/reset-password', async (req: any, res) => {
  const { access_token, new_password } = req.body;
  if (!access_token || !new_password) {
    return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    // Usar el token del email para obtener al usuario y actualizar su password
    const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Token de reset inválido o expirado' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { password: new_password }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
