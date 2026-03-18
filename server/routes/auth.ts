import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';

const router = Router();

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

// Create initial user (dev only handler - delegates to Supabase Auth)
router.post('/setup', async (req, res) => {
  const { email, password, role, managerId } = req.body;
  try {
    // Use Admin API to create user with email auto-confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: role || 'CLIENT'
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Auth trigger in supabase_schema.sql will automatically create the public.users record
    
    // If it's a client being created by a manager, we need to immediately update their manager_id
    if (managerId && data.user) {
       await supabaseAdmin.from('users').update({ manager_id: managerId }).eq('id', data.user.id);
    }
      
    res.json({ success: true, id: data.user?.id });
  } catch (error: any) {
    console.error('Setup error:', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

export default router;
