import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { verifyManager } from '../middleware/auth.js';
import { parsePagination, buildPage, applyCursor } from '../lib/pagination.js';

const router = Router();

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
  { type: 'action', key: 'action.create_task', label: 'Create task', category: 'Actions',
    icon: 'ListTodo', description: 'Create a task for the manager.',
    configFields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'type', label: 'Type', type: 'text' },
    ] },
] as const;

const CATALOG_BY_KEY = new Map<string, any>(WORKFLOW_CATALOG.map(n => [n.key, n]));
const TRIGGER_KEYS = WORKFLOW_CATALOG.filter(n => n.type === 'trigger').map(n => n.key);

// ---- Helpers -----------------------------------------------
function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function renderTemplate(text: string, ctx: any): string {
  if (!text) return '';
  const client = ctx.client || {};
  const firstName = (client.full_name || 'there').split(' ')[0];
  return String(text)
    .replace(/{First Name}/g, firstName)
    .replace(/{Client Name}/g, client.full_name || 'there')
    .replace(/{Coach Name}/g, ctx.coachName || 'your coach')
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
  }
  return { ok: errors.length === 0, errors, warnings };
}

// ---- Executor ----------------------------------------------
async function buildContext(managerId: string, triggerType: string, payload: any) {
  const ctx: any = { trigger: { type: triggerType, ...payload }, data: {}, client: null };
  const { data: mgrProfile } = await supabaseAdmin
    .from('profiles').select('full_name').eq('user_id', managerId).maybeSingle();
  ctx.coachName = mgrProfile?.full_name || 'your coach';

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
          await logStep(node, 'completed', { trigger: node.key });
          break;

        case 'flow.if': {
          const left = getByPath(ctx, cfg.field);
          const result = compare(left, cfg.operator, cfg.value);
          followHandle = result ? 'true' : 'false';
          await logStep(node, 'completed', { field: cfg.field, left, operator: cfg.operator, value: cfg.value, result });
          break;
        }
        case 'flow.switch': {
          const val = getByPath(ctx, cfg.field);
          followHandle = val == null ? 'default' : String(val);
          await logStep(node, 'completed', { field: cfg.field, value: val });
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
        case 'action.create_task': {
          if (dryRun) {
            await logStep(node, 'completed', { dryRun: true, title: cfg.title });
          } else {
            const { error } = await insertWithRetry('tasks', {
              manager_id: managerId, client_id: ctx.client?.id || null,
              title: renderTemplate(cfg.title || 'Workflow task', ctx),
              type: cfg.type || 'workflow', date: new Date().toISOString().split('T')[0],
              time: '09:00', status: 'pending' });
            await logStep(node, error ? 'failed' : 'completed', { title: cfg.title }, error?.message);
            if (error) { status = 'failed'; return { status, steps, ctx }; }
          }
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
export async function runWorkflowsForEvent(managerId: string, triggerKey: string, payload: any) {
  try {
    const versions = await loadPublishedTriggerVersions(managerId);
    for (const v of versions) {
      if (v.triggerKey !== triggerKey) continue;
      // Idempotency: events carrying a stable id only ever produce one run.
      const stableId = payload?.checkinId || payload?.messageId
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
    const today = new Date().toISOString().split('T')[0];

    for (const def of defs || []) {
      if (!def.current_version_id) continue;
      const { data: version } = await supabaseAdmin
        .from('workflow_versions').select('id, status, nodes, edges')
        .eq('id', def.current_version_id).maybeSingle();
      if (!version || version.status !== 'published') continue;
      const nodes: WorkflowNode[] = version.nodes || [];
      const trig = nodes.find(n => n.type === 'trigger');
      if (!trig || trig.key !== 'trigger.schedule') continue;
      const everyDays = Math.max(1, Number(trig.config?.everyDays) || 1);

      const { data: clients } = await supabaseAdmin
        .from('users').select('id').eq('manager_id', def.manager_id).eq('role', 'CLIENT');

      for (const client of clients || []) {
        // everyDays gap: skip if a schedule run happened too recently.
        if (everyDays > 1) {
          const { data: last } = await supabaseAdmin
            .from('workflow_runs').select('started_at')
            .eq('workflow_version_id', version.id).eq('client_id', client.id)
            .eq('trigger_type', 'trigger.schedule')
            .order('started_at', { ascending: false }).limit(1).maybeSingle();
          if (last && (Date.now() - new Date(last.started_at).getTime()) < everyDays * 86400000) continue;
        }
        const res = await executeWorkflowVersion({
          managerId: def.manager_id, versionId: version.id, nodes, edges: version.edges || [],
          triggerType: 'trigger.schedule', payload: { clientId: client.id },
          dedupeKey: `${version.id}:schedule:${client.id}:${today}`,
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
  const out: { versionId: string; triggerKey: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }[] = [];
  for (const def of defs || []) {
    if (!def.current_version_id) continue;
    const { data: version } = await supabaseAdmin
      .from('workflow_versions').select('id, status, nodes, edges')
      .eq('id', def.current_version_id).maybeSingle();
    if (!version || version.status !== 'published') continue;
    const nodes: WorkflowNode[] = version.nodes || [];
    const trig = nodes.find(n => n.type === 'trigger');
    if (!trig) continue;
    out.push({ versionId: version.id, triggerKey: trig.key, nodes, edges: version.edges || [] });
  }
  return out;
}

/* ============================================================
 * REST API
 * ============================================================ */

router.get('/catalog', verifyManager, (_req, res) => {
  res.json({ nodes: WORKFLOW_CATALOG, triggers: TRIGGER_KEYS });
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
router.post('/:id/publish', verifyManager, async (req: any, res) => {
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
