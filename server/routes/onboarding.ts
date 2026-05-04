import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager, verifyClient } from '../middleware/auth.js';

const router = Router();

const FIXED_ONBOARDING_QUESTIONS = [
  {
    id: 'core_info',
    title: 'Core Information',
    subtitle: 'Basic data for your profile',
    type: 'info_card',
    questions: [
      { id: 'height', title: 'Current Height (cm)', type: 'number', unit: 'cm', required: true },
      { id: 'weight', title: 'Current Weight (kg)', type: 'number', unit: 'kg', required: true },
      { id: 'goal', title: 'Primary Goal', type: 'text', required: true },
      { id: 'target_weight', title: 'Target Weight (kg)', type: 'number', unit: 'kg', required: false },
      { id: 'body_fat', title: 'Estimated Body Fat %', type: 'number', unit: '%', required: false }
    ]
  },
  {
    id: 'dietary_info',
    title: 'Dietary & Health',
    subtitle: 'Nutritional preferences and health status',
    type: 'info_card',
    questions: [
      { id: 'dietary_style', title: 'Dietary Style', type: 'select', options: ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Omnivore', 'No preference'], required: true },
      { id: 'allergies', title: 'Allergies / Intolerances', type: 'long_text', required: true, placeholder: 'List any allergies or intolerances...' },
      { id: 'supplementation', title: 'Current Supplementation', type: 'long_text', required: false, placeholder: 'List supplements you are currently taking...' }
    ]
  },
  {
    id: 'measurements_step',
    title: 'Initial Measurements',
    subtitle: 'Base metrics for progress tracking',
    questions: [
      {
        id: 'initial_measurements',
        title: 'Measurements (cm)',
        type: 'measurement_group',
        options: ['waist', 'hip', 'thigh_r', 'arm_r']
      }
    ]
  }
];

const injectFixedQuestions = (schema: any[]) => {
  // Ensure we don't duplicate questions if the manager already added them with same IDs
  const fixedIds = new Set(FIXED_ONBOARDING_QUESTIONS.flatMap(s => [s.id, ...(s.questions?.map(q => q.id) || [])]));
  const customSchema = (schema || []).filter(step => {
     if (fixedIds.has(step.id)) return false;
     // Deep check questions
     if (step.questions) {
        step.questions = step.questions.filter((q: any) => !fixedIds.has(q.id));
     }
     return true;
  });
  return [...FIXED_ONBOARDING_QUESTIONS, ...customSchema];
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
  const { name, description, template_schema, is_default } = req.body;
  const patch: Record<string, any> = { updated_at: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;
  if (template_schema !== undefined) patch.template_schema = template_schema;
  if (is_default !== undefined) patch.is_default = !!is_default;
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .update(patch)
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

    // 2. Ensure profile exists for foreign key (safety for new/legacy users)
    await supabaseAdmin.from('profiles').upsert({ user_id: client_id }, { onConflict: 'user_id' });

    // 3. Deactivate previous
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
      .select('*, client:profiles!client_id(full_name, avatar_url), template:onboarding_templates(id, name, template_schema)')
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
    if (data && (data as any).template) {
       (data as any).template.template_schema = injectFixedQuestions((data as any).template.template_schema);
    }
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

    // --- Sync Fixed Questions to Profile ---
    try {
      const answers = answers_json as any;
      const updates: any = {};
      
      // Look for weight/goal
      const weight = answers.weight || answers.Weight || answers['Current Weight'];
      const goal = answers.goal || answers.Goal || answers['Primary Goal'];
      const supplementation = answers.supplementation || answers.Supplementation || answers['Are you taking any supplements?'];
      const height = answers.height || answers.Height || answers['Current Height'];
      const allergies = answers.allergies || answers.Allergies || answers['Do you have any allergies?'];

      const targetWeight = answers.target_weight || answers['Target Weight'];
      const bodyFat = answers.body_fat || answers['Body Fat %'];
      const diet = answers.dietary_style || answers['Dietary Style'];

      if (weight) updates.weight = Number(weight) || 0;
      if (goal) updates.goal = goal;
      if (height) updates.height = Number(height) || 0;
      
      if (allergies || supplementation) {
        // Fetch current metadata to avoid overwriting other fields
        const { data: profile } = await supabaseAdmin
          .from('clients_profiles')
          .select('metadata')
          .eq('user_id', clientId)
          .single();
        
        const newMetadata = { ...(profile?.metadata || {}) };
        if (allergies) newMetadata.allergies = Array.isArray(allergies) ? allergies : [allergies];
        if (supplementation) newMetadata.supplementation = Array.isArray(supplementation) ? supplementation : [supplementation];
        if (targetWeight) newMetadata.target_weight = targetWeight;
        if (bodyFat) newMetadata.body_fat = bodyFat;
        if (diet) newMetadata.dietary_style = diet;
        
        // Initial Measurements
        const m = {
          waist: answers.waist || answers.Waist || answers['Waist (cm)'],
          hip: answers.hip || answers.Hip || answers['Hip (cm)'],
          thigh_r: answers.thigh_r || answers.Thigh || answers['Right Thigh (cm)'],
          arm_r: answers.arm_r || answers.Arm || answers['Right Arm (cm)']
        };
        if (Object.values(m).some(v => v !== undefined && v !== null)) {
          newMetadata.measurements = { ...(newMetadata.measurements || {}), ...m };
        }
        
        updates.metadata = newMetadata;
      }

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('clients_profiles')
          .update(updates)
          .eq('user_id', clientId);
      }
    } catch (syncErr) {
      console.error('Error syncing onboarding data to profile:', syncErr);
    }

    if (assignment_id) {
      await supabaseAdmin.from('client_onboarding_assignments').update({ is_active: false }).eq('id', assignment_id);
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
