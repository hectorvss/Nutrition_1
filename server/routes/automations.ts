import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import crypto from 'crypto';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { resumeWaitingWorkflows, fireScheduledWorkflows } from './workflows.js';
import { logger } from '../lib/logger.js';
import { makeEnforceLimit, limitsForTier, type PlanTier } from '../lib/plans.js';
import { TRIGGERS, TRIGGER_BY_ID, filterTriggersByTier } from '../lib/automation-triggers.js';
import { ACTIVATION_CONDITIONS, STOP_CONDITIONS, filterConditionsByTier } from '../lib/automation-conditions.js';
import { renderMessage, type RenderContext } from '../lib/messageTemplate.js';

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

// ─── Multi-step engine ────────────────────────────────────────────────────
// Una automation puede definir `delivery_rules.steps: Step[]`. Si esta vacio
// o ausente, el flujo es el clasico (un solo mensaje en `automation.message`).
// Si tiene steps, los ejecutamos secuencialmente; cuando llegamos a un
// `wait` persistimos el progreso en `automation_pending_steps` y el cron
// diario reanuda la cadena cuando vence el delay.

export type AutomationStep =
  | { kind: 'message'; message: string }
  | { kind: 'wait'; amount: number; unit: 'hours' | 'days'; cancelIfReplied?: boolean }
  | { kind: 'create_task'; title: string; type?: string; priority?: 'low'|'medium'|'high'; date?: string }
  | { kind: 'set_field'; field: 'status' | 'goal' | 'notes'; value: string }
  | { kind: 'stop_if'; conditionType: string; operator: string; value: string };

interface ExecutionContext {
  managerId: string;
  automation: any;
  clientId: string;
  /** Snapshot de las variables de mensaje (Client Name, etc.). */
  renderCtx: RenderContext;
  /** Trigger payload original (clientId, etc.). */
  triggerPayload: any;
  /** Valores precomputados para evaluar conditions. */
  conditionValues: Record<string, number | string | boolean>;
}

/**
 * Evalua un array de conditions con shape { type, operator, value, enabled }
 * contra el dict de valores precomputados. Para conditions tipo 'within'
 * el `value` es un periodo (e.g. "24" horas para reply.within=24h).
 *
 * Devuelve true si TODAS las conditions habilitadas se cumplen (AND).
 */
function evalConditions(conditions: any[], values: Record<string, any>): boolean {
  if (!Array.isArray(conditions) || conditions.length === 0) return true;
  for (const c of conditions) {
    if (!c?.enabled) continue;
    const val = values[c.type];
    if (val === undefined) {
      // Type desconocido (e.g. condition legacy o de una version anterior del
      // catalogo): NO se cumple. Para activation conditions esto bloquea el
      // envio (defensivo); para stop conditions el caller pasa una sola en
      // su loop, asi que el siguiente intento puede triggear otra que si
      // exista.
      return false;
    }
    const target = c.value === 'Target' ? values['goal_weight'] : c.value;
    const numTarget = parseFloat(target);
    const numVal = Number(val);
    switch (c.operator) {
      case '>':  if (!(numVal >  numTarget)) return false; break;
      case '<':  if (!(numVal <  numTarget)) return false; break;
      case '>=': if (!(numVal >= numTarget)) return false; break;
      case '<=': if (!(numVal <= numTarget)) return false; break;
      case '==': if (!(String(val) === String(target))) return false; break;
      case '!=': if (!(String(val) !== String(target))) return false; break;
      case 'within':
        // 'within' es tiempo: la condition se cumple si el evento ocurrio
        // en los ultimos N (horas|dias). El values[type] debe ser un numero
        // de horas/dias desde el evento (e.g. last_message_recent_hours).
        if (!(numVal <= numTarget)) return false;
        break;
    }
  }
  return true;
}

/**
 * Ejecuta los steps de una automation a partir de `fromStep`. Devuelve:
 *   - 'completed' si terminamos toda la cadena.
 *   - 'parked'    si un `wait` parqueo la ejecucion (cron resumira).
 *   - 'aborted'   si un `stop_if` se cumplio o un error fatal.
 */
