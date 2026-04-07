import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';

const router = Router();

/**
 * Helper to process an automation trigger
 */
export async function processTrigger(managerId: string, triggerId: string, data: any) {
  try {
    console.log(`Processing trigger: ${triggerId} for manager: ${managerId}`);
    
    // 1. Fetch enabled automations for this trigger and manager
    const { data: automations, error: autoError } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('manager_id', managerId)
      .eq('trigger_id', triggerId)
      .eq('enabled', true);

    if (autoError) throw autoError;
    if (!automations || automations.length === 0) return;

    for (const automation of automations) {
      // 2. Identify the target clients
      let clientIds: string[] = [];
      const rules = automation.delivery_rules || {};

      if (rules.audience === 'Specific Clients') {
        clientIds = rules.selected_client_ids || [];
        // If data.clientId is provided, only process if it's in the selected list
        if (data.clientId) {
          clientIds = clientIds.includes(data.clientId) ? [data.clientId] : [];
        }
      } else if (data.clientId) {
        clientIds = [data.clientId];
      } else if (rules.audience === 'All Clients') {
        const { data: clients } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('manager_id', managerId)
          .eq('role', 'CLIENT');
        clientIds = (clients || []).map(c => c.id);
      }

      // Pre-fetch manager profile una vez para todas las iteraciones de clientes
      const { data: _managerProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('user_id', managerId)
        .maybeSingle();
      const _cachedCoachName = _managerProfile?.full_name || 'your coach';

      for (const clientId of clientIds) {
        // 3. Fetch comprehensive client data for conditions and variables
        const { data: client, error: clientError } = await supabaseAdmin
          .from('users')
          .select(`
            id,
            profiles(full_name),
            clients_profiles(goal_weight, check_in_day, last_login),
            nutrition_plans(updated_at)
          `)
          .eq('id', clientId)
          .single();
        
        if (clientError || !client) continue;

        // Fetch latest check-in for weight, RPE, Mood
        const { data: latestCheckIn } = await supabaseAdmin
          .from('check_ins')
          .select('weight, created_at, mood_score, rpe_score')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch adherence (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: habits } = await supabaseAdmin
          .from('habit_logs')
          .select('status')
          .eq('client_id', clientId)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0]);
        
        const adherence = habits && habits.length > 0 
          ? Math.round((habits.filter(h => h.status === 'completed').length / habits.length) * 100)
          : 0;

        const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : client.clients_profiles;
        const nPlan = Array.isArray(client.nutrition_plans) ? client.nutrition_plans[0] : client.nutrition_plans;

        const currentWeight = latestCheckIn?.weight || 0;
        const goalWeight = cProfile?.goal_weight || 0;
        const lastLogin = cProfile?.last_login ? new Date(cProfile.last_login) : new Date();
        const daysInactive = Math.floor((new Date().getTime() - lastLogin.getTime()) / (1000 * 3600 * 24));
        const checkInDay = cProfile?.check_in_day || 'Monday';
        
        // Days since last check-in
        const lastCheckinDate = latestCheckIn?.created_at ? new Date(latestCheckIn.created_at) : null;
        const daysSinceCheckin = lastCheckinDate 
          ? Math.floor((new Date().getTime() - lastCheckinDate.getTime()) / (1000 * 3600 * 24))
          : 999;

        const mood = latestCheckIn?.mood_score || 0;
        const rpe = latestCheckIn?.rpe_score || 0;

        // 4. Unified Condition Evaluation Helper
        const evalConditions = (conditions: any[]) => {
          if (!conditions || conditions.length === 0) return true;
          for (const cond of conditions) {
            if (!cond.enabled) continue;
            
            let val = 0;
            if (cond.type === 'weight') val = currentWeight;
            else if (cond.type === 'activity') val = daysInactive;
            else if (cond.type === 'adherence') val = adherence;
            else if (cond.type === 'last_checkin') val = daysSinceCheckin;
            else if (cond.type === 'mood') val = mood;
            else if (cond.type === 'rpe') val = rpe;
            else if (cond.type === 'weight_goal') val = currentWeight; // For stop conditions
            
            const target = cond.value === 'Target' ? goalWeight : parseFloat(cond.value) || 0;
            
            if (cond.operator === '>' && !(val > target)) return false;
            if (cond.operator === '<' && !(val < target)) return false;
            if (cond.operator === '==' && !(val === target)) return false;
            if (cond.operator === '<=' && !(val <= target)) return false;
            if (cond.operator === '>=' && !(val >= target)) return false;
          }
          return true;
        };

        // 4a. Check Activation Conditions
        if (!evalConditions(rules.activation_conditions)) continue;

        // 4b. Check Stop Conditions
        if (rules.stop_conditions && rules.stop_conditions.length > 0) {
          // Special cases for triggers like 'reply' or 'checkin'
          let stopMet = false;
          for (const cond of rules.stop_conditions) {
            if (!cond.enabled) continue;
            
            // System event stop conditions (requires data from the trigger)
            if (cond.type === 'reply' && triggerId === 'client-reply') stopMet = true;
            if (cond.type === 'checkin' && triggerId === 'checkin-submitted') stopMet = true;
            
            // Data-based stop conditions
            if (['weight_goal', 'adherence', 'activity'].includes(cond.type)) {
              if (evalConditions([cond])) stopMet = true;
            }
            if (stopMet) break;
          }
          
          if (stopMet) {
            console.log(`Automation ${automation.id} stopped for client ${clientId} due to stop condition.`);
            // Optionally disable the automation for this client if it's recurring?
            // For now, we just skip sending.
            continue;
          }
        }

        // 5. Check for duplicates or "Once" rules — usar insert directo como lock
        if (rules.frequency === 'Once') {
          // Intentar insertar el log primero como barrera anti-race-condition
          // Si ya existe un log para esta combinación, skip
          const { data: existingLogs } = await supabaseAdmin
            .from('automation_logs')
            .select('id')
            .eq('automation_id', automation.id)
            .eq('client_id', clientId)
            .limit(1);

          if (existingLogs && existingLogs.length > 0) continue;
        }

        // 6. Replace placeholders (manager profile se cachea por automation arriba)
        const coachName = _cachedCoachName;

        let finalMessage = automation.message
          .replace(/{Client Name}/g, profile?.full_name || 'there')
          .replace(/{First Name}/g, (profile?.full_name || 'there').split(' ')[0])
          .replace(/{Coach Name}/g, coachName)
          .replace(/{Coach First Name}/g, coachName.split(' ')[0])
          .replace(/{Current Weight}/g, currentWeight.toString())
          .replace(/{Goal Weight}/g, goalWeight.toString())
          .replace(/{Adherence Rate}/g, `${adherence}%`)
          .replace(/{Check-in Day}/g, checkInDay)
          .replace(/{Days Inactive}/g, daysInactive.toString())
          .replace(/{Days Until Expiry}/g, "30"); // Fallback or calculate if column exists
        
        // 7. Send message
        const { error: sendError } = await supabaseAdmin
          .from('messages')
          .insert({
            sender_id: managerId,
            receiver_id: clientId,
            content: finalMessage
          });
        
        if (sendError) {
          console.error(`Error sending automated message to ${clientId}:`, sendError);
          continue;
        }

        // 8. Log the delivery
        await supabaseAdmin
          .from('automation_logs')
          .insert({
            automation_id: automation.id,
            client_id: clientId,
            trigger_context: data,
            sent_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('Failure in processTrigger:', error);
  }
}

// CRUD Operations

router.get('/', verifyManager, async (req: any, res: any) => {
  try {
    const managerId = req.user.id;
    let { data, error } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('manager_id', managerId);
    
    if (error) throw error;

    // Seed defaults if empty
    if (!data || data.length === 0) {
      console.log('Seeding default automations for manager:', managerId);
      const defaults = [
        {
          manager_id: managerId,
          name: 'Weekly Check-in Reminder',
          description: 'Automatically nudge clients to complete their check-in form every week.',
          trigger_id: 'weekly-checkin',
          message: "Hi {First Name}, it's check-in day! 📝 Please take a few minutes to update your progress in the app. Consistency is the key to our success!",
          delivery_rules: { frequency: 'Every', frequencyValue: 7, frequencyUnit: 'Days', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'Repeat', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'Overdue Check-in',
          description: 'Follow up when a client misses their scheduled check-in deadline.',
          trigger_id: 'checkin-overdue',
          message: "Hi {First Name}, I noticed your check-in is a bit late. Is everything okay? Let me know if you need help with anything or if you've had a busy week! 🙏",
          delivery_rules: { frequency: 'Every', frequencyValue: 1, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'ClipboardCheck', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'No Activity Alert',
          description: "Re-engage clients who haven't logged any activity for 3 consecutive days.",
          trigger_id: 'inactivity',
          message: "Hey {First Name}, I haven't seen any activity in the app for a few days. Just wanted to check in and see if you're staying on track! Let me know if you need a boost. ⚡",
          delivery_rules: { frequency: 'Every', frequencyValue: 3, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'AlertTriangle', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'New Client Added',
          description: 'Trigger immediately when you add a new client to send a welcome message.',
          trigger_id: 'new-client',
          message: "Welcome to the team, {First Name}! 🚀 I'm thrilled to have you here. I've just set up your profile — take a look around and let me know if you have any questions!",
          delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'UserPlus', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'App Setup Reminder',
          description: "Nudge clients who haven't completed their initial app profile setup.",
          trigger_id: 'app-setup',
          message: "Hi {First Name}, just a quick reminder to finish setting up your profile and app preferences so we can hit the ground running! 📱",
          delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'Smartphone', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'Weekly Adherence High',
          description: 'Congratulate clients who achieved >90% habit adherence this week.',
          trigger_id: 'adherence-high',
          message: "Amazing work this week, {First Name}! 🌟 Your adherence rate was {Adherence Rate}. You're absolutely crushing it. Keep that momentum going!",
          delivery_rules: { frequency: 'Every', frequencyValue: 7, frequencyUnit: 'Days', deliveryTime: 'Afternoon', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'TrendingUp', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
          enabled: true
        },
        {
          manager_id: managerId,
          name: 'Client Birthday',
          description: "Send a personalized greeting on your client's special day.",
          trigger_id: 'birthday',
          message: "Happy Birthday, {First Name}! 🎂 Wishing you an incredible day filled with joy (and maybe a little treat). Enjoy your special day! — {Coach Name}",
          delivery_rules: { frequency: 'Once', deliveryTime: 'Morning', audience: 'All Clients', activation_conditions: [], stop_conditions: [] },
          icon_info: { iconName: 'Cake', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
          enabled: true
        }
      ];

      const { data: seeded, error: seedError } = await supabaseAdmin
        .from('automations')
        .insert(defaults)
        .select();
      
      if (seedError) throw seedError;
      data = seeded;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyManager, async (req: any, res) => {
  const payload = { ...req.body, manager_id: req.user.id };
  try {
    const { data, error } = await supabaseAdmin
      .from('automations')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyManager, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('automations')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyManager, async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('automations')
      .delete()
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for scheduled tasks (Cron) — protegido con CRON_SECRET
 */
router.post('/cron', async (req: any, res) => {
  const secret = req.headers['x-cron-secret'] || req.body?.cron_secret;
  const validSecret = process.env.CRON_SECRET;
  if (!validSecret || secret !== validSecret) {
    return res.status(403).json({ error: 'Forbidden: x-cron-secret inválido o ausente' });
  }
  try {
    console.log('Running daily automation cron...');
    const today = new Date();
    
    const { data: automations } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('enabled', true)
      .in('trigger_id', ['weekly-checkin', 'birthday', 'inactivity', 'checkin-overdue', 'app-setup', 'adherence-high']);
    
    if (!automations) return res.json({ processed: 0 });

    for (const automation of automations) {
      const { data: clients } = await supabaseAdmin
        .from('users')
        .select(`
          id, 
          email, 
          created_at,
          profiles (full_name, birthday),
          clients_profiles (last_login, check_in_day, height, weight, goal),
          nutrition_plans (updated_at)
        `)
        .eq('manager_id', automation.manager_id)
        .eq('role', 'CLIENT');
      
      if (!clients) continue;

      for (const client of clients) {
        const clientProfile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : client.clients_profiles;
        let shouldTrigger = false;

        if (automation.trigger_id === 'weekly-checkin') {
          // Send if not sent in the last 7 days and it's the right day
          const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
          if (cProfile?.check_in_day === dayName) {
            const { data: lastSent } = await supabaseAdmin
              .from('automation_logs')
              .select('sent_at')
              .eq('automation_id', automation.id)
              .eq('client_id', client.id)
              .order('sent_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / (1000 * 3600 * 24) >= 6) {
              shouldTrigger = true;
            }
          }
        } 
        else if (automation.trigger_id === 'checkin-overdue') {
          // Check if today is day after check_in_day and no checkin today/yesterday
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayName = yesterday.toLocaleDateString('en-US', { weekday: 'long' });

          if (cProfile?.check_in_day === yesterdayName) {
            const { data: checkIn } = await supabaseAdmin
              .from('check_ins')
              .select('id')
              .eq('client_id', client.id)
              .gte('date', yesterday.toISOString().split('T')[0])
              .maybeSingle();

            if (!checkIn) {
              const { data: lastSent } = await supabaseAdmin
                .from('automation_logs')
                .select('sent_at')
                .eq('automation_id', automation.id)
                .eq('client_id', client.id)
                .order('sent_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / (1000 * 3600 * 24) >= 6) {
                shouldTrigger = true;
              }
            }
          }
        }
        else if (automation.trigger_id === 'birthday') {
          if (clientProfile?.birthday) {
            const bday = new Date(clientProfile.birthday);
            if (bday.getUTCMonth() === today.getUTCMonth() && bday.getUTCDate() === today.getUTCDate()) {
              shouldTrigger = true;
            }
          }
        }
        else if (automation.trigger_id === 'inactivity') {
          const lastActivity = cProfile?.last_login;
          if (lastActivity) {
            const lastDate = new Date(lastActivity);
            const diffDays = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
            if (diffDays >= 3) {
              const { data: lastSent } = await supabaseAdmin
                .from('automation_logs')
                .select('sent_at')
                .eq('automation_id', automation.id)
                .eq('client_id', client.id)
                .order('sent_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / (1000 * 3600 * 24) >= 3) {
                shouldTrigger = true;
              }
            }
          }
        }
        else if (automation.trigger_id === 'app-setup') {
          // Check if joined > 2 days ago and profile incomplete (e.g. no height or goal)
          const joinedAt = new Date(client.created_at);
          const diffDays = (today.getTime() - joinedAt.getTime()) / (1000 * 3600 * 24);
          if (diffDays >= 2 && (!cProfile?.height || !cProfile?.goal)) {
            const { data: lastSent } = await supabaseAdmin
              .from('automation_logs')
              .select('sent_at')
              .eq('automation_id', automation.id)
              .eq('client_id', client.id)
              .maybeSingle();
            if (!lastSent) shouldTrigger = true;
          }
        }
        else if (automation.trigger_id === 'adherence-high') {
          // Check on Sundays for weekly adherence > 90%
          if (today.getDay() === 0) { // Sunday
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data: habits } = await supabaseAdmin
              .from('habit_logs')
              .select('status')
              .eq('client_id', client.id)
              .gte('date', sevenDaysAgo.toISOString().split('T')[0]);
            
            const adherence = habits && habits.length > 0 
              ? Math.round((habits.filter(h => h.status === 'completed').length / habits.length) * 100)
              : 0;

            if (adherence >= 90) shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          await processTrigger(automation.manager_id, automation.trigger_id, { clientId: client.id });
        }
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Cron error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
