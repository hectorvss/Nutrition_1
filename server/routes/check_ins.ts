import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { processTrigger } from './automations.js';

const router = Router();

const FIXED_CHECKIN_QUESTIONS = [
  {
    id: 'measurements_step',
    title: 'Weekly Measurements',
    subtitle: 'Track your physical progress',
    questions: [
      {
        id: 'measurements',
        title: 'Body Measurements (cm)',
        type: 'measurement_group',
        options: ['weight', 'waist', 'hip', 'thigh_r', 'arm_r']
      }
    ]
  },
  {
    id: 'macros_step',
    title: 'Plan Adherence',
    subtitle: 'Nutrition and macro tracking',
    questions: [
      { id: 'protein', title: 'Avg. Daily Protein (g)', type: 'number', unit: 'g', required: true },
      { id: 'carbs', title: 'Avg. Daily Carbs (g)', type: 'number', unit: 'g', required: true },
      { id: 'fats', title: 'Avg. Daily Fats (g)', type: 'number', unit: 'g', required: true },
      { id: 'calories', title: 'Avg. Daily Calories (kcal)', type: 'number', unit: 'kcal', required: true },
      { id: 'adherence_score', title: 'Plan Adherence (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { id: 'fatigue', title: 'Fatigue Level (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true }
    ]
  }
];

const injectFixedQuestions = (schema: any[]) => {
  const fixedIds = new Set(FIXED_CHECKIN_QUESTIONS.flatMap(s => [s.id, ...(s.questions?.map(q => q.id) || [])]));
  const customSchema = (schema || []).filter(step => {
     if (fixedIds.has(step.id)) return false;
     if (step.questions) {
        step.questions = step.questions.filter((q: any) => !fixedIds.has(q.id));
     }
     return true;
  });
  return [...FIXED_CHECKIN_QUESTIONS, ...customSchema];
};
// ... (rest of the code until POST /client/check-ins)

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

// Manager verification for accessing client check-ins
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

// Client: Submit a new check-in
router.post('/client/check-ins', verifyClient, async (req: any, res) => {
  const { data_json, date } = req.body;
  const clientId = req.user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .insert({
        client_id: clientId,
        date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        data_json: data_json || {}
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Automations
    try {
      const { data: client } = await supabaseAdmin
        .from('users')
        .select('manager_id, clients_profiles(goal, weight)')
        .eq('id', clientId)
        .single();
      
      if (client?.manager_id) {
        const weight = data_json?.weight;
        const goal = client.clients_profiles?.[0]?.goal;
        
        if (weight && goal) {
          // Check if goal hit (assuming simple weight target for milestone)
          // Adjust logic based on goal type if needed
          const isGoalMet = Math.abs(Number(weight) - Number(goal)) < 0.5;
          if (isGoalMet) {
            processTrigger(client.manager_id, 'milestone', { clientId, weight, goal });
          }
        }
      }
    } catch (triggerErr) {
      console.error('Automation trigger error (check-in):', triggerErr);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error submitting check-in:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Client: Get my check-in history
router.get('/client/check-ins', verifyClient, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching client check-ins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Client: Get a single check-in by ID
router.get('/client/check-ins/:checkInId', verifyClient, async (req: any, res) => {
  const { checkInId } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .eq('client_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching single check-in:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Get check-ins list for a specific client
router.get('/manager/clients/:id/check-ins', verifyManager, async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    // 1. Verify client exists and check linkage
    const { data: userData, error: clientErr } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email, 
        manager_id,
        profiles!left (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (clientErr || !userData) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (userData.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Client belongs to another manager' });
    }

    // Transform for frontend expected format (name/avatar)
    const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
    const client = {
      id: userData.id,
      email: userData.email,
      name: profile?.full_name || userData.email,
      avatar: profile?.avatar_url
    };

    // 2. Fetch check-ins from both legacy and dynamic tables
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false });

    if (legacyError) throw legacyError;

    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('client_id', id)
      .order('submitted_at', { ascending: false });

    if (dynamicError) throw dynamicError;

    // 3. Map to unified format
    const legacyParsed = (legacyData || []).map((ci: any) => ({
      ...ci,
      type: 'legacy',
      reviewed_at: ci.reviewed_at || (ci.data_json?.reviewed_at) || null,
      coach_notes: ci.coach_notes || (ci.data_json?.coach_notes) || null,
      next_week_focus: ci.next_week_focus || (ci.data_json?.next_week_focus) || null
    }));

    const dynamicParsed = (dynamicData || []).map((ci: any) => ({
      id: ci.id,
      client_id: ci.client_id,
      date: ci.submitted_at,
      created_at: ci.submitted_at,
      status: ci.status,
      reviewed_at: ci.reviewed_at,
      data_json: ci.answers_json,
      template_id: ci.template_id,
      template: ci.template ? {
        ...ci.template,
        templateSchema: ci.template.template_schema
      } : null,
      type: 'dynamic',
      coach_notes: ci.coach_notes || null,
      next_week_focus: ci.next_week_focus || null
    }));

    // Merge and sort
    const allCheckIns = [...legacyParsed, ...dynamicParsed].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ client: client, check_ins: allCheckIns });
  } catch (error: any) {
    console.error('Error fetching client check-ins for manager:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Get a single check-in by ID
router.get('/manager/clients/:id/check-ins/:checkInId', verifyManager, async (req: any, res) => {
  const { id, checkInId } = req.params;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to this manager
    const { data: userData, error: clientErr } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email, 
        manager_id,
        profiles!left (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (clientErr || !userData || userData.manager_id !== managerId) {
      console.warn(`Manager Single Check-in Access Denied: Manager ${managerId} tried to access client ${id}.`);
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
    const client = {
      id: userData.id,
      email: userData.email,
      name: profile?.full_name || userData.email,
      avatar: profile?.avatar_url
    };

    // 2. Attempt to fetch from client_checkin_submissions (new)
    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select(`
        *,
        template:checkin_templates(*)
      `)
      .eq('id', checkInId)
      .maybeSingle();

    if (dynamicError) throw dynamicError;

    if (dynamicData) {
      // Prioritize snapshot if available
      const template = dynamicData.template_snapshot_json || (dynamicData.template ? {
        ...dynamicData.template,
        templateSchema: dynamicData.template.template_schema
      } : null);

      const formatted = {
        ...dynamicData,
        date: dynamicData.submitted_at,
        created_at: dynamicData.submitted_at,
        data_json: dynamicData.answers_json,
        template,
        type: 'dynamic'
      };
      return res.json({ client, check_in: formatted });
    }

    // 3. Fallback to check_ins (legacy)
    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .single();
    
    if (legacyError) throw legacyError;
    
    let dj = legacyData.data_json;
    if (typeof dj === 'string') {
      try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
    }

    const formatted = {
      ...legacyData,
      data_json: dj,
      type: 'legacy',
      reviewed_at: legacyData.reviewed_at || dj?.reviewed_at || null,
      coach_notes: legacyData.coach_notes || dj?.coach_notes || null,
      next_week_focus: legacyData.next_week_focus || dj?.next_week_focus || null
    };

    res.json({ client, check_in: formatted });
  } catch (error: any) {
    console.error('Error fetching single check-in for manager:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Save coach review/assessment for a check-in
router.post('/manager/clients/:id/check-ins/:checkInId/review', verifyManager, async (req: any, res) => {
  const { id, checkInId } = req.params;
  const { coach_notes, next_week_focus } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', id)
      .single();

    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // 2. Try to update dynamic table first
    const reviewedAt = new Date().toISOString();
    const { data: dynamicUpdate, error: dynamicUpdateError } = await supabaseAdmin
      .from('client_checkin_submissions')
      .update({ coach_notes, next_week_focus, reviewed_at: reviewedAt, status: 'reviewed' })
      .eq('id', checkInId)
      .select()
      .maybeSingle();

    if (dynamicUpdateError) throw dynamicUpdateError;
    if (dynamicUpdate) {
       return res.json({ success: true, data: dynamicUpdate });
    }

    // 3. Fallback to legacy table
    const { data: legacyUpdate, error: legacyUpdateError } = await supabaseAdmin
      .from('check_ins')
      .update({ coach_notes, next_week_focus, reviewed_at: reviewedAt })
      .eq('id', checkInId)
      .select()
      .single();

    if (legacyUpdateError) {
      // 4. If columns are missing (42703), fallback to storing in data_json
      if (legacyUpdateError.code === '42703') {
        const { data: current } = await supabaseAdmin
          .from('check_ins')
          .select('data_json')
          .eq('id', checkInId)
          .single();
        
        const new_dj = { 
          ...(current?.data_json || {}), 
          coach_notes, 
          next_week_focus, 
          reviewed_at: reviewedAt 
        };

        const { error: fallbackError } = await supabaseAdmin
          .from('check_ins')
          .update({ data_json: new_dj })
          .eq('id', checkInId);
        
        if (fallbackError) throw fallbackError;
        return res.json({ success: true, method: 'data_json' });
      }
      throw legacyUpdateError;
    }

    res.json({ success: true, data: legacyUpdate, method: 'columns' });
  } catch (error: any) {
    console.error('Error saving coach review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Check-in Templates Routes ---

// Manager: Get all templates (active only)
router.get('/manager/checkin-templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('manager_id', managerId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Create a new template
router.post('/manager/checkin-templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { name, description, template_schema, is_default } = req.body;

  try {
    if (is_default) {
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_default: false })
        .eq('manager_id', managerId);
    }

    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
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
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Update a template (Rename, Schema, Status)
router.patch('/manager/checkin-templates/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: current } = await supabaseAdmin
      .from('checkin_templates')
      .select('version, template_schema')
      .eq('id', id)
      .single();

    let newVersion = current?.version || 1;
    if (updates.template_schema && JSON.stringify(updates.template_schema) !== JSON.stringify(current?.template_schema)) {
      newVersion += 1;
    }

    if (updates.is_default) {
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_default: false })
        .eq('manager_id', managerId);
    }

    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .update({
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('manager_id', managerId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Duplicate a template
router.post('/manager/checkin-templates/:id/duplicate', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;

  try {
    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (fetchErr || !original) return res.status(404).json({ error: 'Template not found' });

    const { data, error } = await supabaseAdmin
      .from('checkin_templates')
      .insert({
        manager_id: managerId,
        name: `${original.name} (Copy)`,
        description: original.description,
        template_schema: original.template_schema,
        version: 1,
        is_active: true,
        is_archived: false,
        is_default: false
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: Delete/Archive a template
router.delete('/manager/checkin-templates/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;

  try {
    // 1. Verify ownership and check usage
    const { count: submissionCount } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id);

    const { count: assignmentCount } = await supabaseAdmin
      .from('client_checkin_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', id);

    if ((submissionCount || 0) > 0 || (assignmentCount || 0) > 0) {
      // Soft-delete if in use
      await supabaseAdmin
        .from('checkin_templates')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .eq('manager_id', managerId);
      return res.json({ success: true, method: 'archived' });
    }

    // Hard delete if clean
    const { error } = await supabaseAdmin
      .from('checkin_templates')
      .delete()
      .eq('id', id)
      .eq('manager_id', managerId);

    if (error) throw error;
    res.json({ success: true, method: 'deleted' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Template Assignment Routes ---

// GET /manager/checkin-assignments
// List active assignments for manager's clients
router.get('/manager/checkin-assignments', verifyManager, async (req: any, res: any) => {
  // We assume verifyManager already sets req.user and checks manager role if needed
  const managerId = req.user.id;
  try {
    // We need to fetch assignments for clients that belong to this manager
    const { data, error } = await supabaseAdmin
      .from('client_checkin_assignments')
      .select(`
        *,
        template:checkin_templates(id, name),
        client:users!client_id(id, manager_id)
      `)
      .eq('is_active', true);

    if (error) throw error;

    // Filter by manager_id in memory or ideally via a complex join
    // Since we joined with users!client_id, we can filter
    const filtered = (data || []).filter((a: any) => a.client?.manager_id === managerId);

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /manager/assign-template
// Assign a template to a client
router.post('/manager/assign-template', verifyManager, async (req: any, res: any) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;
  try {
    // 1. Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', client_id)
      .single();
    
    if (clientErr || !client || client.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Client belongs to another manager' });
    }

    // 2. Verify template belongs to this manager
    const { data: template, error: templateErr } = await supabaseAdmin
      .from('checkin_templates')
      .select('id, manager_id')
      .eq('id', template_id)
      .single();

    if (templateErr || !template || template.manager_id !== managerId) {
      return res.status(403).json({ error: 'Access denied: Template belongs to another manager' });
    }

    // 3. Deactivate current active assignments for this client
    const { error: deactivateError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .update({ is_active: false })
      .eq('client_id', client_id)
      .eq('is_active', true);

    if (deactivateError) throw deactivateError;

    // 2. Create new active assignment
    const { data, error: assignError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .insert({
        client_id,
        template_id,
        is_active: true,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (assignError) throw assignError;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Client Dynamic Check-in Routes ---

// GET /client/active-template
// Resolve and return the active template for the authenticated client
router.get('/client/active-template', verifyClient, async (req: any, res: any) => {
  const clientId = req.user.id;

  try {
    // 1. Check for specific assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('client_checkin_assignments')
      .select(`
        template:checkin_templates(*)
      `)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle();

    if (assignmentError) throw assignmentError;

    if (assignment?.template) {
      return res.json(assignment.template);
    }

    // 2. Fallback to manager's default template
    const { data: manager, error: managerError } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (managerError) throw managerError;

    const { data: defaultTemplate, error: defaultError } = await supabaseAdmin
      .from('checkin_templates')
      .select('*')
      .eq('manager_id', manager.manager_id)
      .eq('is_default', true)
      .maybeSingle();

    if (defaultError) throw defaultError;

    if (defaultTemplate) {
      defaultTemplate.template_schema = injectFixedQuestions(defaultTemplate.template_schema);
      return res.json(defaultTemplate);
    }

    // 3. Last fallback: system default (legacy) or empty response
    res.json(null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save check-in data with template association and schema snapshot
router.post('/client/submissions', verifyClient, async (req: any, res: any) => {
  const clientId = req.user.id;
  const { template_id, answers_json } = req.body;

  if (!template_id || !answers_json) {
    return res.status(400).json({ error: 'template_id and answers_json are required' });
  }

  try {
    // 1. Fetch current template and verify ownership (client side security)
    const { data: template, error: templateErr } = await supabaseAdmin
      .from('checkin_templates')
      .select('*, manager:users!manager_id(id)')
      .eq('id', template_id)
      .single();

    if (templateErr || !template) throw new Error('Template not found');

    // 2. Verify client belongs to the template's manager
    const { data: clientInfo, error: clientInfoErr } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();
    
    if (clientInfoErr || !clientInfo || clientInfo.manager_id !== template.manager_id) {
      return res.status(403).json({ error: 'Security violation: Template manager mismatch' });
    }

    // 3. Insert into client_checkin_submissions with snapshot
    const { data, error } = await supabaseAdmin
      .from('client_checkin_submissions')
      .insert({
        client_id: clientId,
        template_id,
        template_version: template.version || 1,
        template_snapshot_json: {
          ...template,
          templateSchema: template.template_schema
        },
        answers_json,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // --- Sync Fixed Questions to Profile ---
    try {
      const answers = answers_json as any;
      const updates: any = {};
      
      // Look for weight & macros
      const weight = answers.weight || answers.Weight || answers['Current Weight'];
      if (weight) updates.weight = Number(weight) || 0;

      // Extract Measurements
      const measurements = {
        weight: answers.weight || answers.Weight,
        waist: answers.waist || answers.Waist || answers['Waist (cm)'],
        hip: answers.hip || answers.Hip || answers['Hip (cm)'],
        thigh_r: answers.thigh_r || answers.Thigh || answers['Right Thigh (cm)'],
        arm_r: answers.arm_r || answers.Arm || answers['Right Arm (cm)']
      };
      
      const macros = {
        protein: answers.protein || answers.Protein,
        carbs: answers.carbs || answers.Carbs,
        fats: answers.fats || answers.Fats,
        calories: answers.calories || answers.Calories,
        adherence_score: answers.adherence_score || answers['Plan Adherence'],
        fatigue: answers.fatigue || answers.Fatigue
      };

      const hasMeasurements = Object.values(measurements).some(v => v !== undefined && v !== null);
      
      if (hasMeasurements) {
          // Get current metadata
          const { data: profile } = await supabaseAdmin
            .from('clients_profiles')
            .select('metadata')
            .eq('user_id', clientId)
            .single();
          
          const currentMetadata = (profile as any)?.metadata || {};
          const prevMeasurements = currentMetadata.measurements || {};

          // Update profile
          await supabaseAdmin
            .from('clients_profiles')
            .update({ 
               ...updates, 
               metadata: { 
                 ...currentMetadata, 
                 measurements: { ...prevMeasurements, ...measurements },
                 macros: { ...(currentMetadata.macros || {}), ...macros } 
               } 
            })
            .eq('user_id', clientId);
      } else if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('clients_profiles')
          .update(updates)
          .eq('user_id', clientId);
      }
    } catch (syncErr) {
      console.error('Error syncing check-in data to profile:', syncErr);
    }
    
    // 3. Trigger automations (need manager_id)
    const { data: clientData } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', clientId)
      .single();

    if (clientData?.manager_id) {
      await processTrigger(clientData.manager_id, 'checkin-submitted', { clientId, submissionId: data.id });
    }

    res.json(data);
  } catch (err: any) {
    console.error('Error saving submission:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
