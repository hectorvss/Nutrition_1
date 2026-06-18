import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';
import { safeErr } from '../lib/http.js';
import { makeEnforceLimit, countActiveAutomations } from '../lib/plans.js';
import { sendPushToUser } from '../lib/push.js';
import { sendClientTransactionalEmail } from '../lib/email.js';
import { renderMessage, type RenderContext } from '../lib/messageTemplate.js';

const router = Router();

// Block workflow activation once the manager reaches their tier's automation
// cap. Cupo unico `activeAutomations`: cuenta automations simples + workflows
// avanzados juntos — para el usuario todo son "automatizaciones".
const enforceWorkflowLimit = makeEnforceLimit(supabaseAdmin, 'activeAutomations',
  (userId: string) => countActiveAutomations(supabaseAdmin, userId));

/* ============================================================
 * Advanced Workflow builder — backend
 * Manager-scoped visual automations. A workflow is a graph of
 * nodes + edges with one trigger; a pausable BFS executor walks it.
 *
 * Reliability features:
 *  - durable delays: a Wait node parks the run (status 'waiting')
 *    with serialized state; the cron resumes it when due
 *  - idempotency: dedupe_key prevents the same event running twice
 *  - retries: action side-effects retry on transient failures
 *  - every node logs a workflow_run_steps row
 * ============================================================ */

// ---- Types -------------------------------------------------
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'data' | 'flow';
  key: string;
  label?: string;
  position?: { x: number; y: number };
  config?: Record<string, any>;
  disabled?: boolean;
}
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}
interface QueueItem { nodeId: string; handle?: string | null }
interface RunState { queue: QueueItem[]; visited: string[]; context: any }

// ---- Node catalog (adapted to the fitness-coaching domain) -
export const WORKFLOW_CATALOG = [
  { type: 'trigger', key: 'trigger.manual', label: 'Manual run', category: 'Triggers',
    icon: 'Play', description: 'Start the workflow manually.', configFields: [] },
  { type: 'trigger', key: 'trigger.new_client', label: 'New client added', category: 'Triggers',
    icon: 'UserPlus', description: 'Fires when a new client is created.', configFields: [] },
  { type: 'trigger', key: 'trigger.checkin_submitted', label: 'Check-in submitted', category: 'Triggers',
    icon: 'ClipboardCheck', description: 'Fires when a client submits a check-in.', configFields: [] },
  { type: 'trigger', key: 'trigger.message_received', label: 'Client replies', category: 'Triggers',
    icon: 'MessageCircle', description: 'Fires when a client sends a message.', configFields: [] },
  { type: 'trigger', key: 'trigger.schedule', label: 'On a schedule', category: 'Triggers',
    icon: 'Clock', description: 'Runs from the daily cron, once per client.',
    configFields: [{ name: 'everyDays', label: 'Every (days)', type: 'number' }] },

  { type: 'condition', key: 'flow.if', label: 'If / Else', category: 'Logic',
    icon: 'GitBranch', description: 'Branch on a condition.', branches: ['true', 'false'],
    configFields: [
      { name: 'field', label: 'Field (e.g. client.weight)', type: 'text' },
      { name: 'operator', label: 'Operator', type: 'select',
        options: ['>', '<', '>=', '<=', '==', '!=', 'contains'] },
      { name: 'value', label: 'Value', type: 'text' },
    ] },
  { type: 'condition', key: 'flow.switch', label: 'Switch', category: 'Logic',
    icon: 'Shuffle', description: 'Route by a field value.',
    configFields: [
      { name: 'field', label: 'Field', type: 'text' },
      { name: 'branches', label: 'Branches (comma separated)', type: 'text' },
    ] },
  { type: 'flow', key: 'flow.delay', label: 'Wait', category: 'Logic',
    icon: 'Timer', description: 'Pause the workflow, then continue later.',
    configFields: [
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'unit', label: 'Unit', type: 'select', options: ['hours', 'days'] },
    ] },
  { type: 'flow', key: 'flow.stop', label: 'Stop', category: 'Logic',
    icon: 'Square', description: 'End the workflow.', configFields: [] },

  { type: 'data', key: 'data.set_fields', label: 'Set fields', category: 'Data',
    icon: 'Pencil', description: 'Write values into the workflow context.',
    configFields: [{ name: 'fields', label: 'Fields (JSON object)', type: 'json' }] },

  { type: 'action', key: 'action.send_message', label: 'Send message', category: 'Actions',
    icon: 'Send', description: 'Send a message to the client.',
    configFields: [{ name: 'message', label: 'Message', type: 'textarea' }] },
  { type: 'action', key: 'action.send_email', label: 'Send email', category: 'Actions',
    icon: 'Mail', description: 'Send a fully custom email to the client.',
    configFields: [
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'body', label: 'Body', type: 'textarea' },
      { name: 'imageUrl', label: 'Image URL', type: 'text' },
      { name: 'imageAlt', label: 'Image alt', type: 'text' },
      { name: 'ctaLabel', label: 'CTA label', type: 'text' },
      { name: 'ctaUrl', label: 'CTA URL', type: 'text' },
      { name: 'note', label: 'Footer note', type: 'text' },
    ] },
  { type: 'action', key: 'action.create_task', label: 'Create task', category: 'Actions',
    icon: 'ListTodo', description: 'Create a task for the manager.',
    configFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'type', label: 'Type', type: 'select',
        options: ['Admin', 'Check-in', 'Call', 'Training', 'Nutrition', 'Video Call', 'In-Person'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
    ] },

  // ── New triggers ─────────────────────────────────────────────
  { type: 'trigger', key: 'trigger.weight_change', label: 'Weight change', category: 'Triggers',
    icon: 'Scale', description: 'Fires when a check-in records a weight change above the threshold (kg).',
    configFields: [
      { name: 'direction', label: 'Direction', type: 'select', options: ['any', 'gain', 'loss'] },
      { name: 'minKg', label: 'Min change (kg)', type: 'number' },
    ] },
  { type: 'trigger', key: 'trigger.plan_assigned', label: 'Plan assigned', category: 'Triggers',
    icon: 'FileCheck', description: 'Fires when a nutrition or training plan is assigned to a client.', configFields: [] },
  { type: 'trigger', key: 'trigger.onboarding_completed', label: 'Onboarding completed', category: 'Triggers',
    icon: 'BadgeCheck', description: 'Fires when a client finishes their onboarding form.', configFields: [] },
  { type: 'trigger', key: 'trigger.checkin_overdue', label: 'Check-in overdue', category: 'Triggers',
    icon: 'AlarmClockOff', description: 'Daily cron — fires when a client misses their scheduled check-in day.',
    configFields: [{ name: 'graceDays', label: 'Grace period (days)', type: 'number' }] },
  { type: 'trigger', key: 'trigger.goal_reached', label: 'Goal weight reached', category: 'Triggers',
    icon: 'BadgeCheck', description: 'Fires when a check-in records the client reaching their goal weight.',
    configFields: [] },
  { type: 'trigger', key: 'trigger.workout_logged', label: 'Workout logged', category: 'Triggers',
    icon: 'Dumbbell', description: 'Fires when a client logs a workout session.', configFields: [] },
  { type: 'trigger', key: 'trigger.meal_logged', label: 'Meal logged', category: 'Triggers',
    icon: 'Utensils', description: 'Fires when a client logs a completed meal.', configFields: [] },
  { type: 'trigger', key: 'trigger.activity_highlighted', label: 'Activity highlighted', category: 'Triggers',
    icon: 'Star', description: 'Fires when the coach highlights (stars) a client activity in the progress feed.', configFields: [] },
  { type: 'trigger', key: 'trigger.client_inactive', label: 'Client inactive', category: 'Triggers',
    icon: 'AlarmClockOff', description: 'Daily cron — fires when a client has no activity for N+ days.',
    configFields: [{ name: 'days', label: 'Inactive for (days)', type: 'number' }] },
  { type: 'trigger', key: 'trigger.day_of_week', label: 'Day of week', category: 'Triggers',
    icon: 'CalendarDays', description: 'Daily cron — fires on the selected weekday for every client.',
    configFields: [
      { name: 'day', label: 'Day', type: 'select',
        options: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
    ] },

  // ── New conditions / shortcuts on flow.if ────────────────────
  { type: 'condition', key: 'flow.has_plan', label: 'Has plan assigned', category: 'Logic',
    icon: 'BadgeCheck', description: 'Branch on whether the client has a nutrition or training plan.',
    branches: ['true', 'false'],
    configFields: [{ name: 'planKind', label: 'Plan', type: 'select',
                     options: ['any', 'nutrition', 'training'] }] },
  { type: 'condition', key: 'flow.has_checkin', label: 'Has recent check-in', category: 'Logic',
    icon: 'ClipboardList', description: 'Branch on whether the client has submitted a check-in in the last N days.',
    branches: ['true', 'false'],
    configFields: [{ name: 'days', label: 'Within (days)', type: 'number' }] },
  { type: 'condition', key: 'flow.days_since', label: 'Days since…', category: 'Logic',
    icon: 'CalendarClock', description: 'Branch on how many days ago an event happened.',
    branches: ['true', 'false'],
    configFields: [
      { name: 'event', label: 'Event', type: 'select',
        options: ['last_check_in', 'last_workout', 'created_at'] },
      { name: 'operator', label: 'Operator', type: 'select', options: ['>', '<', '>=', '<=', '=='] },
      { name: 'days', label: 'Days', type: 'number' },
    ] },
  { type: 'condition', key: 'flow.has_tag', label: 'Has tag', category: 'Logic',
    icon: 'Tag', description: 'Branch on whether the client carries a given tag (set by "Tag client").',
    branches: ['true', 'false'],
    configFields: [{ name: 'tag', label: 'Tag', type: 'text' }] },

  // ── New data nodes ───────────────────────────────────────────
  { type: 'data', key: 'data.get_latest_checkin', label: 'Get latest check-in', category: 'Data',
    icon: 'Database', description: 'Hydrate ctx.latestCheckin with the client\'s most recent submission.',
    configFields: [] },
  { type: 'data', key: 'data.compute_bmi', label: 'Compute BMI', category: 'Data',
    icon: 'Calculator', description: 'Compute BMI from client.weight and client.height into ctx.data.bmi.',
    configFields: [] },

  // ── New actions ──────────────────────────────────────────────
  { type: 'action', key: 'action.schedule_appointment', label: 'Schedule appointment', category: 'Actions',
    icon: 'CalendarPlus', description: 'Create an appointment task for the client.',
    configFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'type', label: 'Type', type: 'select',
        options: ['Video Call', 'In-Person', 'Training', 'Nutrition', 'Internal'] },
      { name: 'date', label: 'Date (YYYY-MM-DD or `today+Nd`)', type: 'text' },
      { name: 'time', label: 'Time (HH:MM)', type: 'text' },
      { name: 'duration', label: 'Duration (e.g. 30m, 1h)', type: 'text' },
    ] },
  { type: 'action', key: 'action.assign_plan', label: 'Assign plan template', category: 'Actions',
    icon: 'ClipboardPlus', description: 'Assign a nutrition or training template to the client.',
    configFields: [
      { name: 'template', label: 'Plan template', type: 'select', source: 'plan_templates' },
    ] },
  { type: 'action', key: 'action.assign_onboarding', label: 'Assign onboarding', category: 'Actions',
    icon: 'UserCog', description: 'Assign an onboarding template to the client.',
    configFields: [
      { name: 'template', label: 'Onboarding template', type: 'select', source: 'onboarding_templates' },
    ] },
  { type: 'action', key: 'action.request_checkin', label: 'Request check-in', category: 'Actions',
    icon: 'ClipboardCheck', description: 'Assign a check-in template the client must fill in.',
    configFields: [
      { name: 'template', label: 'Check-in template', type: 'select', source: 'checkin_templates' },
    ] },
  { type: 'action', key: 'action.set_client_field', label: 'Set client field', category: 'Actions',
    icon: 'PenSquare', description: 'Update a field on the client profile (notes, goal, etc.).',
    configFields: [
      { name: 'field', label: 'Field', type: 'select', options: ['notes', 'goal', 'weight', 'height'] },
      { name: 'value', label: 'Value', type: 'text' },
    ] },
  { type: 'action', key: 'action.set_client_status', label: 'Set client status', category: 'Actions',
    icon: 'UserCog', description: 'Change the client lifecycle status (active / paused / archived).',
    configFields: [
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Paused', 'Archived'] },
    ] },
  { type: 'action', key: 'action.notify_coach', label: 'Notify coach', category: 'Actions',
    icon: 'BellRing', description: 'Create an internal task for the manager (no client attached).',
    configFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ] },

  // ── TK-28: additional triggers ────────────────────────────────
  { type: 'trigger', key: 'trigger.birthday', label: 'Client birthday', category: 'Triggers',
    icon: 'Cake', description: 'Daily cron — fires each year on the client\'s birthday.', configFields: [] },

  // ── TK-28: additional data nodes ─────────────────────────────
  { type: 'data', key: 'data.get_client_field', label: 'Get client field', category: 'Data',
    icon: 'UserSearch', description: 'Copy a client profile field into ctx.data.',
    configFields: [
      { name: 'field', label: 'Field', type: 'select',
        options: ['weight', 'goal_weight', 'height', 'goal', 'notes', 'tags'] },
      { name: 'as', label: 'Store as (ctx.data key)', type: 'text' },
    ] },
  { type: 'data', key: 'data.get_plan_field', label: 'Get plan field', category: 'Data',
    icon: 'FileSearch', description: 'Read a field from the client\'s latest nutrition or training plan.',
    configFields: [
      { name: 'planKind', label: 'Plan', type: 'select', options: ['nutrition', 'training'] },
      { name: 'field', label: 'Field', type: 'select', options: ['name', 'target_calories', 'status'] },
      { name: 'as', label: 'Store as (ctx.data key)', type: 'text' },
    ] },

  // ── TK-28: additional actions ─────────────────────────────────
  { type: 'action', key: 'action.send_push', label: 'Send push notification', category: 'Actions',
    icon: 'Bell', description: 'Send a web-push notification to the client (requires VAPID keys configured).',
    configFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'body', label: 'Body', type: 'textarea' },
      { name: 'url', label: 'URL (optional)', type: 'text' },
    ] },
  { type: 'action', key: 'action.tag_client', label: 'Tag client', category: 'Actions',
    icon: 'Tag', description: 'Add or remove a tag on the client profile (stored in metadata.tags).',
    configFields: [
      { name: 'tag', label: 'Tag', type: 'text' },
      { name: 'action', label: 'Action', type: 'select', options: ['add', 'remove'] },
    ] },

  // ── A/B split — pure-logic branch, no backend dependency ──────
  { type: 'condition', key: 'flow.random_split', label: 'A/B split', category: 'Logic',
    icon: 'Shuffle', description: 'Randomly route each run down branch A or B (for A/B testing).',
    branches: ['A', 'B'],
    configFields: [
      { name: 'weightA', label: 'Weight A (%)', type: 'number' },
    ] },

  // ── Suscripciones (Stripe): triggers de facturación ──────────
  { type: 'trigger', key: 'trigger.payment_succeeded', label: 'Payment succeeded', category: 'Triggers',
    icon: 'DollarSign', description: 'Fires when a client pays a subscription invoice or one-time charge.', configFields: [] },
  { type: 'trigger', key: 'trigger.payment_failed', label: 'Payment failed', category: 'Triggers',
    icon: 'XCircle', description: 'Fires when a client\'s payment fails (past due).', configFields: [] },
  { type: 'trigger', key: 'trigger.subscription_started', label: 'Subscription started', category: 'Triggers',
    icon: 'CreditCard', description: 'Fires when a client\'s subscription becomes active.', configFields: [] },
  { type: 'trigger', key: 'trigger.subscription_canceled', label: 'Subscription canceled', category: 'Triggers',
    icon: 'XCircle', description: 'Fires when a client\'s subscription is canceled.', configFields: [] },
  { type: 'trigger', key: 'trigger.renewal_upcoming', label: 'Renewal upcoming', category: 'Triggers',
    icon: 'CalendarClock', description: 'Daily cron — fires N days before a subscription renews.',
    configFields: [{ name: 'daysBefore', label: 'Days before renewal', type: 'number' }] },

  // ── Suscripciones (Stripe): acciones de facturación ──────────
  { type: 'action', key: 'action.assign_billing_plan', label: 'Assign subscription plan', category: 'Actions',
    icon: 'CreditCard', description: 'Assign a billing plan to the client and send the payment link.',
    configFields: [
      { name: 'plan', label: 'Billing plan', type: 'select', source: 'billing_plans' },
    ] },
  { type: 'action', key: 'action.send_payment_link', label: 'Send payment link', category: 'Actions',
    icon: 'Send', description: 'Send the client\'s most recent open payment link via chat.', configFields: [] },

  // ── Suscripciones: triggers extra ────────────────────────────
  { type: 'trigger', key: 'trigger.subscription_paused', label: 'Subscription paused', category: 'Triggers',
    icon: 'XCircle', description: 'Fires when a client\'s subscription is paused.', configFields: [] },
  { type: 'trigger', key: 'trigger.subscription_resumed', label: 'Subscription resumed', category: 'Triggers',
    icon: 'CreditCard', description: 'Fires when a paused subscription is resumed.', configFields: [] },
  { type: 'trigger', key: 'trigger.trial_ending', label: 'Trial ending', category: 'Triggers',
    icon: 'CalendarClock', description: 'Daily cron — fires N days before a free trial ends.',
    configFields: [{ name: 'daysBefore', label: 'Days before trial ends', type: 'number' }] },
  { type: 'trigger', key: 'trigger.refund_issued', label: 'Refund issued', category: 'Triggers',
    icon: 'DollarSign', description: 'Fires when a refund is issued to a client.', configFields: [] },

  // ── Suscripciones: condiciones ───────────────────────────────
  { type: 'condition', key: 'flow.has_active_subscription', label: 'Has active subscription', category: 'Logic',
    icon: 'CreditCard', description: 'Branch on whether the client has an active/trialing subscription.',
    branches: ['true', 'false'], configFields: [] },
  { type: 'condition', key: 'flow.on_plan', label: 'On billing plan', category: 'Logic',
    icon: 'CreditCard', description: 'Branch on whether the client has a live assignment of a given billing plan.',
    branches: ['true', 'false'],
    configFields: [{ name: 'plan', label: 'Billing plan', type: 'select', source: 'billing_plans' }] },

  // ── Suscripciones: acciones extra ────────────────────────────
  { type: 'action', key: 'action.cancel_subscription', label: 'Cancel subscription', category: 'Actions',
    icon: 'XCircle', description: 'Cancel the client\'s active subscription (now or at period end).',
    configFields: [{ name: 'when', label: 'When', type: 'select', options: ['period_end', 'immediate'] }] },
  { type: 'action', key: 'action.pause_subscription', label: 'Pause subscription', category: 'Actions',
    icon: 'XCircle', description: 'Pause billing on the client\'s active subscription.', configFields: [] },
  { type: 'action', key: 'action.resume_subscription', label: 'Resume subscription', category: 'Actions',
    icon: 'CreditCard', description: 'Resume billing on a paused subscription.', configFields: [] },
  { type: 'action', key: 'action.create_promo_code', label: 'Create promo code', category: 'Actions',
    icon: 'DollarSign', description: 'Create a promotion code tied to a billing plan (e.g. retention offer).',
    configFields: [
      { name: 'plan', label: 'Billing plan', type: 'select', source: 'billing_plans' },
      { name: 'discountType', label: 'Discount', type: 'select', options: ['percent', 'amount'] },
      { name: 'value', label: 'Value (% or amount)', type: 'number' },
      { name: 'duration', label: 'Duration', type: 'select', options: ['once', 'repeating', 'forever'] },
      { name: 'durationInMonths', label: 'Months (if repeating)', type: 'number' },
      { name: 'code', label: 'Code (optional)', type: 'text' },
    ] },
  { type: 'action', key: 'action.create_charge', label: 'Create charge', category: 'Actions',
    icon: 'DollarSign', description: 'Create a recurring or one-time charge and send the payment link.',
    configFields: [
      { name: 'kind', label: 'Type', type: 'select', options: ['recurring', 'one_time'] },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'select', options: ['eur', 'usd', 'gbp', 'mxn'] },
      { name: 'interval', label: 'Interval (recurring)', type: 'select', options: ['month', 'year', 'week', 'day'] },
      { name: 'description', label: 'Label', type: 'text' },
    ] },
] as const;

