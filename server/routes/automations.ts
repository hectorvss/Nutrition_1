import { Router } from 'express';
import { safeErr } from '../lib/http.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import crypto from 'crypto';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { resumeWaitingWorkflows, fireScheduledWorkflows } from './workflows.js';
import { logger } from '../lib/logger.js';
import { makeEnforceLimit, limitsForTier, countActiveAutomations, type PlanTier } from '../lib/plans.js';
import { TRIGGERS, TRIGGER_BY_ID, filterTriggersByTier } from '../lib/automation-triggers.js';
import { ACTIVATION_CONDITIONS, STOP_CONDITIONS, filterConditionsByTier } from '../lib/automation-conditions.js';
import { localizeFlowTemplates } from '../lib/automation-templates.js';
import { getDefaultAutomations, getLocalizedAutomationPreview } from '../lib/automation-defaults.js';
import { sendPushToUser } from '../lib/push.js';
import { sendManagerNotificationEmail, sendClientTransactionalEmail } from '../lib/email.js';
import { renderMessage, type RenderContext } from '../lib/messageTemplate.js';

// Block automation creation once the manager hits their tier's active-automation
// cap. El cupo es unico: cuenta automations simples + workflows avanzados juntos.
const enforceAutomationLimit = makeEnforceLimit(supabaseAdmin, 'activeAutomations',
  (userId: string) => countActiveAutomations(supabaseAdmin, userId));

const router = Router();

async function resolveManagerLanguage(managerId: string): Promise<'es' | 'en'> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language')
      .eq('user_id', managerId)
      .maybeSingle();
    return profile?.language === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function addAutomationPreview(automation: any, language: 'es' | 'en') {
  const steps = Array.isArray(automation?.delivery_rules?.steps) ? automation.delivery_rules.steps : [];
  const firstStepMessage = steps.find((step: any) => step?.kind === 'message')?.message || '';
  const firstEmailStep = steps.find((step: any) => step?.kind === 'send_email') || null;
  const emailText = firstEmailStep
    ? [firstEmailStep.subject, firstEmailStep.title, firstEmailStep.subtitle, firstEmailStep.body]
        .filter(Boolean)
        .join(' ')
    : '';
  const baseMessage = firstStepMessage || emailText || automation?.message || '';
  return {
    ...automation,
    message_preview: getLocalizedAutomationPreview(automation?.trigger_id || '', baseMessage, language),
  };
}

// ─── Multi-step engine ────────────────────────────────────────────────────
// Una automation puede definir `delivery_rules.steps: Step[]`. Si esta vacio
// o ausente, el flujo es el clasico (un solo mensaje en `automation.message`).
// Si tiene steps, los ejecutamos secuencialmente; cuando llegamos a un
// `wait` persistimos el progreso en `automation_pending_steps` y el cron
// diario reanuda la cadena cuando vence el delay.

export type { AutomationStep } from '../lib/automation-types.js';
import type { AutomationStep } from '../lib/automation-types.js';

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

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function triggerNumberParam(automation: any, key: string): number | null {
  const rules = automation?.delivery_rules || {};
  const raw = rules.trigger_params?.[key] ?? rules.triggerParams?.[key] ?? rules.params?.[key];
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) return parsed;
  const def = TRIGGER_BY_ID[automation?.trigger_id]?.params?.find(p => p.key === key)?.defaultValue;
  const fallback = Number(def);
  return Number.isFinite(fallback) ? fallback : null;
}

