import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import crypto from 'crypto';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { resumeWaitingWorkflows, fireScheduledWorkflows } from './workflows.js';
import { logger } from '../lib/logger.js';
import { makeEnforceLimit } from '../lib/plans.js';

// Block automation creation once the manager hits their tier's active-automation cap.
const enforceAutomationLimit = makeEnforceLimit(supabaseAdmin, 'activeAutomations', async (userId: string) => {
  const { count } = await supabaseAdmin
    .from('automations')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', userId)
    .eq('enabled', true);
  return count ?? 0;
});

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

      // Defense in depth: never message a client that is not actually this
      // manager's. Drops stale or forged ids from delivery_rules.selected_client_ids.
      if (clientIds.length > 0) {
        const { data: owned } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('manager_id', managerId)
          .eq('role', 'CLIENT')
          .in('id', clientIds);
        const ownedSet = new Set((owned || []).map(c => c.id));
        clientIds = clientIds.filter(cid => ownedSet.has(cid));
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
            clients_profiles(goal_weight, check_in_day, last_login)
          `)
          .eq('id', clientId)
          .maybeSingle();

        if (clientError || !client) continue;

        // Fetch latest check-in. check_ins stores all metrics inside data_json
        // (the columns weight/mood_score/rpe_score do not exist on the table).
        const { data: latestCheckIn } = await supabaseAdmin
          .from('check_ins')
          .select('data_json, date, created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const ciData: any = latestCheckIn?.data_json || {};

        // Habit adherence tracking is not implemented (no habit_logs table),
        // so adherence-based automations evaluate against 0.
        const adherence = 0;

        const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : client.clients_profiles;

        const currentWeight = Number(ciData.weight ?? ciData.avgWeight ?? ciData.bodyWeight) || 0;
        const goalWeight = cProfile?.goal_weight || 0;
        const lastLogin = cProfile?.last_login ? new Date(cProfile.last_login) : new Date();
        const daysInactive = Math.floor((new Date().getTime() - lastLogin.getTime()) / (1000 * 3600 * 24));
        const checkInDay = cProfile?.check_in_day || 'Monday';

        // Days since last check-in
        const lastCheckinRaw = latestCheckIn?.created_at || latestCheckIn?.date || null;
        const lastCheckinDate = lastCheckinRaw ? new Date(lastCheckinRaw) : null;
        const daysSinceCheckin = lastCheckinDate
          ? Math.floor((new Date().getTime() - lastCheckinDate.getTime()) / (1000 * 3600 * 24))
          : 999;

        const mood = Number(ciData.mood ?? ciData.mood_score) || 0;
        const rpe = Number(ciData.rpe ?? ciData.rpe_score) || 0;

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

        // 5. "Once" rules: claim delivery slot atomically via INSERT to a dedicated tracker.
        // The PRIMARY KEY (automation_id, client_id) makes this race-free — two concurrent
        // workers cannot both succeed, the loser gets a unique-violation and skips.
        if (rules.frequency === 'Once') {
          const { error: claimError } = await supabaseAdmin
            .from('automation_once_deliveries')
            .insert({ automation_id: automation.id, client_id: clientId });

          if (claimError) {
            // 23505 = unique violation → already delivered. Any other error: log and skip too.
            if (claimError.code !== '23505') {
              console.error(`automation_once_deliveries claim failed for ${automation.id}/${clientId}:`, claimError);
            }
            continue;
          }
        }

        // 6. Replace placeholders (manager profile se cachea por automation arriba)
        const coachName = _cachedCoachName;

        const clientName = profile?.full_name || 'there';
        const firstName = clientName.split(' ')[0];
        const coachFirstName = coachName.split(' ')[0];
        let finalMessage = automation.message
          .replace(/{Client Name}/g, () => clientName)
          .replace(/{First Name}/g, () => firstName)
          .replace(/{Coach Name}/g, () => coachName)
          .replace(/{Coach First Name}/g, () => coachFirstName)
          .replace(/{Current Weight}/g, () => currentWeight.toString())
          .replace(/{Goal Weight}/g, () => goalWeight.toString())
          .replace(/{Adherence Rate}/g, () => `${adherence}%`)
          .replace(/{Check-in Day}/g, () => checkInDay)
          .replace(/{Days Inactive}/g, () => daysInactive.toString())
          .replace(/{Days Until Expiry}/g, () => "30");
        
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
  // Automations: cursor DESC sobre created_at. El seed solo corre en la
  // primera pagina (sin cursor) y solo si la BD esta vacia para este manager.
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  const isFirstPage = !page.cursor;
  try {
    const managerId = req.user.id;
    let q = supabaseAdmin
      .from('automations')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'created_at', 'desc');
    let { data, error } = await q;

    if (error) throw error;

    // Seed defaults if empty (solo primera pagina)
    if (isFirstPage && (!data || data.length === 0)) {
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

      // Plain insert: this branch only runs when the manager has zero automations,
      // so there is nothing to conflict with. (There is no unique constraint on
      // manager_id,trigger_id, so an upsert with onConflict would error out.)
      const { data: seeded, error: seedError } = await supabaseAdmin
        .from('automations')
        .insert(defaults)
        .select();

      if (seedError) throw seedError;
      data = seeded;
    }

    res.json(buildPage(data || [], page.limit, 'created_at'));
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

// Only these columns may come from the request body. manager_id is always set
// server-side; ids, timestamps and arbitrary columns are never accepted from clients.
const AUTOMATION_FIELDS = ['name', 'description', 'trigger_id', 'message', 'delivery_rules', 'icon_info', 'enabled'] as const;
function pickAutomationFields(body: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key of AUTOMATION_FIELDS) {
    if (body && body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

router.post('/', verifyManager, enforceAutomationLimit, async (req: any, res) => {
  const payload = { ...pickAutomationFields(req.body), manager_id: req.user.id };
  try {
    const { data, error } = await supabaseAdmin
      .from('automations')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
  }
});

router.put('/:id', verifyManager, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('automations')
      .update(pickAutomationFields(req.body))
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: safeErr(error) });
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
    res.status(500).json({ error: safeErr(error) });
  }
});

/**
 * Endpoint for scheduled tasks (Cron) — protegido con CRON_SECRET
 */
const cronHandler = async (req: any, res: any) => {
  // Vercel Cron invokes with GET and "Authorization: Bearer <CRON_SECRET>".
  // External schedulers may use POST with "x-cron-secret" or a body field.
  const authHeader = String(req.headers['authorization'] || '');
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const secret = req.headers['x-cron-secret'] || req.body?.cron_secret || bearer;
  const validSecret = process.env.CRON_SECRET;
  if (!validSecret) {
    return res.status(500).json({ error: 'Server misconfigured: CRON_SECRET not set' });
  }
  // Timing-safe comparison to prevent secret brute-forcing via response timing.
  const a = Buffer.from(String(secret || ''));
  const b = Buffer.from(validSecret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'Forbidden: x-cron-secret inválido o ausente' });
  }
  try {
    logger.info('automations.cron.started', {});
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
          clients_profiles (last_login, check_in_day, height, weight, goal)
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
              .limit(1)
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
              .order('sent_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (!lastSent) shouldTrigger = true;
          }
        }
        else if (automation.trigger_id === 'adherence-high') {
          // Habit adherence tracking is not implemented (no habit_logs table),
          // so this automation never triggers automatically from the cron.
        }

        if (shouldTrigger) {
          await processTrigger(automation.manager_id, automation.trigger_id, { clientId: client.id });
        }
      }
    }

    // Advanced Workflows: resume parked (Wait) runs + fire scheduled workflows.
    const resumed = await resumeWaitingWorkflows();
    const scheduled = await fireScheduledWorkflows();

    // Expire trials whose deadline has passed and that never converted to a paid sub.
    // Move them to status='past_due' so the frontend renders the paywall.
    let trialsExpired = 0;
    try {
      const nowIso = new Date().toISOString();
      const { data: expired } = await supabaseAdmin
        .from('manager_subscriptions')
        .update({ status: 'past_due', updated_at: nowIso })
        .eq('plan_tier', 'trial')
        .lt('trial_ends_at', nowIso)
        .neq('status', 'past_due')
        .is('stripe_subscription_id', null)
        .select('user_id');
      trialsExpired = expired?.length ?? 0;
      if (trialsExpired) logger.info('billing.trials.expired', { count: trialsExpired });
    } catch (e: any) {
      logger.error('billing.trials.expire_failed', { err: e?.message });
    }

    logger.info('automations.cron.completed', { workflows: { resumed, scheduled }, trialsExpired });
    res.json({ success: true, workflows: { resumed, scheduled }, trialsExpired });
  } catch (error: any) {
    logger.error('automations.cron.failed', { err: error?.message });
    res.status(500).json({ error: safeErr(error) });
  }
};

router.post('/cron', cronHandler);
router.get('/cron', cronHandler);

export default router;
