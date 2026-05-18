/**
 * End-to-end integration test for the automations module.
 * Creates real (temporary) manager + client data in Supabase, exercises
 * processTrigger across every code path, and cleans everything up.
 *
 * Run:  npx tsx scripts/test-automations.ts
 */
import { supabaseAdmin, supabase } from '../server/db/index.js';
import { processTrigger } from '../server/routes/automations.js';

const API = process.env.TEST_API_URL || 'http://localhost:3006/api';
const TEST_PW = 'Test12345!';

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, extra = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${extra ? ' -> ' + extra : ''}`); }
}

const TAG = `auto-test-${Date.now()}`;
let managerId = '';
let clientId = '';
let otherClientId = '';
let seedMgrId = '';
const automationIds: string[] = [];

async function createUser(email: string, role: 'MANAGER' | 'CLIENT', manager?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password: 'Test12345!', email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  const id = data.user.id;
  // A DB trigger may auto-create the public.users row on auth signup -> upsert.
  const { error: uErr } = await supabaseAdmin.from('users').upsert({
    id, email, role, manager_id: manager || null, status: 'Active',
  }, { onConflict: 'id' });
  if (uErr) throw new Error(`users upsert ${email}: ${uErr.message}`);
  return id;
}

async function countMessages() {
  const { count } = await supabaseAdmin
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', managerId).eq('receiver_id', clientId);
  return count || 0;
}

async function lastMessage() {
  const { data } = await supabaseAdmin
    .from('messages').select('content')
    .eq('sender_id', managerId).eq('receiver_id', clientId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data?.content || '';
}

async function newAutomation(triggerId: string, message: string, rules: any) {
  const { data, error } = await supabaseAdmin.from('automations').insert({
    manager_id: managerId, name: `${TAG}-${triggerId}`, description: 't',
    trigger_id: triggerId, message, delivery_rules: rules, enabled: true,
    icon_info: { iconName: 'Plus', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
  }).select().single();
  if (error) throw new Error(`automation insert: ${error.message}`);
  automationIds.push(data.id);
  return data.id;
}

async function setup() {
  managerId = await createUser(`${TAG}-mgr@example.com`, 'MANAGER');
  clientId = await createUser(`${TAG}-cli@example.com`, 'CLIENT', managerId);
  otherClientId = await createUser(`${TAG}-cli2@example.com`, 'CLIENT', managerId);

  const pErr = (await supabaseAdmin.from('profiles').upsert([
    { user_id: managerId, full_name: 'Coach Carter' },
    { user_id: clientId, full_name: 'Alex Client', birthday: '1990-01-15' },
    { user_id: otherClientId, full_name: 'Sam Other' },
  ], { onConflict: 'user_id' })).error;
  if (pErr) throw new Error(`profiles upsert: ${pErr.message}`);
  const cpErr = (await supabaseAdmin.from('clients_profiles').upsert([
    { user_id: clientId, weight: 80, goal: 'lose', height: 180,
      goal_weight: 75, check_in_day: 'Monday', last_login: new Date().toISOString() },
    { user_id: otherClientId, weight: 60, goal_weight: 65 },
  ], { onConflict: 'user_id' })).error;
  if (cpErr) throw new Error(`clients_profiles upsert: ${cpErr.message}`);
  // Latest check-in: weight 80 (data_json), mood 2, rpe 9.
  await supabaseAdmin.from('check_ins').insert({
    client_id: clientId, date: new Date().toISOString().split('T')[0],
    data_json: { weight: 80, mood: 2, rpe: 9 },
  });
}

async function run() {
  console.log(`\n=== Automations E2E test (${TAG}) ===\n`);
  await setup();

  // ---- Test 1: schema sanity — the queries that used to reference missing columns
  console.log('[1] Schema: processTrigger / cron client queries resolve');
  const q1 = await supabaseAdmin.from('users')
    .select('id, profiles(full_name), clients_profiles(goal_weight, check_in_day, last_login)')
    .eq('id', clientId).single();
  check('processTrigger client query has no column/embed error', !q1.error, q1.error?.message);
  const q2 = await supabaseAdmin.from('users')
    .select('id, email, created_at, profiles (full_name, birthday), clients_profiles (last_login, check_in_day, height, weight, goal)')
    .eq('manager_id', managerId).eq('role', 'CLIENT');
  check('cron client query has no column/embed error', !q2.error, q2.error?.message);

  // ---- Test 2: Once automation sends exactly once
  console.log('[2] "Once" frequency + placeholder replacement + dedup');
  const onceId = await newAutomation('new-client',
    'Welcome {First Name}! Coach {Coach Name}, weight {Current Weight}/{Goal Weight}.',
    { frequency: 'Once', audience: 'All Clients', activation_conditions: [], stop_conditions: [] });
  const before = await countMessages();
  await processTrigger(managerId, 'new-client', { clientId });
  const after1 = await countMessages();
  check('Once automation sent 1 message', after1 - before === 1, `delta=${after1 - before}`);
  const msg = await lastMessage();
  check('placeholders replaced', msg === 'Welcome Alex! Coach Coach Carter, weight 80/75.', msg);
  await processTrigger(managerId, 'new-client', { clientId });
  const after2 = await countMessages();
  check('Once automation NOT re-sent (dedup via once_deliveries)', after2 === after1, `count=${after2}`);
  const { count: odCount } = await supabaseAdmin.from('automation_once_deliveries')
    .select('automation_id', { count: 'exact', head: true })
    .eq('automation_id', onceId).eq('client_id', clientId);
  check('once_delivery row recorded', odCount === 1, `count=${odCount}`);
  const { count: logCount } = await supabaseAdmin.from('automation_logs')
    .select('id', { count: 'exact', head: true }).eq('automation_id', onceId);
  check('automation_logs row recorded', logCount === 1, `count=${logCount}`);

  // ---- Test 3: activation condition that PASSES (weight 80 > Target 75)
  console.log('[3] Activation condition — pass and fail paths');
  const passId = await newAutomation('milestone', 'cond-pass',
    { frequency: 'Every', audience: 'All Clients',
      activation_conditions: [{ type: 'weight', operator: '>', value: 'Target', enabled: true }],
      stop_conditions: [] });
  let b = await countMessages();
  await processTrigger(managerId, 'milestone', { clientId });
  check('activation condition met (80 > 75) -> sent', (await countMessages()) - b === 1);

  // condition that FAILS (weight 80 > 200)
  const failId = await newAutomation('milestone', 'cond-fail',
    { frequency: 'Every', audience: 'All Clients',
      activation_conditions: [{ type: 'weight', operator: '>', value: '200', enabled: true }],
      stop_conditions: [] });
  // disable the passing one so only failId is evaluated
  await supabaseAdmin.from('automations').update({ enabled: false }).eq('id', passId);
  b = await countMessages();
  await processTrigger(managerId, 'milestone', { clientId });
  check('activation condition not met (80 > 200) -> NOT sent', (await countMessages()) === b);
  await supabaseAdmin.from('automations').update({ enabled: false }).eq('id', failId);

  // ---- Test 4: stop condition
  console.log('[4] Stop condition');
  const stopId = await newAutomation('milestone', 'stop-test',
    { frequency: 'Every', audience: 'All Clients', activation_conditions: [],
      stop_conditions: [{ type: 'weight_goal', operator: '<=', value: 'Target', enabled: true }] });
  // client weight 80 > goal 75 -> stop NOT met -> should send
  b = await countMessages();
  await processTrigger(managerId, 'milestone', { clientId });
  check('stop condition not met (80<=75 false) -> sent', (await countMessages()) - b === 1);
  // now move weight below goal -> stop met -> should NOT send
  await supabaseAdmin.from('check_ins').insert({
    client_id: clientId, date: new Date().toISOString().split('T')[0],
    data_json: { weight: 70 },
  });
  b = await countMessages();
  await processTrigger(managerId, 'milestone', { clientId });
  check('stop condition met (70<=75 true) -> NOT sent', (await countMessages()) === b);
  await supabaseAdmin.from('automations').update({ enabled: false }).eq('id', stopId);

  // ---- Test 5: Specific Clients audience filtering
  console.log('[5] Audience = Specific Clients');
  const specId = await newAutomation('milestone', 'spec-test',
    { frequency: 'Every', audience: 'Specific Clients', selected_client_ids: [otherClientId],
      activation_conditions: [], stop_conditions: [] });
  // Event for a client NOT in the selected list -> nothing delivered.
  b = await countMessages();
  await processTrigger(managerId, 'milestone', { clientId });
  check('client not in selected list -> NOT sent', (await countMessages()) === b);
  // Event for a client IN the selected list -> delivered.
  await processTrigger(managerId, 'milestone', { clientId: otherClientId });
  const { count: otherMsgs } = await supabaseAdmin.from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', managerId).eq('receiver_id', otherClientId);
  check('selected client received message', (otherMsgs || 0) === 1, `count=${otherMsgs}`);
  await supabaseAdmin.from('automations').update({ enabled: false }).eq('id', specId);

  // ---- Test 6: HTTP CRUD flow (seeding + create + update + delete)
  console.log('[6] HTTP CRUD: seeding, create, update, delete');
  // Fresh manager with zero automations -> GET must seed the 7 defaults.
  seedMgrId = await createUser(`${TAG}-seedmgr@example.com`, 'MANAGER');
  await supabaseAdmin.from('profiles').upsert(
    { user_id: seedMgrId, full_name: 'Seed Manager' }, { onConflict: 'user_id' });
  const signIn = await supabase.auth.signInWithPassword({
    email: `${TAG}-seedmgr@example.com`, password: TEST_PW });
  const token = signIn.data.session?.access_token || '';
  check('manager sign-in returns token', !!token, signIn.error?.message);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const getRes = await fetch(`${API}/automations`, { headers: authHeaders });
  const seeded = getRes.ok ? await getRes.json() : [];
  check('GET /automations returns 200 (no upsert/onConflict 500)', getRes.status === 200,
    `status=${getRes.status}`);
  check('GET seeds 7 default automations for a new manager',
    Array.isArray(seeded) && seeded.length === 7, `count=${seeded?.length}`);

  const postRes = await fetch(`${API}/automations`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({
      name: 'CRUD Test', description: 'd', trigger_id: 'custom',
      message: 'hi {First Name}',
      delivery_rules: { frequency: 'Once', audience: 'All Clients',
        activation_conditions: [], stop_conditions: [] },
      icon_info: { iconName: 'Plus', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
      enabled: true,
      manager_id: '00000000-0000-0000-0000-000000000000', // must be ignored server-side
    }),
  });
  const created = postRes.ok ? await postRes.json() : null;
  if (created?.id) automationIds.push(created.id);
  check('POST /automations creates automation', postRes.status === 200 && !!created?.id,
    `status=${postRes.status}`);
  check('POST ignores client-supplied manager_id (set server-side)',
    created?.manager_id === seedMgrId, `manager_id=${created?.manager_id}`);

  const putRes = await fetch(`${API}/automations/${created?.id}`, {
    method: 'PUT', headers: authHeaders, body: JSON.stringify({ enabled: false }) });
  const updated = putRes.ok ? await putRes.json() : null;
  check('PUT /automations/:id updates automation', putRes.status === 200 && updated?.enabled === false,
    `status=${putRes.status}`);

  const delRes = await fetch(`${API}/automations/${created?.id}`, {
    method: 'DELETE', headers: authHeaders });
  check('DELETE /automations/:id removes automation', delRes.status === 200, `status=${delRes.status}`);
  const getRes2 = await fetch(`${API}/automations`, { headers: authHeaders });
  const after = getRes2.ok ? await getRes2.json() : [];
  check('deleted automation no longer listed',
    Array.isArray(after) && !after.some((a: any) => a.id === created?.id));

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===\n`);
}

