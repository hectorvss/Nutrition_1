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

// Client: Submit a new check-in (original path)
router.post('/client/check-in', verifyClient, async (req: any, res) => {
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

// Client: Submit a new check-in (alternate path used by WeeklyCheckinFlow.tsx)
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
    // Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ client, check_ins: data });
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
    // Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .eq('client_id', id)
      .single();

    if (error) throw error;
    res.json({ client, check_in: data });
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
    // Verify client belongs to this manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .update({ coach_notes, next_week_focus, reviewed_at: new Date().toISOString() })
      .eq('id', checkInId)
      .eq('client_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error saving coach review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
