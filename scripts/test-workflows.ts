/**
 * Integration test for the Advanced Workflow engine + REST API.
 * Run:  npx tsx scripts/test-workflows.ts   (backend must be up on :3006)
 */
import { supabaseAdmin, supabase } from '../server/db/index.js';
import {
  executeWorkflowVersion, validateWorkflow,
  resumeWaitingWorkflows, fireScheduledWorkflows,
} from '../server/routes/workflows.js';

const API = process.env.TEST_API_URL || 'http://localhost:3006/api';
const TEST_PW = 'Test12345!';
const TAG = `wf-test-${Date.now()}`;

let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${extra ? ' -> ' + extra : ''}`); }
}

let managerId = '', clientId = '';
const wfIds: string[] = [];

async function createUser(email: string, role: 'MANAGER' | 'CLIENT', manager?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password: TEST_PW, email_confirm: true });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  const id = data.user.id;
  const { error: uErr } = await supabaseAdmin.from('users').upsert(
    { id, email, role, manager_id: manager || null, status: 'Active' }, { onConflict: 'id' });
  if (uErr) throw new Error(`users upsert: ${uErr.message}`);
  return id;
}

async function countMessages() {
  const { count } = await supabaseAdmin.from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', managerId).eq('receiver_id', clientId);
  return count || 0;
}

// trigger.manual -> flow.if(client.weight > threshold) --true--> send_message
function graph(threshold: string) {
  const nodes = [
    { id: 't1', type: 'trigger', key: 'trigger.manual', label: 'Manual' },
    { id: 'c1', type: 'condition', key: 'flow.if', label: 'If',
      config: { field: 'client.weight', operator: '>', value: threshold } },
    { id: 'a1', type: 'action', key: 'action.send_message', label: 'Send',
      config: { message: 'Hi {First Name}, weight check.' } },
  ];
  const edges = [
    { id: 'e1', source: 't1', target: 'c1' },
    { id: 'e2', source: 'c1', target: 'a1', sourceHandle: 'true' },
  ];
  return { nodes, edges };
}

async function run() {
  console.log(`\n=== Workflow engine test (${TAG}) ===\n`);
  managerId = await createUser(`${TAG}-mgr@example.com`, 'MANAGER');
  clientId = await createUser(`${TAG}-cli@example.com`, 'CLIENT', managerId);
  await supabaseAdmin.from('profiles').upsert([
    { user_id: managerId, full_name: 'Coach Mike' },
    { user_id: clientId, full_name: 'Dana Client' },
  ], { onConflict: 'user_id' });
  await supabaseAdmin.from('clients_profiles').upsert(
    { user_id: clientId, weight: 80, goal_weight: 75 }, { onConflict: 'user_id' });

  // [1] validation
  console.log('[1] Graph validation');
  const g = graph('75');
  const okCheck = validateWorkflow(g.nodes as any, g.edges as any);
  check('valid graph passes validation', okCheck.ok, okCheck.errors.join(';'));
  const badCheck = validateWorkflow([{ id: 'x', type: 'action', key: 'action.send_message' }] as any, []);
  check('graph with no trigger fails validation', !badCheck.ok);

  // [2] executor — condition TRUE path sends a message
  console.log('[2] Executor — condition true/false');
  let before = await countMessages();
  const r1 = await executeWorkflowVersion({
    managerId, versionId: await makeVersion(g.nodes, g.edges),
    nodes: g.nodes as any, edges: g.edges as any,
    triggerType: 'trigger.manual', payload: { clientId },
  });
  check('run completed', r1.status === 'completed', r1.status);
  check('condition true (80>75) -> message sent', (await countMessages()) - before === 1);

  // [3] executor — condition FALSE path skips
  const g2 = graph('200');
  before = await countMessages();
  const r2 = await executeWorkflowVersion({
    managerId, versionId: await makeVersion(g2.nodes, g2.edges),
    nodes: g2.nodes as any, edges: g2.edges as any,
    triggerType: 'trigger.manual', payload: { clientId },
  });
  check('condition false (80>200) -> no message', (await countMessages()) === before, r2.status);

  // [4] dry-run does not send
  before = await countMessages();
  await executeWorkflowVersion({
    managerId, versionId: await makeVersion(g.nodes, g.edges),
    nodes: g.nodes as any, edges: g.edges as any,
    triggerType: 'trigger.manual', payload: { clientId }, dryRun: true,
  });
  check('dry-run -> no message persisted', (await countMessages()) === before);

  // [5] HTTP API: create -> update -> publish -> run
  console.log('[5] REST API CRUD + publish + run');
  const signIn = await supabase.auth.signInWithPassword({
    email: `${TAG}-mgr@example.com`, password: TEST_PW });
  const token = signIn.data.session?.access_token || '';
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const catRes = await fetch(`${API}/workflows/catalog`, { headers: H });
  const cat = catRes.ok ? await catRes.json() : {};
  check('GET /catalog returns node types', Array.isArray(cat.nodes) && cat.nodes.length >= 10,
    `count=${cat.nodes?.length}`);

  const postRes = await fetch(`${API}/workflows`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: 'Test WF', description: 'd' }) });
  const created = postRes.ok ? await postRes.json() : null;
  if (created?.id) wfIds.push(created.id);
  check('POST /workflows creates definition + draft', !!created?.id && !!created?.current_version_id);

  const putRes = await fetch(`${API}/workflows/${created.id}`, {
    method: 'PUT', headers: H,
    body: JSON.stringify({ nodes: g.nodes, edges: g.edges, trigger: { type: 'trigger.manual' } }) });
  check('PUT /workflows/:id saves graph to draft', putRes.status === 200);

  const pubRes = await fetch(`${API}/workflows/${created.id}/publish`, { method: 'POST', headers: H });
  check('POST /:id/publish succeeds on a valid graph', pubRes.status === 200, `status=${pubRes.status}`);

  before = await countMessages();
  const runRes = await fetch(`${API}/workflows/${created.id}/run`, {
    method: 'POST', headers: H, body: JSON.stringify({ clientId }) });
  const runOut = runRes.ok ? await runRes.json() : null;
  check('POST /:id/run executes the workflow', runRes.status === 200 && runOut?.status === 'completed',
    `status=${runRes.status}`);
  check('run via API sent the message', (await countMessages()) - before === 1);

  const runsRes = await fetch(`${API}/workflows/runs/recent`, { headers: H });
  const runs = runsRes.ok ? await runsRes.json() : [];
  check('GET /runs/recent lists the run', Array.isArray(runs) && runs.length >= 1);

  // [6] Durable delay — Wait node parks the run, cron resumes it
  console.log('[6] Durable delay (Wait) + resume');
  const delayNodes = [
    { id: 't1', type: 'trigger', key: 'trigger.manual', label: 'Manual' },
    { id: 'd1', type: 'flow', key: 'flow.delay', label: 'Wait', config: { amount: 2, unit: 'hours' } },
    { id: 'a1', type: 'action', key: 'action.send_message', label: 'Send',
      config: { message: 'Delayed hi {First Name}' } },
  ];
  const delayEdges = [
    { id: 'e1', source: 't1', target: 'd1' },
    { id: 'e2', source: 'd1', target: 'a1' },
  ];
  const delayVer = await makeVersion(delayNodes, delayEdges);
  before = await countMessages();
  const dr = await executeWorkflowVersion({
    managerId, versionId: delayVer, nodes: delayNodes as any, edges: delayEdges as any,
    triggerType: 'trigger.manual', payload: { clientId } });
  check('Wait node parks the run as "waiting"', dr.status === 'waiting', dr.status);
  check('message NOT sent while waiting', (await countMessages()) === before);
  // simulate the timer elapsing
  await supabaseAdmin.from('workflow_runs')
    .update({ resume_at: new Date(Date.now() - 1000).toISOString() }).eq('id', dr.runId!);
  const resumedCount = await resumeWaitingWorkflows();
  check('resumeWaitingWorkflows picked up the run', resumedCount >= 1, `count=${resumedCount}`);
  check('message sent after resume', (await countMessages()) - before === 1);
  const { data: finishedRun } = await supabaseAdmin.from('workflow_runs')
    .select('status').eq('id', dr.runId!).maybeSingle();
  check('resumed run is now completed', finishedRun?.status === 'completed', finishedRun?.status);

  // [7] Idempotency — same dedupe key never runs twice
  console.log('[7] Idempotency (dedupe key)');
  const idemVer = await makeVersion(graph('75').nodes, graph('75').edges);
  before = await countMessages();
  const k = `test-dedupe-${TAG}`;
  const i1 = await executeWorkflowVersion({
    managerId, versionId: idemVer, nodes: graph('75').nodes as any, edges: graph('75').edges as any,
    triggerType: 'trigger.manual', payload: { clientId }, dedupeKey: k });
  const i2 = await executeWorkflowVersion({
    managerId, versionId: idemVer, nodes: graph('75').nodes as any, edges: graph('75').edges as any,
    triggerType: 'trigger.manual', payload: { clientId }, dedupeKey: k });
  check('first run with dedupe key executes', i1.status === 'completed', i1.status);
  check('second run with same key is skipped', i2.status === 'skipped', i2.status);
  check('dedupe prevented the duplicate message', (await countMessages()) - before === 1);

  // [8] Scheduled workflows fan out per client
  console.log('[8] Scheduled workflows');
  const schedNodes = [
    { id: 't1', type: 'trigger', key: 'trigger.schedule', label: 'Schedule', config: { everyDays: 1 } },
    { id: 'a1', type: 'action', key: 'action.send_message', label: 'Send',
      config: { message: 'Scheduled ping {First Name}' } },
  ];
  const schedEdges = [{ id: 'e1', source: 't1', target: 'a1' }];
  await makeVersion(schedNodes, schedEdges); // makeVersion publishes + enables the definition
  before = await countMessages();
  await fireScheduledWorkflows();
  check('scheduled workflow delivered to the client', (await countMessages()) - before >= 1);
  before = await countMessages();
  await fireScheduledWorkflows();
  check('scheduled workflow not re-fired same day (dedupe)', (await countMessages()) === before);

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===\n`);
}