async function cleanup() {
  const ids = [clientId, otherClientId, managerId, seedMgrId].filter(Boolean);
  await supabaseAdmin.from('automation_once_deliveries').delete().in('automation_id', automationIds);
  await supabaseAdmin.from('automation_logs').delete().in('automation_id', automationIds);
  // remove every automation owned by the test managers (incl. seeded defaults)
  await supabaseAdmin.from('automations').delete().in('manager_id', [managerId, seedMgrId].filter(Boolean));
  await supabaseAdmin.from('automations').delete().in('id', automationIds);
  await supabaseAdmin.from('messages').delete().or(`sender_id.in.(${ids.join(',')}),receiver_id.in.(${ids.join(',')})`);
  await supabaseAdmin.from('check_ins').delete().in('client_id', ids);
  await supabaseAdmin.from('clients_profiles').delete().in('user_id', ids);
  await supabaseAdmin.from('profiles').delete().in('user_id', ids);
  await supabaseAdmin.from('users').delete().in('id', ids);
  for (const id of ids) {
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
  }
  console.log('Cleanup done.');
}

run()
  .catch(e => { console.error('TEST CRASHED:', e); fail++; })
  .finally(async () => {
    await cleanup().catch(e => console.error('cleanup error:', e));
    process.exit(fail > 0 ? 1 : 0);
  });
