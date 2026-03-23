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
    // 1. Verify client belongs to this manager
    const { data: userData, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !userData) {
      console.warn(`Manager Access Denied: Manager ${managerId} tried to access client ${id}. Client not found or doesn't belong to manager.`);
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // 2. Fetch check-ins
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false });

    if (error) throw error;

    // Resilient mapping: if columns are missing, pull from data_json
    const formattedCheckIns = (data || []).map((ci: any) => ({
      ...ci,
      reviewed_at: ci.reviewed_at || (ci.data_json?.reviewed_at) || null,
      coach_notes: ci.coach_notes || (ci.data_json?.coach_notes) || null,
      next_week_focus: ci.next_week_focus || (ci.data_json?.next_week_focus) || null
    }));

    res.json({ client: userData, check_ins: formattedCheckIns });
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
      .select('id, name, email, avatar')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !userData) {
      console.warn(`Manager Single Check-in Access Denied: Manager ${managerId} tried to access client ${id}.`);
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // 2. Fetch the check-in
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .single();
    
    if (error) throw error;
    
    // Safety parse data_json if it's a string
    let dj = data.data_json;
    if (typeof dj === 'string') {
      try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
    }

    const formatted = {
      ...data,
      data_json: dj,
      reviewed_at: data.reviewed_at || dj?.reviewed_at || null,
      coach_notes: data.coach_notes || dj?.coach_notes || null,
      next_week_focus: data.next_week_focus || dj?.next_week_focus || null
    };

    res.json({ client: userData, check_in: formatted });
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
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // 2. Try to update dedicated columns first
    const reviewedAt = new Date().toISOString();
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('check_ins')
      .update({ coach_notes, next_week_focus, reviewed_at: reviewedAt })
      .eq('id', checkInId)
      .select()
      .single();

    if (updateError) {
      // 3. If columns are missing (42703), fallback to storing in data_json
      if (updateError.code === '42703') {
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
      throw updateError;
    }

    res.json({ success: true, data: updateData, method: 'columns' });
  } catch (error: any) {
    console.error('Error saving coach review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