async function executeAutomationSteps(opts: {
  ctx: ExecutionContext;
  steps: AutomationStep[];
  fromStep: number;
}): Promise<'completed' | 'parked' | 'aborted'> {
  const { ctx, steps, fromStep } = opts;

  for (let i = fromStep; i < steps.length; i++) {
    const step = steps[i];

    if (step.kind === 'message') {
      const finalMessage = renderMessage(step.message, ctx.renderCtx);
      const { error } = await supabaseAdmin.from('messages').insert({
        sender_id: ctx.managerId,
        receiver_id: ctx.clientId,
        content: finalMessage,
      });
      if (error) {
        console.error(`[automation ${ctx.automation.id}] message step ${i} failed:`, error);
        return 'aborted';
      }
      await supabaseAdmin.from('automation_logs').insert({
        automation_id: ctx.automation.id,
        client_id: ctx.clientId,
        trigger_context: { ...ctx.triggerPayload, step_index: i, step_kind: 'message' },
        sent_at: new Date().toISOString(),
      });
      continue;
    }

    if (step.kind === 'wait') {
      const ms = (step.amount || 0) * (step.unit === 'hours' ? 3600 : 86400) * 1000;
      const resumeAt = new Date(Date.now() + ms).toISOString();
      const { error } = await supabaseAdmin
        .from('automation_pending_steps')
        .insert({
          automation_id: ctx.automation.id,
          client_id: ctx.clientId,
          step_index: i + 1, // queremos resumir DESDE el step siguiente al wait
          resume_at: resumeAt,
          context: {
            triggerPayload: ctx.triggerPayload,
            renderCtx: ctx.renderCtx,
            cancelIfReplied: !!step.cancelIfReplied,
          },
        });
      if (error && error.code !== '23505') {
        // 23505 = unique-violation -> ya hay una fila parqueada para esta
        // cadena. La nueva se descarta (no duplicamos el delay). Cualquier
        // otro error lo loguemos y abortamos para no perder telemetria.
        console.error(`[automation ${ctx.automation.id}] wait step ${i} parking failed:`, error);
        return 'aborted';
      }
      return 'parked';
    }

    if (step.kind === 'create_task') {
      const date = step.date || new Date().toISOString().slice(0, 10);
      const { error } = await supabaseAdmin.from('tasks').insert({
        manager_id: ctx.managerId,
        client_id: ctx.clientId,
        title: renderMessage(step.title, ctx.renderCtx),
        type: step.type || 'Admin',
        date,
        time: '09:00',
        status: 'pending',
        priority: step.priority || 'medium',
      });
      if (error) {
        console.error(`[automation ${ctx.automation.id}] create_task step ${i} failed:`, error);
      }
      continue;
    }

    if (step.kind === 'set_field') {
      // Solo permitimos actualizar campos no sensibles del cliente.
      const SAFE_FIELDS = ['status', 'goal', 'notes'];
      if (!SAFE_FIELDS.includes(step.field)) continue;
      const table = step.field === 'status' ? 'users' : 'clients_profiles';
      const pk = step.field === 'status' ? 'id' : 'user_id';
      const { error } = await supabaseAdmin.from(table)
        .update({ [step.field]: step.value })
        .eq(pk, ctx.clientId);
      if (error) console.error(`[automation ${ctx.automation.id}] set_field step ${i} failed:`, error);
      continue;
    }

    if (step.kind === 'stop_if') {
      const condArr = [{
        type: step.conditionType, operator: step.operator,
        value: step.value, enabled: true,
      }];
      if (evalConditions(condArr, ctx.conditionValues)) {
        // condicion cumplida -> aborto controlado.
        await supabaseAdmin.from('automation_logs').insert({
          automation_id: ctx.automation.id,
          client_id: ctx.clientId,
          trigger_context: { ...ctx.triggerPayload, step_index: i, step_kind: 'stop_if', reason: 'condition_met' },
          sent_at: new Date().toISOString(),
        });
        return 'aborted';
      }
      continue;
    }
  }
  return 'completed';
}

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
            id, email, status, created_at,
            profiles(full_name),
            clients_profiles(goal_weight, check_in_day, last_login, weight, notes)
          `)
          .eq('id', clientId)
          .maybeSingle();

        if (clientError || !client) continue;

        // Fetch latest 2 check-ins (last + previous, para weight_diff)
        const { data: lastTwo } = await supabaseAdmin
          .from('check_ins')
          .select('data_json, date, created_at, reviewed_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(2);
        const latestCheckIn = lastTwo?.[0] || null;
        const prevCheckIn   = lastTwo?.[1] || null;

        const ciData: any = latestCheckIn?.data_json || {};
        const prevData: any = prevCheckIn?.data_json || {};

        const profile = Array.isArray(client.profiles) ? client.profiles[0] : (client.profiles as any);
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : (client.clients_profiles as any);

        const currentWeight = Number(ciData.weight ?? ciData.avgWeight ?? ciData.bodyWeight ?? cProfile?.weight) || 0;
        const prevWeight    = Number(prevData.weight ?? prevData.avgWeight ?? prevData.bodyWeight) || currentWeight;
        const weightDiff    = Math.abs(currentWeight - prevWeight);
        const goalWeight    = Number(cProfile?.goal_weight) || 0;
        const goalWeightDiff = goalWeight ? Math.abs(currentWeight - goalWeight) : 0;

        const lastLogin = cProfile?.last_login ? new Date(cProfile.last_login) : new Date();
        const daysInactive = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 3600 * 24));
        const daysSinceLogin = daysInactive;

        const lastCheckinRaw = latestCheckIn?.created_at || latestCheckIn?.date || null;
        const lastCheckinDate = lastCheckinRaw ? new Date(lastCheckinRaw) : null;
        const daysSinceCheckin = lastCheckinDate
          ? Math.floor((Date.now() - lastCheckinDate.getTime()) / (1000 * 3600 * 24))
          : 999;
        const createdAt = (client as any).created_at ? new Date((client as any).created_at) : new Date();
        const daysAsClient = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 3600 * 24));

        const adherencePct = Number(ciData.nutrition_adherence_score ?? ciData.adherence_score);
        const adherence    = Number.isFinite(adherencePct) ? adherencePct * 10 : 0;

        const mood = Number(ciData.mood ?? ciData.mood_score) || 0;
        const rpe  = Number(ciData.rpe ?? ciData.rpe_score) || 0;
        const bodyFat = Number(ciData.body_fat ?? ciData.bodyFat) || 0;

        // Anti-spam helpers: ¿hubo mensaje reciente? ¿el coach respondio?
        const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
        const { count: recentMsgCount } = await supabaseAdmin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .or(`and(sender_id.eq.${managerId},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${managerId})`)
          .gte('created_at', sixHoursAgo);
        const hoursSinceLastMsg = (recentMsgCount || 0) > 0 ? 0 : 999;

        // Diccionario unico — el evaluator de conditions solo consulta esto.
        const conditionValues: Record<string, any> = {
          weight: currentWeight,
          // weight_goal es un alias historico de `weight` (se comparaba contra
          // goal). El catalogo nuevo usa `weight` + value='Target', pero
          // mantenemos esta clave para automations creadas antes del refactor.
          weight_goal: currentWeight,
          weight_diff: weightDiff,
          goal_weight: goalWeight,
          goal_weight_diff: goalWeightDiff,
          body_fat: bodyFat,
          adherence,
          adherence_avg_4w: adherence, // simplificacion: mismo valor (TODO: media real)
          mood, rpe,
          last_checkin: daysSinceCheckin,
          last_login_days: daysSinceLogin,
          activity: daysInactive,
          days_as_client: daysAsClient,
          streak_workouts: 0, // TODO: calcular desde workout_logs
          unread_messages_count: 0, // TODO
          has_active_plan: true, // TODO: leer de nutrition_plans/training_programs
          // Stop conditions (event-based + anti-spam)
          reply: (triggerId === 'client-reply') ? 0 : 999, // 'within' compara: 0 = "ahora", 999 = "hace mucho"
          checkin: (triggerId === 'checkin-submitted') ? 0 : daysSinceCheckin,
          weight_goal_reached: goalWeight && currentWeight <= goalWeight ? 'true' : 'false',
          client_archived: ((client as any).status === 'Archived' || (client as any).status === 'archived') ? 'true' : 'false',
          coach_replied: hoursSinceLastMsg,
          last_message_recent: hoursSinceLastMsg,
          max_sends_per_week: 0, // TODO: count automation_logs ultima semana
          workflow_paused: 'false', // si llegamos aqui es porque enabled=true
          on_vacation: 'false',
          plan_completed: 'false',
        };

        // 4a. Activation conditions
        if (!evalConditions(rules.activation_conditions, conditionValues)) continue;

        // 4b. Stop conditions (OR: con que UNA se cumpla, paramos)
        let stopMet = false;
        for (const cond of (rules.stop_conditions || [])) {
          if (!cond?.enabled) continue;
          if (evalConditions([cond], conditionValues)) { stopMet = true; break; }
        }
        if (stopMet) {
          console.log(`[automation ${automation.id}] stopped by stop_condition for client ${clientId}`);
          continue;
        }

        // 5. "Once" rules
        if (rules.frequency === 'Once') {
          const { error: claimError } = await supabaseAdmin
            .from('automation_once_deliveries')
            .insert({ automation_id: automation.id, client_id: clientId });
          if (claimError) {
            if (claimError.code !== '23505') {
              console.error(`automation_once_deliveries claim failed for ${automation.id}/${clientId}:`, claimError);
            }
            continue;
          }
        }

        // 6. Construir contexto para steps
        const renderCtx: RenderContext = {
          client: { id: clientId, email: (client as any).email, full_name: profile?.full_name },
          profile: cProfile || null,
          coachName: _cachedCoachName,
          latestCheckIn: ciData,
        };

        const execCtx: ExecutionContext = {
          managerId, automation, clientId, renderCtx,
          triggerPayload: data, conditionValues,
        };

        // 7. Ejecutar steps. Si la automation no define steps multi-step,
        // sintetizamos un unico step `message` desde automation.message.
        const steps: AutomationStep[] = Array.isArray(rules.steps) && rules.steps.length > 0
          ? rules.steps
          : [{ kind: 'message', message: automation.message || '' }];

        await executeAutomationSteps({ ctx: execCtx, steps, fromStep: 0 });
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

/**
 * Devuelve el catalogo de triggers + conditions filtrado por el tier del
 * manager. Frontend lo consume al abrir el wizard de crear automation.
 */
router.get('/catalog', verifyManager, async (req: any, res) => {
  try {
    const { data: sub } = await supabaseAdmin
      .from('manager_subscriptions')
      .select('plan_tier')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const tier = (sub?.plan_tier as PlanTier) || 'trial';
    const limits = limitsForTier(tier);
    const triggerCatalogTier = limits.automationTriggerTier;

    res.json({
      tier,
      limits: {
        maxStepsPerFlow: limits.automationMaxStepsPerFlow,
        activeAutomations: limits.activeAutomations,
        triggerTier: triggerCatalogTier,
      },
      triggers: filterTriggersByTier(triggerCatalogTier),
      activationConditions: filterConditionsByTier(ACTIVATION_CONDITIONS, triggerCatalogTier),
      stopConditions: filterConditionsByTier(STOP_CONDITIONS, triggerCatalogTier),
    });
  } catch (error: any) {
    logger.error('automations.catalog.failed', { err: error?.message });
    res.status(500).json({ error: safeErr(error) });
  }
});

/**
 * Valida el campo `steps` antes de persistirlo. Aplica el cap del tier
 * (automationMaxStepsPerFlow) y descarta steps de tipos desconocidos.
 * No throws — devuelve un { ok, error?, steps? } para que el handler decida.
 */
async function validateSteps(req: any, steps: any): Promise<{ ok: boolean; error?: string; steps?: AutomationStep[] }> {
  if (!Array.isArray(steps) || steps.length === 0) return { ok: true, steps: [] };
  const VALID_KINDS = ['message', 'wait', 'create_task', 'set_field', 'stop_if'];
  const cleaned: AutomationStep[] = [];
  for (const s of steps) {
    if (!s || typeof s !== 'object' || !VALID_KINDS.includes(s.kind)) continue;
    cleaned.push(s as AutomationStep);
  }
  // Cap por tier.
  const { data: sub } = await supabaseAdmin
    .from('manager_subscriptions').select('plan_tier').eq('user_id', req.user.id).maybeSingle();
  const tier = (sub?.plan_tier as PlanTier) || 'trial';
  const max = limitsForTier(tier).automationMaxStepsPerFlow;
  if (max != null && cleaned.length > max) {
    return { ok: false, error: `Tu plan ${tier} permite maximo ${max} paso(s) por automation.` };
  }
  return { ok: true, steps: cleaned };
}

router.post('/', verifyManager, enforceAutomationLimit, async (req: any, res) => {
  try {
    const fields = pickAutomationFields(req.body);
    // Validar steps si vienen en delivery_rules.steps
    if (fields.delivery_rules?.steps) {
      const v = await validateSteps(req, fields.delivery_rules.steps);
      if (!v.ok) return res.status(400).json({ error: v.error });
      fields.delivery_rules.steps = v.steps;
    }
    const payload = { ...fields, manager_id: req.user.id };
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
    const fields = pickAutomationFields(req.body);
    if (fields.delivery_rules?.steps) {
      const v = await validateSteps(req, fields.delivery_rules.steps);
      if (!v.ok) return res.status(400).json({ error: v.error });
      fields.delivery_rules.steps = v.steps;
    }
    const { data, error } = await supabaseAdmin
      .from('automations')
      .update(fields)
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

    // Reanuda cadenas multi-step de simple automations parqueadas (los
    // pasos `wait`). Las filas con resume_at <= now() se procesan en lote;
    // si la cadena termina o vuelve a parquear, la fila se borra/reemplaza.
    let stepsResumed = 0;
    try {
      const { data: pending } = await supabaseAdmin
        .from('automation_pending_steps')
        .select('*')
        .lte('resume_at', new Date().toISOString())
        .limit(200);

      for (const row of pending || []) {
        const { data: automation } = await supabaseAdmin
          .from('automations').select('*').eq('id', row.automation_id).maybeSingle();
        if (!automation || !automation.enabled) {
          await supabaseAdmin.from('automation_pending_steps').delete().eq('id', row.id);
          continue;
        }

        const steps: AutomationStep[] = automation.delivery_rules?.steps || [];
        const ctx0 = row.context || {};

        // cancelIfReplied: si en el wait previo se pidio cancelar si el
        // cliente respondio, comprobamos antes de seguir.
        if (ctx0.cancelIfReplied) {
          const { data: lastReply } = await supabaseAdmin
            .from('messages').select('id')
            .eq('sender_id', row.client_id)
            .eq('receiver_id', automation.manager_id)
            .gte('created_at', row.created_at)
            .limit(1).maybeSingle();
          if (lastReply) {
            await supabaseAdmin.from('automation_pending_steps').delete().eq('id', row.id);
            stepsResumed++;
            continue;
          }
        }

        // Reconstruir un context minimo. Las conditions ya no pueden
        // evaluarse contra datos frescos sin re-fetch — por ahora vacio
        // (los stop_if dentro de la cadena no se evaluan en resume).
        const execCtx: ExecutionContext = {
          managerId: automation.manager_id,
          automation, clientId: row.client_id,
          renderCtx: ctx0.renderCtx || {},
          triggerPayload: ctx0.triggerPayload || {},
          conditionValues: ctx0.conditionValues || {},
        };

        const result = await executeAutomationSteps({
          ctx: execCtx, steps, fromStep: row.step_index,
        });

        // El insert de wait en executeAutomationSteps creo una fila NUEVA
        // (porque el unique-index por (automation_id, client_id) hubiera
        // dado conflict si reusamos). Borramos la fila previa siempre que
        // hayamos completado o aborted; si el siguiente wait parqueo otra,
        // tambien borramos la primera (la nueva tiene id distinto).
        await supabaseAdmin.from('automation_pending_steps').delete().eq('id', row.id);
        stepsResumed++;
      }
    } catch (e: any) {
      logger.error('automations.steps.resume_failed', { err: e?.message });
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

    logger.info('automations.cron.completed', { workflows: { resumed, scheduled }, trialsExpired, stepsResumed });
    res.json({ success: true, workflows: { resumed, scheduled }, trialsExpired, stepsResumed });
  } catch (error: any) {
    logger.error('automations.cron.failed', { err: error?.message });
    res.status(500).json({ error: safeErr(error) });
  }
};

router.post('/cron', cronHandler);
router.get('/cron', cronHandler);

export default router;
