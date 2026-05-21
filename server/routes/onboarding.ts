import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager, verifyClient } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// FIXED ONBOARDING QUESTIONS — the one-time baseline data-collection contract.
// Required + is_fixed + locked: injected into every onboarding flow, never
// removable, and use STABLE ids read directly by the KPI / profile layer.
// ─────────────────────────────────────────────────────────────────────────────
const FIXED_ONBOARDING_QUESTIONS = [
  {
    id: 'core_info',
    title: 'Core Information',
    subtitle: 'Basic data for your profile',
    locked: true,
    questions: [
      { id: 'age', title: 'Age', type: 'number', unit: 'years', required: true, is_fixed: true, locked: true },
      { id: 'gender', title: 'Gender', type: 'single_choice', options: ['Male', 'Female', 'Other'], required: true, is_fixed: true, locked: true },
      { id: 'height', title: 'Current Height (cm)', type: 'number', unit: 'cm', required: true, is_fixed: true, locked: true },
      { id: 'weight', title: 'Current Weight (kg)', type: 'number', unit: 'kg', required: true, is_fixed: true, locked: true },
      { id: 'goal', title: 'Primary Goal', type: 'text', required: true, is_fixed: true, locked: true },
      { id: 'target_weight', title: 'Target Weight (kg)', type: 'number', unit: 'kg', required: true, is_fixed: true, locked: true },
      { id: 'body_fat', title: 'Estimated Body Fat %', type: 'number', unit: '%', required: true, is_fixed: true, locked: true }
    ]
  },
  {
    id: 'dietary_info',
    title: 'Dietary & Health',
    subtitle: 'Nutritional preferences and health status',
    locked: true,
    questions: [
      { id: 'dietary_style', title: 'Dietary Style', type: 'single_choice', options: ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Omnivore', 'No preference'], required: true, is_fixed: true, locked: true },
      { id: 'allergies', title: 'Allergies / Intolerances', type: 'long_text', required: true, is_fixed: true, locked: true, placeholder: 'List any allergies or intolerances...' },
      { id: 'supplementation', title: 'Current Supplementation', type: 'long_text', required: true, is_fixed: true, locked: true, placeholder: 'List supplements you are currently taking, or "None"...' }
    ]
  },
  {
    id: 'measurements_step',
    title: 'Initial Measurements',
    subtitle: 'Base metrics for progress tracking',
    locked: true,
    questions: [
      {
        id: 'measurements',
        title: 'Measurements (cm)',
        type: 'measurement_group',
        options: ['waist', 'hip', 'chest', 'arm_r', 'thigh_r'],
        required: true,
        is_fixed: true,
        locked: true
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

// Returns the ids of every `required` question in `schema` that has no usable
// answer. Mirrors the client-side validation (conditionals + composite types).
const findMissingRequired = (schema: any[], answers: any): string[] => {
  const ans = answers || {};
  const isVisible = (q: any): boolean => {
    if (q.hidden) return false;
    if (!q.conditional) return true;
    const { field, operator, value } = q.conditional;
    const fv = ans[field];
    if (operator === 'equals') return fv === value;
    if (operator === 'not_equals') return fv !== value;
    if (operator === 'contains') return Array.isArray(fv) && fv.includes(value);
    return true;
  };
  const isAnswered = (q: any): boolean => {
    if (q.type === 'measurement_group') {
      return (q.options || []).some((o: string) => {
        const v = ans[o]; return v !== undefined && v !== null && v !== '';
      });
    }
    if (q.type === 'photo_group') {
      return ['front', 'side', 'back'].some(p => {
        const v = ans[`${q.id}_${p}`]; return v !== undefined && v !== null && v !== '';
      });
    }
    const a = ans[q.id];
    if (Array.isArray(a)) return a.length > 0;
    return a !== undefined && a !== null && a !== '';
  };
  const missing: string[] = [];
  for (const step of (schema || [])) {
    for (const q of (step.questions || [])) {
      if (!q.required) continue;
      if (!isVisible(q)) continue;
      if (!isAnswered(q)) missing.push(q.id);
    }
  }
  return missing;
};

// --- Onboarding Templates (Manager) ---

// Get all templates (paginado DESC por created_at; is_default tiene
// preferencia visual pero el cursor solo opera sobre created_at + id).
router.get('/manager/templates', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('onboarding_templates')
      .select('*')
      .or(`manager_id.eq.${managerId},manager_id.is.null`)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'created_at', 'desc');
    const { data, error } = await q;

    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'created_at'));
  } catch (error: any) {
    console.error('Error fetching onboarding templates:', error);
    res.status(500).json({ error: safeErr(error) });
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

// Duplicate a template (own template or a global one) into a new manager-owned copy
router.post('/manager/templates/:id/duplicate', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  try {
    const { data: original, error: fetchErr } = await supabaseAdmin
      .from('onboarding_templates')
      .select('*')
      .eq('id', id)
      .or(`manager_id.eq.${managerId},manager_id.is.null`)
      .maybeSingle();

    if (fetchErr || !original) return res.status(404).json({ error: 'Template not found' });

    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .insert({
        manager_id: managerId,
        name: `${original.name} (Copy)`,
        description: original.description,
        template_schema: original.template_schema,
        is_default: false,
        version: 1
      })
      .select().single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error duplicating onboarding template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Assignments & Operations ---

// Assign a template to a client
router.post('/manager/assign', verifyManager, async (req: any, res) => {
  const { client_id, template_id } = req.body;
  const managerId = req.user.id;

  try {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(String(client_id)) || !UUID_RE.test(String(template_id))) {
      return res.status(400).json({ error: 'Invalid client or template id format' });
    }
    // 1. Verify client belongs to manager (Check in users table - standard source of truth)
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', client_id)
      .maybeSingle();

    if (clientErr || !client || client.manager_id !== managerId) {
      console.warn(`[Assignment] User ${managerId} attempted to assign onboarding to unauthorized client ${client_id}`);
      return res.status(400).json({ 
        error: 'Invalid client association', 
        message: 'This client does not belong to your account or was not found.' 
      });
    }

    // 1b. Verify the template belongs to this manager (or is a global template)
    const { data: template, error: templateErr } = await supabaseAdmin
      .from('onboarding_templates')
      .select('id, manager_id')
      .eq('id', template_id)
      .maybeSingle();

    if (templateErr || !template || (template.manager_id && template.manager_id !== managerId)) {
      return res.status(400).json({
        error: 'Invalid template',
        message: 'This template does not belong to your account or was not found.'
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
      error: safeErr(error),
      details: error
    });
  }
});

// Get all client assignments (paginado DESC por created_at)
router.get('/manager/assignments', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 100, maxLimit: 500 });
  try {
    const { data: myClients } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT');

    const clientIds = (myClients || []).map(c => c.id);
    if (clientIds.length === 0) {
      return res.json(buildPage<any>([], page.limit, 'assigned_at'));
    }

    let q = supabaseAdmin
      .from('client_onboarding_assignments')
      .select('*, template:onboarding_templates(name)')
      .in('client_id', clientIds)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'assigned_at', 'desc');
    const { data: assignments, error: assignErr } = await q;

    if (assignErr) throw assignErr;
    res.json(buildPage(assignments || [], page.limit, 'assigned_at'));
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get submissions for a manager's clients (paginado DESC por submitted_at)
router.get('/manager/submissions', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const { data: myClients, error: clientsErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT');

    if (clientsErr) throw clientsErr;
    const clientIds = (myClients || []).map(c => c.id);
    if (clientIds.length === 0) {
      return res.json(buildPage<any>([], page.limit, 'submitted_at'));
    }

    let q = supabaseAdmin
      .from('client_onboarding_submissions')
      .select('*, client:profiles!client_id(full_name, avatar_url), template:onboarding_templates(id, name, template_schema)')
      .in('client_id', clientIds)
      .order('submitted_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'submitted_at', 'desc');
    const { data, error } = await q;

    if (error) throw error;

    // Prefer the template snapshot taken at submission time over the live template.
    const result = (data || []).map((s: any) => ({
      ...s,
      template: s.template_snapshot_json || s.template
    }));
    res.json(buildPage(result, page.limit, 'submitted_at'));
  } catch (error: any) {
    console.error('Error fetching onboarding submissions:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get a single submission by id (scoped to the manager's own clients)
router.get('/manager/submissions/:id', verifyManager, async (req: any, res) => {
  const managerId = req.user.id;
  const { id } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .select('*, client:profiles!client_id(full_name, avatar_url), template:onboarding_templates(id, name, template_schema)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Submission not found' });

    // Verify the submission's client belongs to this manager.
    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', data.client_id)
      .eq('manager_id', managerId)
      .maybeSingle();

    if (!owner) return res.status(404).json({ error: 'Submission not found or access denied' });

    res.json({ ...data, template: data.template_snapshot_json || data.template });
  } catch (error: any) {
    console.error('Error fetching onboarding submission:', error);
    res.status(500).json({ error: safeErr(error) });
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
  const { answers_json } = req.body;
  try {
    // Derive the template & assignment server-side from the client's own active
    // assignment — never trust template_id / assignment_id from the request body
    // (a client could otherwise submit against, or deactivate, another tenant's data).
    const { data: assignment, error: assignmentErr } = await supabaseAdmin
      .from('client_onboarding_assignments')
      .select('id, template_id')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle();

    if (assignmentErr) throw assignmentErr;
    if (!assignment) {
      return res.status(400).json({ error: 'No active onboarding assignment found.' });
    }

    // Snapshot the template at submission time, so the manager always reviews
    // the answers against the exact schema the client filled in — even if the
    // template is edited afterwards.
    const { data: template } = await supabaseAdmin
      .from('onboarding_templates')
      .select('*')
      .eq('id', assignment.template_id)
      .maybeSingle();

    // Full schema = the manager's questions + the system fixed questions.
    const injectedSchema = injectFixedQuestions(template?.template_schema || []);

    // Server-side guard: every required question must be answered, so an
    // onboarding can never be submitted without the mandatory baseline data.
    const missingRequired = findMissingRequired(injectedSchema, answers_json);
    if (missingRequired.length > 0) {
      return res.status(400).json({
        error: 'Missing required answers',
        message: 'All required questions must be answered before submitting.',
        missing: missingRequired
      });
    }

    const { data, error } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .insert({
        client_id: clientId,
        template_id: assignment.template_id,
        template_version: template?.version || 1,
        template_snapshot_json: template
          ? { ...template, template_schema: injectedSchema, templateSchema: injectedSchema }
          : null,
        answers_json,
        submitted_at: new Date().toISOString()
      })
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

    await supabaseAdmin
      .from('client_onboarding_assignments')
      .update({ is_active: false })
      .eq('id', assignment.id)
      .eq('client_id', clientId);

    // Fire the advanced-workflow trigger for "onboarding completed".
    try {
      const { data: clientRow } = await supabaseAdmin
        .from('users').select('manager_id').eq('id', clientId).maybeSingle();
      if (clientRow?.manager_id) {
        const { runWorkflowsForEvent } = await import('./workflows.js');
        runWorkflowsForEvent(clientRow.manager_id, 'trigger.onboarding_completed', { clientId })
          .catch(err => console.error('Workflow trigger error (onboarding_completed):', err));
      }
    } catch (wfErr) {
      console.error('onboarding_completed workflow dispatch failed:', wfErr);
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager: the canonical fixed/locked questions injected into every onboarding.
// Exposed so the flow editor can show them as read-only, non-deletable.
router.get('/manager/fixed-questions', verifyManager, async (_req: any, res) => {
  res.json(FIXED_ONBOARDING_QUESTIONS);
});

export default router;
