import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';

const router = Router();

// Middleware to verify if the user is a CLIENT
const verifyClient = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to verify if the user is a MANAGER
const verifyManager = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Onboarding Templates (Manager) ---

// Get all templates (including global ones with manager_id = null)
router.get('/manager/templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .select('*')
      .or(`manager_id.eq.${managerId},manager_id.is.null`)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching onboarding templates:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Create/Update Template... (omitted for brevity, keeping existing logic)
// ... but ensuring we use the right return types

// --- Assignments & Operations ---

// Assign a template to a client
router.post('/manager/assign', verifyManager, async (req: any, res) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to manager (Check in profiles table)
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('profiles')
      .select('manager_id')
      .eq('user_id', client_id)
      .maybeSingle();

    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied or client not found' });
    }

    // 2. Deactivate previous
    await supabaseAdmin
      .from('client_onboarding_assignments')
      .update({ is_active: false })
      .eq('client_id', client_id)
      .eq('is_active', true);

    // 3. Insert new
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .insert({ client_id, template_id, is_active: true })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error assigning onboarding:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get all client assignments (for the list view)
router.get('/manager/assignments', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .select('*, template:onboarding_templates(name)')
      .eq('is_active', true)
      .filter('client_id', 'in', 
        supabaseAdmin.from('profiles').select('user_id').eq('manager_id', managerId)
      );
    
    // Fallback if the subquery isn't supported in this version of the client
    // or manually fetch client IDs first
    const { data: myClients } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('manager_id', managerId);
    
    const clientIds = (myClients || []).map(c => c.user_id);
    if (clientIds.length === 0) return res.json([]);

    const { data: assignments, error: assignErr } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .select('*, template:onboarding_templates(name)')
      .in('client_id', clientIds)
      .eq('is_active', true);

    if (assignErr) throw assignErr;
    res.json(assignments || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get submissions for a manager''s clients
router.get('/manager/submissions', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data: myClients } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('manager_id', managerId);
    
    const clientIds = (myClients || []).map(c => c.user_id);
    if (clientIds.length === 0) return res.json([]);

    const { data, error } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .select('*, client:profiles!client_id(full_name, avatar_url), template:onboarding_templates(name)')
      .in('client_id', clientIds)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching onboarding submissions:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// --- Client Endpoints ---

router.get('/client/active', verifyClient, async (req: any, res) => {
  const clientId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .select('*, template:onboarding_templates(*)')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/client/submit', verifyClient, async (req: any, res) => {
  const clientId = req.user.id;
  const { template_id, answers_json, assignment_id } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .insert({ client_id: clientId, template_id, answers_json, submitted_at: new Date().toISOString() })
      .select().single();

    if (error) throw error;
    if (assignment_id) {
      await supabaseAdmin.from('client_onboarding_assignments').update({ is_active: false }).eq('id', assignment_id);
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
