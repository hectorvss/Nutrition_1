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

// Get all templates
router.get('/manager/templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching onboarding templates:', error);
    res.status(500).json({ error: 'Server error', message: error.message, details: error });
  }
});

// Create a new template
router.post('/manager/templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { name, description, template_schema, is_default } = req.body;

  try {
    if (is_default) {
      await supabaseAdmin
        .from('onboarding_templates')
        .update({ is_default: false })
        .eq('manager_id', managerId);
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
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating onboarding template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a template
router.patch('/manager/templates/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('manager_id', managerId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating onboarding template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a template
router.delete('/manager/templates/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('onboarding_templates')
      .delete()
      .eq('id', id)
      .eq('manager_id', managerId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting onboarding template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Assignments (Sending Onboarding) ---

// Assign a template to a client (Send pop-up)
router.post('/manager/assign', verifyManager, async (req: any, res) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Verify ownerships
    const { data: client } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', client_id)
      .single();

    if (client?.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 2. Deactivate previous active assignments for this client
    await supabaseAdmin
      .from('client_onboarding_assignments')
      .update({ is_active: false })
      .eq('client_id', client_id)
      .eq('is_active', true);

    // 3. Create new assignment
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .insert({
        client_id,
        template_id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error assigning onboarding:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Client Endpoints ---

// Get active onboarding assignment
router.get('/client/active', verifyClient, async (req: any, res) => {
  const clientId = req.user.id;

  try {
    const { data: assignment, error } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .select(`
        *,
        template:onboarding_templates(*)
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    res.json(assignment);
  } catch (error: any) {
    console.error('Error fetching active onboarding:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit onboarding
router.post('/client/submit', verifyClient, async (req: any, res) => {
  const clientId = req.user.id;
  const { template_id, answers_json, assignment_id } = req.body;

  try {
    // 1. Save submission
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .insert({
        client_id: clientId,
        template_id,
        answers_json,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Mark assignment as inactive (completed)
    if (assignment_id) {
      await supabaseAdmin
        .from('client_onboarding_assignments')
        .update({ is_active: false })
        .eq('id', assignment_id);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error submitting onboarding:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
