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

// Create a new template
router.post('/manager/templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { name, description, template_schema, is_default } = req.body;
  try {
    if (is_default) {
      await supabaseAdmin.from('onboarding_templates').update({ is_default: false }).eq('manager_id', managerId);
    }
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .insert({
        manager_id: managerId,
        name,
        description,
        template_schema: template_schema || [],
        is_default: !!is_default,
        version: 1
      })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a template
router.patch('/manager/templates/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('manager_id', managerId)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a template
router.delete('/manager/templates/:id', verifyManager, async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('onboarding_templates')
      .delete()
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Assignments & Operations ---

// Assign a template to a client
router.post('/manager/assign', verifyManager, async (req: any, res) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to manager (Check in users table - standard source of truth)
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', client_id)
      .single();

    if (clientErr || !client || client.manager_id !== managerId) {
      console.warn(`[Assignment] User ${managerId} attempted to assign onboarding to unauthorized client ${client_id}`);
      return res.status(400).json({ 
        error: 'Invalid client association', 
        message: 'This client does not belong to your account or was not found.' 
      });
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
      .insert({ 
        client_id, 
        template_id, 
        is_active: true,
        assigned_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error assigning onboarding:', error);
    res.status(500).json({ 
      error: `Server error: ${error.message || 'Unknown database error'}`,
      details: error
    });
  }
});

// Get all client assignments (for the list view)
router.get('/manager/assignments', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data: myClients } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT');
    
    const clientIds = (myClients || []).map(c => c.id);
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
    const { data: myClients, error: clientsErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT');
    
    if (clientsErr) throw clientsErr;
    const clientIds = (myClients || []).map(c => c.id);
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
