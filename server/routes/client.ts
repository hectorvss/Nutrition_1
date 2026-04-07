import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';

const router = Router();

// Middleware to verify CLIENT role using Supabase Auth
const verifyClient = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // Fallback a user_metadata si el registro aún no existe en la tabla users
    const role = userData?.role || user.user_metadata?.role;

    if (role !== 'CLIENT') {
      return res.status(403).json({ error: 'Forbidden: se requiere rol CLIENT' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(verifyClient);

// Get my profile
router.get('/profile', async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email,
        manager_id,
        clients_profiles (weight, goal, notes)
      `)
      .eq('id', req.user.id)
      .single();
      
    if (error || !profile) return res.status(404).json({ error: 'Not found' });
    
    const formattedProfile = {
      id: profile.id,
      email: profile.email,
      manager_id: profile.manager_id,
      weight: profile.clients_profiles?.[0]?.weight || null,
      goal: profile.clients_profiles?.[0]?.goal || null,
      notes: profile.clients_profiles?.[0]?.notes || null,
    };
    
    res.json(formattedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my plans
router.get('/plans', async (req: any, res) => {
  try {
    const { data: nutrition } = await supabaseAdmin.from('nutrition_plans').select('*').eq('client_id', req.user.id);
    const { data: training } = await supabaseAdmin.from('training_programs').select('*').eq('client_id', req.user.id);
    
    res.json({ nutrition, training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my roadmap
router.get('/roadmap', async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('client_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || { 
      data_json: { nutrition: [], training: [] }, 
      status: 'Empty' 
    });
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Save a completed workout session
router.post('/workout-logs', async (req: any, res) => {
  try {
    const { plan_id, workout_name, day_key, exercises, notes, session_rpe, logged_at } = req.body;
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .insert({
        client_id: req.user.id,
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
    res.json(data);
  } catch (error: any) {
    console.error('Error saving workout log:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get my workout history
router.get('/workout-logs', async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('workout_logs')
      .select('*')
      .eq('client_id', req.user.id)
      .order('logged_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// --- ONBOARDING ROUTES ---

// Get active onboarding message for the client
router.get('/onboarding/active', async (req: any, res) => {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('onboarding_assignments')
      .select('*, onboarding_messages(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return res.json(null);
      throw error;
    }

    if (!assignments || assignments.length === 0) {
      return res.json(null);
    }

    // Return the oldest pending assignment to ensure order (if multiple)
    // Actually, usually we want the most recent one if it's a "pop up"
    res.json(assignments[0]);
  } catch (error) {
    console.error('Error fetching active onboarding:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update assignment status (seen/dismissed)
router.post('/onboarding/active/:id/action', async (req: any, res) => {
  const { status } = req.body; // 'seen' or 'dismissed'
  const assignmentId = req.params.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_assignments')
      .update({ status })
      .eq('id', assignmentId)
      .eq('user_id', req.user.id) // Security check
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get my performance statistics (for Progress view)
router.get('/profile-stats', async (req: any, res) => {
  const id = req.user.id;
  const now = new Date();

  try {
    // 1. Fetch user profile
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('*, clients_profiles(*)')
      .eq('id', id)
      .single();

    if (clientErr || !client) return res.status(404).json({ error: 'Profile not found' });

    // 2. Fetch Check-ins
    const { data: checkIns } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: true });

    // 3. Weight & Body Fat History
    const weightHistory = (checkIns || []).map(ci => ({
      date: ci.date,
      weight: (ci.data_json as any).weight || null,
      bodyFat: (ci.data_json as any).body_fat || null
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
        const d = ci.data_json as any;
        if (d.protein_intake && d.protein_goal) { totalP += (d.protein_intake / d.protein_goal); countP++; }
        if (d.carbs_intake && d.carbs_goal) { totalC += (d.carbs_intake / d.carbs_goal); countC++; }
        if (d.fats_intake && d.fats_goal) { totalF += (d.fats_intake / d.fats_goal); countF++; }
        if (d.calories_intake) { totalKcal += d.calories_intake; countKcal++; }
      });

      avgProteinAdherence = countP > 0 ? Math.round((totalP / countP) * 100) : 90;
      avgCarbsAdherence = countC > 0 ? Math.round((totalC / countC) * 100) : 85;
      avgFatsAdherence = countF > 0 ? Math.round((totalF / countF) * 100) : 92;
      dailyCaloricAvg = countKcal > 0 ? Math.round(totalKcal / countKcal) : 0;
    }

    let calculatedAdherenceRate = 0;
    if (recentCheckIns.length > 0) {
      let totalAdh = 0;
      let countAdh = 0;
      recentCheckIns.forEach(ci => {
        const d = ci.data_json as any;
        const val = d.nutrition_adherence_score !== undefined ? Number(d.nutrition_adherence_score) * 10 :
                    (d.adherence_score !== undefined ? Number(d.adherence_score) * 10 : null);
        if (val !== null) {
          totalAdh += val;
          countAdh++;
        } else if (d.nutritionAdherence) {
          const str = d.nutritionAdherence;
          if (str.includes('>95%')) { totalAdh += 98; countAdh++; }
          else if (str.includes('80-95%')) { totalAdh += 85; countAdh++; }
          else if (str.includes('50-80%')) { totalAdh += 65; countAdh++; }
          else if (str.includes('<50%')) { totalAdh += 30; countAdh++; }
        }
      });
      calculatedAdherenceRate = countAdh > 0 ? Math.round(totalAdh / countAdh) : 85; // Fallback to 85 if no scorable data
    }

    // 6. Recent Activity (Messages)
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

    // 7. Training Stats — from workout_logs
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
      history: (checkIns || []).map(ci => ({
        date: ci.date,
        energy: (ci.data_json as any).energy_level || null,
        stress: (ci.data_json as any).stress_level || null,
        mood: (ci.data_json as any).mood_score || null,
        motivation: (ci.data_json as any).motivation_level || null
      })).filter(h => h.energy || h.stress || h.mood || h.motivation)
    };

    res.json({
      latestWeight: (lastCheckIn?.data_json as any)?.weight || null,
      goal: client.clients_profiles?.[0]?.goal || null,
      bodyFat: (lastCheckIn?.data_json as any)?.body_fat || null,
      adherenceRate: calculatedAdherenceRate,
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