const CATALOG_BY_KEY = new Map<string, any>(WORKFLOW_CATALOG.map(n => [n.key, n]));
const TRIGGER_KEYS = WORKFLOW_CATALOG.filter(n => n.type === 'trigger').map(n => n.key);

// ---- Plantillas de fábrica (recetas de suscripción listas para usar) ------
// El manager las activa con un clic: se crean como un workflow nuevo (borrador)
// que puede revisar/publicar. Algunos nodos (p. ej. el plan del cupón) quedan
// sin rellenar a propósito para que el coach elija el plan.
const tNode = (id: string, type: WorkflowNode['type'], key: string, x: number, y: number, config?: any): WorkflowNode =>
  ({ id, type, key, position: { x, y }, ...(config ? { config } : {}) });
const tEdge = (source: string, target: string, sourceHandle?: string): WorkflowEdge =>
  ({ id: `e-${source}-${target}${sourceHandle ? '-' + sourceHandle : ''}`, source, target, ...(sourceHandle ? { sourceHandle } : {}) });

export const WORKFLOW_STARTER_TEMPLATES = [
  {
    id: 'tpl.payment_welcome',
    name: 'Bienvenida al suscribirse',
    description: 'Cuando un cliente activa su suscripción (primer pago), le das la bienvenida y avisas al coach.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.subscription_started', 80, 160),
      tNode('n2', 'action', 'action.send_message', 360, 160, { message: '¡Bienvenido/a, {First Name}! 🎉 Tu suscripción a {Plan Name} ya está activa. Cualquier duda, escríbeme por aquí.' }),
      tNode('n3', 'action', 'action.notify_coach', 640, 160, { title: 'Nuevo pago de {Client Name}', description: '{Client Name} ha pagado {Amount} ({Plan Name}).' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3')],
  },
  {
    id: 'tpl.dunning',
    name: 'Recuperación de impagos (dunning)',
    description: 'Si un pago falla: reenvía el enlace al instante y, si sigue sin pagar, avisa al coach y etiqueta al cliente.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.payment_failed', 80, 160),
      tNode('n2', 'action', 'action.send_message', 360, 160, { message: 'Hola {First Name}, no hemos podido procesar tu pago de {Plan Name}. Puedes reintentarlo aquí: {Payment Link}' }),
      tNode('n3', 'action', 'action.send_payment_link', 640, 160),
      tNode('n4', 'flow', 'flow.delay', 920, 160, { amount: 3, unit: 'days' }),
      tNode('n5', 'action', 'action.notify_coach', 1200, 160, { title: 'Impago sin resolver: {Client Name}', description: '{Client Name} no ha regularizado su pago de {Plan Name} en 3 días.' }),
      tNode('n6', 'action', 'action.tag_client', 1200, 320, { tag: 'impago', action: 'add' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4'), tEdge('n4', 'n5'), tEdge('n4', 'n6')],
  },
  {
    id: 'tpl.dunning_autopause',
    name: 'Impago → auto-pausa',
    description: 'Si un pago falla: avisas con el enlace, esperas 5 días y, si no paga, pausas la suscripción automáticamente.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.payment_failed', 80, 160),
      tNode('n2', 'action', 'action.send_message', 360, 160, { message: 'Hola {First Name}, tu pago de {Plan Name} no se ha podido procesar. Actualiza tu método de pago aquí: {Payment Link}' }),
      tNode('n3', 'flow', 'flow.delay', 640, 160, { amount: 5, unit: 'days' }),
      tNode('n4', 'action', 'action.pause_subscription', 920, 160),
      tNode('n5', 'action', 'action.notify_coach', 1200, 160, { title: 'Suscripción pausada por impago: {Client Name}', description: '{Client Name} no regularizó {Plan Name}; se pausó automáticamente.' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4'), tEdge('n4', 'n5')],
  },
  {
    id: 'tpl.renewal_reminder',
    name: 'Recordatorio de renovación',
    description: '3 días antes de renovar, avisas al cliente con el importe y la fecha.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.renewal_upcoming', 80, 160, { daysBefore: 3 }),
      tNode('n2', 'action', 'action.send_message', 360, 160, { message: 'Hola {First Name}, tu suscripción a {Plan Name} se renueva el {Renewal Date} por {Amount}. ¡Seguimos! 💪' }),
    ],
    edges: [tEdge('n1', 'n2')],
  },
  {
    id: 'tpl.trial_conversion',
    name: 'Fin de prueba → conversión',
    description: 'Antes de que acabe la prueba gratuita, animas al cliente a continuar.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.trial_ending', 80, 160, { daysBefore: 2 }),
      tNode('n2', 'action', 'action.send_message', 360, 160, { message: 'Hola {First Name}, tu prueba de {Plan Name} termina el {Renewal Date}. Si quieres seguir, todo continuará automáticamente. ¿Te ayudo con algo antes?' }),
    ],
    edges: [tEdge('n1', 'n2')],
  },
  {
    id: 'tpl.retention',
    name: 'Retención al cancelar',
    description: 'Cuando alguien cancela, le ofreces un código de descuento para volver (elige el plan en el nodo "Crear código").',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.subscription_canceled', 80, 160),
      tNode('n2', 'action', 'action.create_promo_code', 360, 160, { discountType: 'percent', value: 20, duration: 'repeating', durationInMonths: 3, code: 'VUELVE20' }),
      tNode('n3', 'action', 'action.send_message', 640, 160, { message: 'Sentimos que te vayas, {First Name}. Si cambias de idea, tienes un 20% durante 3 meses con el código VUELVE20. ¡Aquí seguimos!' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3')],
  },
  {
    id: 'tpl.onboarding_email_pack',
    name: 'Onboarding premium por email',
    description: 'Al crear un cliente, envia un email completo con bienvenida, imagen, CTA a la app y tarea interna para preparar el plan.',
    category: 'Onboarding',
    nodes: [
      tNode('n1', 'trigger', 'trigger.new_client', 80, 160),
      tNode('n2', 'action', 'action.send_email', 360, 160, {
        subject: 'Bienvenido/a a tu nuevo plan, {First Name}',
        title: 'Tu proceso empieza hoy',
        subtitle: 'Todo lo que necesitas esta centralizado en tu app.',
        body: 'Hola {First Name}, soy {Coach Name}. Ya tienes acceso a tu espacio personal. Durante estos primeros dias revisaremos tu punto de partida, tus objetivos y los ajustes que necesitas para avanzar con seguridad.',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Persona entrenando con acompanamiento profesional',
        ctaLabel: 'Entrar a mi app',
        ctaUrl: '{App URL}',
        note: 'Si tienes cualquier duda, responde a este email o escribeme por el chat.',
      }),
      tNode('n3', 'action', 'action.assign_onboarding', 640, 160),
      tNode('n4', 'action', 'action.notify_coach', 920, 160, { title: 'Preparar onboarding de {Client Name}', description: 'Nuevo cliente creado. Revisa sus datos iniciales y prepara el primer contacto.' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4')],
  },
  {
    id: 'tpl.checkin_overdue_email_escalation',
    name: 'Check-in atrasado multicanal',
    description: 'Si el check-in se retrasa, combina push, email con CTA, espera y escalada al coach si sigue sin responder.',
    category: 'Check-ins',
    nodes: [
      tNode('n1', 'trigger', 'trigger.checkin_overdue', 80, 160, { graceDays: 1 }),
      tNode('n2', 'action', 'action.send_push', 360, 160, { title: 'Tu check-in esta pendiente', body: 'Tardaras solo un par de minutos y me ayuda a ajustar tu plan.', url: '/' }),
      tNode('n3', 'action', 'action.send_email', 640, 160, {
        subject: 'Tu check-in semanal esta pendiente',
        title: 'Necesito tus datos para ajustar bien',
        subtitle: 'Sin check-in trabajamos a ciegas.',
        body: 'Hola {First Name}, tu check-in de esta semana sigue pendiente. Enviarlo nos permite detectar bloqueos, ajustar comida, entrenamiento y mantener el progreso.',
        ctaLabel: 'Enviar check-in',
        ctaUrl: '{App URL}',
      }),
      tNode('n4', 'flow', 'flow.delay', 920, 160, { amount: 2, unit: 'days' }),
      tNode('n5', 'action', 'action.notify_coach', 1200, 160, { title: '{Client Name} sigue sin check-in', description: 'El cliente no respondio tras push + email. Conviene contacto personal.' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4'), tEdge('n4', 'n5')],
  },
  {
    id: 'tpl.weight_drop_safety_email',
    name: 'Bajada brusca de peso: protocolo de seguridad',
    description: 'Ante una bajada de peso relevante, avisa al coach y envia al cliente un email calmado para recoger contexto.',
    category: 'Peso y seguridad',
    nodes: [
      tNode('n1', 'trigger', 'trigger.weight_change', 80, 160, { direction: 'loss', minKg: 2 }),
      tNode('n2', 'action', 'action.notify_coach', 360, 160, { title: 'Bajada brusca de peso: {Client Name}', description: 'Revisa el check-in y contexto antes de ajustar el plan. Puede requerir seguimiento de seguridad.' }),
      tNode('n3', 'action', 'action.send_email', 640, 160, {
        subject: 'Vamos a revisar tu cambio de peso',
        title: 'He detectado un cambio importante',
        subtitle: 'Quiero entender el contexto antes de tocar el plan.',
        body: 'Hola {First Name}, he visto un cambio de peso relevante en tu ultimo registro. No te preocupes: lo revisaremos con calma. Respondeme si ha habido enfermedad, menos comida, mas estres, cambios de medicacion o entrenamientos mas duros.',
        ctaLabel: 'Ver mi ultimo check-in',
        ctaUrl: '{App URL}',
        note: 'Si hay mareos, debilidad o sintomas importantes, prioriza asistencia sanitaria.',
      }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3')],
  },
  {
    id: 'tpl.goal_reached_email_review',
    name: 'Meta alcanzada: celebracion y siguiente fase',
    description: 'Celebra el hito por email, agenda revision y crea tarea para preparar la siguiente fase.',
    category: 'Progreso',
    nodes: [
      tNode('n1', 'trigger', 'trigger.goal_reached', 80, 160),
      tNode('n2', 'action', 'action.send_email', 360, 160, {
        subject: 'Objetivo conseguido, {First Name}',
        title: 'Has alcanzado tu objetivo',
        subtitle: 'Ahora toca convertir el resultado en una nueva fase sostenible.',
        body: 'Enhorabuena, {First Name}. Este resultado viene de tu constancia. El siguiente paso es revisar metricas, sensaciones y definir si vamos a mantenimiento, recomposicion o un nuevo objetivo.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Celebracion de progreso deportivo',
        ctaLabel: 'Ver mi progreso',
        ctaUrl: '{App URL}',
      }),
      tNode('n3', 'action', 'action.schedule_appointment', 640, 160, { title: 'Revision de siguiente fase - {Client Name}', type: 'Video Call', date: 'today+3d', time: '10:00', duration: '30m' }),
      tNode('n4', 'action', 'action.create_task', 920, 160, { title: 'Preparar nueva fase de {Client Name}', type: 'Nutrition', priority: 'high' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4')],
  },
  {
    id: 'tpl.monthly_progress_digest',
    name: 'Resumen mensual de progreso',
    description: 'Cada 30 dias envia un digest por email y crea una tarea para revisar el plan si el cliente no trae check-ins recientes.',
    category: 'Progreso',
    nodes: [
      tNode('n1', 'trigger', 'trigger.schedule', 80, 160, { everyDays: 30 }),
      tNode('n2', 'condition', 'flow.has_checkin', 360, 160, { days: 14 }),
      tNode('n3', 'action', 'action.send_email', 640, 80, {
        subject: 'Tu resumen mensual de progreso',
        title: 'Un mes mas construyendo resultados',
        subtitle: 'Revisamos datos, constancia y siguientes ajustes.',
        body: 'Hola {First Name}, cerramos otro mes de trabajo. Revisa tu progreso en la app y cuentame que ha sido mas facil y que te esta costando. Con eso afinamos el siguiente bloque.',
        ctaLabel: 'Ver progreso',
        ctaUrl: '{App URL}',
      }),
      tNode('n4', 'action', 'action.create_task', 640, 260, { title: 'Cliente sin datos recientes: {Client Name}', type: 'Check-in', priority: 'medium' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3', 'true'), tEdge('n2', 'n4', 'false')],
  },
  {
    id: 'tpl.failed_payment_email',
    name: 'Impago con email de recuperacion',
    description: 'Acompana el dunning con un email claro, link de pago, espera y escalada si no se regulariza.',
    category: 'Suscripciones',
    nodes: [
      tNode('n1', 'trigger', 'trigger.payment_failed', 80, 160),
      tNode('n2', 'action', 'action.send_email', 360, 160, {
        subject: 'No hemos podido procesar tu pago',
        title: 'Actualiza tu metodo de pago',
        subtitle: 'Asi evitamos que tu plan se pause.',
        body: 'Hola {First Name}, el pago de {Plan Name} no se ha podido procesar. Puedes regularizarlo desde el boton de abajo. Si necesitas ayuda, responde a este email.',
        ctaLabel: 'Actualizar pago',
        ctaUrl: '{Payment Link}',
      }),
      tNode('n3', 'flow', 'flow.delay', 640, 160, { amount: 3, unit: 'days' }),
      tNode('n4', 'action', 'action.notify_coach', 920, 160, { title: 'Impago pendiente: {Client Name}', description: 'No se resolvio el pago tras email de recuperacion.' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4')],
  },
  {
    id: 'tpl.birthday_email',
    name: 'Cumpleanos con email personalizado',
    description: 'Envia un email cercano el dia del cumpleanos y crea una tarea opcional de detalle personal.',
    category: 'Relacion',
    nodes: [
      tNode('n1', 'trigger', 'trigger.birthday', 80, 160),
      tNode('n2', 'action', 'action.send_email', 360, 160, {
        subject: 'Feliz cumpleanos, {First Name}',
        title: 'Que tengas un dia enorme',
        subtitle: 'Hoy tambien cuenta disfrutar.',
        body: 'Feliz cumpleanos, {First Name}. Espero que tengas un dia genial. Celebra, disfruta y manana seguimos cuidando el proceso con normalidad.',
        imageUrl: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Celebracion de cumpleanos',
        note: 'Tu coach',
      }),
      tNode('n3', 'action', 'action.create_task', 640, 160, { title: 'Detalle personal de cumpleanos para {Client Name}', type: 'Admin', priority: 'low' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3')],
  },
  {
    id: 'tpl.high_adherence_referral_email',
    name: 'Alta adherencia: pedir testimonio',
    description: 'Cuando el cliente viene con buena adherencia, refuerza por email y crea tarea para pedir testimonio o referido.',
    category: 'Crecimiento',
    nodes: [
      tNode('n1', 'trigger', 'trigger.checkin_submitted', 80, 160),
      tNode('n2', 'data', 'data.get_latest_checkin', 360, 160),
      tNode('n3', 'condition', 'flow.if', 640, 160, { field: 'latestCheckin.nutrition_adherence_score', operator: '>=', value: '8' }),
      tNode('n4', 'action', 'action.send_email', 920, 80, {
        subject: 'Semana muy fuerte, {First Name}',
        title: 'Tu constancia esta marcando la diferencia',
        subtitle: 'Este es el tipo de semana que construye resultados.',
        body: 'Enhorabuena, {First Name}. Tu adherencia ha sido muy buena y eso merece reconocerse. Sigue con esta linea y dime si hay algo que podamos optimizar para mantenerlo sostenible.',
        ctaLabel: 'Ver progreso',
        ctaUrl: '{App URL}',
      }),
      tNode('n5', 'action', 'action.create_task', 920, 260, { title: 'Valorar testimonio/referral con {Client Name}', type: 'Admin', priority: 'low' }),
    ],
    edges: [tEdge('n1', 'n2'), tEdge('n2', 'n3'), tEdge('n3', 'n4', 'true'), tEdge('n4', 'n5')],
  },
] as const;

function cloneWorkflowStarter(value: any): any {
  return JSON.parse(JSON.stringify(value));
}

export function localizeWorkflowStarterTemplates(language: string) {
  if (language !== 'en') return WORKFLOW_STARTER_TEMPLATES;
  return WORKFLOW_STARTER_TEMPLATES.map(tpl => {
    const t = cloneWorkflowStarter(tpl);
    switch (t.id) {
      case 'tpl.payment_welcome':
        t.name = 'Subscription welcome';
        t.description = 'When a client activates their subscription (first payment), greet them and notify the coach.';
        t.nodes[1].config.message = "Welcome, {First Name}! 🎉 Your {Plan Name} subscription is now active. If you have any questions, write to me here.";
        t.nodes[2].config.title = 'New payment from {Client Name}';
        t.nodes[2].config.description = '{Client Name} has paid {Amount} ({Plan Name}).';
        break;
      case 'tpl.dunning':
        t.name = 'Failed payment recovery (dunning)';
        t.description = 'If a payment fails: send the link instantly and, if it still fails, notify the coach and tag the client.';
        t.nodes[1].config.message = "Hi {First Name}, we could not process your payment for {Plan Name}. You can retry it here: {Payment Link}";
        t.nodes[4].config.title = 'Unresolved failed payment: {Client Name}';
        t.nodes[4].config.description = '{Client Name} has not regularized their {Plan Name} payment in 3 days.';
        break;
      case 'tpl.dunning_autopause':
        t.name = 'Failed payment -> auto-pause';
        t.description = 'If a payment fails: warn with the link, wait 5 days and, if it is still unpaid, pause the subscription automatically.';
        t.nodes[1].config.message = "Hi {First Name}, your {Plan Name} payment could not be processed. Update your payment method here: {Payment Link}";
        t.nodes[4].config.title = 'Subscription paused due to failed payment: {Client Name}';
        t.nodes[4].config.description = '{Client Name} did not regularize {Plan Name}; it was paused automatically.';
        break;
      case 'tpl.renewal_reminder':
        t.name = 'Renewal reminder';
        t.description = '3 days before renewal, you warn the client with the amount and date.';
        t.nodes[1].config.message = 'Hi {First Name}, your {Plan Name} subscription renews on {Renewal Date} for {Amount}. We keep going! 💪';
        break;
      case 'tpl.trial_conversion':
        t.name = 'Trial ending -> conversion';
        t.description = 'Before the free trial ends, encourage the client to continue.';
        t.nodes[1].config.message = 'Hi {First Name}, your {Plan Name} trial ends on {Renewal Date}. If you want to continue, everything will carry on automatically. Can I help with anything before then?';
        break;
      case 'tpl.retention':
        t.name = 'Retention on cancel';
        t.description = 'When someone cancels, you offer a discount code to bring them back (choose the plan in the "Create code" node).';
        t.nodes[2].config.message = 'Sorry to see you go, {First Name}. If you change your mind, you have 20% off for 3 months with code VUELVE20. We are still here!';
        break;
      case 'tpl.onboarding_email_pack':
        t.name = 'Premium onboarding email';
        t.description = 'When a client is created, send a complete welcome email with image, app CTA and an internal task to prepare the plan.';
        t.nodes[1].config.subject = 'Welcome to your new plan, {First Name}';
        t.nodes[1].config.title = 'Your process starts today';
        t.nodes[1].config.subtitle = 'Everything you need is centralized in your app.';
        t.nodes[1].config.body = 'Hi {First Name}, I am {Coach Name}. You now have access to your personal space. Over the next few days we will review your starting point, goals and the adjustments you need to move forward safely.';
        t.nodes[1].config.ctaLabel = 'Open my app';
        t.nodes[1].config.note = 'If you have any questions, reply to this email or write to me in chat.';
        t.nodes[3].config.title = 'Prepare onboarding for {Client Name}';
        t.nodes[3].config.description = 'New client created. Review their initial data and prepare the first contact.';
        break;
      case 'tpl.checkin_overdue_email_escalation':
        t.name = 'Overdue check-in multichannel';
        t.description = 'If the check-in is late, combine push, email with CTA, wait and coach escalation if they still do not respond.';
        t.nodes[1].config.title = 'Your check-in is pending';
        t.nodes[1].config.body = 'It only takes a couple of minutes and helps me adjust your plan.';
        t.nodes[2].config.subject = 'Your weekly check-in is pending';
        t.nodes[2].config.title = 'I need your data to adjust properly';
        t.nodes[2].config.subtitle = 'Without your check-in we are working blind.';
        t.nodes[2].config.body = 'Hi {First Name}, your check-in for this week is still pending. Sending it helps us spot blockers, adjust nutrition, training and keep progress moving.';
        t.nodes[2].config.ctaLabel = 'Send check-in';
        t.nodes[4].config.title = '{Client Name} still has no check-in';
        t.nodes[4].config.description = 'The client did not respond after push + email. Personal contact is recommended.';
        break;
      case 'tpl.weight_drop_safety_email':
        t.name = 'Sudden weight drop: safety protocol';
        t.description = 'When weight drops significantly, alert the coach and send the client a calm email to collect context.';
        t.nodes[1].config.title = 'Sudden weight drop: {Client Name}';
        t.nodes[1].config.description = 'Review the check-in and context before adjusting the plan. Safety follow-up may be needed.';
        t.nodes[2].config.subject = 'Let us review your weight change';
        t.nodes[2].config.title = 'I noticed an important change';
        t.nodes[2].config.subtitle = 'I want to understand the context before changing the plan.';
        t.nodes[2].config.body = 'Hi {First Name}, I noticed a relevant weight change in your latest log. Do not worry: we will review it calmly. Reply if there has been illness, less food, more stress, medication changes or harder training.';
        t.nodes[2].config.ctaLabel = 'View my latest check-in';
        t.nodes[2].config.note = 'If you feel dizzy, weak or have important symptoms, prioritize medical support.';
        break;
      case 'tpl.goal_reached_email_review':
        t.name = 'Goal reached: celebration and next phase';
        t.description = 'Celebrate the milestone by email, schedule a review and create a task to prepare the next phase.';
        t.nodes[1].config.subject = 'Goal achieved, {First Name}';
        t.nodes[1].config.title = 'You reached your goal';
        t.nodes[1].config.subtitle = 'Now we turn the result into a sustainable next phase.';
        t.nodes[1].config.body = 'Congratulations, {First Name}. This result comes from your consistency. The next step is reviewing metrics, feelings and deciding whether we move to maintenance, recomposition or a new goal.';
        t.nodes[1].config.ctaLabel = 'View my progress';
        t.nodes[2].config.title = 'Next-phase review - {Client Name}';
        t.nodes[3].config.title = 'Prepare next phase for {Client Name}';
        break;
      case 'tpl.monthly_progress_digest':
        t.name = 'Monthly progress digest';
        t.description = 'Every 30 days, send a progress email and create a task if the client has no recent check-ins.';
        t.nodes[2].config.subject = 'Your monthly progress summary';
        t.nodes[2].config.title = 'Another month building results';
        t.nodes[2].config.subtitle = 'We review data, consistency and next adjustments.';
        t.nodes[2].config.body = 'Hi {First Name}, we are closing another month of work. Review your progress in the app and tell me what felt easier and what is still hard. With that, we fine-tune the next block.';
        t.nodes[2].config.ctaLabel = 'View progress';
        t.nodes[3].config.title = 'Client without recent data: {Client Name}';
        break;
      case 'tpl.failed_payment_email':
        t.name = 'Failed payment recovery email';
        t.description = 'Support dunning with a clear email, payment link, wait and escalation if payment is not fixed.';
        t.nodes[1].config.subject = 'We could not process your payment';
        t.nodes[1].config.title = 'Update your payment method';
        t.nodes[1].config.subtitle = 'This helps us avoid pausing your plan.';
        t.nodes[1].config.body = 'Hi {First Name}, the payment for {Plan Name} could not be processed. You can regularize it from the button below. If you need help, reply to this email.';
        t.nodes[1].config.ctaLabel = 'Update payment';
        t.nodes[3].config.title = 'Payment still pending: {Client Name}';
        t.nodes[3].config.description = 'Payment was not resolved after the recovery email.';
        break;
      case 'tpl.birthday_email':
        t.name = 'Personalized birthday email';
        t.description = 'Send a warm birthday email and create an optional task for a personal detail.';
        t.nodes[1].config.subject = 'Happy birthday, {First Name}';
        t.nodes[1].config.title = 'Have an amazing day';
        t.nodes[1].config.subtitle = 'Today enjoying yourself counts too.';
        t.nodes[1].config.body = 'Happy birthday, {First Name}. I hope you have a great day. Celebrate, enjoy it, and tomorrow we keep taking care of the process normally.';
        t.nodes[1].config.note = 'Your coach';
        t.nodes[2].config.title = 'Personal birthday detail for {Client Name}';
        break;
      case 'tpl.high_adherence_referral_email':
        t.name = 'High adherence: ask for testimonial';
        t.description = 'When the client has strong adherence, reinforce by email and create a task to ask for a testimonial or referral.';
        t.nodes[3].config.subject = 'Very strong week, {First Name}';
        t.nodes[3].config.title = 'Your consistency is making the difference';
        t.nodes[3].config.subtitle = 'This is the kind of week that builds results.';
        t.nodes[3].config.body = 'Congratulations, {First Name}. Your adherence has been very good and that deserves recognition. Keep this line and tell me if there is anything we can optimize to keep it sustainable.';
        t.nodes[3].config.ctaLabel = 'View progress';
        t.nodes[4].config.title = 'Consider testimonial/referral with {Client Name}';
        break;
    }
    return t;
  });
}

// ---- Helpers -----------------------------------------------
function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function renderTemplate(text: string, ctx: any): string {
  if (!text) return '';
  const client = ctx.client || {};
  const sub = ctx.subscription || {};
  const language = ctx.language === 'en' ? 'en' : 'es';
  const locale = language === 'en' ? 'en-US' : 'es-ES';
  const amountStr = typeof sub.amountCents === 'number'
    ? (sub.amountCents / 100).toLocaleString(locale, { style: 'currency', currency: (sub.currency || 'eur').toUpperCase() })
    : '';
  const renewalStr = sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const baseCtx: RenderContext = {
    client: { id: client.id, email: client.email, full_name: client.full_name },
    profile: client || null,
    coachName: ctx.coachName,
    latestCheckIn: ctx.checkin || null,
    paymentUrl: sub.paymentUrl || null,
    language,
  };
  return renderMessage(String(text), baseCtx)
    .replace(/{Plan Name}/g, sub.planName || '')
    .replace(/{Amount}/g, amountStr)
    .replace(/{Renewal Date}/g, renewalStr)
    .replace(/{Subscription Status}/g, sub.status || '')
    .replace(/{Payment Link}/g, sub.paymentUrl || '')
    .replace(/{App URL}/g, process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, p) => {
      const v = getByPath(ctx, p);
      return v == null ? '' : String(v);
    });
}

function compare(left: any, op: string, right: any): boolean {
  const ln = parseFloat(left), rn = parseFloat(right);
  const numeric = !isNaN(ln) && !isNaN(rn);
  switch (op) {
    case '>':  return numeric ? ln > rn : false;
    case '<':  return numeric ? ln < rn : false;
    case '>=': return numeric ? ln >= rn : false;
    case '<=': return numeric ? ln <= rn : false;
    case '==': return numeric ? ln === rn : String(left) === String(right);
    case '!=': return numeric ? ln !== rn : String(left) !== String(right);
    case 'contains': return String(left ?? '').toLowerCase().includes(String(right ?? '').toLowerCase());
    default: return false;
  }
}

/** Insert with a few retries — shields workflows from transient DB blips. */
async function insertWithRetry(table: string, row: any, tries = 3): Promise<{ error: any }> {
  let res: any = { error: new Error('no attempt') };
  for (let i = 0; i < tries; i++) {
    res = await supabaseAdmin.from(table).insert(row);
    if (!res.error) return res;
    await new Promise(r => setTimeout(r, 250 * (i + 1)));
  }
  return res;
}

function delayMs(cfg: any): number {
  const amount = Number(cfg?.amount) || 0;
  if (amount <= 0) return 0;
  return cfg?.unit === 'days' ? amount * 86400000 : amount * 3600000;
}

const TPL_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a template config value to a row. The node dropdowns now store the
 * template's UUID; legacy workflows stored the name as plain text. We accept
 * both: try id first, fall back to a name lookup. All four template tables
 * own rows via `manager_id` (a global seeded template has manager_id = null).
 */
async function resolveTemplate(
  table: string, managerId: string, ref: string, select = 'id, name',
): Promise<any | null> {
  const v = String(ref || '').trim();
  if (!v) return null;
  if (TPL_UUID_RE.test(v)) {
    const { data } = await supabaseAdmin.from(table).select(select).eq('id', v).maybeSingle();
    if (data) return data;
  }
  const { data } = await supabaseAdmin.from(table).select(select)
    .eq('name', v).or(`manager_id.eq.${managerId},manager_id.is.null`)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data || null;
}

const ALLOWED_VERSION_FIELDS = ['nodes', 'edges', 'trigger'] as const;

/** Validate a workflow graph; returns { ok, errors, warnings }. */
export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const triggers = nodes.filter(n => n.type === 'trigger');
  if (triggers.length === 0) errors.push('The workflow needs exactly one trigger node.');
  if (triggers.length > 1) errors.push('Only one trigger node is allowed.');
  const ids = new Set(nodes.map(n => n.id));
  for (const e of edges) {
    if (!ids.has(e.source)) errors.push(`Edge ${e.id} has an unknown source node.`);
    if (!ids.has(e.target)) errors.push(`Edge ${e.id} has an unknown target node.`);
  }
  for (const n of nodes) {
    if (!CATALOG_BY_KEY.has(n.key)) warnings.push(`Node "${n.label || n.key}" uses an unknown type.`);
    if (n.type !== 'trigger' && !edges.some(e => e.target === n.id))
      warnings.push(`Node "${n.label || n.key}" is not connected to anything.`);
    if (n.key === 'flow.if' && !edges.some(e => e.source === n.id))
      warnings.push('An If/Else node has no branches connected.');
    if (n.key === 'action.send_email') {
      const cfg = n.config || {};
      const hasContent = Boolean(String(cfg.subject || '').trim() || String(cfg.title || '').trim() || String(cfg.body || '').trim() || String(cfg.subtitle || '').trim());
      if (!hasContent) errors.push('The email action needs at least a subject, title or body.');
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

// ---- Executor ----------------------------------------------
async function buildContext(managerId: string, triggerType: string, payload: any) {
  const ctx: any = { trigger: { type: triggerType, ...payload }, data: {}, client: null };
  const { data: mgrProfile } = await supabaseAdmin
    .from('profiles').select('full_name, language').eq('user_id', managerId).maybeSingle();
  ctx.language = mgrProfile?.language === 'en' ? 'en' : 'es';
  ctx.coachName = mgrProfile?.full_name || (ctx.language === 'en' ? 'your coach' : 'tu coach');

  if (payload?.clientId) {
    const { data: cli } = await supabaseAdmin
      .from('users')
      .select('id, email, profiles(full_name), clients_profiles(weight, goal_weight, check_in_day, last_login)')
      .eq('id', payload.clientId).maybeSingle();
    if (cli) {
      const profile = Array.isArray(cli.profiles) ? cli.profiles[0] : cli.profiles;
      const cp = Array.isArray(cli.clients_profiles) ? cli.clients_profiles[0] : cli.clients_profiles;
      ctx.client = { id: cli.id, email: cli.email, full_name: profile?.full_name, ...cp };
    }
    const { data: ci } = await supabaseAdmin
      .from('check_ins').select('data_json, date, created_at')
      .eq('client_id', payload.clientId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (ci) ctx.checkin = { date: ci.date, ...(ci.data_json || {}) };
  }
  // Datos de suscripción que inyectan los triggers de facturación (para los
  // tokens {Plan Name}, {Amount}, {Renewal Date}, {Subscription Status},
  // {Payment Link}).
  if (payload?.planName || payload?.amountCents != null || payload?.paymentUrl || payload?.renewalDate || payload?.subscriptionStatus) {
    ctx.subscription = {
      planName: payload.planName ?? null,
      amountCents: payload.amountCents ?? null,
      currency: payload.currency ?? 'eur',
      renewalDate: payload.renewalDate ?? null,
      status: payload.subscriptionStatus ?? null,
      paymentUrl: payload.paymentUrl ?? null,
    };
  }
  return ctx;
}

interface LoopResult {
  status: 'completed' | 'failed' | 'waiting';
  steps: any[];
  ctx: any;
  pause?: { resumeAt: string; queue: QueueItem[]; visited: string[] };
}

/** Core BFS walk. Shared by fresh runs and resumed runs. */
async function runLoop(p: {
  managerId: string; runId: string | null;
  nodes: WorkflowNode[]; edges: WorkflowEdge[];
  ctx: any; queue: QueueItem[]; visited: Set<string>;
  dryRun: boolean;
}): Promise<LoopResult> {
  const { managerId, runId, nodes, edges, ctx, queue, visited, dryRun } = p;
  const steps: any[] = [];
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  let status: LoopResult['status'] = 'completed';
  const MAX_STEPS = nodes.length * 4 + 10;
  let count = 0;

  const logStep = async (node: WorkflowNode, st: string, output: any, error?: string) => {
    steps.push({ node_id: node.id, node_key: node.key, status: st, output, error });
    if (runId) {
      await supabaseAdmin.from('workflow_run_steps').insert({
        workflow_run_id: runId, node_id: node.id, node_type: node.type, node_key: node.key,
        status: st, output: output || {}, error: error || null, ended_at: new Date().toISOString(),
      }).then(() => {}, () => {}); // best-effort logging
    }
  };

  while (queue.length && count < MAX_STEPS) {
    count++;
    const item = queue.shift()!;
    if (visited.has(item.nodeId)) continue;
    visited.add(item.nodeId);
    const node = nodeById.get(item.nodeId);
    if (!node || node.disabled) continue;

    let followHandle: string | null | undefined = undefined; // undefined => follow all
    let pauseFor = 0;
    try {
      const cfg = node.config || {};
      switch (node.key) {
        case 'trigger.manual':
        case 'trigger.new_client':
        case 'trigger.checkin_submitted':
        case 'trigger.message_received':
        case 'trigger.schedule':
        case 'trigger.weight_change':
        case 'trigger.plan_assigned':
        case 'trigger.onboarding_completed':
        case 'trigger.workout_logged':
        case 'trigger.meal_logged':
        case 'trigger.activity_highlighted':
        case 'trigger.client_inactive':
        case 'trigger.day_of_week':
        case 'trigger.birthday':
        case 'trigger.checkin_overdue':
        case 'trigger.goal_reached':
        case 'trigger.payment_succeeded':
        case 'trigger.payment_failed':
        case 'trigger.subscription_started':
        case 'trigger.subscription_canceled':
        case 'trigger.renewal_upcoming':
        case 'trigger.subscription_paused':
        case 'trigger.subscription_resumed':
        case 'trigger.trial_ending':
        case 'trigger.refund_issued':
          await logStep(node, 'completed', { trigger: node.key });
          break;

        case 'flow.random_split': {
          // Deterministic per-run randomness via Math.random — A/B testing.
          const wA = Math.min(100, Math.max(0, Number(cfg.weightA) || 50));
          followHandle = (Math.random() * 100 < wA) ? 'A' : 'B';
          await logStep(node, 'completed', { weightA: wA, branch: followHandle });
          break;
        }

        case 'flow.if': {
          const left = getByPath(ctx, cfg.field);
          const result = compare(left, cfg.operator, cfg.value);
          followHandle = result ? 'true' : 'false';
          await logStep(node, 'completed', { field: cfg.field, left, operator: cfg.operator, value: cfg.value, result });
          break;
        }
        case 'flow.switch': {
          // Route by value: the node declares its branches in cfg.branches
          // (comma-separated). A value that matches a branch follows that
          // handle; anything else (or null) falls through to "default".
          const val = getByPath(ctx, cfg.field);
          const branchList = String(cfg.branches || '').split(',').map(s => s.trim()).filter(Boolean);
          const v = val == null ? '' : String(val);
          followHandle = branchList.includes(v) ? v : 'default';
          await logStep(node, 'completed', { field: cfg.field, value: val, branch: followHandle });
          break;
        }
        case 'flow.delay': {
          pauseFor = dryRun ? 0 : delayMs(cfg);
          await logStep(node, pauseFor > 0 ? 'waiting' : 'completed',
            { amount: cfg.amount, unit: cfg.unit, paused: pauseFor > 0 });
          break;
        }
        case 'flow.stop':
          await logStep(node, 'completed', { stopped: true });
          return { status, steps, ctx };

        case 'data.set_fields': {
          let fields = cfg.fields;
          if (typeof fields === 'string') { try { fields = JSON.parse(fields); } catch { fields = {}; } }
          Object.assign(ctx.data, fields || {});
          await logStep(node, 'completed', { set: fields });
          break;
        }

        case 'action.send_message': {
          const msg = renderTemplate(cfg.message || '', ctx);
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
          } else if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, message: msg });
          } else {
            const { error } = await insertWithRetry('messages', {
              sender_id: managerId, receiver_id: ctx.client.id, content: msg });
            await logStep(node, error ? 'failed' : 'completed', { message: msg }, error?.message);
            if (error) { status = 'failed'; return { status, steps, ctx }; }
          }
          break;
        }
        case 'action.send_email': {
          if (!ctx.client?.id || !ctx.client.email) {
            await logStep(node, 'skipped', { reason: 'no client email in context' });
            break;
          }
          const subject = renderTemplate(cfg.subject || cfg.title || 'Workflow email', ctx);
          const title = renderTemplate(cfg.title || subject, ctx);
          const subtitle = cfg.subtitle ? renderTemplate(cfg.subtitle, ctx) : undefined;
          const body = renderTemplate(cfg.body || '', ctx);
          const imageUrl = cfg.imageUrl ? renderTemplate(cfg.imageUrl, ctx) : undefined;
          const imageAlt = cfg.imageAlt ? renderTemplate(cfg.imageAlt, ctx) : undefined;
          const ctaLabel = cfg.ctaLabel ? renderTemplate(cfg.ctaLabel, ctx) : undefined;
          const ctaUrl = cfg.ctaUrl ? renderTemplate(cfg.ctaUrl, ctx) : undefined;
          const note = cfg.note ? renderTemplate(cfg.note, ctx) : undefined;
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, subject, title, subtitle, hasImage: !!imageUrl });
            break;
          }
          const sent = await sendClientTransactionalEmail({
            to: ctx.client.email,
            language: ctx.language,
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
          await logStep(node, sent.ok || sent.skipped ? 'completed' : 'failed', {
            subject,
            title,
            subtitle,
            hasImage: !!imageUrl,
          }, sent.ok || sent.skipped ? undefined : 'Email send failed');
          if (!sent.ok && !sent.skipped) {
            status = 'failed';
            return { status, steps, ctx };
          }
          break;
        }
        case 'action.create_task': {
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, title: cfg.title });
          } else {
            const { error } = await insertWithRetry('tasks', {
              manager_id: managerId, client_id: ctx.client?.id || null,
              title: renderTemplate(cfg.title || 'Workflow task', ctx),
              description: cfg.description ? renderTemplate(cfg.description, ctx) : null,
              type: cfg.type || 'workflow', date: new Date().toISOString().split('T')[0],
              time: '09:00', status: 'pending',
              priority: ['low', 'medium', 'high'].includes(cfg.priority) ? cfg.priority : 'medium',
              link_url: cfg.linkUrl || cfg.link_url || null });
            await logStep(node, error ? 'failed' : 'completed', { title: cfg.title }, error?.message);
            if (error) { status = 'failed'; return { status, steps, ctx }; }
          }
          break;
        }

        // ── New condition shortcuts ───────────────────────────────
        case 'flow.has_plan': {
          if (!ctx.client?.id) {
            followHandle = 'false';
            await logStep(node, 'completed', { reason: 'no client', branch: 'false' });
            break;
          }
          const kind = cfg.planKind || 'any';
          let has = false;
          if (kind === 'any' || kind === 'nutrition') {
            const { count } = await supabaseAdmin
              .from('nutrition_plans').select('id', { count: 'exact', head: true })
              .eq('client_id', ctx.client.id);
            if ((count || 0) > 0) has = true;
          }
          if (!has && (kind === 'any' || kind === 'training')) {
            const { count } = await supabaseAdmin
              .from('training_programs').select('id', { count: 'exact', head: true })
              .eq('client_id', ctx.client.id);
            if ((count || 0) > 0) has = true;
          }
          followHandle = has ? 'true' : 'false';
          await logStep(node, 'completed', { planKind: kind, hasPlan: has });
          break;
        }
        case 'flow.has_checkin': {
          if (!ctx.client?.id) {
            followHandle = 'false';
            await logStep(node, 'completed', { reason: 'no client', branch: 'false' });
            break;
          }
          const days = Number(cfg.days) || 7;
          const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from('client_checkin_submissions').select('id', { count: 'exact', head: true })
            .eq('client_id', ctx.client.id).gte('submitted_at', since);
          const has = (count || 0) > 0;
          followHandle = has ? 'true' : 'false';
          await logStep(node, 'completed', { days, hasRecentCheckin: has });
          break;
        }
        case 'flow.days_since': {
          if (!ctx.client?.id) {
            followHandle = 'false';
            await logStep(node, 'completed', { reason: 'no client', branch: 'false' });
            break;
          }
          let refDate: string | null = null;
          if (cfg.event === 'last_check_in') {
            const { data } = await supabaseAdmin
              .from('client_checkin_submissions').select('submitted_at')
              .eq('client_id', ctx.client.id)
              .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
            refDate = data?.submitted_at || null;
          } else if (cfg.event === 'last_workout') {
            const { data } = await supabaseAdmin
              .from('workout_logs').select('logged_at')
              .eq('client_id', ctx.client.id)
              .order('logged_at', { ascending: false }).limit(1).maybeSingle();
            refDate = data?.logged_at || null;
          } else if (cfg.event === 'created_at') {
            const { data } = await supabaseAdmin
              .from('users').select('created_at').eq('id', ctx.client.id).maybeSingle();
            refDate = data?.created_at || null;
          }
          const days = refDate
            ? Math.floor((Date.now() - new Date(refDate).getTime()) / 86400000)
            : Number.POSITIVE_INFINITY;
          const result = compare(days, cfg.operator || '>', Number(cfg.days) || 0);
          followHandle = result ? 'true' : 'false';
          await logStep(node, 'completed', { event: cfg.event, days, operator: cfg.operator, threshold: cfg.days, result });
          break;
        }
        case 'flow.has_tag': {
          if (!ctx.client?.id) {
            followHandle = 'false';
            await logStep(node, 'completed', { reason: 'no client', branch: 'false' });
            break;
          }
          const wanted = String(cfg.tag || '').trim().toLowerCase();
          // Tags live in clients_profiles.metadata.tags (set by "Tag client").
          const { data: cp } = await supabaseAdmin
            .from('clients_profiles').select('metadata')
            .eq('user_id', ctx.client.id).maybeSingle();
          const tags: string[] = Array.isArray((cp?.metadata as any)?.tags)
            ? (cp!.metadata as any).tags.map((x: any) => String(x).toLowerCase())
            : [];
          const has = wanted ? tags.includes(wanted) : false;
          followHandle = has ? 'true' : 'false';
          await logStep(node, 'completed', { tag: wanted, hasTag: has });
          break;
        }

        case 'flow.has_active_subscription': {
          if (!ctx.client?.id) { followHandle = 'false'; await logStep(node, 'completed', { reason: 'no client', branch: 'false' }); break; }
          const { count } = await supabaseAdmin
            .from('client_billing').select('id', { count: 'exact', head: true })
            .eq('manager_id', managerId).eq('client_id', ctx.client.id).eq('kind', 'recurring')
            .in('status', ['active', 'trialing']);
          const has = (count || 0) > 0;
          followHandle = has ? 'true' : 'false';
          await logStep(node, 'completed', { hasActiveSubscription: has });
          break;
        }
        case 'flow.on_plan': {
          if (!ctx.client?.id) { followHandle = 'false'; await logStep(node, 'completed', { reason: 'no client', branch: 'false' }); break; }
          const planId = String(cfg.plan || '').trim();
          if (!planId) { followHandle = 'false'; await logStep(node, 'completed', { reason: 'no plan', branch: 'false' }); break; }
          const { count } = await supabaseAdmin
            .from('client_billing').select('id', { count: 'exact', head: true })
            .eq('manager_id', managerId).eq('client_id', ctx.client.id).eq('plan_id', planId)
            .not('status', 'in', '("canceled","void")');
          const has = (count || 0) > 0;
          followHandle = has ? 'true' : 'false';
          await logStep(node, 'completed', { planId, onPlan: has });
          break;
        }

        // ── New data nodes ─────────────────────────────────────────
        case 'data.get_latest_checkin': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client' });
            break;
          }
          const { data } = await supabaseAdmin
            .from('client_checkin_submissions')
            .select('id, submitted_at, answers_json')
            .eq('client_id', ctx.client.id)
            .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
          ctx.latestCheckin = data ? { ...data, ...(data.answers_json || {}) } : null;
          await logStep(node, 'completed', { found: !!data });
          break;
        }
        case 'data.compute_bmi': {
          const w = parseFloat(ctx.client?.weight);
          const h = parseFloat(ctx.client?.height) / 100; // cm → m
          if (Number.isFinite(w) && Number.isFinite(h) && h > 0) {
            ctx.data.bmi = +(w / (h * h)).toFixed(1);
            await logStep(node, 'completed', { bmi: ctx.data.bmi });
          } else {
            await logStep(node, 'skipped', { reason: 'missing weight or height' });
          }
          break;
        }

        // ── New actions ────────────────────────────────────────────
        case 'action.schedule_appointment': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          // Resolve "today+Nd" or YYYY-MM-DD; default to today.
          let date = String(cfg.date || '').trim();
          const m = date.match(/^today\+(\d+)d$/i);
          if (m) {
            const d = new Date();
            d.setDate(d.getDate() + parseInt(m[1], 10));
            date = d.toISOString().split('T')[0];
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            date = new Date().toISOString().split('T')[0];
          }
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, date, time: cfg.time, type: cfg.type });
          } else {
            const { error } = await insertWithRetry('tasks', {
              manager_id: managerId, client_id: ctx.client.id,
              title: renderTemplate(cfg.title || 'Appointment', ctx),
              type: cfg.type || 'Video Call',
              date,
              time: cfg.time || '09:00',
              duration: cfg.duration || '30m',
              status: 'pending',
            });
            await logStep(node, error ? 'failed' : 'completed', { date, time: cfg.time }, error?.message);
            if (error) { status = 'failed'; return { status, steps, ctx }; }
          }
          break;
        }
        case 'action.assign_plan': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          // The dropdown stores "<kind>:<templateId>"; legacy workflows stored
          // a planKind field + a templateName string.
          const raw = String(cfg.template || '').trim();
          let planKind: 'nutrition' | 'training';
          let tplRef: string;
          if (raw.includes(':')) {
            const [k, ...rest] = raw.split(':');
            planKind = k === 'training' ? 'training' : 'nutrition';
            tplRef = rest.join(':');
          } else {
            planKind = cfg.planKind === 'training' ? 'training' : 'nutrition';
            tplRef = raw || String(cfg.templateName || '').trim();
          }
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, planKind, tplRef });
            break;
          }
          const tplTable = planKind === 'training' ? 'training_templates' : 'nutrition_templates';
          const tpl = await resolveTemplate(tplTable, managerId, tplRef, 'id, name, data_json');
          if (!tpl) {
            await logStep(node, 'skipped', { reason: `template "${tplRef}" not found` });
            break;
          }
          const planTable = planKind === 'training' ? 'training_programs' : 'nutrition_plans';
          const { error } = await insertWithRetry(planTable, {
            client_id: ctx.client.id, created_by: managerId,
            name: tpl.name, data_json: tpl.data_json || {},
          });
          await logStep(node, error ? 'failed' : 'completed', { planKind, template: tpl.name }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.assign_onboarding': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const tplRef = String(cfg.template || cfg.templateName || '').trim();
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, tplRef });
            break;
          }
          const tpl = await resolveTemplate('onboarding_templates', managerId, tplRef);
          if (!tpl) {
            await logStep(node, 'skipped', { reason: `template "${tplRef}" not found` });
            break;
          }
          // Deactivate previous, then insert.
          await supabaseAdmin.from('client_onboarding_assignments')
            .update({ is_active: false })
            .eq('client_id', ctx.client.id).eq('is_active', true);
          const { error } = await insertWithRetry('client_onboarding_assignments', {
            client_id: ctx.client.id, template_id: tpl.id,
            assigned_by: managerId, is_active: true,
            assigned_at: new Date().toISOString(),
          });
          await logStep(node, error ? 'failed' : 'completed', { template: tpl.name }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.request_checkin': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const tplRef = String(cfg.template || cfg.templateName || '').trim();
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, tplRef });
            break;
          }
          const tpl = await resolveTemplate('checkin_templates', managerId, tplRef);
          if (!tpl) {
            await logStep(node, 'skipped', { reason: `check-in template "${tplRef}" not found` });
            break;
          }
          // Deactivate previous active assignment, then insert the new one.
          await supabaseAdmin.from('client_checkin_assignments')
            .update({ is_active: false })
            .eq('client_id', ctx.client.id).eq('is_active', true);
          const { error } = await insertWithRetry('client_checkin_assignments', {
            client_id: ctx.client.id, template_id: tpl.id,
            assigned_by: managerId, is_active: true,
            assigned_at: new Date().toISOString(),
          });
          await logStep(node, error ? 'failed' : 'completed', { template: tpl.name }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.set_client_field': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const field = String(cfg.field || '').trim();
          if (!['notes', 'goal', 'weight', 'height'].includes(field)) {
            await logStep(node, 'skipped', { reason: `field "${field}" not allowed` });
            break;
          }
          const value = field === 'weight' || field === 'height'
            ? Number(renderTemplate(String(cfg.value || ''), ctx)) || null
            : renderTemplate(String(cfg.value || ''), ctx);
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, field, value });
            break;
          }
          const { error } = await supabaseAdmin
            .from('clients_profiles')
            .upsert({ user_id: ctx.client.id, [field]: value }, { onConflict: 'user_id' });
          await logStep(node, error ? 'failed' : 'completed', { field, value }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.set_client_status': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const ALLOWED = ['Active', 'Paused', 'Archived'];
          const newStatus = String(cfg.status || '').trim();
          if (!ALLOWED.includes(newStatus)) {
            await logStep(node, 'skipped', { reason: `status "${newStatus}" not allowed` });
            break;
          }
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, status: newStatus });
            break;
          }
          const { error } = await supabaseAdmin
            .from('users').update({ status: newStatus }).eq('id', ctx.client.id);
          await logStep(node, error ? 'failed' : 'completed', { status: newStatus }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.notify_coach': {
          const title = renderTemplate(cfg.title || 'Workflow notification', ctx);
          const description = renderTemplate(cfg.description || '', ctx);
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, title });
            break;
          }
          const { error } = await insertWithRetry('tasks', {
            manager_id: managerId, client_id: null,
            title, description, type: 'workflow',
            date: new Date().toISOString().split('T')[0],
            time: '09:00', status: 'pending',
          });
          await logStep(node, error ? 'failed' : 'completed', { title }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }

        // ── TK-28: new data nodes ──────────────────────────────────
        case 'data.get_client_field': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const field = String(cfg.field || '').trim();
          const storeAs = String(cfg.as || field).trim() || field;
          // Read the real clients_profiles column. `tags` lives in metadata
          // (that's where the Tag client action writes), the rest are columns.
          let value: any = null;
          if (field === 'tags') {
            const { data: cp } = await supabaseAdmin
              .from('clients_profiles').select('metadata')
              .eq('user_id', ctx.client.id).maybeSingle();
            value = Array.isArray((cp?.metadata as any)?.tags) ? (cp!.metadata as any).tags : [];
          } else if (['weight', 'goal_weight', 'height', 'goal', 'notes'].includes(field)) {
            const { data: cp } = await supabaseAdmin
              .from('clients_profiles').select(field)
              .eq('user_id', ctx.client.id).maybeSingle();
            value = cp ? ((cp as any)[field] ?? null) : null;
          } else {
            // Fallback for any other path already hydrated on ctx.client.
            value = (ctx.client as any)[field] ?? null;
          }
          if (storeAs) ctx.data[storeAs] = value;
          await logStep(node, 'completed', { field, storeAs, value });
          break;
        }
        case 'data.get_plan_field': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const planKind = cfg.planKind === 'training' ? 'training' : 'nutrition';
          const field = String(cfg.field || 'name').trim();
          const storeAs = String(cfg.as || field).trim() || field;
          const planTable = planKind === 'training' ? 'training_programs' : 'nutrition_plans';
          const { data: plan } = await supabaseAdmin
            .from(planTable).select('name, status, data_json')
            .eq('client_id', ctx.client.id)
            .order('updated_at', { ascending: false }).limit(1).maybeSingle();
          let value: any = null;
          if (plan) {
            if (field === 'target_calories') {
              value = (plan as any).data_json?.config?.targetCalories
                ?? (plan as any).data_json?.target_calories ?? null;
            } else {
              value = (plan as any)[field] ?? (plan as any).data_json?.[field] ?? null;
            }
          }
          if (storeAs) ctx.data[storeAs] = value;
          await logStep(node, 'completed', { planKind, field, storeAs, value, found: !!plan });
          break;
        }

        // ── TK-28: new actions ─────────────────────────────────────
        case 'action.send_push': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const title = renderTemplate(cfg.title || 'New notification', ctx);
          const body = renderTemplate(cfg.body || '', ctx);
          const url = cfg.url ? renderTemplate(String(cfg.url), ctx) : '/';
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, title, body });
            break;
          }
          await sendPushToUser(ctx.client.id, { title, body, url });
          await logStep(node, 'completed', { title, body });
          break;
        }
        case 'action.tag_client': {
          if (!ctx.client?.id) {
            await logStep(node, 'skipped', { reason: 'no client in context' });
            break;
          }
          const tag = String(cfg.tag || '').trim().toLowerCase();
          const act = cfg.action === 'remove' ? 'remove' : 'add';
          if (!tag) {
            await logStep(node, 'skipped', { reason: 'no tag specified' });
            break;
          }
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, tag, action: act });
            break;
          }
          const { data: cp } = await supabaseAdmin
            .from('clients_profiles').select('metadata')
            .eq('user_id', ctx.client.id).maybeSingle();
          const meta: any = { ...(cp?.metadata || {}) };
          let tags: string[] = Array.isArray(meta.tags) ? [...meta.tags] : [];
          if (act === 'add' && !tags.includes(tag)) tags.push(tag);
          else if (act === 'remove') tags = tags.filter(t => t !== tag);
          meta.tags = tags;
          const { error: tagErr } = await supabaseAdmin
            .from('clients_profiles')
            .upsert({ user_id: ctx.client.id, metadata: meta }, { onConflict: 'user_id' });
          await logStep(node, tagErr ? 'failed' : 'completed', { tag, action: act, tags }, tagErr?.message);
          if (tagErr) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.assign_billing_plan': {
          if (!ctx.client?.id) { await logStep(node, 'skipped', { reason: 'no client in context' }); break; }
          const planId = String(cfg.plan || '').trim();
          if (!planId) { await logStep(node, 'skipped', { reason: 'no plan selected' }); break; }
          const { data: plan } = await supabaseAdmin
            .from('billing_plans').select('*').eq('id', planId).eq('manager_id', managerId).maybeSingle();
          if (!plan) { await logStep(node, 'skipped', { reason: `plan ${planId} not found` }); break; }
          if (plan.active === false) { await logStep(node, 'skipped', { reason: 'plan archived' }); break; }
          if (dryRun) { await logStep(node, 'completed', { dryRun: true, plan: plan.name }); break; }
          // Evita duplicar una asignación viva del mismo plan.
          const { data: dup } = await supabaseAdmin
            .from('client_billing').select('id')
            .eq('manager_id', managerId).eq('client_id', ctx.client.id).eq('plan_id', planId)
            .not('status', 'in', '("canceled","void")').maybeSingle();
          if (dup) { await logStep(node, 'skipped', { reason: 'client already on this plan' }); break; }
          try {
            const { assignPlanRow } = await import('./client-billing.js');
            await assignPlanRow(managerId, plan, ctx.client.id, true);
            await logStep(node, 'completed', { plan: plan.name });
          } catch (e: any) {
            await logStep(node, 'failed', { plan: plan.name }, e?.message || String(e));
            status = 'failed'; return { status, steps, ctx };
          }
          break;
        }
        case 'action.send_payment_link': {
          if (!ctx.client?.id) { await logStep(node, 'skipped', { reason: 'no client in context' }); break; }
          if (dryRun) { await logStep(node, 'completed', { dryRun: true }); break; }
          // El cobro abierto más reciente del cliente con enlace de pago.
          const { data: row } = await supabaseAdmin
            .from('client_billing').select('*')
            .eq('manager_id', managerId).eq('client_id', ctx.client.id)
            .not('payment_url', 'is', null)
            .in('status', ['pending', 'past_due', 'active', 'trialing'])
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (!row) { await logStep(node, 'skipped', { reason: 'no open charge with a payment link' }); break; }
          const { error } = await supabaseAdmin.from('messages').insert({
            sender_id: managerId, receiver_id: ctx.client.id, content: '',
            attachment_type: 'payment', attachment_url: row.payment_url,
            payload: { billing_id: row.id, plan_id: row.plan_id, kind: row.kind, amount_cents: row.amount_cents, currency: row.currency, interval: row.interval, description: row.description, status: row.status },
          });
          await logStep(node, error ? 'failed' : 'completed', { billing_id: row.id }, error?.message);
          if (error) { status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.cancel_subscription': {
          if (!ctx.client?.id) { await logStep(node, 'skipped', { reason: 'no client in context' }); break; }
          const atEnd = cfg.when !== 'immediate';
          if (dryRun) { await logStep(node, 'completed', { dryRun: true, atPeriodEnd: atEnd }); break; }
          try {
            const { wfCancelSubscription } = await import('./client-billing.js');
            const r = await wfCancelSubscription(managerId, ctx.client.id, atEnd);
            await logStep(node, r?.error ? 'failed' : (r?.skipped ? 'skipped' : 'completed'), r, r?.error);
            if (r?.error) { status = 'failed'; return { status, steps, ctx }; }
          } catch (e: any) { await logStep(node, 'failed', {}, e?.message); status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.pause_subscription':
        case 'action.resume_subscription': {
          if (!ctx.client?.id) { await logStep(node, 'skipped', { reason: 'no client in context' }); break; }
          const pause = node.key === 'action.pause_subscription';
          if (dryRun) { await logStep(node, 'completed', { dryRun: true, pause }); break; }
          try {
            const { wfSetPause } = await import('./client-billing.js');
            const r = await wfSetPause(managerId, ctx.client.id, pause);
            await logStep(node, r?.error ? 'failed' : (r?.skipped ? 'skipped' : 'completed'), r, r?.error);
            if (r?.error) { status = 'failed'; return { status, steps, ctx }; }
          } catch (e: any) { await logStep(node, 'failed', {}, e?.message); status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.create_promo_code': {
          const planId = String(cfg.plan || '').trim();
          if (!planId) { await logStep(node, 'skipped', { reason: 'no plan selected' }); break; }
          const value = Number(cfg.value);
          if (!Number.isFinite(value) || value <= 0) { await logStep(node, 'skipped', { reason: 'invalid value' }); break; }
          if (dryRun) { await logStep(node, 'completed', { dryRun: true, planId, value }); break; }
          try {
            const { wfCreatePlanPromo } = await import('./client-billing.js');
            const r = await wfCreatePlanPromo(managerId, planId, {
              discountType: cfg.discountType === 'amount' ? 'amount' : 'percent',
              value, duration: cfg.duration, durationInMonths: Number(cfg.durationInMonths) || undefined,
              code: cfg.code ? renderTemplate(String(cfg.code), ctx) : undefined,
            });
            await logStep(node, r?.error ? 'failed' : 'completed', r, r?.error);
            if (r?.error) { status = 'failed'; return { status, steps, ctx }; }
            // Expone el código creado para usarlo en mensajes posteriores.
            if (r?.code) ctx.data.promoCode = r.code;
          } catch (e: any) { await logStep(node, 'failed', {}, e?.message); status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        case 'action.create_charge': {
          if (!ctx.client?.id) { await logStep(node, 'skipped', { reason: 'no client in context' }); break; }
          const amount = Number(cfg.amount);
          if (!Number.isFinite(amount) || amount <= 0) { await logStep(node, 'skipped', { reason: 'invalid amount' }); break; }
          if (dryRun) { await logStep(node, 'completed', { dryRun: true, amount }); break; }
          try {
            const { wfCreateCharge } = await import('./client-billing.js');
            const r = await wfCreateCharge(managerId, ctx.client.id, {
              kind: cfg.kind === 'one_time' ? 'one_time' : 'recurring',
              amount, currency: cfg.currency, interval: cfg.interval,
              description: cfg.description ? renderTemplate(String(cfg.description), ctx) : undefined,
            });
            await logStep(node, r?.error ? 'failed' : 'completed', r, r?.error);
            if (r?.error) { status = 'failed'; return { status, steps, ctx }; }
          } catch (e: any) { await logStep(node, 'failed', {}, e?.message); status = 'failed'; return { status, steps, ctx }; }
          break;
        }
        default:
          await logStep(node, 'skipped', { reason: `unknown node ${node.key}` });
      }
    } catch (err: any) {
      await logStep(node, 'failed', {}, err?.message || String(err));
      return { status: 'failed', steps, ctx };
    }

    // Enqueue downstream nodes.
    for (const e of edges.filter(ed => ed.source === node.id)) {
      if (followHandle === undefined || e.sourceHandle == null || e.sourceHandle === followHandle) {
        queue.push({ nodeId: e.target, handle: e.sourceHandle });
      }
    }

    // A Wait node parks the run for later resumption.
    if (pauseFor > 0) {
      return {
        status: 'waiting', steps, ctx,
        pause: { resumeAt: new Date(Date.now() + pauseFor).toISOString(),
                 queue: [...queue], visited: [...visited] },
      };
    }
  }
  if (count >= MAX_STEPS) status = 'failed';
  return { status, steps, ctx };
}

async function persistRunResult(runId: string, r: LoopResult) {
  if (r.pause) {
    await supabaseAdmin.from('workflow_runs').update({
      status: 'waiting', resume_at: r.pause.resumeAt, context: r.ctx,
      resume_state: { queue: r.pause.queue, visited: r.pause.visited, context: r.ctx },
    }).eq('id', runId);
  } else {
    await supabaseAdmin.from('workflow_runs').update({
      status: r.status, context: r.ctx, resume_at: null, resume_state: null,
      ended_at: new Date().toISOString(),
    }).eq('id', runId);
  }
}

/** Run one workflow version from its trigger. */
export async function executeWorkflowVersion(opts: {
  managerId: string; versionId: string;
  nodes: WorkflowNode[]; edges: WorkflowEdge[];
  triggerType: string; payload: any;
  dryRun?: boolean; dedupeKey?: string;
}): Promise<{ runId: string | null; status: string; steps: any[] }> {
  const { managerId, versionId, nodes, edges, triggerType, payload, dryRun = false, dedupeKey } = opts;
  const ctx = await buildContext(managerId, triggerType, payload);

  let runId: string | null = null;
  if (!dryRun) {
    const { data: run, error } = await supabaseAdmin.from('workflow_runs').insert({
      workflow_version_id: versionId, manager_id: managerId, client_id: payload?.clientId || null,
      trigger_type: triggerType, trigger_payload: payload || {}, status: 'running',
      dedupe_key: dedupeKey || null,
    }).select('id').single();
    if (error) {
      // 23505 = dedupe hit -> this event already produced a run; skip silently.
      if (error.code === '23505') return { runId: null, status: 'skipped', steps: [] };
      throw error;
    }
    runId = run!.id;
  }

  const start = nodes.find(n => n.type === 'trigger');
  if (!start) {
    if (runId) await supabaseAdmin.from('workflow_runs')
      .update({ status: 'failed', error: 'No trigger node', ended_at: new Date().toISOString() })
      .eq('id', runId);
    return { runId, status: 'failed', steps: [] };
  }

  const result = await runLoop({
    managerId, runId, nodes, edges, ctx,
    queue: [{ nodeId: start.id }], visited: new Set<string>(), dryRun,
  });
  if (runId) await persistRunResult(runId, result);
  return { runId, status: result.status, steps: result.steps };
}

/** Resume a single parked ('waiting') run. */
async function resumeWorkflowRun(run: any) {
  try {
    const { data: version } = await supabaseAdmin
      .from('workflow_versions').select('nodes, edges')
      .eq('id', run.workflow_version_id).maybeSingle();
    if (!version) {
      await supabaseAdmin.from('workflow_runs')
        .update({ status: 'failed', error: 'version missing on resume', ended_at: new Date().toISOString() })
        .eq('id', run.id);
      return;
    }
    const st: RunState = run.resume_state || { queue: [], visited: [], context: {} };
    const result = await runLoop({
      managerId: run.manager_id, runId: run.id,
      nodes: version.nodes || [], edges: version.edges || [],
      ctx: st.context || {}, queue: st.queue || [], visited: new Set(st.visited || []),
      dryRun: false,
    });
    await persistRunResult(run.id, result);
  } catch (err) {
    console.error('resumeWorkflowRun failed:', err);
  }
}

/** Cron hook: resume every parked run whose timer has elapsed. */
export async function resumeWaitingWorkflows(): Promise<number> {
  const { data: runs } = await supabaseAdmin
    .from('workflow_runs').select('*')
    .eq('status', 'waiting').lte('resume_at', new Date().toISOString()).limit(200);
  for (const run of runs || []) await resumeWorkflowRun(run);
  return (runs || []).length;
}

/** Fire every enabled published workflow of a manager whose trigger matches an event. */
function shouldRunEventTrigger(triggerKey: string, triggerConfig: any, payload: any): boolean {
  if (triggerKey === 'trigger.weight_change') {
    const delta = Number(payload?.delta);
    if (Number.isFinite(delta)) {
      const minKg = Math.max(0, Number(triggerConfig?.minKg) || 0);
      if (Math.abs(delta) < minKg) return false;
      const direction = triggerConfig?.direction || 'any';
      if (direction === 'gain' && delta <= 0) return false;
      if (direction === 'loss' && delta >= 0) return false;
    }
  }
  return true;
}

export async function runWorkflowsForEvent(managerId: string, triggerKey: string, payload: any) {
  try {
    const versions = await loadPublishedTriggerVersions(managerId);
    for (const v of versions) {
      if (v.triggerKey !== triggerKey) continue;
      if (!shouldRunEventTrigger(triggerKey, v.triggerConfig, payload)) continue;
      // Idempotency: events carrying a stable id only ever produce one run.
      const stableId = payload?.checkinId || payload?.submissionId || payload?.messageId
        || payload?.workoutId || payload?.mealLogId || payload?.mealId || payload?.activityId
        || payload?.billingId || payload?.refundId || payload?.eventId
        || (triggerKey === 'trigger.new_client' ? payload?.clientId : null);
      const dedupeKey = stableId ? `${v.versionId}:${triggerKey}:${stableId}` : undefined;
      await executeWorkflowVersion({
        managerId, versionId: v.versionId, nodes: v.nodes, edges: v.edges,
        triggerType: triggerKey, payload, dedupeKey,
      });
    }
  } catch (err) {
    console.error('runWorkflowsForEvent failed:', err);
  }
}

/** Cron hook: run scheduled workflows once per client, respecting `everyDays`. */
export async function fireScheduledWorkflows(): Promise<number> {
  let fired = 0;
  try {
    const { data: defs } = await supabaseAdmin
      .from('workflow_definitions').select('id, manager_id, current_version_id').eq('enabled', true);
    const nowDate = new Date();
    const today = nowDate.toISOString().split('T')[0];

    const WEEKDAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayWeekday = WEEKDAY_NAMES[nowDate.getDay()];

    for (const def of defs || []) {
      if (!def.current_version_id) continue;
      const { data: version } = await supabaseAdmin
        .from('workflow_versions').select('id, status, nodes, edges')
        .eq('id', def.current_version_id).maybeSingle();
      if (!version || version.status !== 'published') continue;
      const nodes: WorkflowNode[] = version.nodes || [];
      const trig = nodes.find(n => n.type === 'trigger');
      if (!trig) continue;

      // Only the cron-style triggers fire from this loop.
      const cronTriggers = new Set(['trigger.schedule', 'trigger.day_of_week', 'trigger.client_inactive', 'trigger.birthday', 'trigger.checkin_overdue', 'trigger.renewal_upcoming', 'trigger.trial_ending']);
      if (!cronTriggers.has(trig.key)) continue;

      // trigger.trial_ending: suscripciones en prueba cuyo fin (current_period_end
      // del periodo de prueba) cae dentro de la ventana [hoy, hoy+daysBefore].
      if (trig.key === 'trigger.trial_ending') {
        const daysBefore = Math.max(1, Number(trig.config?.daysBefore) || 3);
        const horizon = new Date(nowDate.getTime() + daysBefore * 86400000).toISOString();
        const { data: rows } = await supabaseAdmin
          .from('client_billing')
          .select('id, client_id, plan_id, description, amount_cents, currency, interval, status, payment_url, current_period_end')
          .eq('manager_id', def.manager_id)
          .eq('kind', 'recurring')
          .eq('status', 'trialing')
          .not('current_period_end', 'is', null)
          .gte('current_period_end', nowDate.toISOString())
          .lte('current_period_end', horizon);
        for (const row of rows || []) {
          const res = await executeWorkflowVersion({
            managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
            triggerType: 'trigger.trial_ending',
            payload: {
              clientId: row.client_id, billingId: row.id, planName: row.description,
              amountCents: row.amount_cents, currency: row.currency, interval: row.interval,
              subscriptionStatus: row.status, paymentUrl: row.payment_url, renewalDate: row.current_period_end,
            },
            dedupeKey: `${version.id}:trigger.trial_ending:${row.id}:${String(row.current_period_end).slice(0, 10)}`,
          });
          if (res.status !== 'skipped') fired++;
        }
        continue;
      }

      // trigger.renewal_upcoming: suscripciones activas cuya renovación cae
      // dentro de la ventana [hoy, hoy+daysBefore]. Deduplica por fecha de
      // renovación para no repetir el aviso en pasadas sucesivas.
      if (trig.key === 'trigger.renewal_upcoming') {
        const daysBefore = Math.max(1, Number(trig.config?.daysBefore) || 3);
        const horizon = new Date(nowDate.getTime() + daysBefore * 86400000).toISOString();
        const { data: rows } = await supabaseAdmin
          .from('client_billing')
          .select('id, client_id, plan_id, description, amount_cents, currency, interval, status, payment_url, current_period_end')
          .eq('manager_id', def.manager_id)
          .eq('kind', 'recurring')
          .in('status', ['active', 'trialing'])
          .not('current_period_end', 'is', null)
          .gte('current_period_end', nowDate.toISOString())
          .lte('current_period_end', horizon);
        for (const row of rows || []) {
          const res = await executeWorkflowVersion({
            managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
            triggerType: 'trigger.renewal_upcoming',
            payload: {
              clientId: row.client_id, billingId: row.id, planName: row.description,
              amountCents: row.amount_cents, currency: row.currency, interval: row.interval,
              subscriptionStatus: row.status, paymentUrl: row.payment_url, renewalDate: row.current_period_end,
            },
            dedupeKey: `${version.id}:trigger.renewal_upcoming:${row.id}:${String(row.current_period_end).slice(0, 10)}`,
          });
          if (res.status !== 'skipped') fired++;
        }
        continue;
      }

      // trigger.day_of_week: skip workflows whose configured weekday isn't today.
      if (trig.key === 'trigger.day_of_week' && trig.config?.day && trig.config.day !== todayWeekday) {
        continue;
      }

      const everyDays = trig.key === 'trigger.schedule'
        ? Math.max(1, Number(trig.config?.everyDays) || 1) : 1;
      const inactiveDays = trig.key === 'trigger.client_inactive'
        ? Math.max(1, Number(trig.config?.days) || 7) : 0;

      // trigger.birthday: fetch only clients whose birthday falls on today (MM-DD).
      if (trig.key === 'trigger.birthday') {
        const { data: allClients } = await supabaseAdmin
          .from('users')
          .select('id, profiles!inner(birthday)')
          .eq('manager_id', def.manager_id)
          .eq('role', 'CLIENT');
        for (const client of allClients || []) {
          const profile: any = Array.isArray((client as any).profiles)
            ? (client as any).profiles[0] : (client as any).profiles;
          if (!profile?.birthday) continue;
          const bday = new Date(profile.birthday);
          if (bday.getUTCMonth() !== nowDate.getUTCMonth() || bday.getUTCDate() !== nowDate.getUTCDate()) continue;
          const res = await executeWorkflowVersion({
            managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
            triggerType: 'trigger.birthday', payload: { clientId: client.id },
            dedupeKey: `${version.id}:trigger.birthday:${client.id}:${today}`,
          });
          if (res.status !== 'skipped') fired++;
        }
        continue;
      }

      // trigger.checkin_overdue: a client whose scheduled check-in day passed
      // (plus a grace period) without a submission since. Deduped per missed
      // week so a workflow only fires once per overdue check-in.
      if (trig.key === 'trigger.checkin_overdue') {
        const graceDays = Math.max(0, Number(trig.config?.graceDays) || 1);
        const WD = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const { data: ovClients } = await supabaseAdmin
          .from('users')
          .select('id, clients_profiles(check_in_day)')
          .eq('manager_id', def.manager_id).eq('role', 'CLIENT');
        for (const client of ovClients || []) {
          const cp: any = Array.isArray((client as any).clients_profiles)
            ? (client as any).clients_profiles[0] : (client as any).clients_profiles;
          const dayName = String(cp?.check_in_day || '').toLowerCase();
          const dayIdx = WD.indexOf(dayName);
          if (dayIdx < 0) continue; // no check-in day configured
          // Date of the most recent past occurrence of the check-in weekday.
          const diff = (nowDate.getDay() - dayIdx + 7) % 7;
          const scheduled = new Date(nowDate);
          scheduled.setDate(scheduled.getDate() - diff);
          scheduled.setHours(0, 0, 0, 0);
          const daysSince = Math.floor((nowDate.getTime() - scheduled.getTime()) / 86400000);
          if (daysSince < graceDays) continue; // still within grace
          // Overdue only if no submission since the scheduled day.
          const { count } = await supabaseAdmin
            .from('client_checkin_submissions').select('id', { count: 'exact', head: true })
            .eq('client_id', client.id).gte('submitted_at', scheduled.toISOString());
          if ((count || 0) > 0) continue; // they submitted — not overdue
          const res = await executeWorkflowVersion({
            managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
            triggerType: 'trigger.checkin_overdue', payload: { clientId: client.id },
            dedupeKey: `${version.id}:trigger.checkin_overdue:${client.id}:${scheduled.toISOString().slice(0,10)}`,
          });
          if (res.status !== 'skipped') fired++;
        }
        continue;
      }

      const { data: clients } = await supabaseAdmin
        .from('users').select('id').eq('manager_id', def.manager_id).eq('role', 'CLIENT');

      for (const client of clients || []) {
        // trigger.client_inactive: fire only if the client has been inactive long enough.
        if (trig.key === 'trigger.client_inactive') {
          const [{ data: ci }, { data: wl }] = await Promise.all([
            supabaseAdmin.from('client_checkin_submissions').select('submitted_at')
              .eq('client_id', client.id).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
            supabaseAdmin.from('workout_logs').select('logged_at')
              .eq('client_id', client.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
          ]);
          const lastDates: number[] = [];
          if (ci?.submitted_at) lastDates.push(new Date(ci.submitted_at).getTime());
          if (wl?.logged_at) lastDates.push(new Date(wl.logged_at).getTime());
          const lastActivity = lastDates.length ? Math.max(...lastDates) : 0;
          const daysSince = lastActivity ? Math.floor((Date.now() - lastActivity) / 86400000) : Number.POSITIVE_INFINITY;
          if (daysSince < inactiveDays) continue;
        }

        // everyDays gap (schedule only): skip if a schedule run happened too recently.
        if (trig.key === 'trigger.schedule' && everyDays > 1) {
          const { data: last } = await supabaseAdmin
            .from('workflow_runs').select('started_at')
            .eq('workflow_version_id', version.id).eq('client_id', client.id)
            .eq('trigger_type', 'trigger.schedule')
            .order('started_at', { ascending: false }).limit(1).maybeSingle();
          if (last && (Date.now() - new Date(last.started_at).getTime()) < everyDays * 86400000) continue;
        }
        const res = await executeWorkflowVersion({
          managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
          triggerType: trig.key, payload: { clientId: client.id },
          dedupeKey: `${version.id}:${trig.key}:${client.id}:${today}`,
        });
        if (res.status !== 'skipped') fired++;
      }
    }
  } catch (err) {
    console.error('fireScheduledWorkflows failed:', err);
  }
  return fired;
}

async function loadPublishedTriggerVersions(managerId: string) {
  const { data: defs } = await supabaseAdmin
    .from('workflow_definitions')
    .select('id, current_version_id').eq('manager_id', managerId).eq('enabled', true);
  const out: { versionId: string; triggerKey: string; triggerConfig: any; nodes: WorkflowNode[]; edges: WorkflowEdge[] }[] = [];
  for (const def of defs || []) {
    if (!def.current_version_id) continue;
    const { data: version } = await supabaseAdmin
      .from('workflow_versions').select('id, status, nodes, edges')
      .eq('id', def.current_version_id).maybeSingle();
    if (!version || version.status !== 'published') continue;
    const nodes: WorkflowNode[] = version.nodes || [];
    const trig = nodes.find(n => n.type === 'trigger');
    if (!trig) continue;
    out.push({ versionId: version.id, triggerKey: trig.key, triggerConfig: trig.config || {}, nodes, edges: version.edges || [] });
  }
  return out;
}

/* ============================================================
 * REST API
 * ============================================================ */

router.get('/catalog', verifyManager, (_req, res) => {
  res.json({ nodes: WORKFLOW_CATALOG, triggers: TRIGGER_KEYS });
});

// Plantillas de fábrica (recetas listas) para activar con un clic.
router.get('/starter-templates', verifyManager, async (req: any, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('language')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const language = profile?.language === 'en' ? 'en' : 'es';
    res.json({ templates: localizeWorkflowStarterTemplates(language) });
  } catch {
    res.json({ templates: localizeWorkflowStarterTemplates('es') });
  }
});

// Real-data option lists for node config dropdowns (configField.source).
// The inspector fetches this once so nodes like "Assign onboarding" let the
// coach pick an actual template instead of typing a name.
router.get('/config-options', verifyManager, async (req: any, res) => {
  try {
    const mid = req.user.id;
    const ownFilter = `manager_id.eq.${mid},manager_id.is.null`;
    const [onb, chk, nut, trn, cli, bill] = await Promise.all([
      supabaseAdmin.from('onboarding_templates').select('id, name').or(ownFilter).order('name'),
      supabaseAdmin.from('checkin_templates').select('id, name').or(ownFilter).order('name'),
      supabaseAdmin.from('nutrition_templates').select('id, name').or(ownFilter).order('name'),
      supabaseAdmin.from('training_templates').select('id, name').or(ownFilter).order('name'),
      supabaseAdmin.from('users').select('id, email, profiles(full_name)')
        .eq('manager_id', mid).eq('role', 'CLIENT'),
      supabaseAdmin.from('billing_plans').select('id, name, amount_cents, currency').eq('manager_id', mid).eq('active', true).order('created_at', { ascending: false }),
    ]);
    const opt = (rows: any[] | null) =>
      (rows || []).map(r => ({ value: r.id, label: r.name || 'Sin nombre' }));
    res.json({
      onboarding_templates: opt(onb.data),
      checkin_templates: opt(chk.data),
      nutrition_templates: opt(nut.data),
      training_templates: opt(trn.data),
      billing_plans: (bill.data || []).map((r: any) => ({
        value: r.id,
        label: `${r.name || 'Plan'} · ${((r.amount_cents || 0) / 100).toLocaleString('es-ES', { style: 'currency', currency: (r.currency || 'eur').toUpperCase() })}`,
      })),
      // assign_plan uses one combined list; value encodes the plan kind.
      plan_templates: [
        ...(nut.data || []).map(r => ({ value: `nutrition:${r.id}`, label: `🥗 ${r.name || 'Sin nombre'}` })),
        ...(trn.data || []).map(r => ({ value: `training:${r.id}`,  label: `🏋 ${r.name || 'Sin nombre'}` })),
      ],
      clients: (cli.data || []).map((c: any) => {
        const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        return { value: c.id, label: p?.full_name || c.email || 'Cliente' };
      }),
    });
  } catch (error: any) {
    console.error('workflows.config-options failed:', error);
    res.status(500).json({ error: safeErr(error) });
  }
});

router.get('/', verifyManager, async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('workflow_definitions')
      .select('*, workflow_versions!workflow_definitions_current_version_fk(status, version_number)')
      .eq('manager_id', req.user.id)
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'updated_at', 'desc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'updated_at'));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/runs/recent', verifyManager, async (req: any, res) => {
  const page = parsePagination(req, { defaultLimit: 50, maxLimit: 200 });
  try {
    let q = supabaseAdmin
      .from('workflow_runs').select('*')
      .eq('manager_id', req.user.id)
      .order('started_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(page.limit + 1);
    q = applyCursor(q, page.cursor, 'started_at', 'desc');
    const { data, error } = await q;
    if (error) throw error;
    res.json(buildPage(data || [], page.limit, 'started_at'));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/runs/:runId', verifyManager, async (req: any, res) => {
  try {
    const { data: run } = await supabaseAdmin
      .from('workflow_runs').select('*')
      .eq('id', req.params.runId).eq('manager_id', req.user.id).maybeSingle();
    if (!run) return res.status(404).json({ error: 'Run not found' });
    const { data: steps } = await supabaseAdmin
      .from('workflow_run_steps').select('*')
      .eq('workflow_run_id', run.id).order('started_at', { ascending: true });
    res.json({ ...run, steps: steps || [] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyManager, async (req: any, res) => {
  try {
    const { name, description, nodes = [], edges = [], trigger = {} } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const { data: def, error: defErr } = await supabaseAdmin
      .from('workflow_definitions')
      .insert({ manager_id: req.user.id, name, description: description || null })
      .select().single();
    if (defErr) throw defErr;
    const { data: version, error: vErr } = await supabaseAdmin
      .from('workflow_versions')
      .insert({ workflow_id: def.id, version_number: 1, status: 'draft', nodes, edges, trigger })
      .select().single();
    if (vErr) throw vErr;
    await supabaseAdmin.from('workflow_definitions')
      .update({ current_version_id: version.id }).eq('id', def.id);
    res.json({ ...def, current_version_id: version.id, current_version: version });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyManager, async (req: any, res) => {
  try {
    const { data: def } = await supabaseAdmin
      .from('workflow_definitions').select('*')
      .eq('id', req.params.id).eq('manager_id', req.user.id).maybeSingle();
    if (!def) return res.status(404).json({ error: 'Workflow not found' });
    const { data: version } = def.current_version_id
      ? await supabaseAdmin.from('workflow_versions').select('*').eq('id', def.current_version_id).maybeSingle()
      : { data: null } as any;
    const { data: runs } = await supabaseAdmin
      .from('workflow_runs').select('id, status, trigger_type, started_at, ended_at')
      .eq('workflow_version_id', def.current_version_id || '00000000-0000-0000-0000-000000000000')
      .order('started_at', { ascending: false }).limit(10);
    res.json({ ...def, current_version: version, recent_runs: runs || [] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyManager, async (req: any, res) => {
  try {
    const { data: def } = await supabaseAdmin
      .from('workflow_definitions').select('*')
      .eq('id', req.params.id).eq('manager_id', req.user.id).maybeSingle();
    if (!def) return res.status(404).json({ error: 'Workflow not found' });

    const body = req.body || {};
    if (body.name !== undefined || body.description !== undefined || body.enabled !== undefined) {
      const upd: any = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) upd.name = body.name;
      if (body.description !== undefined) upd.description = body.description;
      if (body.enabled !== undefined) upd.enabled = body.enabled;
      await supabaseAdmin.from('workflow_definitions').update(upd).eq('id', def.id);
    }

    let version: any = null;
    if (ALLOWED_VERSION_FIELDS.some(f => body[f] !== undefined)) {
      const { data: current } = def.current_version_id
        ? await supabaseAdmin.from('workflow_versions').select('*').eq('id', def.current_version_id).maybeSingle()
        : { data: null } as any;
      const patch: any = {};
      for (const f of ALLOWED_VERSION_FIELDS) if (body[f] !== undefined) patch[f] = body[f];

      if (current && current.status === 'draft') {
        const { data: upd } = await supabaseAdmin.from('workflow_versions')
          .update(patch).eq('id', current.id).select().single();
        version = upd;
      } else {
        const nextNum = (current?.version_number || 0) + 1;
        const { data: created } = await supabaseAdmin.from('workflow_versions').insert({
          workflow_id: def.id, version_number: nextNum, status: 'draft',
          nodes: patch.nodes ?? current?.nodes ?? [],
          edges: patch.edges ?? current?.edges ?? [],
          trigger: patch.trigger ?? current?.trigger ?? {},
        }).select().single();
        version = created;
        await supabaseAdmin.from('workflow_definitions')
          .update({ current_version_id: created!.id }).eq('id', def.id);
      }
    }
    res.json({ ok: true, current_version: version });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyManager, async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin.from('workflow_definitions')
      .delete().eq('id', req.params.id).eq('manager_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/validate', verifyManager, async (req: any, res) => {
  try {
    res.json(validateWorkflow(req.body?.nodes || [], req.body?.edges || []));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Publish: validate, mark current version published, enable the workflow.
// Plan-gated: the manager's tier caps how many workflows can be enabled at once.
router.post('/:id/publish', verifyManager, enforceWorkflowLimit, async (req: any, res) => {
  try {
    const { data: def } = await supabaseAdmin
      .from('workflow_definitions').select('*')
      .eq('id', req.params.id).eq('manager_id', req.user.id).maybeSingle();
    if (!def || !def.current_version_id) return res.status(404).json({ error: 'Workflow not found' });
    const { data: version } = await supabaseAdmin
      .from('workflow_versions').select('*').eq('id', def.current_version_id).maybeSingle();
    if (!version) return res.status(404).json({ error: 'Version not found' });

    const check = validateWorkflow(version.nodes || [], version.edges || []);
    if (!check.ok) return res.status(400).json({ error: 'Validation failed', ...check });

    await supabaseAdmin.from('workflow_versions')
      .update({ status: 'published', published_at: new Date().toISOString() }).eq('id', version.id);
    await supabaseAdmin.from('workflow_definitions')
      .update({ enabled: true, updated_at: new Date().toISOString() }).eq('id', def.id);
    res.json({ ok: true, warnings: check.warnings });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Unpublish / disable a workflow without deleting it.
router.post('/:id/unpublish', verifyManager, async (req: any, res) => {
  try {
    const { data: def } = await supabaseAdmin
      .from('workflow_definitions').select('*')
      .eq('id', req.params.id).eq('manager_id', req.user.id).maybeSingle();
    if (!def) return res.status(404).json({ error: 'Workflow not found' });
    await supabaseAdmin.from('workflow_definitions')
      .update({ enabled: false, updated_at: new Date().toISOString() }).eq('id', def.id);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Run now. ?dryRun=1 (or body.dryRun) skips side effects.
router.post('/:id/run', verifyManager, async (req: any, res) => {
  try {
    const { data: def } = await supabaseAdmin
      .from('workflow_definitions').select('*')
      .eq('id', req.params.id).eq('manager_id', req.user.id).maybeSingle();
    if (!def || !def.current_version_id) return res.status(404).json({ error: 'Workflow not found' });
    const { data: version } = await supabaseAdmin
      .from('workflow_versions').select('*').eq('id', def.current_version_id).maybeSingle();
    if (!version) return res.status(404).json({ error: 'Version not found' });

    const dryRun = req.query.dryRun === '1' || req.body?.dryRun === true;
    const check = validateWorkflow(version.nodes || [], version.edges || []);
    if (!check.ok) return res.status(400).json({ error: 'Validation failed', ...check });

    const triggerNode = (version.nodes || []).find((n: WorkflowNode) => n.type === 'trigger');
    const result = await executeWorkflowVersion({
      managerId: req.user.id, versionId: version.id,
      nodes: version.nodes || [], edges: version.edges || [],
      triggerType: triggerNode?.key || 'trigger.manual',
      payload: { ...(req.body?.triggerPayload || {}), clientId: req.body?.clientId },
      dryRun,
    });
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
