import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { supabase, supabaseAdmin } from '../db/index.js';
import Stripe from 'stripe';
import { newStripeClient } from '../lib/stripe.js';
import { google } from 'googleapis';
import { processTrigger } from './automations.js';
import { runWorkflowsForEvent } from './workflows.js';
import { vapidPublicKey, pushConfigured } from '../lib/push.js';
import { nutritionPlanSchema, trainingProgramSchema } from '../schemas/plans.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import { limitsForTier, isAccessBlocked, trialDaysLeft, makeEnforceLimit, countActiveAutomations, type PlanTier } from '../lib/plans.js';
import { repeatLabelToRrule, expandTaskDates, applyExceptions, virtualInstanceId, parseVirtualId, type TaskRow, type TaskException } from '../lib/recurrence.js';

// Limit enforcer for client creation. Counts active clients under this manager
// and blocks POST /clients when the tier cap is reached.
const enforceClientLimit = makeEnforceLimit(supabaseAdmin, 'activeClients', async (userId: string) => {
  const { count } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', userId)
    .eq('role', 'CLIENT')
    .neq('status', 'inactive');
  return count ?? 0;
});

const router = Router();
// ... (rest of the code until POST /clients)

// Middleware to verify MANAGER role using Supabase Auth
const verifyManager = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = data.user;

    // Verificar rol MANAGER desde la tabla de usuarios
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('role, id')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('verifyManager: DB error', dbError);
      return res.status(500).json({ error: 'Error verifying user role' });
    }

    // DB is the source of truth — never fall back to user_metadata (it is user-mutable
    // via supabase.auth.updateUser and would allow privilege escalation).
    if (!userData || userData.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol MANAGER' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyManager: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

router.use(verifyManager);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY_RE = /^[a-z0-9_-]{1,64}$/i;

// Get current manager profile
router.get('/profile', async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(profile || { user_id: req.user.id });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update current manager profile
router.post('/profile', async (req: any, res) => {
  const profileData = req.body;
  const userId = req.user.id;

  // Validate avatar_url: must be a small data URL of an allowed image type, OR null/empty.
  if (profileData.avatar_url) {
    const av = String(profileData.avatar_url);
    const isAllowedDataUrl = /^data:image\/(jpeg|png|webp);base64,/i.test(av);
    const isHttpsUrl = /^https:\/\//i.test(av);
    if (!isAllowedDataUrl && !isHttpsUrl) {
      return res.status(400).json({ error: 'avatar_url must be an https URL or a data URL of jpeg/png/webp' });
    }
    // Cap size at ~2MB worth of base64 (≈2.7M chars). Rejects huge base64 blobs.
    if (av.length > 2_800_000) {
      return res.status(413).json({ error: 'avatar_url too large (max 2 MB)' });
    }
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          professional_title: profileData.professional_title,
          bio: profileData.bio,
          phone_number: profileData.phone_number,
          address: profileData.address,
          linkedin_url: profileData.linkedin_url,
          twitter_url: profileData.twitter_url,
          instagram_url: profileData.instagram_url,
          avatar_url: profileData.avatar_url,
          language: profileData.language || 'es',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: profileData.full_name,
          professional_title: profileData.professional_title,
          bio: profileData.bio,
          phone_number: profileData.phone_number,
          address: profileData.address,
          linkedin_url: profileData.linkedin_url,
          twitter_url: profileData.twitter_url,
          instagram_url: profileData.instagram_url,
          avatar_url: profileData.avatar_url,
          language: profileData.language || 'es'
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get manager integrations
router.get('/integrations', async (req: any, res) => {
  try {
    const { data: integrations, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      // If table doesn't exist yet, return initial state instead of 500
      if (error.code === '42P01') {
        return res.json({ user_id: req.user.id });
      }
      throw error;
    }
    res.json(integrations || { user_id: req.user.id });
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update manager integrations
router.post('/integrations', async (req: any, res) => {
  const integrationData = req.body;
  const userId = req.user.id;

  try {
    const { data: existing } = await supabaseAdmin
      .from('integrations')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    const payload = {
      user_id: userId,
      google_calendar_enabled: integrationData.google_calendar_enabled,
      google_calendar_api_key: integrationData.google_calendar_api_key,
      google_calendar_id: integrationData.google_calendar_id,
      google_service_account: integrationData.google_service_account,
      stripe_enabled: integrationData.stripe_enabled,
      stripe_publishable_key: integrationData.stripe_publishable_key,
      stripe_secret_key: integrationData.stripe_secret_key,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      result = await supabaseAdmin
        .from('integrations')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('integrations')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error saving integrations:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get Stripe balance (Mock for now, returns data based on secret key presence)
router.get('/integrations/stripe/balance', async (req: any, res) => {
  try {
    const { data: integrations, error } = await supabaseAdmin
      .from('integrations')
      .select('stripe_secret_key, stripe_enabled')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    
    if (!integrations?.stripe_enabled || !integrations?.stripe_secret_key) {
      return res.status(400).json({ error: 'Stripe not connected' });
    }

    const stripe = newStripeClient(integrations.stripe_secret_key);
    
    // Fetch real balance
    const balance = await stripe.balance.retrieve();
    const available = balance.available.reduce((acc, curr) => acc + curr.amount, 0) / 100;
    
    // Fetch recent payouts/charges for MRR/Revenue trends (simplified estimate)
    const transactions = await stripe.balanceTransactions.list({ limit: 20 });
    const recent_revenue = transactions.data
      .filter(t => t.type === 'charge')
      .slice(0, 7)
      .map(t => t.amount / 100);

    res.json({
      balance: available,
      mrr: available * 0.8, // Simplified estimation
      recent_revenue: recent_revenue.length > 0 ? recent_revenue : [0, 0, 0, 0, 0, 0, 0],
      currency: balance.available[0]?.currency.toUpperCase() || 'EUR'
    });
  } catch (error: any) {
    console.error('Error fetching stripe balance:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get all clients for this manager with plan status (paginado DESC por created_at)
//
// Cursor keyset sobre users.created_at + id. La query trae limit+1 filas;
// los joins anidados (check_ins, submissions, workout_logs, tasks) los
// ordena PostgREST por sus propios sort fields pero el cursor opera sobre
// el row del USER. Asi una pagina = limit clientes con sus sub-recursos.
router.get('/clients', async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        created_at,
        status,
        profiles!user_id (full_name, avatar_url),
        clients_profiles!user_id (weight, goal, notes, gender, age),
        check_ins (id, date, reviewed_at, data_json),
        client_checkin_submissions!client_id (id, submitted_at, reviewed_at, answers_json),
        workout_logs!client_id (logged_at),
        tasks!client_id (*)
      `)
      .eq('manager_id', req.user.id)
      .eq('role', 'CLIENT')
      .eq('tasks.manager_id', req.user.id) // Filter joined tasks by manager_id too
      .order('created_at', { ascending: false }) // orden principal estable
      .order('id', { ascending: false })
      .order('date', { foreignTable: 'check_ins', ascending: false })
      .order('submitted_at', { foreignTable: 'client_checkin_submissions', ascending: false })
      .order('logged_at', { foreignTable: 'workout_logs', ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'created_at', 'desc');
    const { data: clientsRaw, error } = await q;

    if (error) throw error;

    // Detectamos si hay mas paginas a partir del +1. Recortamos a limit
    // ANTES de agregar sub-recursos para no hacer trabajo extra.
    const hasMore = (clientsRaw || []).length > page.limit;
    const clients = hasMore ? (clientsRaw || []).slice(0, page.limit) : (clientsRaw || []);

    if (clients.length === 0) {
      // Devolvemos el shape paginado con array vacio.
      return res.json({ data: [], nextCursor: null, hasMore: false });
    }

    // Fetch related plans separately since direct joins may lack foreign key mapping in cache
    const clientIds = clients.map(c => c.id);

    const [roadmapsRes, nutritionRes, trainingRes, unreadMsgRes] = await Promise.all([
      supabaseAdmin.from('roadmaps').select('*').in('client_id', clientIds),
      supabaseAdmin.from('nutrition_plans').select('id, client_id, name, created_at, data_json').in('client_id', clientIds),
      supabaseAdmin.from('training_programs').select('id, client_id').in('client_id', clientIds),
      // Unread messages received by this manager from each client (powers the "unread DM" task rule)
      supabaseAdmin.from('messages')
        .select('sender_id, created_at')
        .eq('receiver_id', req.user.id)
        .in('sender_id', clientIds)
        .eq('deleted_by_receiver', false)
        .or('is_read.eq.false,is_read.is.null')
        .order('created_at', { ascending: true })
    ]);

    // Aggregate unread messages per client: count + timestamp of the oldest unread message
    const unreadBySender: Record<string, { count: number; oldest: string }> = {};
    (unreadMsgRes.data || []).forEach((m: any) => {
      if (!unreadBySender[m.sender_id]) {
        unreadBySender[m.sender_id] = { count: 0, oldest: m.created_at };
      }
      unreadBySender[m.sender_id].count++;
    });

    // Attach related data to client objects
    (clients as any[]).forEach(c => {
      c.roadmaps = (roadmapsRes.data || []).filter(r => r.client_id === c.id);
      c.nutrition_plans = (nutritionRes.data || []).filter(n => n.client_id === c.id);
      c.training_programs = (trainingRes.data || []).filter(t => t.client_id === c.id);
    });
    
    // Helper to map adherence string/score to percentage
    const mapAdherence = (str: string, d?: any): number => {
      // Prioritize numeric slider (1-10 -> 10-100%), clamped to [0, 100]
      if (d?.nutrition_adherence_score !== undefined) return Math.min(Math.max(Number(d.nutrition_adherence_score) * 10, 0), 100);
      if (d?.adherence_score !== undefined) return Math.min(Math.max(Number(d.adherence_score) * 10, 0), 100);
      
      // Fallback to text
      if (!str) return 0;
      if (str.includes('>95%')) return 98;
      if (str.includes('80-95%')) return 85;
      if (str.includes('50-80%')) return 65;
      if (str.includes('<50%')) return 30;
      return 0;
    };

    // Summarise a nutrition plan's data_json into calories + macro split.
    const summarizePlan = (dj: any) => {
      if (!dj) return null;
      let meals: any[] = [];
      if (Array.isArray(dj.meals)) meals = dj.meals;
      else if (dj.days) meals = dj.days.monday?.meals || (Object.values(dj.days)[0] as any)?.meals || [];
      let cal = 0, p = 0, c = 0, f = 0;
      meals.forEach((m: any) => (m.items || []).forEach((i: any) => {
        const q = Number(i.quantity || i.multiplier || 1);
        cal += (Number(i.calories) || 0) * q;
        p += (Number(i.protein) || 0) * q;
        c += (Number(i.carbs) || 0) * q;
        f += (Number(i.fats) || 0) * q;
      }));
      const macroCal = p * 4 + c * 4 + f * 9;
      if (macroCal > 0) {
        return {
          calories: Math.round(cal || macroCal),
          macros: {
            p: Math.round((p * 4 / macroCal) * 100),
            c: Math.round((c * 4 / macroCal) * 100),
            f: Math.round((f * 9 / macroCal) * 100),
          },
        };
      }
      if (dj.macros) return { calories: Math.round(cal) || dj.targetCalories || 0, macros: dj.macros };
      return null;
    };

    const formattedClients = clients.map((c: any) => {
      // Merge legacy check-ins and new submissions
      const legacyCheckIns = c.check_ins || [];
      const newSubmissions = (c.client_checkin_submissions || []).map((s: any) => ({
        id: s.id,
        date: s.submitted_at,
        reviewed_at: s.reviewed_at,
        data_json: s.answers_json
      }));
      
      const allCheckIns = [...legacyCheckIns, ...newSubmissions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const latestCheckIn = allCheckIns[0] || null;
      const latestWorkout = c.workout_logs?.[0] || null;
      let dj = latestCheckIn?.data_json || {};
      if (typeof dj === 'string') {
        try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const lastCheckInDate = latestCheckIn ? new Date(latestCheckIn.date) : null;
      const lastWorkoutDate = latestWorkout ? new Date(latestWorkout.logged_at) : null;
      
      // New clients get a 7-day grace period before they can be flagged At Risk.
      const createdRecently = c.created_at && new Date(c.created_at) > weekAgo;
      const isAtRisk = !createdRecently && (
                       (lastCheckInDate && lastCheckInDate < weekAgo) ||
                       (lastWorkoutDate && lastWorkoutDate < weekAgo) ||
                       (!lastCheckInDate && !lastWorkoutDate)); // Never checked in or logged

      // Last activity = most recent of any check-in or workout log (proxy for "app activity")
      const activityDates = [lastCheckInDate, lastWorkoutDate].filter((d): d is Date => !!d);
      const lastActivityAt = activityDates.length > 0
        ? new Date(Math.max(...activityDates.map(d => d.getTime()))).toISOString()
        : null;

      const unread = unreadBySender[c.id];

      const progressValue = mapAdherence(dj.nutritionAdherence, dj);
      const progressLabel = !latestCheckIn ? 'No Data'
        : progressValue >= 80 ? 'On Track'
        : progressValue >= 50 ? 'Stalled'
        : 'Regression';

      const latestNutritionPlan = (c.nutrition_plans || [])
        .slice()
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
      const planName = latestNutritionPlan?.name || 'No Plan';

      // The goal carried by the assigned nutrition plan / roadmap. Used so the
      // UI never shows "Not Set" for a client who actually has a plan.
      const planGoal = (() => {
        let pdj: any = latestNutritionPlan?.data_json;
        if (typeof pdj === 'string') { try { pdj = JSON.parse(pdj); } catch { pdj = {}; } }
        const fromPlan = pdj?.goal || pdj?.goalType || pdj?.planFamilyLabel;
        if (fromPlan) return fromPlan;
        let rdj: any = (c.roadmaps || [])[0]?.data_json;
        if (typeof rdj === 'string') { try { rdj = JSON.parse(rdj); } catch { rdj = {}; } }
        return rdj?.goalType || rdj?.planFamilyLabel || rdj?.primaryGoal
          || rdj?.trajectoryGoals?.primaryGoal || null;
      })();

      return {
        id: c.id,
        email: c.email,
        created_at: c.created_at,
        status: c.status || 'Active',
        isAtRisk,
        riskStatus: isAtRisk ? 'overdue' : null,
        name: c.profiles?.full_name || c.profiles?.[0]?.full_name || c.email.split('@')[0],
        avatar: c.profiles?.avatar_url || c.profiles?.[0]?.avatar_url || null,
        gender: c.clients_profiles?.gender || c.clients_profiles?.[0]?.gender || 'Unknown',
        age: c.clients_profiles?.age || c.clients_profiles?.[0]?.age || '--',
        weight: dj.weight || c.clients_profiles?.weight || c.clients_profiles?.[0]?.weight || null,
        goal: c.clients_profiles?.goal || c.clients_profiles?.[0]?.goal || null,
        nutritionPlanGoal: planGoal,
        notes: c.clients_profiles?.notes || c.clients_profiles?.[0]?.notes || null,
        nutritionPlanAssigned: !!(c.nutrition_plans && c.nutrition_plans.length > 0),
        trainingPlanAssigned: !!(c.training_programs && c.training_programs.length > 0),
        planningAssigned: !!(c.roadmaps && c.roadmaps.length > 0),
        roadmaps: c.roadmaps || [],
        plan_name: planName,
        nutritionPlan: summarizePlan(latestNutritionPlan?.data_json),
        progress: progressValue,
        progressLabel,
        lastActivityAt,
        lastWorkoutAt: lastWorkoutDate ? lastWorkoutDate.toISOString() : null,
        planUpdatedAt: latestNutritionPlan?.created_at || null,
        unreadMessages: unread?.count || 0,
        oldestUnreadAt: unread?.oldest || null,
        lastCheckInDate: latestCheckIn?.date || null,
        lastCheckIn: latestCheckIn ? (() => {
          const diff = now.getTime() - lastCheckInDate!.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          if (days === 0) return 'Today';
          if (days === 1) return 'Yesterday';
          return `${days} days ago`;
        })() : 'Never',
        nextAppointment: (() => {
          const taskDate = (t: any) => {
            if (!t.date) return null;
            const d = new Date(`${t.date}T${t.time || '00:00'}`);
            return isNaN(d.getTime()) ? null : d;
          };
          const futureTasks = (c.tasks || [])
            .map((t: any) => ({ t, when: taskDate(t) }))
            .filter((x: any) => x.when && x.when >= now)
            .sort((a: any, b: any) => a.when.getTime() - b.when.getTime());

          if (futureTasks.length === 0) return 'Not Scheduled';
          const next = futureTasks[0].t;
          const time = (next.time || '00:00').substring(0, 5);
          return `${new Date(next.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} ${time}`;
        })(),
        isUnreviewed: latestCheckIn ? !(latestCheckIn.reviewed_at || latestCheckIn.data_json?.reviewed_at) : false,
        check_ins: allCheckIns
      };
    });
    
    // Construimos el cursor de la siguiente pagina desde el ULTIMO cliente
    // visible (created_at + id). Solo emitimos cursor si hubo mas filas en
    // BD (hasMore detectado al inicio).
    let nextCursor: string | null = null;
    if (hasMore && formattedClients.length > 0) {
      const lastRaw = clients[clients.length - 1];
      if (lastRaw?.created_at && lastRaw?.id) {
        // Codifica { v: created_at, i: id } en base64. Inline en lugar
        // de importar encodeCursor para evitar tener que cambiar la firma
        // de buildPage (que asume sortKey en cada row del array transformado).
        nextCursor = Buffer.from(
          JSON.stringify({ v: String(lastRaw.created_at), i: String(lastRaw.id) }),
          'utf8',
        ).toString('base64');
      }
    }
    res.json({ data: formattedClients, nextCursor, hasMore });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Update client status (Archive/Active)
router.patch('/clients/:id/status', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!UUID_RE.test(id)) {
      return res.status(400).json({ error: 'Invalid client id format' });
    }

    const VALID_STATUSES = ['Active', 'Archived', 'Inactive'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ status })
      .eq('id', id)
      .eq('manager_id', req.user.id)
      .eq('role', 'CLIENT')
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase error updating status:', error);
      return res.status(500).json({ error: safeErr(error) });
    }
    if (!updatedUser) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Catch block error updating client status:', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Update general client fields (e.g. access expiration date)
router.patch('/clients/:id', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  const { access_expiration, full_name, phone, gender, age, goal } = req.body;

  try {
    if (!UUID_RE.test(id)) {
      return res.status(400).json({ error: 'Invalid client id format' });
    }

    // Verify the client belongs to this manager.
    const { data: clientOwner } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .maybeSingle();
    if (!clientOwner) return res.status(404).json({ error: 'Client not found or access denied' });

    // Update profile fields (name / phone) when provided.
    if (full_name !== undefined || phone !== undefined) {
      const profilePatch: any = {};
      if (full_name !== undefined) profilePatch.full_name = String(full_name).trim();
      if (phone !== undefined) profilePatch.phone_number = phone ? String(phone).trim() : null;
      const { error: pErr } = await supabaseAdmin
        .from('profiles')
        .upsert({ user_id: id, ...profilePatch }, { onConflict: 'user_id' });
      if (pErr) throw pErr;
    }

    // Update client-specific fields (gender / age / goal) when provided.
    if (gender !== undefined || age !== undefined || goal !== undefined) {
      const cpPatch: any = {};
      if (gender !== undefined) cpPatch.gender = gender || null;
      if (age !== undefined) cpPatch.age = (age === '' || age === null) ? null : Number(age);
      if (goal !== undefined) cpPatch.goal = goal || null;
      const { error: cpErr } = await supabaseAdmin
        .from('clients_profiles')
        .upsert({ user_id: id, ...cpPatch }, { onConflict: 'user_id' });
      if (cpErr) throw cpErr;
    }

    if (access_expiration !== undefined) {
      // Merge into clients_profiles.metadata (jsonb) without clobbering other keys.
      const { data: existing } = await supabaseAdmin
        .from('clients_profiles')
        .select('metadata')
        .eq('user_id', id)
        .maybeSingle();
      const metadata = { ...((existing?.metadata as any) || {}), access_expiration: access_expiration || null };
      if (existing) {
        const { error: upErr } = await supabaseAdmin.from('clients_profiles').update({ metadata }).eq('user_id', id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabaseAdmin.from('clients_profiles').insert({ user_id: id, metadata });
        if (insErr) throw insErr;
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Reset a client's password — generates a new one and returns it so the
// manager can pass it on. Existing (hashed) passwords can never be retrieved.
router.post('/clients/:id/reset-password', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    if (!UUID_RE.test(id)) {
      return res.status(400).json({ error: 'Invalid client id format' });
    }

    // Verify the client belongs to this manager.
    const { data: clientOwner } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .maybeSingle();
    if (!clientOwner) return res.status(404).json({ error: 'Client not found or access denied' });

    const newPassword = 'Nutri' + Math.floor(Math.random() * 9000 + 1000) + '$xp';
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(id, { password: newPassword });
    if (updErr) throw updErr;

    res.json({ success: true, password: newPassword });
  } catch (error: any) {
    console.error('Error resetting client password:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a new client under this manager
router.post('/clients', enforceClientLimit, async (req: any, res) => {
  const { email, password, profile, name } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Create the user in Auth space securely using the Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'CLIENT' }
    });

    if (authError || !authData.user) {
      console.error('Client creation Auth error:', authError);
      return res.status(400).json({ error: authError?.message || 'Failed to create client' });
    }

    const clientId = authData.user.id;

    // 2. The database trigger automatically creates the `public.users` record.
    // We just need to link it to the manager. If this fails the client would be
    // orphaned (invisible to the manager) — roll back the auth user instead.
    const { error: linkError } = await supabaseAdmin
      .from('users')
      .update({ manager_id: managerId })
      .eq('id', clientId);
    if (linkError) {
      console.error('Failed to link client to manager, rolling back auth user:', linkError);
      await supabaseAdmin.auth.admin.deleteUser(clientId).catch(() => {});
      return res.status(500).json({ error: 'Failed to create client. Please try again.' });
    }

    // 3. Store the display name / phone in profiles (the source GET /clients reads).
    const fullName = (name || profile?.full_name || '').trim();
    const phone = (profile?.phone || '').trim();
    if (fullName || phone) {
      const profilePayload: any = { user_id: clientId };
      if (fullName) profilePayload.full_name = fullName;
      if (phone) profilePayload.phone_number = phone;
      const { error: nameError } = await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });
      if (nameError) {
        console.error('Error saving client name/phone:', nameError);
      }
    }

    // 4. Create the client profile
    if (profile) {
      const { error: profileError } = await supabaseAdmin.from('clients_profiles').insert({
        user_id: clientId,
        weight: profile.weight,
        goal: profile.goal,
        notes: profile.notes,
        height: profile.height,
        gender: profile.gender,
        age: profile.age
      });

      if (profileError) {
        console.error('Error saving client profile:', profileError);
      }
    }

    // 5. Trigger "Welcome Message" automation + any Advanced Workflows
    processTrigger(managerId, 'new-client', { clientId }).catch(err => {
      console.error('Trigger error (new-client):', err);
    });
    runWorkflowsForEvent(managerId, 'trigger.new_client', { clientId }).catch(err => {
      console.error('Workflow trigger error (new_client):', err);
    });

    res.json({ success: true, client_id: clientId });
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Delete a client permanently
router.delete('/clients/:id', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    // Verify the client belongs to this manager before deleting
    const { data: clientData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .single();

    if (fetchError || !clientData) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // Delete dependent rows that do NOT cascade on user deletion.
    // (check_ins, messages, nutrition_plans, training_programs, workout_logs,
    //  clients_profiles, profiles, integrations cascade automatically; these don't.)
    await supabaseAdmin.from('client_checkin_submissions').delete().eq('client_id', id);
    await supabaseAdmin.from('client_checkin_assignments').delete().eq('client_id', id);
    await supabaseAdmin.from('client_onboarding_submissions').delete().eq('client_id', id);
    await supabaseAdmin.from('client_onboarding_assignments').delete().eq('client_id', id);

    // Delete client profile (defensive — also cascades)
    await supabaseAdmin.from('clients_profiles').delete().eq('user_id', id);

    // Remove the user record (cascades check_ins, messages, plans, etc.)
    const { error: userDeleteError } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (userDeleteError) throw userDeleteError;

    // Delete from Supabase Auth (removes authentication access)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authDeleteError) {
      console.error('Error deleting client from auth:', authDeleteError);
      // Non-fatal: user record is already removed from our DB
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get nutrition plan for a specific client
router.get('/clients/:id/nutrition-plan', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  try {
    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (error) throw error;
    res.json(plan || null);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create or update nutrition plan for a client
router.post('/clients/:id/nutrition-plan', async (req: any, res) => {
  const { id } = req.params;
  const parsed = nutritionPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { name, data_json } = parsed.data;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const payload = {
      client_id: id,
      created_by: managerId,
      name: name || 'Nutrition Plan',
      data_json: data_json || {},
      updated_at: new Date().toISOString()
    };

    // Atomic upsert — relies on UNIQUE(client_id, created_by) constraint
    const { data: planData, error: planError } = await supabaseAdmin
      .from('nutrition_plans')
      .upsert(payload, { onConflict: 'client_id,created_by' })
      .select()
      .single();

    if (planError) throw planError;

    // Fire trigger.plan_assigned for any workflow listening on this event.
    runWorkflowsForEvent(managerId, 'trigger.plan_assigned', {
      clientId: id, planKind: 'nutrition', planId: planData?.id,
    }).catch(err => console.error('Workflow trigger error (plan_assigned/nutrition):', err));

    res.json(planData);
  } catch (error: any) {
    console.error('Error saving nutrition plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get training program for a specific client
router.get('/clients/:id/training-program', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  try {
    const { data: program, error } = await supabaseAdmin
      .from('training_programs')
      .select('*')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (error) throw error;
    res.json(program || null);
  } catch (error: unknown) {
    console.error('Error fetching training program:', error);
    const msg = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ error: msg });
  }
});

// Create or update training program for a client
router.post('/clients/:id/training-program', async (req: any, res) => {
  const { id } = req.params;
  const parsed = trainingProgramSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const { name, data_json } = parsed.data;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const payload = {
      client_id: id,
      created_by: managerId,
      name: name || 'Training Program',
      data_json: data_json || {},
      updated_at: new Date().toISOString()
    };

    // Atomic upsert — relies on UNIQUE(client_id, created_by) constraint
    const { data: programData, error: programError } = await supabaseAdmin
      .from('training_programs')
      .upsert(payload, { onConflict: 'client_id,created_by' })
      .select()
      .single();

    if (programError) throw programError;

    // Fire trigger.plan_assigned for any workflow listening on this event.
    runWorkflowsForEvent(managerId, 'trigger.plan_assigned', {
      clientId: id, planKind: 'training', planId: programData?.id,
    }).catch(err => console.error('Workflow trigger error (plan_assigned/training):', err));

    res.json(programData);
  } catch (error: any) {
    console.error('Error saving training program:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get master plan by slug
router.get('/master-plans/:slug', async (req: any, res) => {
  const { slug } = req.params;
  try {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('nutrition_master_plans')
      .select('*')
      .eq('slug', slug)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: 'Master plan not found' });
    }

    // Fetch meals with their foods and general blocks
    const { data: meals, error: mealsError } = await supabaseAdmin
      .from('nutrition_master_plan_meals')
      .select(`
        *,
        nutrition_master_plan_meal_foods (*),
        nutrition_master_plan_general_blocks (*)
      `)
      .eq('plan_id', plan.id)
      .order('order_index', { ascending: true });

    if (mealsError) throw mealsError;

    res.json({ ...plan, meals });
  } catch (error: any) {
    console.error('Error fetching master plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Apply a master plan to a client
router.post('/clients/:id/apply-master-plan', async (req: any, res) => {
  const { id } = req.params;
  const { slug } = req.body;
  const managerId = req.user.id;

  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    // 1. Fetch Master Plan detail
    let masterPlan: any = null;
    const { data: mData, error: mError } = await supabaseAdmin
      .from('nutrition_master_plans')
      .select(`
        *,
        nutrition_master_plan_meals (
          *,
          nutrition_master_plan_meal_foods (*),
          nutrition_master_plan_general_blocks (*)
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (mError || !mData) {
      console.warn('Master plan not found in DB or error. Using fallback for known slugs.');
      
      const fallbacks: Record<string, any> = {
        'nutrition_1500_fat_loss_basic': {
          name: 'Fat Loss Basic',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt 0%', calories: 120, protein: 20, carbs: 9, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Oats', calories: 155, protein: 6.7, carbs: 26.4, fats: 2.7, serving_size: '100g', quantity: 0.4 },
                { name: 'Blueberries', calories: 30, protein: 0.3, carbs: 7.2, fats: 0.1, serving_size: '100g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein Source', example: 'Greek Yogurt 0%, Egg whites', amount: 30, color: 'bg-blue-500' },
                { label: 'Complex Carbs', example: 'Oats, Whole grain bread', amount: 35, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Apple', calories: 65, protein: 0.3, carbs: 15, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Almonds', calories: 580, protein: 21, carbs: 22, fats: 50, serving_size: '100g', quantity: 0.15 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fruit', example: 'Apple, Berries', amount: 150, color: 'bg-pink-500' },
                { label: 'Healthy Fats', example: 'Almonds, Walnuts', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving_size: '100g', quantity: 1.2 },
                { name: 'White Rice cooked', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving_size: '100g', quantity: 1.2 },
                { name: 'Mixed Vegetables', calories: 40, protein: 2, carbs: 8, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving_size: '100g', quantity: 0.08 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein Source', example: 'Chicken Breast, Turkey', amount: 35, color: 'bg-blue-500' },
                { label: 'Starchy Carbs', example: 'Rice, Potato, Pasta', amount: 35, color: 'bg-emerald-500' },
                { label: 'Veg/Greens', example: 'Broccoli, Spinach', amount: 150, color: 'bg-green-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Skyr 0%', calories: 63, protein: 11, carbs: 3.9, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Whey Protein', calories: 400, protein: 80, carbs: 6, fats: 4, serving_size: '100g', quantity: 0.2 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Whey Protein, Skyr', amount: 30, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, serving_size: '100g', quantity: 1.2 },
                { name: 'Potato boiled', calories: 87, protein: 1.9, carbs: 20, fats: 0.1, serving_size: '100g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving_size: '100g', quantity: 0.08 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein (Fatty/Lean)', example: 'Salmon, Beef, White Fish', amount: 25, color: 'bg-blue-500' },
                { label: 'Starchy Carbs', example: 'Potato, Sweet Potato', amount: 30, color: 'bg-emerald-500' },
                { label: 'Veg/Greens', example: 'Zucchini, Asparagus', amount: 150, color: 'bg-green-500' }
              ]
            }
          ]
        },
        'nutrition_active-maintain': {
          name: 'Active Maintain',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Mixed Eggs (2 eggs + whites)', calories: 180, protein: 20, carbs: 2, fats: 10, serving_size: '150g', quantity: 1 },
                { name: 'Whole Grain Bread', calories: 150, protein: 6, carbs: 28, fats: 2, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Eggs, Egg whites', amount: 20, color: 'bg-blue-500' },
                { label: 'Slow Carbs', example: 'Whole grain bread, Rye', amount: 30, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Turkey Breast', calories: 160, protein: 35, carbs: 0, fats: 2, serving_size: '120g', quantity: 1.2 },
                { name: 'Quinoa cooked', calories: 220, protein: 8, carbs: 39, fats: 3.5, serving_size: '185g', quantity: 1.5 },
                { name: 'Asparagus', calories: 30, protein: 3, carbs: 5, fats: 0.2, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein', example: 'Turkey, Lean Ham', amount: 40, color: 'bg-blue-500' },
                { label: 'Superfood Carbs', example: 'Quinoa, Buckwheat', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack', time: '05:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Cottage Cheese Low Fat', calories: 90, protein: 13, carbs: 4, fats: 2, serving_size: '100g', quantity: 1.5 },
                { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, serving_size: '180g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Snack', example: 'Cottage Cheese, Skyr', amount: 20, color: 'bg-blue-500' },
                { label: 'Fruit', example: 'Apple, Pear', amount: 150, color: 'bg-pink-500' }
              ]
            },
            {
              name: 'Dinner', time: '08:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'White Fish (Cod)', calories: 150, protein: 30, carbs: 0, fats: 1.5, serving_size: '150g', quantity: 1.5 },
                { name: 'Sweet Potato boiled', calories: 180, protein: 4, carbs: 41, fats: 0.3, serving_size: '200g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 90, protein: 0, carbs: 0, fats: 10, serving_size: '10g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'White Fish/Protein', example: 'Cod, Hake, Tilapia', amount: 40, color: 'bg-blue-500' },
                { label: 'Root Carbs', example: 'Sweet Potato, Pumpkin', amount: 60, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_moderate-gain': {
          name: 'Moderate Gain',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Skyr 0%', calories: 150, protein: 28, carbs: 8, fats: 0.5, serving_size: '250g', quantity: 1.2 },
                { name: 'Oats', calories: 150, protein: 6, carbs: 26, fats: 3, serving_size: '40g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Foundation', example: 'Skyr, Quartz', amount: 35, color: 'bg-blue-500' },
                { label: 'Carbs', example: 'Oats, Granola', amount: 30, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:30 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fats: 1.5, serving_size: '30g', quantity: 1.5 },
                { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving_size: '1 medium', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fast Protein', example: 'Whey, Isolate', amount: 35, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Lean Beef', calories: 250, protein: 35, carbs: 0, fats: 12, serving_size: '150g', quantity: 1.2 },
                { name: 'Brown Rice cooked', calories: 215, protein: 5, carbs: 45, fats: 1.8, serving_size: '200g', quantity: 1.2 },
                { name: 'Broccoli', calories: 50, protein: 4.5, carbs: 10, fats: 0.6, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Red Meat/Protein', example: 'Lean Beef, Steak', amount: 40, color: 'bg-blue-500' },
                { label: 'Whole Grain Carbs', example: 'Brown Rice, Pasta', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Almonds', calories: 160, protein: 6, carbs: 6, fats: 14, serving_size: '28g', quantity: 1 },
                { name: 'Pear', calories: 100, protein: 0.6, carbs: 25, fats: 0.3, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Healthy Fats', example: 'Almonds, Walnuts', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 200, protein: 40, carbs: 0, fats: 4, serving_size: '150g', quantity: 1.3 },
                { name: 'Potato boiled', calories: 130, protein: 3, carbs: 30, fats: 0.2, serving_size: '150g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 90, protein: 0, carbs: 0, fats: 10, serving_size: '10g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein', example: 'Chicken, Turkey', amount: 45, color: 'bg-blue-500' },
                { label: 'Root Carbs', example: 'Potato, Sweet Potato', amount: 45, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_active-build': {
          name: 'Active Build',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Oatmeal with whey', calories: 350, protein: 30, carbs: 40, fats: 8, serving_size: 'Bowl', quantity: 1 },
                { name: 'Berries', calories: 60, protein: 1, carbs: 14, fats: 0.5, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Power Breakfast', example: 'Oats with Whey', amount: 40, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Peanut Butter', calories: 190, protein: 8, carbs: 6, fats: 16, serving_size: '32g', quantity: 1 },
                { name: 'Whole grain toast', calories: 140, protein: 6, carbs: 24, fats: 2, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fuel Snack', example: 'Toast with PB', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 250, protein: 50, carbs: 0, fats: 5, serving_size: '200g', quantity: 1 },
                { name: 'Pasta Whole grain', calories: 300, protein: 12, carbs: 60, fats: 2.5, serving_size: '85g dry', quantity: 1 },
                { name: 'Tomato Sauce', calories: 50, protein: 2, carbs: 10, fats: 1, serving_size: '100g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Maximum Protein', example: 'Chicken, Seitan', amount: 60, color: 'bg-blue-500' },
                { label: 'Performance Carbs', example: 'Pasta, Rice', amount: 70, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt 0%', calories: 100, protein: 18, carbs: 6, fats: 0.2, serving_size: '170g', quantity: 1.2 },
                { name: 'Walnuts', calories: 185, protein: 4, carbs: 4, fats: 18, serving_size: '28g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Recovery Snack', example: 'Yogurt & Nuts', amount: 25, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Seitan', calories: 240, protein: 45, carbs: 10, fats: 2, serving_size: '200g', quantity: 1 },
                { name: 'Rice Mix', calories: 200, protein: 5, carbs: 42, fats: 1, serving_size: '150g', quantity: 1 },
                { name: 'Avocado', calories: 160, protein: 2, carbs: 8, fats: 15, serving_size: '100g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Plant/Meat Protein', example: 'Seitan, Beef', amount: 50, color: 'bg-blue-500' },
                { label: 'Complex Carbs', example: 'Brown Rice, Quinoa', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Late Snack', time: '11:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Casein Shake', calories: 120, protein: 24, carbs: 3, fats: 1.5, serving_size: '30g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nightly Protein', example: 'Casein, Cottage Cheese', amount: 25, color: 'bg-blue-500' }
              ]
            }
          ]
        },
        'nutrition_athlete-perform': {
          name: 'Athlete Perform',
          nutrition_master_plan_meals: [
            {
              name: 'Pre-Workout', time: '07:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving_size: '1 unit', quantity: 1 },
                { name: 'Rice Cakes', calories: 70, protein: 1.5, carbs: 15, fats: 0.5, serving_size: '2 units', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fast Carbs', example: 'Banana, Rice Cakes', amount: 40, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Breakfast', time: '09:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Scrambled Eggs (3 eggs)', calories: 210, protein: 18, carbs: 1.5, fats: 15, serving_size: '150h', quantity: 1 },
                { name: 'Sourdough Bread', calories: 180, protein: 6, carbs: 36, fats: 1, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Eggs, Tofu', amount: 25, color: 'bg-blue-500' },
                { label: 'Carb Source', example: 'Sourdough, Oats', amount: 40, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Lean Beef Steak', calories: 300, protein: 40, carbs: 0, fats: 15, serving_size: '180g', quantity: 1 },
                { name: 'White Rice', calories: 300, protein: 6, carbs: 65, fats: 0.5, serving_size: '230g', quantity: 1 },
                { name: 'Green Salad', calories: 50, protein: 2, carbs: 5, fats: 3, serving_size: 'Bowl', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Muscle Protein', example: 'Steak, Chicken', amount: 45, color: 'bg-blue-500' },
                { label: 'Energy Carbs', example: 'White Rice, Pasta', amount: 70, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack', time: '05:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Smoothie (Whey, Oats, Berries)', calories: 400, protein: 35, carbs: 45, fats: 8, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Recovery Smoothie', example: 'Whey + Oats', amount: 80, color: 'bg-purple-500' }
              ]
            },
            {
              name: 'Dinner', time: '08:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon Fillet', calories: 350, protein: 35, carbs: 0, fats: 22, serving_size: '170g', quantity: 1 },
                { name: 'Couscous', calories: 250, protein: 8, carbs: 50, fats: 1, serving_size: '150g', quantity: 1 },
                { name: 'Roasted Veg', calories: 100, protein: 4, carbs: 15, fats: 3, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Healthy Fat Protein', example: 'Salmon, Mackerel', amount: 40, color: 'bg-blue-500' },
                { label: 'Quick Carbs', example: 'Couscous, Bulgur', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Evening', time: '10:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt', calories: 150, protein: 20, carbs: 8, fats: 5, serving_size: '170g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nightly Recovery', example: 'Yogurt, Casein', amount: 25, color: 'bg-blue-500' }
              ]
            }
          ]
        },
        'nutrition_mass-builder': {
          name: 'Mass Builder',
          nutrition_master_plan_meals: [
            {
              name: 'Meal 1', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Energy Bowl (Oats, Peanut Butter, Berries)', calories: 550, protein: 25, carbs: 75, fats: 18, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Mass Breakfast', example: 'Huge Bowl of Oats', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 2', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Pasta with Chicken', calories: 500, protein: 35, carbs: 70, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Muscle Meal', example: 'Pasta + Protein', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 3 (Lunch)', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Beef with Rice', calories: 600, protein: 45, carbs: 80, fats: 12, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Classic Bulk', example: 'Beef & Rice', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 4', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Protein Shake & Fruit', calories: 350, protein: 30, carbs: 50, fats: 5, serving_size: 'Med', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Anabolic Snack', example: 'Shake + Banana', amount: 80, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Meal 5 (Dinner)', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon and Potato', calories: 600, protein: 40, carbs: 75, fats: 15, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Night Fuel', example: 'Salmon & Potatoes', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Late', time: '11:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Nuts', calories: 200, protein: 5, carbs: 5, fats: 18, serving_size: '30g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nuts/Fats', example: 'Walnuts, Peanuts', amount: 20, color: 'bg-amber-500' }
              ]
            }
          ]
        },
        'nutrition_power-lifting': {
          name: 'Power Lifting',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Power Breakfast (4 eggs, 4 slices toast)', calories: 600, protein: 35, carbs: 60, fats: 25, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Strength Breakfast', example: 'Eggs & Toast', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Steak with Mash', calories: 800, protein: 55, carbs: 80, fats: 30, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Strength Lunch', example: 'Steak & Potato', amount: 150, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Pre-Lift', time: '04:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Rice & Chicken', calories: 500, protein: 35, carbs: 70, fats: 8, serving_size: 'Med', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Pre-Lift Fuel', example: 'Rice + Chicken', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Post-Lift', time: '07:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Mass Gainer / Recovery', calories: 500, protein: 40, carbs: 80, fats: 5, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Anabolic Window', example: 'Shake + High Carbs', amount: 120, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken with Sweet Potato', calories: 700, protein: 50, carbs: 80, fats: 20, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Night Recovery', example: 'Chicken & Sweet Potato', amount: 130, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_extreme-bulk': {
          name: 'Extreme Bulk',
          nutrition_master_plan_meals: [
            {
              name: 'Meal 1', time: '07:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Breakfast Gainer', calories: 650, protein: 35, carbs: 95, fats: 15, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 1', example: 'Gainer Shake/Bowl', amount: 150, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 2', time: '10:30 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Pasta & Meatballs', calories: 550, protein: 30, carbs: 80, fats: 12, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 2', example: 'Pasta & Meat', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 3', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Rice & Beef', calories: 600, protein: 40, carbs: 90, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 3', example: 'Beef & Rice', amount: 140, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 4', time: '04:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Weight Gainer Shake', calories: 500, protein: 30, carbs: 90, fats: 5, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 4', example: 'Mass Gainer', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 5', time: '07:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken & Bulk Rice', calories: 600, protein: 40, carbs: 90, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 5', example: 'Chicken & Rice', amount: 140, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 6', time: '10:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Cereal & Milk', calories: 400, protein: 15, carbs: 60, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 6', example: 'Cereal Bowl', amount: 80, color: 'bg-emerald-500' }
              ]
            }
          ]
        }
      };

      // Compatibility mapping: nutrition_fat-loss-basic points to the 1500 kcal fallback
      fallbacks['nutrition_fat-loss-basic'] = fallbacks['nutrition_1500_fat_loss_basic'];

      if (fallbacks[slug]) {
        masterPlan = fallbacks[slug];
      } else {
        return res.status(404).json({ error: 'Master plan not found' });
      }
    } else {
      masterPlan = mData;
    }

    // 2. Map to nutrition_plans.data_json structure
    const meals = masterPlan.nutrition_master_plan_meals.map((m: any) => ({
      id: Math.floor(Math.random() * 1000000), // temp id for frontend
      name: m.name,
      time: m.time,
      iconName: m.icon_name,
      items: (m.nutrition_master_plan_meal_foods || []).map((f: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        foodId: f.food_id,
        name: f.name,
        calories: Number(f.calories),
        protein: Number(f.protein),
        carbs: Number(f.carbs),
        fats: Number(f.fats),
        servingSize: f.serving_size,
        quantity: Number(f.quantity)
      })),
      categories: (m.nutrition_master_plan_general_blocks || []).map((b: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        label: b.label,
        example: b.example,
        amount: Number(b.amount),
        color: b.color
      }))
    }));

    const data_json = {
      meals,
      mode: 'example' // As requested: predeterminado en Example Mode
    };

    // 3. Upsert into nutrition_plans (atomic — relies on UNIQUE(client_id, created_by))
    const payload = {
      client_id: id,
      created_by: managerId,
      name: `${masterPlan.name} Plan`,
      data_json,
      updated_at: new Date().toISOString()
    };

    const result = await supabaseAdmin
      .from('nutrition_plans')
      .upsert(payload, { onConflict: 'client_id,created_by' })
      .select()
      .single();

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error applying master plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Apply a training master plan to a client
router.post('/clients/:id/apply-training-master-plan', async (req: any, res: any) => {
  const { id } = req.params;
  const { slug } = req.body;
  const managerId = req.user.id;

  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const fallbacks: Record<string, any> = {
      'training_fuerza-start': {
        name: 'Fuerza Start',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Dynamic Mobility',
            exercises: [
              { id: 'w1', name: 'Arm Circles', sets: '2', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w1' },
              { id: 'w2', name: 'Leg Swings', sets: '2', reps: '12 each', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w2' },
              { id: 'w3', name: 'Cat-Cow', sets: '2', reps: '10', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w3' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Compound Focus',
            exercises: [
              { id: 's1', name: 'Goblet Squat', sets: '3', reps: '12', rest: '90s', rir: '2', type: 'Compound', weight: '10kg', exerciseId: 'e_s1' },
              { id: 's2', name: 'Push Ups', sets: '3', reps: '10', rest: '60s', rir: '1', type: 'Compound', weight: 'Bodyweight', exerciseId: 'e_s2' },
              { id: 's3', name: 'Dumbbell Row', sets: '3', reps: '12', rest: '60s', rir: '2', type: 'Compound', weight: '8kg', exerciseId: 'e_s3' },
              { id: 's4', name: 'Plank', sets: '3', reps: '45s', rest: '45s', rir: '-', type: 'Core', weight: '-', exerciseId: 'e_s4' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Static cool down',
            exercises: [
              { id: 'st1', name: 'Child\'s Pose', sets: '1', reps: '60s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st1' },
              { id: 'st2', name: 'Hamstring Stretch', sets: '1', reps: '45s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st2' }
            ]
          }
        ]
      },
      'training_fuerza-regular': {
        name: 'Fuerza Regular',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Pre-activation',
            exercises: [
              { id: 'w1', name: 'Face Pulls', sets: '2', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '5kg', exerciseId: 'e_w_fp' },
              { id: 'w2', name: 'Bird Dog', sets: '2', reps: '12', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_bd' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Strength & Hypertrophy',
            exercises: [
              { id: 's1', name: 'Barbell Back Squat', sets: '4', reps: '8', rest: '2-3m', rir: '2', type: 'Compound', weight: '40kg', exerciseId: 'e_s_bs' },
              { id: 's2', name: 'Bench Press', sets: '4', reps: '8', rest: '2-3m', rir: '2', type: 'Compound', weight: '30kg', exerciseId: 'e_s_bp' },
              { id: 's3', name: 'Pull Ups', sets: '3', reps: '8-10', rest: '2m', rir: '1', type: 'Compound', weight: '-', exerciseId: 'e_s_pu' },
              { id: 's4', name: 'Romanian Deadlift', sets: '3', reps: '10', rest: '90s', rir: '2', type: 'Compound', weight: '30kg', exerciseId: 'e_s_rdl' },
              { id: 's5', name: 'Lateral Raises', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '5kg', exerciseId: 'e_s_lr' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Muscular release',
            exercises: [
              { id: 'st1', name: 'Pigeon Stretch', sets: '1', reps: '60s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ps' },
              { id: 'st2', name: 'Chest Stretch', sets: '1', reps: '60s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_cs' }
            ]
          }
        ]
      },
      'training_fuerza-pro': {
        name: 'Fuerza Pro',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Performance Prep',
            exercises: [
              { id: 'w1', name: 'World Greatest Stretch', sets: '2', reps: '8 each', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_wgs' },
              { id: 'w2', name: 'Glute Bridges', sets: '2', reps: '20', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_gb' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Performance & Power',
            exercises: [
              { id: 's1', name: 'Deadlift', sets: '5', reps: '5', rest: '3-4m', rir: '2', type: 'Compound', weight: '100kg', exerciseId: 'e_s_dl' },
              { id: 's2', name: 'Overhead Press', sets: '4', reps: '6', rest: '3m', rir: '2', type: 'Compound', weight: '40kg', exerciseId: 'e_s_ohp' },
              { id: 's3', name: 'Weighted Pull Ups', sets: '3', reps: '6-8', rest: '2m', rir: '1', type: 'Compound', weight: '10kg', exerciseId: 'e_s_wpu' },
              { id: 's4', name: 'Barbell Rows', sets: '4', reps: '8', rest: '2m', rir: '2', type: 'Compound', weight: '60kg', exerciseId: 'e_s_br' },
              { id: 's5', name: 'Walking Lunges', sets: '3', reps: '12 each', rest: '90s', rir: '1', type: 'Compound', weight: '20kg', exerciseId: 'e_s_wl' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Deep recovery',
            exercises: [
              { id: 'st1', name: 'Cobra Pose', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_cp' },
              { id: 'st2', name: 'Downward Dog', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_dd' }
            ]
          }
        ]
      },
      'training_perdida-grasa': {
        name: 'Pérdida de Grasa',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Metabolic Prep',
            exercises: [
              { id: 'w1', name: 'Jumping Jacks', sets: '3', reps: '45s', rest: '15s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_jj' },
              { id: 'w2', name: 'Mountain Climbers', sets: '3', reps: '30s', rest: '15s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_mc' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'High Intensity Circuit',
            exercises: [
              { id: 's1', name: 'Thrusters', sets: '4', reps: '15', rest: '45s', rir: '1', type: 'Compound', weight: '10kg', exerciseId: 'e_s_th' },
              { id: 's2', name: 'Kettlebell Swings', sets: '4', reps: '20', rest: '45s', rir: '1', type: 'Compound', weight: '16kg', exerciseId: 'e_s_ks' },
              { id: 's3', name: 'Burpees', sets: '4', reps: '12', rest: '45s', rir: '0', type: 'Cardio', weight: '-', exerciseId: 'e_s_bu' },
              { id: 's4', name: 'Box Jumps', sets: '4', reps: '10', rest: '45s', rir: '1', type: 'Power', weight: '-', exerciseId: 'e_s_bj' },
              { id: 's5', name: 'Battle Ropes', sets: '4', reps: '30s', rest: '45s', rir: '-', type: 'Cardio', weight: '-', exerciseId: 'e_s_br' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Metabolic cool down',
            exercises: [
              { id: 'st1', name: 'Passive Hanging', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ph' },
              { id: 'st2', name: 'Quad Stretch', sets: '2', reps: '45s each', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_qs' }
            ]
          }
        ]
      },
      'training_hipertrofia': {
        name: 'Hipertrofia',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Pump & Prep',
            exercises: [
              { id: 'w1', name: 'Band Pull-aparts', sets: '3', reps: '20', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_bpa' },
              { id: 'w2', name: 'Air Squats', sets: '3', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_as' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Volume & Sarcoplasmic focus',
            exercises: [
              { id: 's1', name: 'Incline DB Bench Press', sets: '4', reps: '10-12', rest: '90s', rir: '1', type: 'Compound', weight: '20kg', exerciseId: 'e_s_idbp' },
              { id: 's2', name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '90s', rir: '1', type: 'Compound', weight: '50kg', exerciseId: 'e_s_lpd' },
              { id: 's3', name: 'Leg Press', sets: '4', reps: '12-15', rest: '2m', rir: '1', type: 'Compound', weight: '120kg', exerciseId: 'e_s_lp' },
              { id: 's4', name: 'Dumbbell Flys', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '10kg', exerciseId: 'e_s_df' },
              { id: 's5', name: 'Hammer Curls', sets: '3', reps: '12', rest: '60s', rir: '1', type: 'Isolation', weight: '12kg', exerciseId: 'e_s_hc' },
              { id: 's6', name: 'Tricep Rope Pushdowns', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '20kg', exerciseId: 'e_s_tpd' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Fascial stretch',
            exercises: [
              { id: 'st1', name: 'Late Stretch', sets: '2', reps: '45s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ls' },
              { id: 'st2', name: 'Wall Pec Stretch', sets: '2', reps: '45s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_wps' }
            ]
          }
        ]
      },
      'training_movilidad': {
        name: 'Movilidad & Recuperación',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Joint Lubrication',
            exercises: [
              { id: 'w1', name: 'Neck Circles', sets: '1', reps: '10 each', rest: '0s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w_nc' },
              { id: 'w2', name: 'Hip Circles', sets: '1', reps: '10 each', rest: '0s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w_hc' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Active Restoration',
            exercises: [
              { id: 's1', name: 'Spiderman Lunges', sets: '3', reps: '10 each', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_sl' },
              { id: 's2', name: '90/90 Hip Switches', sets: '3', reps: '12', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_9090' },
              { id: 's3', name: 'Thoracic Bridge', sets: '3', reps: '10 each', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_tb' },
              { id: 's4', name: 'Frog Stretch', sets: '3', reps: '60s', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_fs' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Parasympathetic Activation',
            exercises: [
              { id: 'st1', name: 'Viparita Karani', sets: '1', reps: '3m', rest: '0s', rir: '-', type: 'Restorative', weight: '-', exerciseId: 'e_st_vk' },
              { id: 'st2', name: 'Deep Breathing', sets: '1', reps: '5m', rest: '0s', rir: '-', type: 'Restorative', weight: '-', exerciseId: 'e_st_db' }
            ]
          }
        ]
      },
      'training_resistencia': {
        name: 'Resistencia',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Aerobic Prep',
            exercises: [
              { id: 'w1', name: 'Light Jog', sets: '1', reps: '5m', rest: '60s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_lj' },
              { id: 'w2', name: 'Dynamic Stretch', sets: '1', reps: '5m', rest: '60s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_ds' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Sustained Output',
            exercises: [
              { id: 's1', name: 'Running / Cycling', sets: '1', reps: '30m', rest: '0s', rir: 'Zone 2', type: 'Cardio', weight: '-', exerciseId: 'e_s_rc' },
              { id: 's2', name: 'Rowing Intervals', sets: '5', reps: '2m', rest: '60s', rir: 'Hard', type: 'Cardio', weight: '-', exerciseId: 'e_s_ri' },
              { id: 's3', name: 'Bear Crawls', sets: '4', reps: '20m', rest: '60s', rir: '1', type: 'Conditioning', weight: '-', exerciseId: 'e_s_bc' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Myofascial cool down',
            exercises: [
              { id: 'st1', name: 'Foam Rolling Legs', sets: '1', reps: '5m', rest: '0s', rir: '-', type: 'Recovery', weight: '-', exerciseId: 'e_st_frl' },
              { id: 'st2', name: 'Hip Flexor Stretch', sets: '1', reps: '60s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_hfs' }
            ]
          }
        ]
      }
    };

    if (!fallbacks[slug]) {
      return res.status(404).json({ error: 'Training master plan not found' });
    }

    const masterPlan = fallbacks[slug];

    // Atomic upsert into training_programs (relies on UNIQUE(client_id, created_by))
    const payload = {
      client_id: id,
      created_by: managerId,
      name: `${masterPlan.name} Program`,
      data_json: { blocks: masterPlan.blocks },
      updated_at: new Date().toISOString()
    };

    const result = await supabaseAdmin
      .from('training_programs')
      .upsert(payload, { onConflict: 'client_id,created_by' })
      .select()
      .single();

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error applying training master plan:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});


// Get manager settings
router.get('/settings', async (req: any, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('manager_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json(settings || {
      user_id: req.user.id,
      theme_color: '#17cf54',
      dark_mode: false,
      density: 'Comfortable',
      font_scale: 100,
      notification_prefs: {
        new_client_check_ins_email: true,
        new_client_check_ins_push: true,
        new_messages_email: false,
        new_messages_push: true,
        appointment_reminders_email: true,
        appointment_reminders_push: true,
        system_updates_email: true,
        system_updates_push: false
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update manager settings
router.post('/settings', async (req: any, res) => {
  try {
    const ALLOWED_SETTINGS_FIELDS = ['theme_color', 'dark_mode', 'density', 'font_scale', 'notification_prefs', 'language'];
    const filtered: Record<string, any> = {};
    for (const key of ALLOWED_SETTINGS_FIELDS) {
      if (key in req.body) filtered[key] = req.body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('manager_settings')
      .upsert({
        user_id: req.user.id,
        ...filtered
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});


// Get the manager's SaaS subscription, invoices and payment method
router.get('/billing', async (req: any, res) => {
  try {
    const { data: sub } = await supabaseAdmin
      .from('manager_subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    let invoices: any[] = [];
    let paymentMethod: any = null;

    const platformKey = process.env.STRIPE_SECRET_KEY;
    if (sub?.stripe_customer_id && platformKey) {
      try {
        const stripe = newStripeClient(platformKey);
        const inv = await stripe.invoices.list({ customer: sub.stripe_customer_id, limit: 12 });
        invoices = inv.data.map(i => ({
          id: i.id,
          date: i.created ? new Date(i.created * 1000).toISOString() : null,
          amount: (i.amount_paid ?? i.amount_due ?? 0) / 100,
          currency: (i.currency || 'usd').toUpperCase(),
          status: i.status,
          pdf: i.invoice_pdf || i.hosted_invoice_url || null
        }));
        const cust: any = await stripe.customers.retrieve(sub.stripe_customer_id, {
          expand: ['invoice_settings.default_payment_method']
        });
        const pm: any = cust?.invoice_settings?.default_payment_method;
        if (pm?.card) {
          paymentMethod = { brand: pm.card.brand, last4: pm.card.last4, expMonth: pm.card.exp_month, expYear: pm.card.exp_year };
        }
      } catch (e: any) {
        console.error('Billing Stripe fetch error:', e?.message);
      }
    }

    res.json({ subscription: sub || null, invoices, paymentMethod });
  } catch (error: any) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Canonical billing status — single endpoint the frontend hits to know the tier,
// remaining trial days, configured limits, and live usage counts. Used by the
// trial banner, the paywall, and the Settings/Billing card.
router.get('/billing/status', async (req: any, res) => {
  try {
    const userId = req.user.id;

    const { data: sub } = await supabaseAdmin
      .from('manager_subscriptions')
      .select('plan_tier, status, current_period_end, trial_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    const tier: PlanTier = (sub?.plan_tier as PlanTier) || 'trial';
    const limits = limitsForTier(tier);
    const blocked = isAccessBlocked({
      tier,
      status: sub?.status,
      trialEndsAt: sub?.trial_ends_at,
    });

    // Live usage counts. Resources that don't have a backing table yet report 0.
    const monthStartIso = (() => {
      const d = new Date();
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
    })();

    const [clientsCount, automationsCount, monthlyMsgCount] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('manager_id', userId)
        .eq('role', 'CLIENT')
        .neq('status', 'inactive'),
      // Cupo unico: automations simples + workflows avanzados activos.
      countActiveAutomations(supabaseAdmin, userId),
      supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', userId)
        .gte('created_at', monthStartIso),
    ]);

    const usage = {
      activeClients: clientsCount.count ?? 0,
      activeAutomations: automationsCount,
      monthlyMessages: monthlyMsgCount.count ?? 0,
      activeAlerts: 0,
      storageGB: 0,
    };

    res.json({
      tier,
      status: sub?.status || (tier === 'trial' ? 'trialing' : 'inactive'),
      isTrial: tier === 'trial',
      trialEndsAt: sub?.trial_ends_at || null,
      trialDaysLeft: trialDaysLeft(sub?.trial_ends_at),
      currentPeriodEnd: sub?.current_period_end || null,
      hasStripeSubscription: Boolean(sub?.stripe_subscription_id),
      accessBlocked: blocked,
      limits,
      usage,
    });
  } catch (error: any) {
    console.error('Error fetching billing status:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a Stripe Billing Portal session (manage plan / payment method / invoices)
router.post('/billing/portal', async (req: any, res) => {
  try {
    const platformKey = process.env.STRIPE_SECRET_KEY;
    if (!platformKey) {
      return res.status(503).json({ error: 'Billing is not configured on this server.' });
    }
    const { data: sub } = await supabaseAdmin
      .from('manager_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return res.status(404).json({ error: 'No subscription found for this account.' });
    }

    const stripe = newStripeClient(platformKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?billing_updated=1`
    });
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// List supplements (paginado ASC por category + id tiebreak).
// El sort secundario por `name` se mantiene como criterio dentro de la
// misma categoria pero NO entra en el cursor (mismo razonamiento que en
// templates: el coach navega por categoria, name es solo presentacion).
router.get('/supplements', async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 100, maxLimit: 300 });
  try {
    let q = supabaseAdmin
      .from('supplements')
      .select('*')
      .or(`manager_id.is.null,manager_id.eq.${req.user.id}`)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'category', 'asc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'category'));
  } catch (error: any) {
    console.error('Error fetching supplements:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a custom supplement for this manager
router.post('/supplements', async (req: any, res) => {
  try {
    const { name, category, purpose, recommended_dose, timing, notes, emoji, language,
      brand, primary_ingredient, calories, protein, carbs, fats, quality_rating } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const numOrNull = (v: any) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
    const { data, error } = await supabaseAdmin
      .from('supplements')
      .insert({
        name: String(name).trim(),
        category: category || null,
        purpose: purpose || null,
        recommended_dose: recommended_dose || null,
        timing: timing || null,
        notes: notes || null,
        emoji: emoji || null,
        language: language || 'es',
        brand: brand || null,
        primary_ingredient: primary_ingredient || null,
        calories: numOrNull(calories),
        protein: numOrNull(protein),
        carbs: numOrNull(carbs),
        fats: numOrNull(fats),
        quality_rating: numOrNull(quality_rating),
        is_custom: true,
        manager_id: req.user.id
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating supplement:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update manager password
router.post('/update-password', async (req: any, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (error) throw error;

    // Log the event
    await supabaseAdmin.from('login_history').insert({
      user_id: req.user.id,
      event: 'Password changed',
      status: 'Success',
      device: req.headers['user-agent'],
      ip_address: req.ip
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get active sessions (paginadas DESC por last_active)
router.get('/security/sessions', async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 20, maxLimit: 100 });
  try {
    let q = supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_active', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'last_active', 'desc');
    const { data: sessions, error } = await q;
    if (error) throw error;
    res.json(buildPage(sessions || [], page.limit, 'last_active'));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Revoke session
router.delete('/security/sessions/:id', async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Revoke ALL sessions for this user (global sign-out across every device).
router.post('/security/sessions/revoke-all', async (req: any, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (token) {
      try {
        await supabaseAdmin.auth.admin.signOut(token, 'global');
      } catch (e: any) {
        console.error('admin signOut error:', e?.message);
      }
    }
    await supabaseAdmin.from('user_sessions').delete().eq('user_id', req.user.id);
    await supabaseAdmin.from('login_history').insert({
      user_id: req.user.id, event: 'Signed out everywhere', status: 'Success'
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get login history (paginado DESC por timestamp)
router.get('/security/history', async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 10, maxLimit: 100 });
  try {
    let q = supabaseAdmin
      .from('login_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'timestamp', 'desc');
    const { data: history, error } = await q;
    if (error) throw error;
    res.json(buildPage(history || [], page.limit, 'timestamp'));
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Toggle 2FA
router.post('/security/2fa/toggle', async (req: any, res) => {
  try {
    const { enabled } = req.body;
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ mfa_enabled: enabled })
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Log the event
    await supabaseAdmin.from('login_history').insert({
      user_id: req.user.id,
      event: enabled ? '2FA enabled' : '2FA disabled',
      status: 'Success'
    });

    res.json({ success: true, mfa_enabled: enabled });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});// Get real aggregated analytics for this manager
router.get('/analytics', async (req: any, res) => {
  const managerId = req.user.id;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. Single clients fetch — replaces 3 serial COUNT queries
    const { data: allClientData } = await supabaseAdmin
      .from('users')
      .select('id, created_at, status')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: true });

    const totalClients = allClientData?.length || 0;
    const activeClients = allClientData?.filter(c => c.status === 'Active').length || 0;
    const newClients = allClientData?.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length || 0;
    const clientIds = (allClientData || []).map(c => c.id);

    // 2. Run all main data queries in parallel
    const [
      checkInsRes,
      recentCheckInsRes,
      recentMessagesRes,
      allCheckInsRes,
      allProgramsRes,
      integrationsRes,
      recentSubmissionsRes,
      perfSubmissionsRes,
      allSubmissionsRes,
      workoutLogsRes,
      nutritionPlansRes,
    ] = await Promise.all([
      // Performance metrics: check_ins last 60 days — filtered by clientIds (no join needed)
      clientIds.length > 0
        ? supabaseAdmin.from('check_ins').select('date, data_json, client_id').in('client_id', clientIds).gte('date', sixtyDaysAgo.toISOString().split('T')[0])
        : Promise.resolve({ data: [], error: null }),
      // Recent legacy check-ins for activity feed
      clientIds.length > 0
        ? supabaseAdmin.from('check_ins').select('id, date, client_id, reviewed_at, users!inner (email, profiles!left (full_name))').in('client_id', clientIds).order('date', { ascending: false }).limit(10)
        : Promise.resolve({ data: [], error: null }),
      // Recent messages received by manager
      supabaseAdmin.from('messages').select('id, content, created_at, sender_id, users!sender_id (email, role, profiles!left (full_name))').eq('receiver_id', managerId).eq('users.role', 'CLIENT').order('created_at', { ascending: false }).limit(10),
      // All check-ins for cohort analysis (lightweight: only client_id + date)
      clientIds.length > 0
        ? supabaseAdmin.from('check_ins').select('client_id, date').in('client_id', clientIds)
        : Promise.resolve({ data: [], error: null }),
      // Training programs
      clientIds.length > 0
        ? supabaseAdmin.from('training_programs').select('data_json').in('client_id', clientIds)
        : Promise.resolve({ data: [], error: null }),
      // Integrations (for Stripe revenue)
      supabaseAdmin.from('integrations').select('*').eq('user_id', managerId).maybeSingle(),
      // Recent template-based submissions (new check-in system)
      clientIds.length > 0
        ? supabaseAdmin.from('client_checkin_submissions').select('id, submitted_at, reviewed_at, client_id, users!inner (email, profiles!left (full_name))').in('client_id', clientIds).order('submitted_at', { ascending: false }).limit(10)
        : Promise.resolve({ data: [], error: null }),
      // Performance metrics: dynamic submissions last 60 days (merged with legacy below)
      clientIds.length > 0
        ? supabaseAdmin.from('client_checkin_submissions').select('submitted_at, answers_json, client_id').in('client_id', clientIds).gte('submitted_at', sixtyDaysAgo.toISOString())
        : Promise.resolve({ data: [], error: null }),
      // All dynamic submissions for cohort analysis (lightweight: client_id + date)
      clientIds.length > 0
        ? supabaseAdmin.from('client_checkin_submissions').select('client_id, submitted_at').in('client_id', clientIds)
        : Promise.resolve({ data: [], error: null }),
      // Workout logs last 30 days — for real training volume
      clientIds.length > 0
        ? supabaseAdmin.from('workout_logs').select('logged_at, exercises, client_id').in('client_id', clientIds).gte('logged_at', thirtyDaysAgo.toISOString())
        : Promise.resolve({ data: [], error: null }),
      // Nutrition plans — for the calorie-goal line
      clientIds.length > 0
        ? supabaseAdmin.from('nutrition_plans').select('data_json, client_id').in('client_id', clientIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const checkInsError = checkInsRes.error;
    const recentCheckIns = recentCheckInsRes.data || [];
    const recentMessages = recentMessagesRes.data || [];
    const allPrograms = allProgramsRes.data || [];
    const recentSubmissions = recentSubmissionsRes.data || [];
    const integrations = integrationsRes.data;

    if (checkInsError) throw checkInsError;

    // Unify legacy check_ins and dynamic submissions so all downstream metrics
    // (churn, retention, active clients, nutrition/training aggregation) count
    // check-ins regardless of which system produced them.
    const perfSubmissions = (perfSubmissionsRes.data || []).map((s: any) => ({
      date: (s.submitted_at || '').split('T')[0],
      data_json: s.answers_json || {},
      client_id: s.client_id
    }));
    const checkIns = [...(checkInsRes.data || []), ...perfSubmissions];

    const allSubmissions = (allSubmissionsRes.data || []).map((s: any) => ({
      client_id: s.client_id,
      date: (s.submitted_at || '').split('T')[0]
    }));
    const allCheckIns = [...(allCheckInsRes.data || []), ...allSubmissions];

    // Filter check-ins into buckets
    const last30DaysCheckIns = (checkIns || []).filter(ci => new Date(ci.date) >= thirtyDaysAgo);
    const previous30DaysCheckIns = (checkIns || []).filter(ci => {
      const d = new Date(ci.date);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const activeClientsLast30 = new Set(last30DaysCheckIns.map(ci => ci.client_id)).size;
    const activeClientsPrev30 = new Set(previous30DaysCheckIns.map(ci => ci.client_id)).size;

    // Calculate Churn Proxy: (PrevActive - StillActive) / PrevActive
    const stillActive = new Set(
      previous30DaysCheckIns
        .filter(prev => last30DaysCheckIns.some(curr => curr.client_id === prev.client_id))
        .map(ci => ci.client_id)
    ).size;
    
    const churnRate = activeClientsPrev30 > 0 
      ? Number(((activeClientsPrev30 - stillActive) / activeClientsPrev30 * 100).toFixed(1)) 
      : 0;
    
    const retentionRate = totalClients && totalClients > 0 
      ? Number((activeClientsLast30 / totalClients * 100).toFixed(1)) 
      : 0;

    // 3. Aggregate Nutrition & Training Stats (Last 30 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    let dailyNutrition: Record<string, { intake: number[], goal: number[], count: number[] }> = {};
    let dailyTraining: Record<string, { volume: number[], rpe: number[], count: number[] }> = {};
    
    // Initialize day buckets
    const caloriesByDay = last7Days.map(() => ({ intake: 0, goal: 0, count: 0 }));
    const trainingByDay = last7Days.map(() => ({ volume: 0, intensity: 0, count: 0 }));
    const clientDeficits: Record<string, { name: string, email: string, deficit: number }> = {};

    let nutrition = {
      avgHydration: 0,
      consistency: 0,
      alcoholAlerts: 0,
      supplementAdherence: 0,
      calories: { intake: [0,0,0,0,0,0,0], goal: [0,0,0,0,0,0,0] },
      topDeficits: [] as any[]
    };

    let training = {
      avgCompletion: 0,
      totalVolume: 0,
      avgRPE: 0,
      volumeTrends: [0,0,0,0,0,0,0],
      intensityTrends: [0,0,0,0,0,0,0]
    };

    if (last30DaysCheckIns.length > 0) {
      const count = last30DaysCheckIns.length;
      let sumHydration = 0, sumSuppAdh = 0, sumComp = 0, sumRPE = 0, sumNutrition = 0;
      const numVal = (x: any) => { const v = Number(x); return Number.isFinite(v) ? v : null; };
      const suppMap: Record<string, number> = { All: 100, Most: 75, Some: 40, None: 0 };

      const mapping: Record<string, number> = {
        'Perfect (>95%)': 100, 'Mostly (>80%)': 85, 'Somewhat (50-80%)': 65, 'Little (<50%)': 30, 'None': 0,
        'All sessions': 100, 'Missed 1': 85, 'Missed 2-3': 60, 'None done': 0,
        'Excellent': 100, 'Good': 80, 'Okay': 60, 'Struggling': 30,
        'Mostly': 80, 'Yes': 100, 'No': 0,
        'Perfect': 100, 'Very High': 90, 'High': 80, 'Moderate': 60, 'Low': 30, 'Poor': 10
      };

      last30DaysCheckIns.forEach(ci => {
        const d = ci.data_json as any;
        const ciDate = ci.date;
        const dayIdx = last7Days.indexOf(ciDate);

        // Nutrition adherence — fixed metric `nutrition_adherence_score` (1-10).
        const adherenceBase = d.nutrition_adherence_score !== undefined ? Number(d.nutrition_adherence_score) * 10
                            : (d.adherence_score !== undefined ? Number(d.adherence_score) * 10 : null);
        const nutVal = adherenceBase ?? (mapping[d.nutritionAdherence] ?? Number(d.nutritionAdherence || 0));

        // Training adherence — fixed metric `training_adherence_score` (1-10).
        const traScore = numVal(d.training_adherence_score);
        const traVal = (traScore != null && traScore > 0) ? traScore * 10
                     : (mapping[d.trainingAdherence] ?? Number(d.trainingAdherence || 0));

        // Hydration — fixed metric `water_intake_score` (1-10).
        const hydScore = numVal(d.water_intake_score);
        const hydrateVal = (hydScore != null && hydScore > 0) ? hydScore * 10
                         : (mapping[d.waterIntake] ?? Number(d.hydration_percent || 0));

        // Training intensity / RPE — fixed metric `training_intensity_score` (1-10).
        const intScore = numVal(d.training_intensity_score);
        const rpeVal = (intScore != null && intScore > 0) ? intScore
                     : Math.round((mapping[d.trainingIntensity] ?? 0) / 10);

        sumNutrition += nutVal;
        sumHydration += hydrateVal;

        // Alcohol — fixed metric `alcohol_intake`.
        const alcohol = d.alcohol_intake ?? d.alcoholIntake;
        if (alcohol && alcohol !== 'None') nutrition.alcoholAlerts++;

        // Supplement adherence — fixed metric `supplements_taken` (All/Most/Some/None).
        if (d.supplements_taken !== undefined) {
          sumSuppAdh += suppMap[d.supplements_taken] ?? 0;
        } else if (d.supplements && d.supplements !== 'None') {
          sumSuppAdh += 100;
        }

        if (dayIdx !== -1) {
          // Real reported daily calories (fixed check-in metric `calories`).
          caloriesByDay[dayIdx].intake += Number(d.calories || 0);
          caloriesByDay[dayIdx].count++;
        }

        // Track Deficits per Client (using adherence as proxy)
        const deficit = 100 - nutVal;
        if (!clientDeficits[ci.client_id] || deficit > clientDeficits[ci.client_id].deficit) {
          clientDeficits[ci.client_id] = {
            name: (ci.users as any)?.email?.split('@')[0] || 'Client',
            email: (ci.users as any)?.email || '',
            deficit
          };
        }

        // Detailed Training Aggregation (volume is computed separately from workout_logs)
        sumComp += traVal;
        sumRPE += rpeVal;

        if (dayIdx !== -1) {
          trainingByDay[dayIdx].intensity += rpeVal;
          trainingByDay[dayIdx].count++;
        }
      });

      nutrition.avgHydration = Math.round(sumHydration / count);
      nutrition.consistency = Math.round(sumNutrition / count);
      nutrition.supplementAdherence = Math.round(sumSuppAdh / count);
      
      nutrition.calories.intake = caloriesByDay.map(d => d.count > 0 ? Math.round(d.intake / d.count) : 0);
      
      nutrition.topDeficits = Object.values(clientDeficits)
        .sort((a,b) => b.deficit - a.deficit)
        .slice(0, 5)
        .map(d => ({ 
          name: d.name, 
          email: d.email, 
          deficit: d.deficit > 20 ? 'Action Required' : 'On Track', 
          status: d.deficit > 20 ? 'High Deficit' : 'On Track' 
        }));

      training.avgCompletion = Math.round(sumComp / count);
      training.avgRPE = Number((sumRPE / count).toFixed(1));
      training.intensityTrends = trainingByDay.map(d => d.count > 0 ? Number((d.intensity / d.count).toFixed(1)) : 0);
    }

    // Real training volume — sum of weight × reps across all sets, from workout_logs.
    {
      const sessionVolume = (log: any): number => {
        let v = 0;
        for (const ex of (log.exercises || [])) {
          for (const s of (ex.sets_logged || [])) {
            v += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        }
        return v;
      };
      const logs = workoutLogsRes.data || [];
      const volByDay = last7Days.map(() => 0);
      let totalVol = 0;
      logs.forEach((log: any) => {
        const v = sessionVolume(log);
        totalVol += v;
        const day = (log.logged_at || '').split('T')[0];
        const idx = last7Days.indexOf(day);
        if (idx !== -1) volByDay[idx] += v;
      });
      training.totalVolume = logs.length > 0 ? Math.round(totalVol / logs.length) : 0;
      training.volumeTrends = volByDay;
    }

    // Calorie goal line — average daily calorie target across the clients' nutrition plans.
    {
      const sumMeals = (meals: any[]): number =>
        (meals || []).reduce((t: number, m: any) =>
          t + (m.items || []).reduce((s: number, i: any) =>
            s + (Number(i.calories) || 0) * (Number(i.quantity) || 1), 0), 0);
      const planDailyCalories = (dj: any): number => {
        let data = dj;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return 0; } }
        if (!data) return 0;
        if (data.type === 'weekly' && data.days) {
          const vals = Object.values(data.days).map((d: any) => sumMeals(d?.meals)).filter((v: number) => v > 0);
          return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
        }
        return sumMeals(data.meals);
      };
      const planVals = (nutritionPlansRes.data || [])
        .map((p: any) => planDailyCalories(p.data_json))
        .filter((v: number) => v > 0);
      const avgGoal = planVals.length
        ? Math.round(planVals.reduce((a: number, b: number) => a + b, 0) / planVals.length)
        : 0;
      nutrition.calories.goal = last7Days.map(() => avgGoal);
    }

    // 4. Cohort Analysis Logic (uses allClientData + allCheckIns already fetched)
    const cohorts: any[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Group clients by month
    const clientGroups: Record<string, string[]> = {};
    allClientData?.forEach(c => {
      const date = new Date(c.created_at);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!clientGroups[key]) clientGroups[key] = [];
      clientGroups[key].push(c.id);
    });

    // For each cohort, calculate retention for subsequent months
    Object.keys(clientGroups).reverse().slice(0, 5).reverse().forEach(cohortKey => {
      const cohortClientIds = clientGroups[cohortKey];
      const cohortStartDate = new Date(allClientData?.find(c => cohortClientIds.includes(c.id))?.created_at || '');
      
      const retention = [100]; // Month 0 is always 100%
      for (let i = 1; i <= 6; i++) {
        const targetMonth = new Date(cohortStartDate);
        targetMonth.setMonth(targetMonth.getMonth() + i);
        
        if (targetMonth > now) {
          retention.push(null as any);
          continue;
        }

        const activeInMonth = new Set(
          allCheckIns.filter(ci => {
            if (!cohortClientIds.includes(ci.client_id)) return false;
            const ciDate = new Date(ci.date);
            return ciDate.getMonth() === targetMonth.getMonth() && ciDate.getFullYear() === targetMonth.getFullYear();
          }).map(ci => ci.client_id)
        ).size;

        retention.push(Math.round((activeInMonth / cohortClientIds.length) * 100));
      }
      cohorts.push({ cohort: cohortKey, data: retention });
    });

    // 5. Compliance Score Calculation (Weighted aggregation of adherence)
    const complianceScore = training.avgCompletion * 0.4 + nutrition.avgHydration * 0.3 + (retentionRate) * 0.3;

    // Check-in reliability: % of active clients who submitted a check-in in the last 7 days.
    const checkedInClientIds = new Set(
      (checkIns || []).filter(ci => last7Days.includes(ci.date)).map(ci => ci.client_id)
    );
    const checkInReliability = activeClients > 0
      ? Math.round((checkedInClientIds.size / activeClients) * 100)
      : 0;
    const activePrograms = allPrograms.length;

    // 6. Recent Activity & Attention Required (recentCheckIns + recentMessages from Promise.all above)
    const activity = [
      ...(recentCheckIns || []).map(ci => {
        const userData = ci.users as any;
        const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
        const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';

        return {
          type: 'CHECK_IN',
          title: 'New Check-in',
          sub: `from ${clientName}`,
          time: ci.date,
          color: 'bg-emerald-100 text-emerald-600',
          checkInId: ci.id,
          clientId: ci.client_id
        };
      }),
      // New template-based submissions
      ...recentSubmissions.map(sub => {
        const userData = sub.users as any;
        const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
        const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';
        return {
          type: 'CHECK_IN',
          title: 'New Check-in',
          sub: `from ${clientName}`,
          time: sub.submitted_at,
          color: 'bg-emerald-100 text-emerald-600',
          checkInId: sub.id,
          clientId: sub.client_id
        };
      }),
      ...(recentMessages || []).map(msg => {
        const userData = msg.users as any;
        const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
        const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';

        return {
          type: 'MESSAGE',
          title: 'New Message',
          sub: `from ${clientName}`,
          time: msg.created_at,
          color: 'bg-blue-100 text-blue-600',
          clientId: msg.sender_id
        };
      })
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    const attentionRequired = [
      ...(recentCheckIns || [])
        .filter(ci => !ci.reviewed_at)
        .map(ci => {
          const userData = ci.users as any;
          const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
          const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';
          return {
            id: ci.id,
            type: 'CHECK_IN',
            client: clientName,
            clientId: ci.client_id,
            title: 'Review Check-in',
            desc: `Pending review since ${ci.date}`,
            timeLabel: ci.date,
            status: 'pending',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`
          };
        }),
      // Template-based submissions still pending manager review
      ...recentSubmissions.filter(sub => !sub.reviewed_at).map(sub => {
        const userData = sub.users as any;
        const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
        const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';
        return {
          id: sub.id,
          type: 'CHECK_IN',
          client: clientName,
          clientId: sub.client_id,
          title: 'Review Check-in',
          desc: `Template submission from ${clientName}`,
          timeLabel: sub.submitted_at,
          status: 'pending',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`
        };
      }),
      ...(recentMessages || [])
        .slice(0, 5) // Prioritize messages
        .map(msg => {
          const userData = msg.users as any;
          const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
          const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';
          return {
            id: msg.id,
            type: 'MESSAGE',
            client: clientName,
            clientId: msg.sender_id,
            title: 'New Message',
            desc: msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : ''),
            timeLabel: msg.created_at,
            status: 'pending',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`
          };
        })
    ].sort((a, b) => new Date(b.timeLabel).getTime() - new Date(a.timeLabel).getTime());

    // 7. Revenue & Stripe (integrations already fetched in Promise.all)
    let revenue = 0;
    let monthlyRevenue = Array(12).fill(0);

    if (integrations?.stripe_enabled && integrations?.stripe_secret_key) {
      try {
        const stripe = newStripeClient(integrations.stripe_secret_key);
        const startOfYear = Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000);
        const charges = await stripe.charges.list({ created: { gte: startOfYear }, limit: 100 });
        charges.data.forEach(c => {
          const date = new Date(c.created * 1000);
          if (date.getFullYear() === now.getFullYear()) {
            monthlyRevenue[date.getMonth()] += (c.amount / 100);
          }
        });
        revenue = monthlyRevenue[now.getMonth()];
      } catch (sErr) { console.error('Stripe analytics error:', sErr); }
    }

    // 7. Training Distribution & Muscle Frequency (allPrograms from Promise.all above)
    let typeDist: Record<string, number> = { Strength: 0, Hypertrophy: 0, Mobility: 0, Cardio: 0 };
    let muscleFreq: Record<string, number> = { Legs: 0, Back: 0, Chest: 0, Shoulders: 0, Arms: 0, Core: 0 };
    let totalWorkouts = 0;
    let totalExercises = 0;

    if (allPrograms && allPrograms.length > 0) {
      allPrograms.forEach(prog => {
        const pData = prog.data_json as any;
        if (!pData || !pData.workouts) return;

        pData.workouts.forEach((w: any) => {
          totalWorkouts++;
          const name = (w.name || '').toLowerCase();
          if (name.includes('fuerza') || name.includes('strength')) typeDist.Strength++;
          else if (name.includes('hyper') || name.includes('músculo') || name.includes('muscle')) typeDist.Hypertrophy++;
          else if (name.includes('mob') || name.includes('flex')) typeDist.Mobility++;
          else if (name.includes('cardio') || name.includes('run') || name.includes('hit')) typeDist.Cardio++;
          else typeDist.Strength++; // Default

          if (w.blocks) {
            w.blocks.forEach((b: any) => {
              if (b.exercises) {
                b.exercises.forEach((ex: any) => {
                  totalExercises++;
                  const mg = (ex.muscle_group || 'Other').toLowerCase();
                  if (mg.includes('leg') || mg.includes('pierna') || mg.includes('glute') || mg.includes('quad')) muscleFreq.Legs++;
                  else if (mg.includes('back') || mg.includes('espalda') || mg.includes('lat')) muscleFreq.Back++;
                  else if (mg.includes('chest') || mg.includes('pecho') || mg.includes('pec')) muscleFreq.Chest++;
                  else if (mg.includes('shoulder') || mg.includes('hombro') || mg.includes('delt')) muscleFreq.Shoulders++;
                  else if (mg.includes('arm') || mg.includes('brazo') || mg.includes('bi') || mg.includes('tri')) muscleFreq.Arms++;
                  else if (mg.includes('core') || mg.includes('abs') || mg.includes('abd')) muscleFreq.Core++;
                });
              }
            });
          }
        });
      });
    }

    const trainingDistribution = Object.entries(typeDist).map(([label, count]) => ({
      label,
      value: totalWorkouts > 0 ? Math.round((count / totalWorkouts) * 100) : 0
    }));

    const muscleFrequency = Object.entries(muscleFreq).map(([label, count]) => ({
      label,
      percentage: totalExercises > 0 ? Math.round((count / totalExercises) * 100) : 0
    }));

    res.json({
      business: {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        newLeads: newClients || 0,
        retention: retentionRate, 
        churnRate,
        revenue: revenue || 0,
        ltv: totalClients ? Math.round((revenue * 6) / totalClients) : 0,
        monthlyRevenue,
        cohorts,
        complianceScore: Math.round(complianceScore || 0),
        workoutAdherence: training.avgCompletion,
        nutritionConsistency: nutrition.consistency,
        checkInReliability
      },
      nutrition,
      training: {
        ...training,
        activePrograms,
        distribution: trainingDistribution,
        muscleFrequency
      },
      recentActivity: activity.length > 0 ? activity : [
         { type: 'SYSTEM', title: 'Welcome', sub: 'to your dashboard', time: 'Just now', color: 'bg-blue-100 text-blue-600' }
      ],
      attentionRequired: attentionRequired
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});
;

// NOTE: The legacy /onboarding* routes (onboarding_messages / onboarding_assignments)
// were removed. They had no manager_id scoping (cross-tenant IDOR) and were unused —
// the app uses the multi-tenant system in routes/onboarding.ts (/api/onboarding/*).

// Get detailed profile stats for a specific client
router.get('/clients/:id/profile-stats', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  const now = new Date();

  try {
    // 1. Verify client belongs to manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('*, clients_profiles(*)')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) return res.status(404).json({ error: 'Client not found' });

    // 2. Fetch Check-ins
    const { data: checkIns } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: true });

    // 3. Weight & Body Fat History
    // Coerce a possibly-string numeric field to a real number, or null when blank/non-numeric.
    const num = (v: any): number | null => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    // 4. Latest Measurements (From legacy and dynamic)
    const { data: dynamicCheckIns } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('*')
      .eq('client_id', id)
      .order('submitted_at', { ascending: true });

    // Combine all to find latest measurements
    const allCheckInsCombined = [
      ...(checkIns || []).map(ci => ({ date: ci.date, answers: ci.data_json as any })),
      ...(dynamicCheckIns || []).map(ci => ({ date: ci.submitted_at, answers: ci.answers_json as any }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lastCheckInAny = allCheckInsCombined.length > 0 ? allCheckInsCombined[allCheckInsCombined.length - 1] : null;
    const prevCheckInAny = allCheckInsCombined.length > 1 ? allCheckInsCombined[allCheckInsCombined.length - 2] : null;

    // 3. Weight & Body Fat history — from ALL check-ins (legacy + dynamic submissions),
    //    reading the canonical fixed metric keys `weight` / `body_fat`.
    const weightHistory = allCheckInsCombined.map(ci => ({
      date: ci.date,
      weight: num(ci.answers?.weight),
      bodyFat: num(ci.answers?.body_fat ?? ci.answers?.bodyFat)
    })).filter(w => w.weight !== null);

    const measurements: any = lastCheckInAny ? (lastCheckInAny.answers.measurements || {}) : {};
    const prevMeasurements: any = prevCheckInAny ? (prevCheckInAny.answers.measurements || {}) : {};
    
    // Attempt to extract from top-level questions if not in .measurements.
    // The legacy check-in form uses flat keys: waist, hips, chest, arms, thighs.
    const extractM = (a: any) => {
      if (!a) return {};
      const m: any = { ...(a.measurements || {}) };
      const pick = (...keys: string[]) => {
        for (const k of keys) { const v = num(a[k]); if (v !== null) return v; }
        return undefined;
      };
      if (m.waist === undefined) m.waist = pick('waist', 'Waist', 'Waist (cm)');
      if (m.hip === undefined) m.hip = pick('hip', 'hips', 'Hip', 'Hips', 'Hip (cm)');
      if (m.thigh_r === undefined) m.thigh_r = pick('thigh_r', 'thighs', 'Thigh', 'Right Thigh', 'Right Thigh (cm)');
      if (m.arm_r === undefined) m.arm_r = pick('arm_r', 'arms', 'Arm', 'Right Arm', 'Right Arm (cm)');
      Object.keys(m).forEach(k => { if (m[k] === undefined) delete m[k]; });
      return m;
    };

    const currentM = extractM(lastCheckInAny?.answers);
    const oldM = extractM(prevCheckInAny?.answers);

    const calcChange = (curr: any, old: any) => {
      const c = Number(curr);
      const o = Number(old);
      if (isNaN(c) || isNaN(o)) return '0';
      const diff = c - o;
      return diff === 0 ? '0' : diff.toFixed(1);
    };

    const finalMeasurements = {
      ...currentM,
      waistChange: calcChange(currentM.waist, oldM.waist),
      hipChange: calcChange(currentM.hip, oldM.hip),
      thighChange: calcChange(currentM.thigh_r, oldM.thigh_r),
      armChange: calcChange(currentM.arm_r, oldM.arm_r)
    };

    // 5. Macro Adherence (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLegacyCheckIns = (checkIns || []).filter(ci => new Date(ci.date) >= sevenDaysAgo);
    
    // Fetch dynamic check-ins for the last 7 days too
    const { data: recentDynamicCheckIns } = await supabaseAdmin
      .from('client_checkin_submissions')
      .select('*')
      .eq('client_id', id)
      .gte('submitted_at', sevenDaysAgo.toISOString())
      .order('submitted_at', { ascending: false });

    // Average daily macro INTAKE (grams / kcal) from the fixed check-in keys
    // `protein` / `carbs` / `fats` / `calories`, plus the 1-10 plan-adherence score.
    let avgProteinIntake = 0;
    let avgCarbsIntake = 0;
    let avgFatsIntake = 0;
    let dailyCaloricAvg = 0;
    let avgAdherenceScore = 0;

    // Combine both legacy and dynamic check-ins
    const allRecentCheckIns = [
      ...recentLegacyCheckIns.map(ci => ({ ...ci, data: ci.data_json as any })),
      ...(recentDynamicCheckIns || []).map(ci => ({ ...ci, data: ci.answers_json as any }))
    ];

    if (allRecentCheckIns.length > 0) {
      const avg = (key: string) => {
        const vals = allRecentCheckIns.map(ci => num(ci.data?.[key])).filter((v): v is number => v !== null);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      };
      avgProteinIntake = Math.round(avg('protein'));
      avgCarbsIntake = Math.round(avg('carbs'));
      avgFatsIntake = Math.round(avg('fats'));
      dailyCaloricAvg = Math.round(avg('calories'));
      // nutrition_adherence_score is 1-10 → scale to 0-100%
      avgAdherenceScore = Math.round(Math.min(Math.max(avg('nutrition_adherence_score') * 10, 0), 100));
    }

    // 6. Recent Activity — id was validated as UUID earlier (route ownership check), so safe in .or().
    // Defense in depth: re-check format before interpolating into PostgREST filter string.
    if (!UUID_RE.test(id)) {
      return res.status(400).json({ error: 'Invalid client id format' });
    }
    const { data: recentMsgs } = await supabaseAdmin
      .from('messages')
      .select('created_at, content')
      .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
      .order('created_at', { ascending: false })
      .limit(3);

    const activity = [
      ...(checkIns || []).slice(-3).map(ci => ({
        type: 'CHECK_IN',
        title: 'Morning Check-in',
        sub: `Logged weight (${(ci.data_json as any).weight}kg)`,
        time: ci.date,
        color: 'bg-emerald-100 text-emerald-600'
      })),
      ...(recentMsgs || []).map(m => ({
        type: 'MESSAGE',
        title: 'Message Received',
        sub: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        time: m.created_at,
        color: 'bg-blue-100 text-blue-600'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    // 8. Training Stats — from workout_logs
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const { data: allWorkoutLogs } = await supabaseAdmin
      .from('workout_logs')
      .select('*')
      .eq('client_id', id)
      .order('logged_at', { ascending: false })
      .limit(100);

    const workoutLogs = allWorkoutLogs || [];
    const weeklyLogs = workoutLogs.filter(w => new Date(w.logged_at) >= startOfWeek);

    let weeklyVolume = 0;
    let avgRPE = 0;
    let workoutCount = weeklyLogs.length;

    // Helper: compute total volume for a session (sum of weight × reps for all sets of all exercises)
    const calcSessionVolume = (log: any): number => {
      let vol = 0;
      for (const ex of (log.exercises || [])) {
        for (const s of (ex.sets_logged || [])) {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          vol += w * r;
        }
      }
      return vol;
    };

    weeklyLogs.forEach(log => {
      weeklyVolume += calcSessionVolume(log);
    });

    const logsWithRPE = weeklyLogs.filter(l => l.session_rpe);
    avgRPE = logsWithRPE.length > 0
      ? Number((logsWithRPE.reduce((s, l) => s + Number(l.session_rpe), 0) / logsWithRPE.length).toFixed(1))
      : 0;

    // Fatigue: Pull from latest check-in if possible, otherwise use session RPE as fallback
    const latestAnyCheckIn = allCheckInsCombined.length > 0 ? allCheckInsCombined[allCheckInsCombined.length - 1] : null;
    let fatigue = 5; // Default middle
    if (latestAnyCheckIn) {
      const a = latestAnyCheckIn.answers;
      const fatigueVal = a.fatigue || a.Fatigue || a['Fatigue Level'] || a.energy_level || a.stress_level;
      if (fatigueVal) {
        // If it's a number (1-10), use it. If it's energy_level (high = low fatigue), invert it if needed.
        // For simplicity, we try to parse it.
        const parsed = parseInt(fatigueVal);
        if (!isNaN(parsed)) fatigue = parsed;
      }
    } else if (logsWithRPE.length > 0) {
      fatigue = Number(logsWithRPE[0].session_rpe);
    }

    // 9. Strength PRs & History from workout_logs
    // PRs & Latest status for ALL exercises
    const allExercisesMap: Record<string, { pr: number, latest: number, latestDate: string }> = {};
    const dayBuckets: Record<string, { volume: number; logs: any }> = {};

    const primaryExercises = [
      'Bench Press', 'Squat', 'Deadlift', 'Military Press', 'Barbell Row',
      'Sentadilla', 'Peso Muerto', 'Press Banca', 'Press Militar', 'Remo con Barra',
      'Buenos Días', 'Romanian Deadlift', '90-90 Hip Switch', 'Adductor Rock-Back'
    ];

    for (const log of workoutLogs) {
      const d = new Date(log.logged_at);
      const key = d.toISOString().split('T')[0];
      
      if (!dayBuckets[key]) dayBuckets[key] = { volume: 0, logs: {} };
      dayBuckets[key].volume += calcSessionVolume(log);

      for (const ex of (log.exercises || [])) {
        const exNameRaw = (ex.name || 'Unknown Exercise').trim();
        
        const canonicalMapping: Record<string, string> = {
          'press banca': 'Bench Press',
          'press de banca': 'Bench Press',
          'sentadilla': 'Squat',
          'peso muerto': 'Deadlift',
          'press militar': 'Military Press',
          'remo con barra': 'Barbell Row',
          'buenos dias': 'Buenos Días',
          'buenos días': 'Buenos Días',
          'peso muerto rumano': 'Romanian Deadlift'
        };

        const mappedName = canonicalMapping[exNameRaw.toLowerCase()] || exNameRaw;
        const canonicalName = primaryExercises.find(p => p.toLowerCase() === mappedName.toLowerCase()) || mappedName;
        
        const sets = (ex.sets_logged || []);
        const maxWTotal = sets.reduce((m: number, s: any) => Math.max(m, Number(s.weight) || 0), 0);
        
        // Track PR & Latest
        if (!allExercisesMap[canonicalName]) {
          allExercisesMap[canonicalName] = { pr: maxWTotal, latest: maxWTotal, latestDate: log.logged_at };
        } else {
          allExercisesMap[canonicalName].pr = Math.max(allExercisesMap[canonicalName].pr, maxWTotal);
          if (new Date(log.logged_at) > new Date(allExercisesMap[canonicalName].latestDate)) {
            allExercisesMap[canonicalName].latest = maxWTotal;
            allExercisesMap[canonicalName].latestDate = log.logged_at;
          }
        }

        // GRANULAR LOGS: Track max weight FOR EACH rep count on this DAY
        if (!(dayBuckets[key].logs as any)[canonicalName]) {
          (dayBuckets[key].logs as any)[canonicalName] = { 
             repMaxes: {} as Record<string, number>,
             max_weight: 0 
          };
        }
        const exBucket = (dayBuckets[key].logs as any)[canonicalName];
        exBucket.max_weight = Math.max(exBucket.max_weight, maxWTotal);

        for (const s of sets) {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          if (r > 0 && w > 0) {
            const rStr = String(r);
            exBucket.repMaxes[rStr] = Math.max(exBucket.repMaxes[rStr] || 0, w);
          }
        }
      }
    }

    // FILL GAPS: Ensure the current week (Mon-Sun) is present, plus some history
    const nowLocal = new Date();
    const dayIdx = nowLocal.getDay();
    const isoToday = dayIdx === 0 ? 7 : dayIdx;
    
    // Get Monday of current week
    const currentMonday = new Date(nowLocal);
    currentMonday.setDate(nowLocal.getDate() - (isoToday - 1));
    
    // Fill 35 days: from 28 days ago to the end of the current week (Sunday)
    for (let i = 0; i < 35; i++) {
        const d = new Date(currentMonday);
        d.setDate(currentMonday.getDate() - 28 + i);
        const k = d.toISOString().split('T')[0];
        if (!dayBuckets[k]) {
            dayBuckets[k] = { volume: 0, logs: {} };
        }
    }

    // Convert allExercisesMap to a sorted array for the UI (sorted by latest activity)
    const allExercises = Object.entries(allExercisesMap)
      .map(([name, data]) => ({
        name,
        pr: data.pr,
        latest: data.latest,
        latestDate: data.latestDate
      }))
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

    // Canonical PRs for compatibility/legacy if still needed elsewhere
    const findPR = (keywords: string[]) => {
      const entry = allExercises.find(ex => keywords.some(kw => ex.name.toLowerCase().includes(kw)));
      return entry ? { weight: entry.pr, date: entry.latestDate } : null;
    };
    const squatPR = findPR(['squat', 'sentadilla']);
    const deadliftPR = findPR(['deadlift', 'peso muerto']);
    const benchPR = findPR(['bench', 'press banca', 'press plano', 'chest press']);

    const prs = {
      squat: squatPR ? squatPR.weight : '--',
      deadlift: deadliftPR ? deadliftPR.weight : '--',
      bench: benchPR ? benchPR.weight : '--',
      date: squatPR?.date || deadliftPR?.date || benchPR?.date || null
    };

    const strengthHistory = Object.entries(dayBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        volume: vals.volume,
        logs: vals.logs // Contains max weight for every exercise done this day
      }));

    // Recent workouts: last 10 sessions with full exercise detail
    const recentWorkouts = workoutLogs.slice(0, 10).map(log => ({
      id: log.id,
      name: log.workout_name || 'Workout Session',
      date: log.logged_at,
      status: 'Completed',
      volume: Math.round(calcSessionVolume(log)),
      rpe: log.session_rpe || 0,
      notes: log.notes,
      exercises: log.exercises || [] // This includes sets_logged and notes for each exercise
    }));

    // Sensations: collect notes for specific exercises across all logs
    const sensations: { exercise: string, date: string, note: string }[] = [];
    for (const log of workoutLogs) {
      for (const ex of (log.exercises || [])) {
        if (ex.notes && ex.notes.trim()) {
          sensations.push({
            exercise: ex.name,
            date: new Date(log.logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            note: ex.notes
          });
        }
      }
      if (sensations.length >= 10) break; // Limit to 10 latest sensations
    }

    // 10. Mindset Stats & History — from ALL check-ins (legacy + dynamic submissions),
    //     reading the canonical fixed 1-10 metric keys.
    const latestData = lastCheckInAny?.answers || {};

    const mEnergy = (d: any) => num(d?.energy_level ?? d?.energy);
    const mStress = (d: any) => num(d?.stress_level ?? d?.stress);
    const mMood = (d: any) => num(d?.mood_score ?? d?.mood);
    const mMotivation = (d: any) => num(d?.motivation_level ?? d?.motivation);
    const mSleep = (d: any) => num(d?.sleep_hours ?? d?.sleep ?? d?.sleepQuantity);
    const mSleepQuality = (d: any) => num(d?.sleep_quality_score ?? d?.sleepQuality);
    const mSteps = (d: any) => num(d?.steps ?? d?.stepCount);

    const mindset = {
      energy: mEnergy(latestData) ?? '--',
      stress: mStress(latestData) ?? '--',
      mood: mMood(latestData) ?? '--',
      motivation: mMotivation(latestData) ?? '--',
      sleep: mSleep(latestData) ?? '--',
      sleepQuality: mSleepQuality(latestData) ?? '--',
      steps: mSteps(latestData) ?? '--',
      history: allCheckInsCombined.map(ci => {
        const d = ci.answers as any;
        return {
          date: ci.date,
          energy: mEnergy(d),
          stress: mStress(d),
          mood: mMood(d),
          motivation: mMotivation(d),
          sleep: mSleep(d),
          sleepQuality: mSleepQuality(d),
          steps: mSteps(d)
        };
      }).filter(h => h.energy !== null || h.stress !== null || h.mood !== null || h.motivation !== null || h.sleep !== null || h.sleepQuality !== null || h.steps !== null)
    };

    // 11. Documents (Filtered real data from messages and submissions)
    const { data: messageAttachments } = await supabaseAdmin
      .from('messages')
      .select('attachment_name, attachment_url, created_at, attachment_type, content')
      .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
      .not('attachment_url', 'is', null);

    // Classify an attachment into a real file category from its URL/extension.
    const classifyAttachment = (url: string, declaredType?: string | null) => {
      const clean = String(url || '').split('?')[0].toLowerCase();
      const ext = clean.includes('.') ? clean.split('.').pop() || '' : '';
      if (declaredType === 'image' || /^(jpg|jpeg|png|gif|webp|heic|bmp|svg)$/.test(ext)) return 'image';
      if (declaredType === 'audio' || /^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(ext)) return 'audio';
      if (declaredType === 'video' || /^(mp4|mov|avi|wmv|mkv|webm)$/.test(ext)) return 'video';
      if (/^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf|odt)$/.test(ext)) return 'document';
      return declaredType && declaredType !== 'file' ? declaredType : 'document';
    };
    const fileNameFromUrl = (url: string) => {
      try {
        const seg = decodeURIComponent(String(url || '').split('?')[0].split('/').pop() || '');
        return seg && seg.includes('.') ? seg : '';
      } catch { return ''; }
    };

    const documents = (messageAttachments || [])
      .filter(m => m.attachment_url) // Real attached files only — never the chat text itself
      .map(m => {
        const kind = classifyAttachment(m.attachment_url as string, m.attachment_type);
        const fallbackName =
          kind === 'image' ? 'Photo' :
          kind === 'audio' ? 'Audio' :
          kind === 'video' ? 'Video' : 'Document';
        return {
          name: m.attachment_name || fileNameFromUrl(m.attachment_url as string) || fallbackName,
          url: m.attachment_url,
          date: m.created_at,
          type: kind
        };
      });

    // Add initial assessment if it exists from profile
    if ((client.clients_profiles as any)?.metadata?.initial_assessment_url) {
      const assessmentUrl = (client.clients_profiles as any).metadata.initial_assessment_url;
      if (assessmentUrl) {
          documents.unshift({
            name: 'Initial Assessment.pdf',
            url: assessmentUrl,
            date: client.created_at,
            type: 'PDF'
          });
      }
    }

    // 12. Active Plans
    const { data: nutritionPlans } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    const { data: trainingPrograms } = await supabaseAdmin
      .from('training_programs')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Dynamic Allergies from Recent Onboarding or Metadata
    const { data: latestOnboarding } = await supabaseAdmin
      .from('client_onboarding_submissions')
      .select('answers_json')
      .eq('client_id', id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let allergies = (client.clients_profiles as any)?.metadata?.allergies || [];
    let supplementation = (client.clients_profiles as any)?.metadata?.supplementation || [];
    let dietaryStyle: string[] = (client.clients_profiles as any)?.metadata?.dietary_style || [];
    if (latestOnboarding?.answers_json) {
      const answers = latestOnboarding.answers_json as any;
      const onboardingAllergies = answers.allergies || answers.Allergies || answers['Do you have any allergies?'];
      if (onboardingAllergies) {
         allergies = Array.isArray(onboardingAllergies) ? onboardingAllergies : [onboardingAllergies];
      }

      const onboardingSupps = answers.supplementation || answers.Supplementation || answers['Are you taking any supplements?'];
      if (onboardingSupps && (!supplementation || supplementation.length === 0)) {
         supplementation = Array.isArray(onboardingSupps) ? onboardingSupps : [onboardingSupps];
      }

      const onboardingDiet = answers.dietary_style || answers.dietType || answers.diet_type || answers.diet || answers['Dietary preference'];
      if (onboardingDiet && (!dietaryStyle || dietaryStyle.length === 0)) {
         dietaryStyle = Array.isArray(onboardingDiet) ? onboardingDiet : [onboardingDiet];
      }
    }

    res.json({
      weightHistory,
      latestWeight: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : (client.clients_profiles as any)?.weight || 0,
      goal: (client.clients_profiles as any)?.goal || 'TBD',
      bodyFat: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].bodyFat : '--',
      activeDays: (checkIns?.length || 0) + (recentDynamicCheckIns?.length || 0),
      accessExpiration: (client.clients_profiles as any)?.metadata?.access_expiration || null,
      adherenceRate: (() => {
        // % of the last 30 days that have at least one check-in (legacy + dynamic).
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const days = new Set<string>();
        (checkIns || []).forEach(ci => {
          if (ci.date && new Date(ci.date) >= thirtyDaysAgo) days.add(String(ci.date).split('T')[0]);
        });
        (dynamicCheckIns || []).forEach(ci => {
          if (ci.submitted_at && new Date(ci.submitted_at) >= thirtyDaysAgo) days.add(String(ci.submitted_at).split('T')[0]);
        });
        return Math.min(Math.round((days.size / 30) * 100), 100);
      })(),
      macros: {
        protein: avgProteinIntake,
        carbs: avgCarbsIntake,
        fats: avgFatsIntake,
        calories: dailyCaloricAvg,
        adherenceScore: avgAdherenceScore
      },
      training: {
        weeklyVolume,
        avgRPE,
        workoutCount,
        fatigue,
        prs,
        strengthHistory,
        allExercises,
        recentWorkouts,
        sensations
      },
      mindset,
      measurements: finalMeasurements,
      activity,
      documents,
      allergies: allergies.length > 0 ? allergies : ['None'],
      supplementation: supplementation.length > 0 ? supplementation : ['None'],
      dietaryStyle,
      nutritionPlan: nutritionPlans && nutritionPlans.length > 0 ? nutritionPlans[0] : null,
      trainingPlan: trainingPrograms && trainingPrograms.length > 0 ? trainingPrograms[0] : null
    });
  } catch (error: any) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Supplementation handlers
router.get('/clients/:id/supplementation', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const { data: profile, error } = await supabaseAdmin
      .from('clients_profiles')
      .select('metadata')
      .eq('user_id', id)
      .single();

    if (error) throw error;
    res.json(profile?.metadata?.supplementation || []);
  } catch (error: any) {
    console.error('Error fetching supplementation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/clients/:id/supplementation', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  const { supplementation } = req.body;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', id).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const { data: profile } = await supabaseAdmin
      .from('clients_profiles')
      .select('metadata')
      .eq('user_id', id)
      .single();

    const metadata = {
      ...(profile?.metadata || {}),
      supplementation: Array.isArray(supplementation) ? supplementation : [supplementation]
    };

    const { error } = await supabaseAdmin
      .from('clients_profiles')
      .update({ metadata })
      .eq('user_id', id);

    if (error) throw error;
    res.json({ success: true, supplementation: metadata.supplementation });
  } catch (error: any) {
    console.error('Error updating supplementation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- TASKS & CALENDAR ROUTES ---

// Get all tasks for this manager
router.get('/tasks', async (req: any, res) => {
  // Two modes:
  //   • Range mode (?from=YYYY-MM-DD&to=YYYY-MM-DD): used by the calendar.
  //     We return every one-off task whose date falls in the range PLUS
  //     virtual instances expanded from recurring tasks. Exceptions (skip
  //     / override) are applied here so the frontend sees a flat list.
  //   • Paginated mode (default, no from/to): keeps the old keyset cursor
  //     behaviour used by Tasks.tsx so we don't break that view.
  const from = typeof req.query.from === 'string' ? req.query.from : null;
  const to   = typeof req.query.to   === 'string' ? req.query.to   : null;

  if (from && to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ error: 'from/to must be YYYY-MM-DD' });
    }
    try {
      // Pull one-offs in range + every recurring parent that could possibly
      // touch the range (starts on/before `to`). The expansion below filters
      // by recurrence_end so series that already finished don't leak in.
      const { data: oneOffs, error: oneOffErr } = await supabaseAdmin
        .from('tasks')
        .select('*, users!client_id(email, profiles!user_id(full_name, avatar_url))')
        .eq('manager_id', req.user.id)
        .is('recurrence_rule', null)
        .gte('date', from)
        .lte('date', to);
      if (oneOffErr) throw oneOffErr;

      const { data: recurring, error: recErr } = await supabaseAdmin
        .from('tasks')
        .select('*, users!client_id(email, profiles!user_id(full_name, avatar_url))')
        .eq('manager_id', req.user.id)
        .not('recurrence_rule', 'is', null)
        .lte('date', to);
      if (recErr) throw recErr;

      const fromDate = new Date(`${from}T00:00:00`);
      const toDate   = new Date(`${to}T23:59:59`);

      // Fetch exceptions for the recurring tasks in this window once.
      const recurringIds = (recurring || []).map((t: any) => t.id);
      let exceptionsByTask: Record<string, TaskException[]> = {};
      if (recurringIds.length) {
        const { data: exData } = await supabaseAdmin
          .from('task_exceptions')
          .select('*')
          .in('task_id', recurringIds);
        for (const ex of (exData || []) as TaskException[]) {
          (exceptionsByTask[ex.task_id] ||= []).push(ex);
        }
      }

      const virtualInstances: any[] = [];
      for (const parent of (recurring || []) as TaskRow[]) {
        const dates = expandTaskDates(parent, fromDate, toDate);
        const { kept, overrides } = applyExceptions(dates, exceptionsByTask[parent.id] || []);
        for (const d of kept) {
          const ov = overrides.get(d);
          virtualInstances.push({
            ...parent,
            id: virtualInstanceId(parent.id, d),
            date: d,
            recurrence_parent_id: parent.id,
            is_virtual: true,
            ...(ov?.override_payload || {}),
          });
        }
      }

      res.json({ tasks: [...(oneOffs || []), ...virtualInstances] });
      return;
    } catch (error: any) {
      console.error('Error expanding tasks:', error);
      res.status(500).json({ error: safeErr(error) });
      return;
    }
  }

  // Tareas paginadas cronologicamente ASC (las mas proximas primero).
  // Cursor keyset sobre `date`; usamos `id` como tiebreaker. El campo
  // `time` queda como sort secundario solo dentro del mismo `date` — no
  // entra en el cursor para no triplicar la complejidad (en la practica
  // dos tareas con el mismo date+time del mismo manager son rarisimas).
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('tasks')
      .select('*, users!client_id(email, profiles!user_id(full_name, avatar_url))')
      .eq('manager_id', req.user.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'date', 'asc');
    const { data: tasks, error } = await q;
    if (error) throw error;
    res.json(buildPage(tasks || [], page.limit, 'date'));
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Helper function to sync a task to Google Calendar
async function syncToGoogleCalendar(managerId: string, task: any, operation: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT') {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', managerId)
      .maybeSingle();

    if (!integrations?.google_calendar_enabled) {
      return;
    }

    let auth: any = integrations.google_calendar_api_key;

    if (integrations.google_service_account) {
      try {
        const credentials = typeof integrations.google_service_account === 'string' 
          ? JSON.parse(integrations.google_service_account) 
          : integrations.google_service_account;
        
        auth = google.auth.fromJSON(credentials);
        (auth as any).scopes = ['https://www.googleapis.com/auth/calendar'];
      } catch (err) {
        console.error('Failed to parse Google Service Account JSON');
        return; 
      }
    } else if (!auth) {
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = integrations.google_calendar_id || 'primary';
    
    console.log(`Syncing task ${task.id} to Google Calendar ${calendarId}...`);
    // Determine the date/time string
    // Standardize: if task has date and start_time/time
    const dateStr = task.date || new Date().toISOString().split('T')[0];
    const timeStr = task.time || task.start_time || '09:00';
    const derivedEndHour = (parseInt(timeStr.split(':')[0]) + 1) % 24;
    const endStr = task.end_time || (derivedEndHour.toString().padStart(2, '0') + ':' + timeStr.split(':')[1]);

    const eventBody: any = {
      summary: task.title,
      description: task.description || task.desc || '',
      start: {
        dateTime: `${dateStr}T${timeStr}:00Z`,
      },
      end: {
        dateTime: `${dateStr}T${endStr}:00Z`,
      },
      timeZone: 'UTC' // Standardize
    };

    // If this is a recurring series, attach the RRULE. Google Calendar accepts
    // the same iCalendar string we already store, with an UNTIL=YYYYMMDDTHHMMSSZ
    // suffix when we want a bounded series.
    if (task.recurrence_rule) {
      const rrule = String(task.recurrence_rule).toUpperCase();
      let line = `RRULE:${rrule}`;
      if (task.recurrence_end) {
        const until = new Date(task.recurrence_end);
        if (!Number.isNaN(until.getTime())) {
          const yyyy = until.getUTCFullYear();
          const mm = String(until.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(until.getUTCDate()).padStart(2, '0');
          const hh = String(until.getUTCHours()).padStart(2, '0');
          const mi = String(until.getUTCMinutes()).padStart(2, '0');
          const ss = String(until.getUTCSeconds()).padStart(2, '0');
          const sep = line.endsWith(rrule) ? ';' : ';';
          line += `${sep}UNTIL=${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
        }
      }
      eventBody.recurrence = [line];
    }

    console.log('Google Event Data:', JSON.stringify(eventBody, null, 2));

    if (operation === 'DELETE') {
      if (task.google_event_id) {
        await calendar.events.delete({ calendarId, eventId: task.google_event_id });
        console.log(`Task ${task.id} deleted from Google Calendar`);
      }
    } else if (operation === 'UPDATE' && task.google_event_id) {
      await calendar.events.update({
        calendarId,
        eventId: task.google_event_id,
        requestBody: eventBody
      });
      console.log(`Task ${task.id} updated in Google Calendar`);
    } else {
      // INSERT (or fallback if UPDATE was requested but no ID exists)
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
      });
      
      const newEventId = response.data.id;
      if (newEventId) {
        // Store the ID in our DB
        await supabaseAdmin
          .from('tasks')
          .update({ google_event_id: newEventId })
          .eq('id', task.id);
        console.log(`Task ${task.id} synced to Google Calendar (New Event: ${newEventId})`);
      }
    }
  } catch (error: any) {
    console.error('Google Calendar Sync Error:', error.message || error);
    if (error.code === 404 || error.code === 403) {
      console.warn('CRITICAL: Calendar not found or access denied. Ensure the calendar is SHARED with the Service Account email if using JSON.');
    }
  }
}

// Create a new task
router.post('/tasks', async (req: any, res) => {
  console.log('POST /tasks: Received payload:', JSON.stringify(req.body, null, 2));
  try {
    // Verify that client_id belongs to this manager if provided
    if (req.body.client_id) {
       if (!UUID_RE.test(String(req.body.client_id))) {
         return res.status(400).json({ error: 'Invalid client id format' });
       }
       const { data: clientCheck } = await supabaseAdmin
         .from('users')
         .select('id')
         .eq('id', req.body.client_id)
         .eq('manager_id', req.user.id)
         .eq('role', 'CLIENT')
         .maybeSingle();

       if (!clientCheck) {
         return res.status(403).json({ error: 'Forbidden. Client does not belong to you.' });
       }
    }

    // `time` must be a string before any .split() — guard against numeric/object bodies.
    const timeStr = typeof req.body.time === 'string' ? req.body.time : '';
    const computedEnd = (parseInt(timeStr.split(':')[0] || '09', 10) + 1).toString().padStart(2, '0')
      + ':' + (timeStr.split(':')[1] || '00');

    // Recurrence: the form sends either a UI label ("Weekly") or, for Custom,
    // a raw RRULE string in `recurrence_rule`. We honour an explicit RRULE
    // first; otherwise we derive one from the label. recurrence_end defaults
    // to 1 year out so expansions stay bounded.
    const explicitRule = typeof req.body.recurrence_rule === 'string' && req.body.recurrence_rule.trim()
      ? req.body.recurrence_rule.trim()
      : null;
    const derivedRule = explicitRule || repeatLabelToRrule(req.body.repeat, req.body.date);
    const recurrenceEnd = derivedRule
      ? (req.body.recurrence_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString())
      : null;

    // Priority del form -> columna `priority` en BD. Validamos contra el
    // enum (CHECK constraint en BD lo refuerza); fallback 'medium'.
    const VALID_PRIORITIES = ['low', 'medium', 'high'] as const;
    const rawPrio = String(req.body.priority || '').toLowerCase();
    const priority = (VALID_PRIORITIES as readonly string[]).includes(rawPrio)
      ? rawPrio
      : 'medium';

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        date: req.body.date,
        time: timeStr || null,
        end_time: req.body.end_time || computedEnd,
        duration: req.body.duration,
        client_id: req.body.client_id,
        status: req.body.status || 'pending',
        priority,
        manager_id: req.user.id,
        recurrence_rule: derivedRule,
        recurrence_end: recurrenceEnd,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Google Calendar Sync (non-blocking) - fire and forget
    syncToGoogleCalendar(req.user.id, data).catch(e => console.error('GCal Sync Error:', e));

    res.json(data);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Manual trigger to sync all tasks to Google Calendar
router.post('/integrations/google-calendar/sync-all', async (req: any, res) => {
  try {
    const managerId = req.user.id;
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('manager_id', managerId);

    if (error) throw error;

    let successCount = 0;
    let failCount = 0;

    for (const task of (tasks || [])) {
      try {
        await syncToGoogleCalendar(managerId, task);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    res.json({ success: true, synced: successCount, failed: failCount });
  } catch (error: any) {
    console.error('Error in sync-all:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Test Google Calendar Connection
router.post('/integrations/google-calendar/test', async (req: any, res) => {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!integrations?.google_calendar_api_key && !integrations?.google_service_account) {
      return res.json({ success: false, message: 'Falta la API Key o Cuenta de Servicio' });
    }

    let auth: any = integrations.google_calendar_api_key;
    if (integrations.google_service_account) {
      try {
        const credentials = typeof integrations.google_service_account === 'string' 
          ? JSON.parse(integrations.google_service_account) 
          : integrations.google_service_account;
        auth = google.auth.fromJSON(credentials);
        (auth as any).scopes = ['https://www.googleapis.com/auth/calendar'];
      } catch (err) {
        return res.json({ success: false, message: 'JSON de Cuenta de Servicio inválido' });
      }
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const list = await calendar.calendarList.list({ maxResults: 1 });
    
    // Check if the specific calendarID is accessible
    if (integrations.google_calendar_id) {
       try {
         await calendar.events.list({ calendarId: integrations.google_calendar_id, maxResults: 1 });
       } catch (e: any) {
         return res.json({ success: false, message: `Calendario ID ${integrations.google_calendar_id} no accesible: ${e.message}` });
       }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Google test error:', error);
    let msg = safeErr(error, 'Error de conexión');
    if (error.code === 401) msg = 'No autorizado (revisa tu API Key/JSON)';
    if (error.code === 403) msg = 'Acceso denegado (¿has compartido el calendario con el email de la cuenta de servicio?)';
    res.json({ success: false, message: msg });
  }
});

// Test Stripe Connection
router.post('/integrations/stripe/test', async (req: any, res) => {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!integrations?.stripe_secret_key) {
      return res.json({ success: false, message: 'Falta la Secret Key' });
    }

    const stripe = newStripeClient(integrations.stripe_secret_key);
    await stripe.balance.retrieve();
    res.json({ success: true });
  } catch (error: any) {
    console.error('Stripe test error:', error);
    res.json({ success: false, message: safeErr(error, 'Clave de Stripe inválida') });
  }
});

// Update a task
router.patch('/tasks/:id', async (req: any, res) => {
  try {
    // Two id shapes are accepted:
    //   • Real UUID — edits the stored task. If scope=series we update every
    //     future occurrence at once (it's the recurring parent itself).
    //   • Virtual id "<parentUuid>:<YYYY-MM-DD>" — represents one occurrence
    //     of a recurring series. With scope=instance (default for virtual
    //     ids) we persist an override into task_exceptions instead of
    //     touching the parent. With scope=series we redirect to the parent.
    const rawId = String(req.params.id);
    const scope = req.query.scope === 'instance' ? 'instance' : 'series';
    const virtual = parseVirtualId(rawId);

    const buildUpdates = () => {
      const updates: any = { updated_at: new Date().toISOString() };
      const allowedFields = ['title', 'description', 'type', 'date', 'time', 'end_time', 'duration', 'client_id', 'status', 'priority', 'recurrence_rule', 'recurrence_end'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });
      if (updates.priority !== undefined) {
        const VALID_PRIORITIES = ['low', 'medium', 'high'] as const;
        const norm = String(updates.priority).toLowerCase();
        if (!(VALID_PRIORITIES as readonly string[]).includes(norm)) {
          return { error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` };
        }
        updates.priority = norm;
      }
      // `repeat` label → RRULE, but only when an explicit RRULE wasn't passed
      // already. Edits to one-off tasks may include `repeat` to convert the
      // task into a recurring series.
      if (req.body.repeat !== undefined && updates.recurrence_rule === undefined) {
        const anchor = updates.date || req.body.anchor_date;
        if (anchor) updates.recurrence_rule = repeatLabelToRrule(req.body.repeat, anchor);
      }
      return { updates };
    };

    if (virtual && scope === 'instance') {
      // Verify the parent belongs to this manager before writing exceptions.
      const { data: parent } = await supabaseAdmin
        .from('tasks')
        .select('id, manager_id')
        .eq('id', virtual.parentId)
        .eq('manager_id', req.user.id)
        .maybeSingle();
      if (!parent) return res.status(404).json({ error: 'Task not found or access denied' });

      const built = buildUpdates();
      if ('error' in built) return res.status(400).json({ error: built.error });
      // override_payload mirrors what the calendar would render for this date.
      const payload = { ...built.updates };
      delete payload.updated_at;
      const { error: exErr } = await supabaseAdmin
        .from('task_exceptions')
        .upsert({
          task_id: virtual.parentId,
          original_date: virtual.date,
          action: 'override',
          override_payload: payload,
        }, { onConflict: 'task_id,original_date' });
      if (exErr) throw exErr;
      return res.json({ id: rawId, ...payload, is_virtual: true, recurrence_parent_id: virtual.parentId });
    }

    // From here we're editing a real row. Virtual id with scope=series points
    // at the parent.
    const realId = virtual ? virtual.parentId : rawId;
    if (!UUID_RE.test(realId)) {
      return res.status(400).json({ error: 'Invalid task id format' });
    }

    const built = buildUpdates();
    if ('error' in built) return res.status(400).json({ error: built.error });

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(built.updates)
      .eq('id', realId)
      .eq('manager_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Task not found or access denied' });

    await syncToGoogleCalendar(req.user.id, data, 'UPDATE');

    res.json(data);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Delete a task. Mirrors the PATCH semantics:
//   • Real id, scope=series (default) → delete the row; the FK ON DELETE
//     CASCADE on task_exceptions removes related exceptions too.
//   • Virtual id, scope=instance (default for virtual ids) → insert a `skip`
//     exception so this one occurrence disappears from future expansions.
//   • Virtual id, scope=series → delete the parent.
router.delete('/tasks/:id', async (req: any, res) => {
  try {
    const rawId = String(req.params.id);
    const scope = req.query.scope === 'instance' ? 'instance' : 'series';
    const virtual = parseVirtualId(rawId);

    if (virtual && scope === 'instance') {
      const { data: parent } = await supabaseAdmin
        .from('tasks')
        .select('id, manager_id')
        .eq('id', virtual.parentId)
        .eq('manager_id', req.user.id)
        .maybeSingle();
      if (!parent) return res.status(404).json({ error: 'Task not found or access denied' });

      const { error: exErr } = await supabaseAdmin
        .from('task_exceptions')
        .upsert({
          task_id: virtual.parentId,
          original_date: virtual.date,
          action: 'skip',
          override_payload: null,
        }, { onConflict: 'task_id,original_date' });
      if (exErr) throw exErr;
      return res.json({ success: true, scope: 'instance', date: virtual.date });
    }

    const realId = virtual ? virtual.parentId : rawId;
    if (!UUID_RE.test(realId)) {
      return res.status(400).json({ error: 'Invalid task id format' });
    }

    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', realId)
      .eq('manager_id', req.user.id)
      .maybeSingle();

    if (task) {
      await syncToGoogleCalendar(req.user.id, task, 'DELETE');
    }

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', realId)
      .eq('manager_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, scope: 'series' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// ROADMAP ROUTES

router.get('/clients/:clientId/roadmap', async (req: any, res) => {
  const { clientId } = req.params;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', clientId).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) throw error;
    
    // Default structure if not found — same shape as a stored row (data_json wrapper)
    if (!data) {
      return res.json({
        data_json: { nutrition: [], training: [], goals: [], milestones: [] },
        status: 'Draft'
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.post('/clients/:clientId/roadmap', async (req: any, res) => {
  const { clientId } = req.params;
  const managerId = req.user.id;
  const body = req.body;

  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', clientId).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });
  } catch (ownerErr: any) {
    return res.status(500).json({ error: ownerErr.message || 'Server error' });
  }

  // Extract core fields and ensure data_json is clean
  const data_json = body.data_json || body;
  const status = body.status || data_json.status || 'Draft';

  // Derived Recommendations (Simple Algorithm)
  const deriveRecommendations = (data: any) => {
    const goal = data.primaryGoal
      || data.goalType
      || data.trajectoryGoals?.primaryGoal
      || data.goals?.[0]?.label
      || 'Fat Loss';
    const mapping: Record<string, any> = {
      'Fat Loss': { nutrition: 'fat-loss-std', training: 'fat-loss-base' },
      'Muscle Gain': { nutrition: 'muscle-gain-std', training: 'hypertrophy-base' },
      'Body Recomposition': { nutrition: 'recomp-std', training: 'recomp-base' },
      'Performance': { nutrition: 'perf-std', training: 'perf-base' },
      'Metabolic Reset': { nutrition: 'reset-std', training: 'reset-base' }
    };
    return mapping[goal] || mapping['Fat Loss'];
  };

  const final_data_json = {
    ...data_json,
    recommendations: deriveRecommendations(data_json),
    updated_at: new Date().toISOString()
  };

  try {
    // Perform atomic upsert on client_id
    const { data: result, error } = await supabaseAdmin
      .from('roadmaps')
      .upsert({ 
        client_id: clientId,
        manager_id: managerId,
        data_json: final_data_json,
        status: status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'client_id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw error;
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});


// Get workout logs for a client (paginado ASC por logged_at).
// Default limit 200 — pensado para que el trajectory chart funcione sin
// loadMore en la mayoria de los casos. Para historicos largos el frontend
// debe paginar (la respuesta incluye nextCursor/hasMore).
router.get('/clients/:id/workout-logs', async (req: any, res) => {
  const clientId = req.params.id;
  const managerId = req.user.id;
  const page = parsePagination(req, { defaultLimit: 200, maxLimit: 500 });
  try {
    // Verify client belongs to this manager
    const { data: clientData } = await supabaseAdmin
      .from('users')
      .select('id, manager_id')
      .eq('id', clientId)
      .eq('manager_id', managerId)
      .maybeSingle();

    if (!clientData) {
      return res.status(403).json({ error: 'Access denied or client not found' });
    }

    let q = supabaseAdmin
      .from('workout_logs')
      .select('id, logged_at, workout_name, exercises, session_rpe, notes')
      .eq('client_id', clientId)
      .order('logged_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'logged_at', 'asc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'logged_at'));
  } catch (error: any) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Save or update a workout log for a client (Manager side)
router.post('/clients/:id/workout-logs', async (req: any, res) => {
  const clientId = req.params.id;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', clientId).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const { plan_id, workout_name, day_key, exercises, notes, session_rpe, logged_at } = req.body;
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .insert({
        client_id: clientId,
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

    // Fire trigger.workout_logged for the manager's workflows.
    runWorkflowsForEvent(managerId, 'trigger.workout_logged', {
      clientId, workoutId: data?.id, loggedAt: data?.logged_at,
    }).catch(err => console.error('Workflow trigger error (workout_logged):', err));

    res.json(data);
  } catch (error: any) {
    console.error('Error saving workout log:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.patch('/clients/:id/workout-logs/:logId', async (req: any, res) => {
  const { id: clientId, logId } = req.params;
  const managerId = req.user.id;
  try {
    const { data: clientOwner } = await supabaseAdmin.from('users').select('id').eq('id', clientId).eq('manager_id', managerId).maybeSingle();
    if (!clientOwner) return res.status(403).json({ error: 'Forbidden: client does not belong to this manager' });

    const { exercises, notes, session_rpe } = req.body;
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .update({
        exercises: exercises || [],
        notes: notes || null,
        session_rpe: session_rpe || null
      })
      .eq('id', logId)
      .eq('client_id', clientId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating workout log:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// --- Shared template helpers -------------------------------------------------
// Preset templates exist once per language and share the same `key`, so a plain
// .maybeSingle() lookup throws when both rows match. These helpers resolve the
// right row and implement copy-on-write so a coach can customise a global preset.

async function getManagerLanguage(userId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('profiles').select('language').eq('user_id', userId).maybeSingle();
  return data?.language || 'es';
}

// Resolve a template by UUID or key, tolerating per-language duplicate keys.
// Returns the manager's own copy first, then the row in the manager's language.
async function resolveTemplateRow(table: string, id: string, userId: string, language: string) {
  const isUuid = UUID_RE.test(id);
  const base = supabaseAdmin.from(table).select('*');
  const { data, error } = await (isUuid ? base.eq('id', id) : base.eq('key', id));
  if (error) throw error;
  const list = (data || []).filter((r: any) => !r.manager_id || r.manager_id === userId);
  return list.find((r: any) => r.manager_id === userId)
      || list.find((r: any) => r.language === language)
      || list[0] || null;
}

// Update the manager's own template; if the target is a global preset, clone it
// into a manager-owned copy with the edits applied (copy-on-write).
async function updateTemplateCoW(opts: {
  table: string; id: string; userId: string; language: string;
  patch: Record<string, any>; cloneFields: string[]; keyPrefix: string;
}): Promise<any | null> {
  const { table, id, userId, language, patch, cloneFields, keyPrefix } = opts;
  const isUuid = UUID_RE.test(id);
  const ownQ = supabaseAdmin.from(table).update(patch).eq('manager_id', userId);
  const { data: updated, error: updErr } = await (isUuid ? ownQ.eq('id', id) : ownQ.eq('key', id)).select();
  if (updErr) throw updErr;
  if (updated && updated.length) return updated[0];

  // Not owned — copy-on-write from the matching global preset.
  const gBase = supabaseAdmin.from(table).select('*').is('manager_id', null);
  const { data: globals, error: gErr } = await (isUuid ? gBase.eq('id', id) : gBase.eq('key', id));
  if (gErr) throw gErr;
  const src = (globals || []).find((r: any) => r.language === language) || (globals || [])[0];
  if (!src) return null;
  const insertRow: Record<string, any> = {
    key: `${keyPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    manager_id: userId,
    // Tag the copy with the manager's language so it shows in their list.
    language,
  };
  for (const f of cloneFields) insertRow[f] = src[f];
  Object.assign(insertRow, patch);
  const { data: created, error: insErr } = await supabaseAdmin
    .from(table).insert(insertRow).select().single();
  if (insErr) throw insErr;
  return created;
}

// Nutrition Templates Routes (paginado ASC por target_calories + id tiebreak)
router.get('/nutrition-templates', async (req: any, res: any) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const language = profile?.language || 'es';

    let q = supabaseAdmin
      .from('nutrition_templates')
      .select('id, key, name, description, target_calories, data_json')
      .eq('language', language)
      .or(`manager_id.is.null,manager_id.eq.${req.user.id}`)
      .order('target_calories', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'target_calories', 'asc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'target_calories'));
  } catch (error: any) {
    console.error('Error fetching nutrition templates:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a new nutrition plan template
router.post('/nutrition-templates', async (req: any, res: any) => {
  try {
    const { name, description, target_calories, data_json } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('language').eq('user_id', req.user.id).maybeSingle();
    const language = profile?.language || 'es';
    const key = `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabaseAdmin
      .from('nutrition_templates')
      .insert({
        key,
        name: String(name).trim(),
        description: description || null,
        target_calories: Number(target_calories) || 0,
        data_json: data_json || {},
        language,
        manager_id: req.user.id,
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating nutrition template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update a nutrition template (id may be a UUID or a key slug)
router.put('/nutrition-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of ['name', 'description', 'target_calories', 'data_json']) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    // Edit the manager's own template, or copy-on-write from a global preset.
    const language = await getManagerLanguage(req.user.id);
    const row = await updateTemplateCoW({
      table: 'nutrition_templates', id, userId: req.user.id, language, patch,
      cloneFields: ['name', 'description', 'target_calories', 'data_json'],
      keyPrefix: 'tpl',
    });
    if (!row) return res.status(404).json({ error: 'Template not found or not editable' });
    res.json(row);
  } catch (error: any) {
    console.error('Error updating nutrition template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Delete a nutrition template (id may be a UUID or a key slug)
router.delete('/nutrition-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });
    const q = supabaseAdmin.from('nutrition_templates').delete().eq('manager_id', req.user.id);
    const { data, error } = await (isUuid ? q.eq('id', id) : q.eq('key', id)).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Template not found or not deletable' });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting nutrition template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.get('/nutrition-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    // The :id param can be either a UUID or a slug "key". Validate which one and
    // use parameterized .eq() — never interpolate raw user input into .or() filter strings.
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) {
      return res.status(400).json({ error: 'Invalid template id/key format' });
    }
    const language = await getManagerLanguage(req.user.id);
    const row = await resolveTemplateRow('nutrition_templates', id, req.user.id, language);
    if (!row) return res.status(404).json({ error: 'Template not found' });
    res.json(row);
  } catch (error: any) {
    console.error('Error fetching template detail:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Training Templates Routes (paginado ASC por weekly_frequency + id tiebreak)
router.get('/training-templates', async (req: any, res: any) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const language = profile?.language || 'es';

    let q = supabaseAdmin
      .from('training_templates')
      .select('id, key, name, description, level, type, weekly_frequency, data_json')
      .eq('language', language)
      .or(`manager_id.is.null,manager_id.eq.${req.user.id}`)
      .order('weekly_frequency', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'weekly_frequency', 'asc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'weekly_frequency'));
  } catch (error: any) {
    console.error('Error fetching training templates:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a new training plan template
router.post('/training-templates', async (req: any, res: any) => {
  try {
    const { name, description, level, type, weekly_frequency, data_json } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('language').eq('user_id', req.user.id).maybeSingle();
    const language = profile?.language || 'es';
    const key = `twf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabaseAdmin
      .from('training_templates')
      .insert({
        key,
        name: String(name).trim(),
        description: description || null,
        level: level || null,
        type: type || null,
        weekly_frequency: Number(weekly_frequency) || null,
        data_json: data_json || {},
        language,
        manager_id: req.user.id,
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating training template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update a training template (id may be a UUID or a key slug)
router.put('/training-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of ['name', 'description', 'level', 'type', 'weekly_frequency', 'data_json']) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    const language = await getManagerLanguage(req.user.id);
    const row = await updateTemplateCoW({
      table: 'training_templates', id, userId: req.user.id, language, patch,
      cloneFields: ['name', 'description', 'level', 'type', 'weekly_frequency', 'data_json'],
      keyPrefix: 'twf',
    });
    if (!row) return res.status(404).json({ error: 'Template not found or not editable' });
    res.json(row);
  } catch (error: any) {
    console.error('Error updating training template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Delete a training template (id may be a UUID or a key slug)
router.delete('/training-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });
    const q = supabaseAdmin.from('training_templates').delete().eq('manager_id', req.user.id);
    const { data, error } = await (isUuid ? q.eq('id', id) : q.eq('key', id)).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Template not found or not deletable' });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting training template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.get('/training-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) {
      return res.status(400).json({ error: 'Invalid template id/key format' });
    }
    const language = await getManagerLanguage(req.user.id);
    const row = await resolveTemplateRow('training_templates', id, req.user.id, language);
    if (!row) return res.status(404).json({ error: 'Template not found' });
    res.json(row);
  } catch (error: any) {
    console.error('Error fetching training template detail:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Planning Templates Routes (strategic roadmap blueprints, paginado ASC por duration + id)
router.get('/planning-templates', async (req: any, res: any) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const language = profile?.language || 'es';

    let q = supabaseAdmin
      .from('planning_templates')
      .select('id, key, name, description, goal_type, intensity, duration_weeks, phases, data_json')
      .eq('language', language)
      .or(`manager_id.is.null,manager_id.eq.${req.user.id}`)
      .order('duration_weeks', { ascending: true })
      .order('id', { ascending: true })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'duration_weeks', 'asc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'duration_weeks'));
  } catch (error: any) {
    console.error('Error fetching planning templates:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Create a new planning template
router.post('/planning-templates', async (req: any, res: any) => {
  try {
    const { name, description, goal_type, intensity, duration_weeks, phases, data_json } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('language').eq('user_id', req.user.id).maybeSingle();
    const language = profile?.language || 'es';
    const key = `pln_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabaseAdmin
      .from('planning_templates')
      .insert({
        key,
        name: String(name).trim(),
        description: description || null,
        goal_type: goal_type || null,
        intensity: intensity || null,
        duration_weeks: Number(duration_weeks) || null,
        phases: Number(phases) || null,
        data_json: data_json || {},
        language,
        manager_id: req.user.id,
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating planning template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update a planning template (id may be a UUID or a key slug)
router.put('/planning-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of ['name', 'description', 'goal_type', 'intensity', 'duration_weeks', 'phases', 'data_json']) {
      if (req.body?.[f] !== undefined) patch[f] = req.body[f];
    }
    const language = await getManagerLanguage(req.user.id);
    const row = await updateTemplateCoW({
      table: 'planning_templates', id, userId: req.user.id, language, patch,
      cloneFields: ['name', 'description', 'goal_type', 'intensity', 'duration_weeks', 'phases', 'data_json'],
      keyPrefix: 'pln',
    });
    if (!row) return res.status(404).json({ error: 'Template not found or not editable' });
    res.json(row);
  } catch (error: any) {
    console.error('Error updating planning template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Delete a planning template (id may be a UUID or a key slug)
router.delete('/planning-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) return res.status(400).json({ error: 'Invalid template id/key format' });
    const q = supabaseAdmin.from('planning_templates').delete().eq('manager_id', req.user.id);
    const { data, error } = await (isUuid ? q.eq('id', id) : q.eq('key', id)).select();
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Template not found or not deletable' });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting planning template:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.get('/planning-templates/:id', async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const isUuid = UUID_RE.test(id);
    const isKey = KEY_RE.test(id);
    if (!isUuid && !isKey) {
      return res.status(400).json({ error: 'Invalid template id/key format' });
    }
    const language = await getManagerLanguage(req.user.id);
    const row = await resolveTemplateRow('planning_templates', id, req.user.id, language);
    if (!row) return res.status(404).json({ error: 'Template not found' });
    res.json(row);
  } catch (error: any) {
    console.error('Error fetching planning template detail:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// --- Web Push notifications ---

// Public VAPID key the browser needs to create a push subscription.
router.get('/push/vapid-public-key', async (_req: any, res) => {
  res.json({ key: vapidPublicKey, configured: pushConfigured });
});

// Register (or refresh) a push subscription for the current device.
router.post('/push/subscribe', async (req: any, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid push subscription' });
  }
  try {
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        { user_id: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: 'endpoint' }
      );
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Remove a push subscription (this device opted out).
router.post('/push/unsubscribe', async (req: any, res) => {
  const { endpoint } = req.body || {};
  try {
    if (endpoint) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint)
        .eq('user_id', req.user.id);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

export default router;



