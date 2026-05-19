/**
 * End-to-end check of the nutrition + training plan flows.
 * Run:  TEST_API_URL=https://nutrition-1-zeta.vercel.app/api npx tsx scripts/test-plan-flows.ts
 *       (or default localhost:3006/api with the dev server up)
 */
import { supabaseAdmin, supabase } from '../server/db/index.js';

const API = process.env.TEST_API_URL || 'http://localhost:3006/api';
const TEST_PW = 'Test12345!';
const TAG = `flow-test-${Date.now()}`;

let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${extra ? ' -> ' + extra : ''}`); }
}

let managerId = '', clientId = '';

async function createUser(email: string, role: 'MANAGER' | 'CLIENT', manager?: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password: TEST_PW, email_confirm: true });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  const id = data.user.id;
  await supabaseAdmin.from('users').upsert(
    { id, email, role, manager_id: manager || null, status: 'Active' }, { onConflict: 'id' });
  return id;
}

async function run() {
  console.log(`\n=== Plan flows test (${TAG}) — API: ${API} ===\n`);
  managerId = await createUser(`${TAG}-mgr@example.com`, 'MANAGER');
  clientId = await createUser(`${TAG}-cli@example.com`, 'CLIENT', managerId);
  await supabaseAdmin.from('profiles').upsert([
    { user_id: managerId, full_name: 'Coach Flow' },
    { user_id: clientId, full_name: 'Flow Client' },
  ], { onConflict: 'user_id' });
  await supabaseAdmin.from('clients_profiles').upsert(
    { user_id: clientId, goal: 'Muscle Gain' }, { onConflict: 'user_id' });

  const signIn = await supabase.auth.signInWithPassword({
    email: `${TAG}-mgr@example.com`, password: TEST_PW });
  const token = signIn.data.session?.access_token || '';
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  check('manager sign-in', !!token, signIn.error?.message);

  // [1] Templates load (the 500-bug fix)
  console.log('[1] Templates load');
  const nt = await fetch(`${API}/manager/nutrition-templates`, { headers: H });
  const ntData = nt.ok ? await nt.json() : [];
  check('GET nutrition-templates 200', nt.status === 200, `status=${nt.status}`);
  check('nutrition templates seeded (>=8)', Array.isArray(ntData) && ntData.length >= 8, `count=${ntData?.length}`);
  const tt = await fetch(`${API}/manager/training-templates`, { headers: H });
  const ttData = tt.ok ? await tt.json() : [];
  check('GET training-templates 200', tt.status === 200, `status=${tt.status}`);
  check('training templates seeded (>=8)', Array.isArray(ttData) && ttData.length >= 8, `count=${ttData?.length}`);

  // [2] Assign a nutrition plan to the client (the ON CONFLICT bug fix)
  console.log('[2] Assign + edit nutrition plan');
  const firstTpl = ntData[0];
  const npRes = await fetch(`${API}/manager/clients/${clientId}/nutrition-plan`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: firstTpl?.name || 'Plan', data_json: firstTpl?.data_json || {} }) });
  check('POST nutrition-plan (assign) 200', npRes.status === 200, `status=${npRes.status}`);
  const npGet = await fetch(`${API}/manager/clients/${clientId}/nutrition-plan`, { headers: H });
  const npGetData = npGet.ok ? await npGet.json() : null;
  check('GET nutrition-plan returns the assigned plan', !!npGetData?.data_json);
  // edit (re-save) — must not error on the unique constraint
  const npEdit = await fetch(`${API}/manager/clients/${clientId}/nutrition-plan`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: 'Plan editado', data_json: { ...(npGetData?.data_json || {}), edited: true } }) });
  check('re-save nutrition plan (edit) 200 — no ON CONFLICT error', npEdit.status === 200, `status=${npEdit.status}`);

  // [3] Assign + edit a training program
  console.log('[3] Assign + edit training program');
  const firstTt = ttData[0];
  const tpRes = await fetch(`${API}/manager/clients/${clientId}/training-program`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: firstTt?.name || 'Programa', data_json: firstTt?.data_json || {} }) });
  check('POST training-program (assign) 200', tpRes.status === 200, `status=${tpRes.status}`);
  const tpEdit = await fetch(`${API}/manager/clients/${clientId}/training-program`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: 'Programa editado', data_json: { edited: true } }) });
  check('re-save training program (edit) 200 — no ON CONFLICT error', tpEdit.status === 200, `status=${tpEdit.status}`);

  // [4] Template CRUD (nutrition)
  console.log('[4] Nutrition template create / edit / delete');
  const createRes = await fetch(`${API}/manager/nutrition-templates`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ name: `${TAG}-tpl`, description: 'd', target_calories: 2100,
      data_json: { type: 'template', macros: { p: 30, c: 45, f: 25 }, meals: [] } }) });
  const created = createRes.ok ? await createRes.json() : null;
  check('POST nutrition-template (create) 200', createRes.status === 200 && !!created?.id, `status=${createRes.status}`);
  const tplId = created?.key || created?.id;
  const putRes = await fetch(`${API}/manager/nutrition-templates/${tplId}`, {
    method: 'PUT', headers: H, body: JSON.stringify({ target_calories: 2222 }) });
  check('PUT nutrition-template (edit) 200', putRes.status === 200, `status=${putRes.status}`);
  const delRes = await fetch(`${API}/manager/nutrition-templates/${tplId}`, { method: 'DELETE', headers: H });
  check('DELETE nutrition-template 200', delRes.status === 200, `status=${delRes.status}`);

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===\n`);
}

async function cleanup() {
  const ids = [managerId, clientId].filter(Boolean);
  await supabaseAdmin.from('nutrition_plans').delete().in('client_id', ids);
  await supabaseAdmin.from('training_programs').delete().in('client_id', ids);
  await supabaseAdmin.from('nutrition_templates').delete().like('name', `${TAG}%`);
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
