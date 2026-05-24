import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { supabaseAdmin } from '../db/index.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import { verifyClient } from '../middleware/auth.js';

const router = Router();

// Defense-in-depth: any value about to be interpolated into a PostgREST
// .or() / filter string MUST be a valid UUID. The auth middleware already
// guarantees req.user.id comes from Supabase Auth, but the explicit check
// keeps the intent obvious and stops future regressions cold.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Verificacion de rol CLIENT centralizada en middleware/auth.ts: la BD es la
// unica fuente de verdad del rol y NUNCA se confia en user_metadata (mutable
// por el propio usuario via supabase.auth.updateUser).
router.use(verifyClient);

// Get my profile
router.get('/profile', async (req: any, res) => {
  try {
    // `clients_profiles.notes` es la nota PRIVADA del coach sobre el cliente:
    // NO debe exponerse en el portal del cliente. Solo se devuelven campos
    // que pertenecen al propio cliente.
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        manager_id,
        clients_profiles (weight, goal, gender, age, metadata)
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !profile) return res.status(404).json({ error: 'Not found' });

    const cp: any = profile.clients_profiles?.[0] || {};
    // `manager_id` is exposed so the client portal can scope follow-up
    // requests (e.g. fetching the coach's messages and onboarding flows) to
    // its own coach. The reverse field `clients_profiles.notes` is the
    // coach's private note about the client and intentionally stays out of
    // this response.
    const formattedProfile = {
      id: profile.id,
      email: profile.email,
      manager_id: (profile as any).manager_id || null,
      weight: cp.weight || null,
      goal: cp.goal || null,
      gender: cp.gender || null,
      age: cp.age || null,
      full_name: cp.metadata?.full_name || null,
      phone: cp.metadata?.phone || null,
    };

    res.json(formattedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update my own profile (datos editables por el cliente desde su portal).
// Allow-list explícita: NUNCA se aceptan manager_id, role, notes, weight, etc.
router.patch('/profile', async (req: any, res) => {
  const id = req.user.id;
  try {
    const { full_name, phone, gender, age, goal } = req.body || {};

    // metadata es JSONB: merge para no pisar otras claves ya guardadas.
    const { data: existing } = await supabaseAdmin
      .from('clients_profiles')
      .select('metadata')
      .eq('user_id', id)
      .maybeSingle();
    const metadata: Record<string, any> = { ...(existing?.metadata || {}) };
    if (typeof full_name === 'string') metadata.full_name = full_name.trim().slice(0, 120);
    if (typeof phone === 'string') metadata.phone = phone.trim().slice(0, 40);

    const update: Record<string, any> = { metadata, updated_at: new Date().toISOString() };
    if (typeof gender === 'string') update.gender = gender.trim().slice(0, 40) || null;
    if (typeof goal === 'string') update.goal = goal.trim().slice(0, 200) || null;
    if (age !== undefined && age !== null && age !== '') {
      const n = Number(age);
      update.age = Number.isFinite(n) && n > 0 && n < 130 ? Math.round(n) : null;
    }

    const { error } = await supabaseAdmin
      .from('clients_profiles')
      .update(update)
      .eq('user_id', id);
    if (error) throw error;

    // Return the freshly merged profile in the SAME shape `GET /profile`
    // emits so the frontend can drop the response straight into its state
    // and the edited values render immediately (no page reload required).
    const { data: row } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        manager_id,
        clients_profiles (weight, goal, gender, age, metadata)
      `)
      .eq('id', id)
      .single();
    const cp: any = row?.clients_profiles?.[0] || {};
    res.json({
      id: row?.id,
      email: row?.email,
      manager_id: (row as any)?.manager_id || null,
      weight: cp.weight ?? null,
      goal: cp.goal ?? null,
      gender: cp.gender ?? null,
      age: cp.age ?? null,
      full_name: cp.metadata?.full_name ?? null,
      phone: cp.metadata?.phone ?? null,
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get my plans — scoped to current manager so stale plans from previous managers don't leak
router.get('/plans', async (req: any, res) => {
  try {
    const { data: clientRow } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', req.user.id)
      .maybeSingle();

    const managerId = clientRow?.manager_id;
    if (!managerId) {
      return res.json({ nutrition: [], training: [] });
    }

    const [{ data: nutrition }, { data: training }] = await Promise.all([
      supabaseAdmin.from('nutrition_plans').select('*').eq('client_id', req.user.id).eq('created_by', managerId).order('updated_at', { ascending: false }),
      supabaseAdmin.from('training_programs').select('*').eq('client_id', req.user.id).eq('created_by', managerId).order('updated_at', { ascending: false }),
    ]);

    res.json({ nutrition: nutrition || [], training: training || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my roadmap — scoped to current manager so stale roadmaps from previous managers don't leak.
router.get('/roadmap', async (req: any, res) => {
  try {
    const { data: clientRow } = await supabaseAdmin
      .from('users')
      .select('manager_id')
      .eq('id', req.user.id)
      .maybeSingle();

    const managerId = clientRow?.manager_id;
    if (!managerId) {
      return res.json({ data_json: { nutrition: [], training: [] }, status: 'Empty' });
    }

    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('client_id', req.user.id)
      .eq('manager_id', managerId)
      .maybeSingle();

    if (error) throw error;
    res.json(data || {
      data_json: { nutrition: [], training: [] },
      status: 'Empty'
    });
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Save a completed workout session
router.post('/workout-logs', async (req: any, res) => {
  try {
    const { plan_id, workout_name, day_key, exercises, notes, session_rpe } = req.body;

    // Cap exercises array to prevent DoS via huge payloads
    const safeExercises = Array.isArray(exercises) ? exercises.slice(0, 100) : [];

    // Validate day_key against the known set, and session_rpe to a 1-10 range.
    const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const safeDayKey = (typeof day_key === 'string' && VALID_DAYS.includes(day_key.toLowerCase()))
      ? day_key.toLowerCase()
      : null;
    const rpeNum = Number(session_rpe);
    const safeRpe = (Number.isFinite(rpeNum) && rpeNum >= 1 && rpeNum <= 10) ? rpeNum : null;

    // If a plan_id is given, ensure it belongs to this client (prevents tagging logs to other clients' plans)
    if (plan_id) {
      const { data: planRow } = await supabaseAdmin
        .from('training_programs')
        .select('id')
        .eq('id', plan_id)
        .eq('client_id', req.user.id)
        .maybeSingle();
      if (!planRow) {
        return res.status(403).json({ error: 'Forbidden: plan does not belong to this client' });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .insert({
        client_id: req.user.id,
        plan_id: plan_id || null,
        workout_name: typeof workout_name === 'string' ? workout_name.slice(0, 200) : 'Workout Session',
        day_key: safeDayKey,
        exercises: safeExercises,
        notes: typeof notes === 'string' ? notes.slice(0, 2000) : null,
        session_rpe: safeRpe,
        // Always server-side timestamp — client cannot backdate logs.
        logged_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Fire trigger.workout_logged for the client's manager (workflow listeners).
    try {
      const { data: clientRow } = await supabaseAdmin
        .from('users').select('manager_id').eq('id', req.user.id).maybeSingle();
      if (clientRow?.manager_id) {
        const { runWorkflowsForEvent } = await import('./workflows.js');
        runWorkflowsForEvent(clientRow.manager_id, 'trigger.workout_logged', {
          clientId: req.user.id,
          workoutId: data?.id,
          loggedAt: data?.logged_at,
        }).catch(err => console.error('Workflow trigger error (workout_logged):', err));
      }
    } catch (wErr) {
      console.error('workout_logged trigger derivation failed:', wErr);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error saving workout log:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Get my workout history (paginado DESC por logged_at)
router.get('/workout-logs', async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('workout_logs')
      .select('*')
      .eq('client_id', req.user.id)
      .order('logged_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'logged_at', 'desc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'logged_at'));
  } catch (error: any) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// Update one of my own workout logs (edit sets / notes / RPE)
router.patch('/workout-logs/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(String(id))) {
      return res.status(400).json({ error: 'Invalid log id format' });
    }

    const { exercises, notes, session_rpe } = req.body;
    const updates: any = {};
    if (exercises !== undefined) {
      updates.exercises = Array.isArray(exercises) ? exercises.slice(0, 100) : [];
    }
    if (notes !== undefined) {
      updates.notes = typeof notes === 'string' ? notes.slice(0, 2000) : null;
    }
    if (session_rpe !== undefined) {
      const rpeNum = Number(session_rpe);
      updates.session_rpe = (Number.isFinite(rpeNum) && rpeNum >= 1 && rpeNum <= 10) ? rpeNum : null;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .update(updates)
      .eq('id', id)
      .eq('client_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Workout log not found' });
    res.json(data);
  } catch (error: any) {
    console.error('Error updating workout log:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

// NOTE: the legacy `/client/onboarding/active` GET + POST endpoints that
// used to live here read from `onboarding_assignments`/`onboarding_messages`
// (the old popup model). The UI moved to `/onboarding/client/active` long
// ago (see server/routes/onboarding.ts and src/ClientApp.tsx), so those
// routes were unreachable dead code. Removed to prevent future drift.

// Get my performance statistics (for Progress view)
router.get('/profile-stats', async (req: any, res) => {
  const id = req.user.id;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const now = new Date();

  try {
    // The four independent reads (profile, check-ins, recent messages,
    // workout logs) used to serialize for ~4× the latency of the slowest
    // one. They share no inputs other than `id`, so issue them in parallel.
    // Field selects stay explicit — `clients_profiles(*)` would leak `notes`
    // (coach's private note) and `temp_password`.
    const [
      { data: client, error: clientErr },
      { data: checkIns },
      { data: recentMsgs },
      { data: allWorkoutLogs },
    ] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, email, clients_profiles(weight, goal, goal_weight, height, gender, age, metadata)')
        .eq('id', id)
        .single(),
      supabaseAdmin
        .from('check_ins')
        .select('*')
        .eq('client_id', id)
        .order('date', { ascending: true })
        .limit(365),
      supabaseAdmin
        .from('messages')
        .select('created_at, content')
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
        .order('created_at', { ascending: false })
        .limit(3),
      supabaseAdmin
        .from('workout_logs')
        .select('*')
        .eq('client_id', id)
        .order('logged_at', { ascending: false })
        .limit(100),
    ]);

    if (clientErr || !client) return res.status(404).json({ error: 'Profile not found' });

    // 3. Weight & Body Fat History
    const num = (v: any): number | null => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    const weightHistory = (checkIns || []).map(ci => ({
      date: ci.date,
      weight: num((ci.data_json as any)?.weight),
      bodyFat: num((ci.data_json as any)?.body_fat)
    })).filter(w => w.weight !== null);

    // 4. Latest Measurements
    const lastCheckIn = checkIns && checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;

    // 5. Macro Adherence (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCheckIns = (checkIns || []).filter(ci => new Date(ci.date) >= sevenDaysAgo);
    
    let avgProteinAdherence = 0;
    let avgCarbsAdherence = 0;
    let avgFatsAdherence = 0;
    let dailyCaloricAvg = 0;

    if (recentCheckIns.length > 0) {
      let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0;
      let countP = 0, countC = 0, countF = 0, countKcal = 0;

      recentCheckIns.forEach(ci => {
        const d = (ci.data_json as any) || {};
        // Canonical fixed check-in keys: absolute average daily intake.
        const p = num(d.protein); if (p !== null) { totalP += p; countP++; }
        const c = num(d.carbs); if (c !== null) { totalC += c; countC++; }
        const f = num(d.fats); if (f !== null) { totalF += f; countF++; }
        const k = num(d.calories); if (k !== null) { totalKcal += k; countKcal++; }
      });

      avgProteinAdherence = countP > 0 ? Math.round(totalP / countP) : 0;
      avgCarbsAdherence = countC > 0 ? Math.round(totalC / countC) : 0;
      avgFatsAdherence = countF > 0 ? Math.round(totalF / countF) : 0;
      dailyCaloricAvg = countKcal > 0 ? Math.round(totalKcal / countKcal) : 0;
    }

    let calculatedAdherenceRate = 0;
    if (recentCheckIns.length > 0) {
      let totalAdh = 0;
      let countAdh = 0;
      recentCheckIns.forEach(ci => {
        const d = (ci.data_json as any) || {};
        const val = d.nutrition_adherence_score !== undefined ? Number(d.nutrition_adherence_score) * 10 :
                    (d.adherence_score !== undefined ? Number(d.adherence_score) * 10 : null);
        if (val !== null) {
          totalAdh += val;
          countAdh++;
        } else if (typeof d.nutritionAdherence === 'string') {
          const str = d.nutritionAdherence;
          if (str.includes('>95%')) { totalAdh += 98; countAdh++; }
          else if (str.includes('80-95%')) { totalAdh += 85; countAdh++; }
          else if (str.includes('50-80%')) { totalAdh += 65; countAdh++; }
          else if (str.includes('<50%')) { totalAdh += 30; countAdh++; }
        }
      });
      calculatedAdherenceRate = countAdh > 0 ? Math.round(totalAdh / countAdh) : 0;
    }

    // 6. Recent Activity (Messages) — fetched in parallel above.
    const activity = [
      ...(checkIns || []).slice(-3).map(ci => {
        const w = (ci.data_json as any)?.weight;
        return {
          type: 'CHECK_IN',
          title: 'Morning Check-in',
          sub: w ? `Logged weight (${w}kg)` : 'Check-in submitted',
          time: ci.date,
          color: 'bg-emerald-100 text-emerald-600'
        };
      }),
      ...(recentMsgs || []).map(m => ({
        type: 'MESSAGE',
        title: 'Message Received',
        sub: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        time: m.created_at,
        color: 'bg-blue-100 text-blue-600'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    // 7. Training Stats — workout_logs fetched in parallel above.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const workoutLogs = allWorkoutLogs || [];
    const weeklyLogs = workoutLogs.filter(w => new Date(w.logged_at) >= startOfWeek);

    let weeklyVolume = 0;
    let avgRPE = 0;
    let workoutCount = weeklyLogs.length;

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

    const fatigue = logsWithRPE.length > 0 ? Number(logsWithRPE[0].session_rpe) : 5;

    // 8. Strength PRs & History
    const allExercisesMap: Record<string, { pr: number, latest: number, latestDate: string }> = {};
    const dayBuckets: Record<string, { volume: number; logs: any }> = {};

    const primaryExercises = [
      'Bench Press', 'Squat', 'Deadlift', 'Military Press', 'Barbell Row',
      'Sentadilla', 'Peso Muerto', 'Press Banca', 'Press Militar', 'Remo con Barra',
      'Buenos Días', 'Romanian Deadlift'
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
        
        if (!allExercisesMap[canonicalName]) {
          allExercisesMap[canonicalName] = { pr: maxWTotal, latest: maxWTotal, latestDate: log.logged_at };
        } else {
          allExercisesMap[canonicalName].pr = Math.max(allExercisesMap[canonicalName].pr, maxWTotal);
          if (new Date(log.logged_at) > new Date(allExercisesMap[canonicalName].latestDate)) {
            allExercisesMap[canonicalName].latest = maxWTotal;
            allExercisesMap[canonicalName].latestDate = log.logged_at;
          }
        }

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

    const currentMonday = new Date();
    const dayIdx = currentMonday.getDay();
    const isoToday = dayIdx === 0 ? 7 : dayIdx;
    currentMonday.setDate(currentMonday.getDate() - (isoToday - 1));
    
    for (let i = 0; i < 35; i++) {
        const d = new Date(currentMonday);
        d.setDate(currentMonday.getDate() - 28 + i);
        const k = d.toISOString().split('T')[0];
        if (!dayBuckets[k]) {
            dayBuckets[k] = { volume: 0, logs: {} };
        }
    }

    const allExercises = Object.entries(allExercisesMap)
      .map(([name, data]) => ({
        name,
        pr: data.pr,
        latest: data.latest,
        latestDate: data.latestDate
      }))
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());

    const strengthHistory = Object.entries(dayBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        volume: vals.volume,
        logs: vals.logs
      }));

    const recentWorkouts = workoutLogs.slice(0, 10).map(log => ({
      id: log.id,
      name: log.workout_name || 'Workout Session',
      date: log.logged_at,
      status: 'Completed',
      volume: Math.round(calcSessionVolume(log)),
      rpe: log.session_rpe || 0,
      notes: log.notes,
      exercises: log.exercises || []
    }));

    const mindset = {
      energy: (lastCheckIn?.data_json as any)?.energy_level || '--',
      stress: (lastCheckIn?.data_json as any)?.stress_level || '--',
      mood: (lastCheckIn?.data_json as any)?.mood_score || '--',
      motivation: (lastCheckIn?.data_json as any)?.motivation_level || '--',
      history: (checkIns || []).map(ci => {
        const d = (ci.data_json as any) || {};
        return {
          date: ci.date,
          energy: num(d.energy_level),
          stress: num(d.stress_level),
          mood: num(d.mood_score),
          motivation: num(d.motivation_level)
        };
      }).filter(h => h.energy || h.stress || h.mood || h.motivation)
    };

    const cProfile: any = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : client.clients_profiles;
    const allergies = cProfile?.metadata?.allergies || [];

    res.json({
      latestWeight: num((lastCheckIn?.data_json as any)?.weight),
      goal: cProfile?.goal || null,
      goalWeight: num(cProfile?.goal_weight),
      // The first check-in weight gives a stable "starting point" baseline.
      startWeight: weightHistory.length > 0 ? num(weightHistory[0]?.weight) : null,
      bodyFat: num((lastCheckIn?.data_json as any)?.body_fat),
      adherenceRate: calculatedAdherenceRate,
      activeDays: (checkIns?.length || 0),
      allergies: allergies.length > 0 ? allergies : [],
      weightHistory,
      macros: {
          protein: avgProteinAdherence,
          carbs: avgCarbsAdherence,
          fats: avgFatsAdherence,
          calories: dailyCaloricAvg
      },
      activity,
      training: {
          weeklyVolume,
          avgRPE,
          workoutCount,
          fatigue,
          allExercises,
          strengthHistory
      },
      recentWorkouts,
      mindset
    });
  } catch (error: any) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