async function makeVersion(nodes: any, edges: any) {
  const { data: def } = await supabaseAdmin.from('workflow_definitions')
    .insert({ manager_id: managerId, name: `${TAG}-direct`, enabled: true }).select('id').single();
  wfIds.push(def!.id);
  const { data: v } = await supabaseAdmin.from('workflow_versions')
    .insert({ workflow_id: def!.id, status: 'published', nodes, edges, trigger: {} })
    .select('id').single();
  await supabaseAdmin.from('workflow_definitions')
    .update({ current_version_id: v!.id }).eq('id', def!.id);
  return v!.id;
}

async function cleanup() {
  const ids = [managerId, clientId].filter(Boolean);
  for (const wf of wfIds) {
    const { data: vs } = await supabaseAdmin.from('workflow_versions').select('id').eq('workflow_id', wf);
    for (const v of vs || []) {
      const { data: rs } = await supabaseAdmin.from('workflow_runs').select('id').eq('workflow_version_id', v.id);
      for (const r of rs || [])
        await supabaseAdmin.from('workflow_run_steps').delete().eq('workflow_run_id', r.id);
      await supabaseAdmin.from('workflow_runs').delete().eq('workflow_version_id', v.id);
    }
    await supabaseAdmin.from('workflow_definitions').update({ current_version_id: null }).eq('id', wf);
    await supabaseAdmin.from('workflow_versions').delete().eq('workflow_id', wf);
    await supabaseAdmin.from('workflow_definitions').delete().eq('id', wf);
  }
  await supabaseAdmin.from('messages').delete()
    .or(`sender_id.in.(${ids.join(',')}),receiver_id.in.(${ids.join(',')})`);
  await supabaseAdmin.from('check_ins').delete().in('client_id', ids);
  await supabaseAdmin.from('clients_profiles').delete().in('user_id', ids);
  await supabaseAdmin.from('profiles').delete().in('user_id', ids);
  await supabaseAdmin.from('users').delete().in('id', ids);
  for (const id of ids) await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
  console.log('Cleanup done.');
}

run()
  .catch(e => { console.error('TEST CRASHED:', e); fail++; })
  .finally(async () => {
    await cleanup().catch(e => console.error('cleanup error:', e));
    process.exit(fail > 0 ? 1 : 0);
  });