async function lastAutomationSentAt(automationId: string, clientId: string): Promise<Date | null> {
  const { data } = await supabaseAdmin
    .from('automation_logs')
    .select('sent_at')
    .eq('automation_id', automationId)
    .eq('client_id', clientId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.sent_at ? new Date(data.sent_at) : null;
}

async function hasSentWithin(automationId: string, clientId: string, ms: number): Promise<boolean> {
  const last = await lastAutomationSentAt(automationId, clientId);
  return Boolean(last && Date.now() - last.getTime() < ms);
}

async function countAutomationLogsSince(automationId: string, clientId: string, sinceIso: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('automation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('automation_id', automationId)
    .eq('client_id', clientId)
    .gte('sent_at', sinceIso);
  return count || 0;
}

function normalizeCheckinRows(legacyRows: any[] = [], submissionRows: any[] = []) {
  const rows = [
    ...legacyRows.map(row => ({
      data: row.data_json || {},
      at: row.created_at || row.date,
      reviewed_at: row.reviewed_at || null,
    })),
    ...submissionRows.map(row => ({
      data: row.answers_json || {},
      at: row.submitted_at,
      reviewed_at: row.reviewed_at || null,
    })),
  ];
  return rows
    .filter(row => row.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function readWeight(data: any): number | null {
  const raw = data?.weight ?? data?.Weight ?? data?.current_weight ?? data?.['Current Weight']
    ?? data?.peso ?? data?.avgWeight ?? data?.bodyWeight;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function countCheckinsInRange(clientId: string, startIso: string, endIso: string): Promise<number> {
  const [{ count: legacy }, { count: dynamic }] = await Promise.all([
    supabaseAdmin
      .from('check_ins')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('created_at', startIso)
      .lt('created_at', endIso),
    supabaseAdmin
      .from('client_checkin_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('submitted_at', startIso)
      .lt('submitted_at', endIso),
  ]);
  return (legacy || 0) + (dynamic || 0);
}

async function hasAnyActivePlan(clientId: string): Promise<boolean> {
  const [nutrition, training] = await Promise.all([
    supabaseAdmin.from('nutrition_plans').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
    supabaseAdmin.from('training_programs').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
  ]);
  return (nutrition.count || 0) > 0 || (training.count || 0) > 0;
}

async function latestPlanUpdatedAt(clientId: string): Promise<string | null> {
  const [nutrition, training] = await Promise.all([
    supabaseAdmin.from('nutrition_plans').select('updated_at, created_at').eq('client_id', clientId).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('training_programs').select('updated_at, created_at').eq('client_id', clientId).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const dates = [nutrition.data?.updated_at || nutrition.data?.created_at, training.data?.updated_at || training.data?.created_at]
    .filter(Boolean)
    .map(d => new Date(d as string).getTime())
    .filter(Number.isFinite);
  if (!dates.length) return null;
  return new Date(Math.max(...dates)).toISOString();
}

async function hasFutureAppointment(managerId: string, clientId: string, todayIso: string): Promise<boolean> {
  const { count } = await supabaseAdmin
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', managerId)
    .eq('client_id', clientId)
    .gte('date', todayIso)
    .not('status', 'in', '(completed,cancelled,canceled)');
  return (count || 0) > 0;
}

async function recentWorkoutStats(clientId: string, now = new Date()) {
  const [{ data: latest }, { count }] = await Promise.all([
    supabaseAdmin
      .from('workout_logs')
      .select('logged_at')
      .eq('client_id', clientId)
      .order('logged_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('workout_logs')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clientId),
  ]);
  const daysSinceLastWorkout = latest?.logged_at
    ? Math.floor((now.getTime() - new Date(latest.logged_at).getTime()) / DAY_MS)
    : 999;
  return { daysSinceLastWorkout, totalWorkouts: count || 0 };
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
  dryRun?: boolean;
}): Promise<'completed' | 'parked' | 'aborted'> {
  const { ctx, steps, fromStep, dryRun = false } = opts;

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

    if (step.kind === 'send_email') {
      const clientEmail = String(ctx.renderCtx?.client?.email || '').trim();
      if (!clientEmail) {
        await supabaseAdmin.from('automation_logs').insert({
          automation_id: ctx.automation.id,
          client_id: ctx.clientId,
          trigger_context: { ...ctx.triggerPayload, step_index: i, step_kind: 'send_email', reason: 'missing_email' },
          sent_at: new Date().toISOString(),
        });
        continue;
      }
      const subject = renderMessage(step.subject || step.title || 'Update', ctx.renderCtx);
      const title = renderMessage(step.title || subject, ctx.renderCtx);
      const subtitle = step.subtitle ? renderMessage(step.subtitle, ctx.renderCtx) : undefined;
      const body = renderMessage(step.body || '', ctx.renderCtx);
      const imageUrl = step.imageUrl ? renderMessage(step.imageUrl, ctx.renderCtx) : undefined;
      const imageAlt = step.imageAlt ? renderMessage(step.imageAlt, ctx.renderCtx) : undefined;
      const ctaLabel = step.ctaLabel ? renderMessage(step.ctaLabel, ctx.renderCtx) : undefined;
      const ctaUrl = step.ctaUrl ? renderMessage(step.ctaUrl, ctx.renderCtx) : undefined;
      const note = step.note ? renderMessage(step.note, ctx.renderCtx) : undefined;
      if (dryRun) {
        await supabaseAdmin.from('automation_logs').insert({
          automation_id: ctx.automation.id,
          client_id: ctx.clientId,
          trigger_context: { ...ctx.triggerPayload, step_index: i, step_kind: 'send_email', dryRun: true, subject, title },
          sent_at: new Date().toISOString(),
        });
        continue;
      }
      const sent = await sendClientTransactionalEmail({
        to: clientEmail,
        language: ctx.renderCtx.language === 'en' ? 'en' : 'es',
        subject,
        title,
        subtitle,
        body,
        imageUrl,
        imageAlt,
        ctaLabel,
        ctaUrl,
        note,
      });
      if (!sent.ok && !sent.skipped) {
        console.error(`[automation ${ctx.automation.id}] send_email step ${i} failed`);
        return 'aborted';
      }
      await supabaseAdmin.from('automation_logs').insert({
        automation_id: ctx.automation.id,
        client_id: ctx.clientId,
        trigger_context: {
          ...ctx.triggerPayload,
          step_index: i,
          step_kind: 'send_email',
          subject,
          title,
          subtitle,
          has_image: !!imageUrl,
        },
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
        description: step.description ? renderMessage(step.description, ctx.renderCtx) : null,
        type: step.type || 'Admin',
        date,
        time: '09:00',
        status: 'pending',
        priority: step.priority || 'medium',
        link_url: step.linkUrl || null,
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

    if (step.kind === 'notify_coach') {
      // Web-push to the coach. Best-effort: a missing subscription must not
      // abort the chain.
      try {
        const title = renderMessage(step.title || (ctx.renderCtx.language === 'en' ? 'Automation' : 'Automatización'), ctx.renderCtx);
        const body = renderMessage(step.body || '', ctx.renderCtx);
        await sendPushToUser(ctx.managerId, {
          title,
          body,
          url: '/automations',
        });
        await sendManagerNotificationEmail(ctx.managerId, 'system_updates_email', {
          subject: { es: 'Nueva alerta de automatización', en: 'New automation alert' },
          title: { es: title, en: title },
          body: {
            es: body || 'Tienes una nueva alerta en automatizaciones.',
            en: body || 'You have a new alert in automations.',
          },
          ctaLabel: { es: 'Abrir automatizaciones', en: 'Open automations' },
          ctaUrl: '/automations',
        });
      } catch (e: any) {
        console.error(`[automation ${ctx.automation.id}] notify_coach step ${i} failed:`, e?.message);
      }
      continue;
    }

    if (step.kind === 'create_event') {
      const offset = Number(step.offsetDays) || 0;
      const date = new Date(Date.now() + offset * 86400 * 1000).toISOString().slice(0, 10);
      const { error } = await supabaseAdmin.from('tasks').insert({
        manager_id: ctx.managerId,
        client_id: ctx.clientId,
        title: renderMessage(step.title, ctx.renderCtx),
        description: step.description ? renderMessage(step.description, ctx.renderCtx) : null,
        type: step.eventType || 'Call',
        date,
        time: step.time || '09:00',
        status: 'pending',
        priority: 'medium',
        link_url: step.linkUrl || null,
      });
      if (error) console.error(`[automation ${ctx.automation.id}] create_event step ${i} failed:`, error);
      continue;
    }

    if (step.kind === 'assign_checkin') {
      // Verify the template belongs to this manager before assigning.
      if (step.templateId) {
        const { data: tpl } = await supabaseAdmin
          .from('checkin_templates')
          .select('id, manager_id')
          .eq('id', step.templateId)
          .maybeSingle();
        if (tpl && tpl.manager_id === ctx.managerId) {
          await supabaseAdmin.from('client_checkin_assignments')
            .update({ is_active: false })
            .eq('client_id', ctx.clientId)
            .eq('is_active', true);
          const { error } = await supabaseAdmin.from('client_checkin_assignments').insert({
            client_id: ctx.clientId,
            template_id: step.templateId,
            is_active: true,
            assigned_at: new Date().toISOString(),
          });
          if (error) console.error(`[automation ${ctx.automation.id}] assign_checkin step ${i} failed:`, error);
        } else {
          console.error(`[automation ${ctx.automation.id}] assign_checkin step ${i}: template not owned`);
        }
      }
      continue;
    }

    if (step.kind === 'assign_onboarding') {
      // Verify the onboarding template is the manager's (or a global one).
      if (step.templateId) {
        const { data: tpl } = await supabaseAdmin
          .from('onboarding_templates')
          .select('id, manager_id')
          .eq('id', step.templateId)
          .maybeSingle();
        if (tpl && (!tpl.manager_id || tpl.manager_id === ctx.managerId)) {
          await supabaseAdmin.from('profiles').upsert({ user_id: ctx.clientId }, { onConflict: 'user_id' });
          await supabaseAdmin.from('client_onboarding_assignments')
            .update({ is_active: false })
            .eq('client_id', ctx.clientId)
            .eq('is_active', true);
          const { error } = await supabaseAdmin.from('client_onboarding_assignments').insert({
            client_id: ctx.clientId,
            template_id: step.templateId,
            is_active: true,
            assigned_at: new Date().toISOString(),
          });
          if (error) console.error(`[automation ${ctx.automation.id}] assign_onboarding step ${i} failed:`, error);
        } else {
          console.error(`[automation ${ctx.automation.id}] assign_onboarding step ${i}: template not owned`);
        }
      }
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

      if (triggerId === 'weight-dropped' || triggerId === 'weight-gained') {
        const delta = Math.abs(Number(data?.delta ?? data?.weightDelta));
        const thresholdKg = Math.max(0, triggerNumberParam(automation, 'kg') || 2);
        if (Number.isFinite(delta) && delta < thresholdKg) continue;
      }

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
        .select('full_name, language')
        .eq('user_id', managerId)
        .maybeSingle();
      const _cachedLanguage = _managerProfile?.language === 'en' ? 'en' : 'es';
      const _cachedCoachName = _managerProfile?.full_name || (_cachedLanguage === 'en' ? 'your coach' : 'tu coach');

      for (const clientId of clientIds) {
        // 3. Fetch comprehensive client data for conditions and variables
        const { data: client, error: clientError } = await supabaseAdmin
          .from('users')
          .select(`
            id, email, status, created_at,
            profiles(full_name),
            clients_profiles(goal_weight, check_in_day, last_login, weight, notes, metadata)
          `)
          .eq('id', clientId)
          .maybeSingle();

        if (clientError || !client) continue;

        const [{ data: legacyCheckins }, { data: dynamicCheckins }] = await Promise.all([
          supabaseAdmin
            .from('check_ins')
            .select('data_json, date, created_at, reviewed_at')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(2),
          supabaseAdmin
            .from('client_checkin_submissions')
            .select('answers_json, submitted_at, reviewed_at')
            .eq('client_id', clientId)
            .order('submitted_at', { ascending: false })
            .limit(2),
        ]);
        const checkins = normalizeCheckinRows(legacyCheckins || [], dynamicCheckins || []);
        const latestCheckIn = checkins[0] || null;
        const prevCheckIn = checkins[1] || null;

        const ciData: any = latestCheckIn?.data || {};
        const prevData: any = prevCheckIn?.data || {};

        const profile = Array.isArray(client.profiles) ? client.profiles[0] : (client.profiles as any);
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : (client.clients_profiles as any);

        const currentWeight = readWeight(ciData) ?? (Number(cProfile?.weight) || 0);
        const prevWeight    = readWeight(prevData) ?? currentWeight;
        const weightDiff    = Math.abs(currentWeight - prevWeight);
        const goalWeight    = Number(cProfile?.goal_weight) || 0;
        const goalWeightDiff = goalWeight ? Math.abs(currentWeight - goalWeight) : 0;

        const lastLogin = cProfile?.last_login ? new Date(cProfile.last_login) : new Date();
        const daysInactive = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 3600 * 24));
        const daysSinceLogin = daysInactive;

        const lastCheckinRaw = latestCheckIn?.at || null;
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
        const weekAgo = new Date(Date.now() - 7 * DAY_MS).toISOString();
        const [
          { data: latestAnyMessage },
          { count: unreadCount },
          { data: latestCoachMessage },
          planActive,
          workouts,
          sendsThisWeek,
        ] = await Promise.all([
          supabaseAdmin
            .from('messages')
            .select('created_at')
            .or(`and(sender_id.eq.${managerId},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${managerId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('sender_id', clientId)
            .eq('receiver_id', managerId)
            .or('is_read.eq.false,is_read.is.null'),
          supabaseAdmin
            .from('messages')
            .select('created_at')
            .eq('sender_id', managerId)
            .eq('receiver_id', clientId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          hasAnyActivePlan(clientId),
          recentWorkoutStats(clientId),
          countAutomationLogsSince(automation.id, clientId, weekAgo),
        ]);
        const hoursSinceLastMsg = latestAnyMessage?.created_at
          ? (Date.now() - new Date(latestAnyMessage.created_at).getTime()) / HOUR_MS
          : 999;
        const hoursSinceCoachReply = latestCoachMessage?.created_at
          ? (Date.now() - new Date(latestCoachMessage.created_at).getTime()) / HOUR_MS
          : 999;
        const metadata = cProfile?.metadata || {};
        const tags = Array.isArray(metadata?.tags) ? metadata.tags.map((x: any) => String(x).toLowerCase()) : [];
        const notes = String(cProfile?.notes || '').toLowerCase();

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
          streak_workouts: workouts.totalWorkouts,
          unread_messages_count: unreadCount || 0,
          has_active_plan: planActive ? 'true' : 'false',
          // Stop conditions (event-based + anti-spam)
          reply: (triggerId === 'client-reply') ? 0 : 999, // 'within' compara: 0 = "ahora", 999 = "hace mucho"
          checkin: (triggerId === 'checkin-submitted') ? 0 : daysSinceCheckin,
          weight_goal_reached: goalWeight && currentWeight <= goalWeight ? 'true' : 'false',
          client_archived: ((client as any).status === 'Archived' || (client as any).status === 'archived') ? 'true' : 'false',
          coach_replied: hoursSinceCoachReply,
          last_message_recent: hoursSinceLastMsg,
          max_sends_per_week: sendsThisWeek,
          workflow_paused: 'false', // si llegamos aqui es porque enabled=true
          on_vacation: (tags.includes('vacaciones') || tags.includes('pausa') || notes.includes('vacaciones')) ? 'true' : 'false',
          plan_completed: metadata?.plan_completed === true ? 'true' : 'false',
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
          language: _cachedLanguage,
          // El trigger subscription-renewal-soon inyecta el link de pago en el
          // payload para que `{Payment Link}` se resuelva en el recordatorio.
          paymentUrl: (data as any)?.paymentUrl ?? null,
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
    let language: 'es' | 'en' = 'es';
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('language')
        .eq('user_id', managerId)
        .maybeSingle();
      language = profile?.language === 'en' ? 'en' : 'es';
    } catch {
      language = 'es';
    }
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
      const defaults = getDefaultAutomations(language, managerId);

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

    const previewable = (data || []).map((automation: any) => {
      const steps = Array.isArray(automation?.delivery_rules?.steps) ? automation.delivery_rules.steps : [];
      const firstStepMessage = steps.find((step: any) => step?.kind === 'message')?.message || '';
      const baseMessage = firstStepMessage || automation?.message || '';
      return {
        ...automation,
        message_preview: getLocalizedAutomationPreview(automation?.trigger_id || '', baseMessage, language),
      };
    });

    res.json(buildPage(previewable, page.limit, 'created_at'));
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
    let language: 'es' | 'en' = 'es';
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('language')
        .eq('user_id', req.user.id)
        .maybeSingle();
      language = profile?.language === 'en' ? 'en' : 'es';
    } catch {
      language = 'es';
    }
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
      // Ready-made flow per trigger. The builder pre-fills message + steps +
      // stop conditions + delivery from here so picking a trigger gives a
      // working automation, not a blank form.
      templates: localizeFlowTemplates(language),
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
  const VALID_KINDS = ['message', 'wait', 'create_task', 'set_field', 'stop_if', 'notify_coach', 'send_email', 'create_event', 'assign_checkin', 'assign_onboarding'];
  const cleaned: AutomationStep[] = [];
  for (const s of steps) {
    if (!s || typeof s !== 'object' || !VALID_KINDS.includes(s.kind)) continue;
    if (s.kind === 'send_email') {
      const hasContent = Boolean(String(s.subject || '').trim() || String(s.title || '').trim() || String(s.body || '').trim() || String(s.subtitle || '').trim());
      if (!hasContent) return { ok: false, error: 'El email necesita al menos asunto, título o contenido.' };
    }
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
    const language = await resolveManagerLanguage(req.user.id);
    res.json(addAutomationPreview(data, language));
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
    const language = await resolveManagerLanguage(req.user.id);
    res.json(addAutomationPreview(data, language));
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
      .in('trigger_id', ['weekly-checkin', 'birthday', 'inactivity', 'checkin-overdue', 'app-setup',
        'adherence-high', 'adherence-low', 'anniversary', 'onboarding-stalled', 'checkin-pending-review',
        'subscription-renewal-soon', 'consecutive-checkins-missed', 'client-message-stale',
        'weight-plateau', 'workout-streak-broken', 'workout-streak-milestone',
        'plan-update-due', 'no-appointment']);
    
    if (!automations) return res.json({ processed: 0 });

    for (const automation of automations) {
      const { data: clients } = await supabaseAdmin
        .from('users')
        .select(`
          id,
          email,
          status,
          created_at,
          profiles (full_name, birthday),
          clients_profiles (last_login, check_in_day, height, weight, goal, goal_weight)
        `)
        .eq('manager_id', automation.manager_id)
        .eq('role', 'CLIENT');
      
      if (!clients) continue;

      for (const client of clients) {
        const clientProfile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles;
        const cProfile = Array.isArray(client.clients_profiles) ? client.clients_profiles[0] : client.clients_profiles;
        let shouldTrigger = false;
        // Datos extra que algunos triggers inyectan en el payload (e.g. el
        // link de pago para subscription-renewal-soon → `{Payment Link}`).
        const triggerExtra: Record<string, any> = {};

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
            const start = new Date(yesterday);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start.getTime() + 2 * DAY_MS);
            const checkInCount = await countCheckinsInRange(client.id, start.toISOString(), end.toISOString());

            if (checkInCount === 0) {
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
          const inactiveAfterDays = Math.max(1, triggerNumberParam(automation, 'days') || 3);
          const lastActivity = cProfile?.last_login;
          if (lastActivity) {
            const lastDate = new Date(lastActivity);
            const diffDays = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
            if (diffDays >= inactiveAfterDays) {
              const { data: lastSent } = await supabaseAdmin
                .from('automation_logs')
                .select('sent_at')
                .eq('automation_id', automation.id)
                .eq('client_id', client.id)
                .order('sent_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / (1000 * 3600 * 24) >= inactiveAfterDays) {
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
        else if (automation.trigger_id === 'adherence-high' || automation.trigger_id === 'adherence-low') {
          // Adherence from the latest check-in (nutrition_adherence_score is 0-10
          // → x10 for a %). High fires ≥90%, low fires <70%.
          const [{ data: legacy }, { data: dynamic }] = await Promise.all([
            supabaseAdmin.from('check_ins').select('data_json, created_at')
              .eq('client_id', client.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabaseAdmin.from('client_checkin_submissions').select('answers_json, submitted_at')
              .eq('client_id', client.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
          ]);
          const latest = normalizeCheckinRows(legacy ? [legacy] : [], dynamic ? [dynamic] : [])[0];
          const adh = latest ? Number((latest.data as any)?.nutrition_adherence_score
            ?? (latest.data as any)?.adherence_score) : NaN;
          if (Number.isFinite(adh)) {
            const pct = adh * 10;
            const threshold = Math.max(0, triggerNumberParam(automation, 'pct') || (automation.trigger_id === 'adherence-high' ? 90 : 70));
            const hit = automation.trigger_id === 'adherence-high' ? pct >= threshold : pct < threshold;
            if (hit) {
              const { data: lastSent } = await supabaseAdmin
                .from('automation_logs').select('sent_at')
                .eq('automation_id', automation.id).eq('client_id', client.id)
                .order('sent_at', { ascending: false }).limit(1).maybeSingle();
              if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / 86400000 >= 6) {
                shouldTrigger = true;
              }
            }
          }
        }
        else if (automation.trigger_id === 'anniversary') {
          // Fires on the monthly anniversary of the signup day (day-of-month
          // match, at least one full month elapsed). Deduped ~monthly.
          const joined = new Date(client.created_at);
          const monthsElapsed = (today.getUTCFullYear() - joined.getUTCFullYear()) * 12
            + (today.getUTCMonth() - joined.getUTCMonth());
          if (monthsElapsed >= 1 && today.getUTCDate() === joined.getUTCDate()) {
            const { data: lastSent } = await supabaseAdmin
              .from('automation_logs').select('sent_at')
              .eq('automation_id', automation.id).eq('client_id', client.id)
              .order('sent_at', { ascending: false }).limit(1).maybeSingle();
            if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / 86400000 >= 25) {
              shouldTrigger = true;
            }
          }
        }
        else if (automation.trigger_id === 'onboarding-stalled') {
          // Active onboarding assignment older than 48 h with no submission.
          const stalledHours = Math.max(1, triggerNumberParam(automation, 'hours') || 48);
          const { data: assign } = await supabaseAdmin
            .from('client_onboarding_assignments').select('assigned_at')
            .eq('client_id', client.id).eq('is_active', true)
            .order('assigned_at', { ascending: false }).limit(1).maybeSingle();
          if (assign?.assigned_at
              && (today.getTime() - new Date(assign.assigned_at).getTime()) / 3600000 >= stalledHours) {
            const { count: subs } = await supabaseAdmin
              .from('client_onboarding_submissions').select('id', { count: 'exact', head: true })
              .eq('client_id', client.id);
            if ((subs ?? 0) === 0) {
              const { data: lastSent } = await supabaseAdmin
                .from('automation_logs').select('sent_at')
                .eq('automation_id', automation.id).eq('client_id', client.id)
                .order('sent_at', { ascending: false }).limit(1).maybeSingle();
              if (!lastSent) shouldTrigger = true;
            }
          }
        }
        else if (automation.trigger_id === 'checkin-pending-review') {
          // The coach has an unreviewed check-in older than 24 h.
          const pendingHours = Math.max(1, triggerNumberParam(automation, 'hours') || 24);
          const cutoff = new Date(today.getTime() - pendingHours * HOUR_MS).toISOString();
          const [{ data: legacyPending }, { data: dynamicPending }] = await Promise.all([
            supabaseAdmin
              .from('check_ins').select('id, created_at')
              .eq('client_id', client.id).is('reviewed_at', null)
              .lte('created_at', cutoff)
              .order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabaseAdmin
              .from('client_checkin_submissions').select('id, submitted_at')
              .eq('client_id', client.id).is('reviewed_at', null)
              .lte('submitted_at', cutoff)
              .order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
          ]);
          const pending = legacyPending || dynamicPending;
          if (pending) {
            const { data: lastSent } = await supabaseAdmin
              .from('automation_logs').select('sent_at')
              .eq('automation_id', automation.id).eq('client_id', client.id)
              .order('sent_at', { ascending: false }).limit(1).maybeSingle();
            if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / 86400000 >= 1) {
              shouldTrigger = true;
            }
          }
        }

        else if (automation.trigger_id === 'consecutive-checkins-missed') {
          const targetMisses = Math.max(1, triggerNumberParam(automation, 'count') || 2);
          const dayName = String(cProfile?.check_in_day || '').toLowerCase();
          const dayIdx = WEEKDAYS.indexOf(dayName);
          if (dayIdx >= 0) {
            let missed = 0;
            for (let i = 0; i < targetMisses; i++) {
              const diff = (today.getDay() - dayIdx + 7) % 7;
              const scheduled = new Date(today);
              scheduled.setDate(today.getDate() - diff - (i * 7));
              scheduled.setHours(0, 0, 0, 0);
              const windowEnd = new Date(scheduled.getTime() + 7 * DAY_MS);
              if (today.getTime() - scheduled.getTime() < DAY_MS) break;
              const count = await countCheckinsInRange(client.id, scheduled.toISOString(), windowEnd.toISOString());
              if (count > 0) break;
              missed++;
            }
            if (missed >= targetMisses && !(await hasSentWithin(automation.id, client.id, 6 * DAY_MS))) {
              shouldTrigger = true;
            }
          }
        }

        else if (automation.trigger_id === 'client-message-stale') {
          const hours = Math.max(1, triggerNumberParam(automation, 'hours') || 2);
          const cutoff = new Date(today.getTime() - hours * HOUR_MS).toISOString();
          const { data: lastClientMsg } = await supabaseAdmin
            .from('messages')
            .select('id, created_at')
            .eq('sender_id', client.id)
            .eq('receiver_id', automation.manager_id)
            .lte('created_at', cutoff)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (lastClientMsg?.created_at) {
            const { count: replies } = await supabaseAdmin
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('sender_id', automation.manager_id)
              .eq('receiver_id', client.id)
              .gte('created_at', lastClientMsg.created_at);
            if ((replies || 0) === 0 && !(await hasSentWithin(automation.id, client.id, DAY_MS))) {
              shouldTrigger = true;
            }
          }
        }

        else if (automation.trigger_id === 'weight-plateau') {
          const weeks = Math.max(1, triggerNumberParam(automation, 'weeks') || 3);
          const since = new Date(today.getTime() - weeks * 7 * DAY_MS).toISOString();
          const [{ data: legacy }, { data: dynamic }] = await Promise.all([
            supabaseAdmin.from('check_ins').select('data_json, created_at, date')
              .eq('client_id', client.id).gte('created_at', since).order('created_at', { ascending: true }),
            supabaseAdmin.from('client_checkin_submissions').select('answers_json, submitted_at')
              .eq('client_id', client.id).gte('submitted_at', since).order('submitted_at', { ascending: true }),
          ]);
          const rows = normalizeCheckinRows(legacy || [], dynamic || []).reverse();
          const weights = rows.map(row => readWeight(row.data)).filter((n): n is number => n != null);
          if (weights.length >= 2) {
            const delta = Math.abs(weights[weights.length - 1] - weights[0]);
            if (delta <= 0.5 && !(await hasSentWithin(automation.id, client.id, 7 * DAY_MS))) {
              shouldTrigger = true;
            }
          }
        }

        else if (automation.trigger_id === 'workout-streak-broken') {
          const days = Math.max(1, triggerNumberParam(automation, 'days') || 5);
          const stats = await recentWorkoutStats(client.id, today);
          if (stats.daysSinceLastWorkout >= days && !(await hasSentWithin(automation.id, client.id, days * DAY_MS))) {
            shouldTrigger = true;
          }
        }

        else if (automation.trigger_id === 'workout-streak-milestone') {
          const targetCount = Math.max(1, triggerNumberParam(automation, 'count') || 10);
          const stats = await recentWorkoutStats(client.id, today);
          if (stats.totalWorkouts >= targetCount && !(await lastAutomationSentAt(automation.id, client.id))) {
            shouldTrigger = true;
          }
        }

        else if (automation.trigger_id === 'plan-update-due') {
          const weeks = Math.max(1, triggerNumberParam(automation, 'weeks') || 4);
          const latestPlan = await latestPlanUpdatedAt(client.id);
          if (latestPlan && today.getTime() - new Date(latestPlan).getTime() >= weeks * 7 * DAY_MS
              && !(await hasSentWithin(automation.id, client.id, 7 * DAY_MS))) {
            shouldTrigger = true;
          }
        }

        else if (automation.trigger_id === 'no-appointment') {
          const todayIso = today.toISOString().slice(0, 10);
          const hasFuture = await hasFutureAppointment(automation.manager_id, client.id, todayIso);
          if (!hasFuture && !(await hasSentWithin(automation.id, client.id, 7 * DAY_MS))) {
            shouldTrigger = true;
          }
        }

        else if (automation.trigger_id === 'subscription-renewal-soon') {
          // El cliente tiene un cobro recurrente activo cuyo periodo termina
          // dentro de N días (3 por defecto). Inyectamos el link de pago en
          // el payload para que `{Payment Link}` lo resuelva en el mensaje.
          const horizonDays = Math.max(1, triggerNumberParam(automation, 'days') || 7);
          const horizon = new Date(today.getTime() + horizonDays * 86400000).toISOString();
          const { data: billing } = await supabaseAdmin
            .from('client_billing')
            .select('payment_url, current_period_end, status')
            .eq('client_id', client.id)
            .eq('manager_id', automation.manager_id)
            .in('status', ['active', 'trialing', 'past_due'])
            .not('current_period_end', 'is', null)
            .lte('current_period_end', horizon)
            .order('current_period_end', { ascending: true })
            .limit(1)
            .maybeSingle();
          if (billing?.current_period_end) {
            const { data: lastSent } = await supabaseAdmin
              .from('automation_logs').select('sent_at')
              .eq('automation_id', automation.id).eq('client_id', client.id)
              .order('sent_at', { ascending: false }).limit(1).maybeSingle();
            // Dedupe: no repetir el aviso de renovación más de una vez cada 5 días.
            if (!lastSent || (today.getTime() - new Date(lastSent.sent_at).getTime()) / 86400000 >= 5) {
              shouldTrigger = true;
              if (billing.payment_url) triggerExtra.paymentUrl = billing.payment_url;
            }
          }
        }

        if (shouldTrigger) {
          await processTrigger(automation.manager_id, automation.trigger_id, { clientId: client.id, ...triggerExtra });
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

    // Sincroniza cobros pendientes contra Stripe y notifica al coach de los
    // pagos nuevos (no hay webhook por-coach; este barrido diario lo cubre).
    let billingPaid = 0;
    try {
      const { runBillingSyncSweep } = await import('./client-billing.js');
      const sweep = await runBillingSyncSweep();
      billingPaid = sweep.paid;
      if (sweep.checked) logger.info('billing.sweep.completed', sweep);
    } catch (e: any) {
      logger.error('billing.sweep.failed', { err: e?.message });
    }

    logger.info('automations.cron.completed', { workflows: { resumed, scheduled }, trialsExpired, stepsResumed, billingPaid });
    res.json({ success: true, workflows: { resumed, scheduled }, trialsExpired, stepsResumed, billingPaid });
  } catch (error: any) {
    logger.error('automations.cron.failed', { err: error?.message });
    res.status(500).json({ error: safeErr(error) });
  }
};

router.post('/cron', cronHandler);
router.get('/cron', cronHandler);

export default router;

