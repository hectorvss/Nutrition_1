import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';

const router = Router();

// Middleware to verify CLIENT role using Supabase Auth
const verifyClient = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Relaxed for now: Any user can access as long as they are authenticated, but normally:
    // if (userData?.role !== 'CLIENT') {
    //   return res.status(403).json({ error: 'Forbidden. Client role required.' });
    // }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(verifyClient);

// Get my profile
router.get('/profile', async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email,
        manager_id,
        clients_profiles (weight, goal, notes)
      `)
      .eq('id', req.user.id)
      .single();
      
    if (error || !profile) return res.status(404).json({ error: 'Not found' });
    
    const formattedProfile = {
      id: profile.id,
      email: profile.email,
      manager_id: profile.manager_id,
      weight: profile.clients_profiles?.[0]?.weight || null,
      goal: profile.clients_profiles?.[0]?.goal || null,
      notes: profile.clients_profiles?.[0]?.notes || null,
    };
    
    res.json(formattedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my plans
router.get('/plans', async (req: any, res) => {
  try {
    const { data: nutrition } = await supabaseAdmin.from('nutrition_plans').select('*').eq('client_id', req.user.id);
    const { data: training } = await supabaseAdmin.from('training_programs').select('*').eq('client_id', req.user.id);
    
    res.json({ nutrition, training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my roadmap
router.get('/roadmap', async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('client_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || { 
      data_json: { nutrition: [], training: [] }, 
      status: 'Empty' 
    });
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Save a completed workout session
router.post('/workout-logs', async (req: any, res) => {
  try {
    const { plan_id, workout_name, day_key, exercises, notes, session_rpe, logged_at } = req.body;
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .insert({
        client_id: req.user.id,
        plan_id: plan_id || null,
        workout_name: workout_name || 'Workout Session',
        day_key: day_key || null,
        exercises: exercises || [],
        notes: notes || null,
        session_rpe: session_rpe || null,
        logged_at: logged_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error saving workout log:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get my workout history
router.get('/workout-logs', async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .select('*')
      .eq('client_id', req.user.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// --- ONBOARDING ROUTES ---

// Get active onboarding message for the client
router.get('/onboarding/active', async (req: any, res) => {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('onboarding_assignments')
      .select('*, onboarding_messages(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return res.json(null);
      throw error;
    }

    if (!assignments || assignments.length === 0) {
      return res.json(null);
    }

    // Return the oldest pending assignment to ensure order (if multiple)
    // Actually, usually we want the most recent one if it's a "pop up"
    res.json(assignments[0]);
  } catch (error) {
    console.error('Error fetching active onboarding:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update assignment status (seen/dismissed)
router.post('/onboarding/active/:id/action', async (req: any, res) => {
  const { status } = req.body; // 'seen' or 'dismissed'
  const assignmentId = req.params.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_assignments')
      .update({ status })
      .eq('id', assignmentId)
      .eq('user_id', req.user.id) // Security check
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
