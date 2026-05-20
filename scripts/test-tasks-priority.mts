// End-to-end test: la prioridad sale del form -> backend -> BD -> GET back.
// Cubre el bug del ticket: "Y cuando se crea un evento, y se le da a crear
// la prioridad, hay que asegurarse de que en tareas aparece en la categoría
// correspondiente a dicha prioridad."
//
// Requiere backend corriendo en localhost:3006 y un manager seed en BD.
// Run: npx tsx scripts/test-tasks-priority.mts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:3006/api';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

let pass = 0, fail = 0;
const taskIds: string[] = [];

const check = (name: string, ok: boolean, extra?: string) => {
  if (ok) { pass++; console.log('  PASS ', name, extra ? `(${extra})` : ''); }
  else    { fail++; console.log('  FAIL ', name, extra ? `(${extra})` : ''); }
};

async function findOrCreateSeedManager(): Promise<{ id: string; token: string }> {
  const email = 'prio-test-mgr@nutrition1.test';
  const password = 'PrioTestPass123!';
  // Try to sign in first
  const sb = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!);
  let session = await sb.auth.signInWithPassword({ email, password });
  if (session.error || !session.data?.session) {
    // Create the manager
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { role: 'MANAGER' }
    });
    if (error) throw error;
    await supabaseAdmin.from('users').update({ role: 'MANAGER' }).eq('id', created.user!.id);
    session = await sb.auth.signInWithPassword({ email, password });
  }
  return { id: session.data.session!.user.id, token: session.data.session!.access_token };
}

async function run() {
  console.log('=== Tasks priority round-trip test ===\n');
  const { id: mgrId, token } = await findOrCreateSeedManager();
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // ─── Test 1: POST /tasks con priority='high' persiste correctamente ───
  console.log('[1] POST /tasks con priority');
  const today = new Date().toISOString().slice(0, 10);

  const highRes = await fetch(`${API}/manager/tasks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'Prio test HIGH', description: 'high priority task',
      type: 'Check-in', date: today, time: '10:00', end_time: '11:00',
      duration: '1h', status: 'pending', priority: 'high',
    })
  });
  const highTask = await highRes.json();
  if (highTask?.id) taskIds.push(highTask.id);
  check('POST 200', highRes.status === 200, `status=${highRes.status}`);
  check('priority=high persistido en BD', highTask?.priority === 'high', `got=${highTask?.priority}`);

  const medRes = await fetch(`${API}/manager/tasks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'Prio test MED', type: 'Call', date: today, time: '11:00',
      end_time: '12:00', duration: '1h', priority: 'medium',
    })
  });
  const medTask = await medRes.json();
  if (medTask?.id) taskIds.push(medTask.id);
  check('priority=medium persistido', medTask?.priority === 'medium', `got=${medTask?.priority}`);

  const lowRes = await fetch(`${API}/manager/tasks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'Prio test LOW', type: 'Admin', date: today, time: '12:00',
      end_time: '13:00', duration: '1h', priority: 'low',
    })
  });
  const lowTask = await lowRes.json();
  if (lowTask?.id) taskIds.push(lowTask.id);
  check('priority=low persistido', lowTask?.priority === 'low', `got=${lowTask?.priority}`);

  // ─── Test 2: tareas sin priority -> default 'medium' ───
  console.log('\n[2] POST /tasks sin priority -> default medium');
  const noPrioRes = await fetch(`${API}/manager/tasks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'No prio', type: 'Admin', date: today, time: '13:00',
      end_time: '14:00', duration: '1h',
    })
  });
  const noPrioTask = await noPrioRes.json();
  if (noPrioTask?.id) taskIds.push(noPrioTask.id);
  check('sin priority -> default "medium"', noPrioTask?.priority === 'medium', `got=${noPrioTask?.priority}`);

  // ─── Test 3: priority invalida -> ¿que pasa? El POST no valida explicit;
  //     deberia caer en fallback 'medium' (logica del handler). ───
  console.log('\n[3] POST con priority invalida -> fallback medium');
  const badPrioRes = await fetch(`${API}/manager/tasks`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      title: 'Bad prio', type: 'Admin', date: today, time: '14:00',
      end_time: '15:00', duration: '1h', priority: 'urgente',  // valor invalido
    })
  });
  const badPrioTask = await badPrioRes.json();
  if (badPrioTask?.id) taskIds.push(badPrioTask.id);
  check('priority invalida -> fallback medium', badPrioTask?.priority === 'medium', `got=${badPrioTask?.priority}`);

  // ─── Test 4: PATCH /tasks/:id cambia la prioridad ───
  console.log('\n[4] PATCH /tasks/:id cambia priority');
  const patchRes = await fetch(`${API}/manager/tasks/${highTask.id}`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ priority: 'low' })
  });
  const patched = await patchRes.json();
  check('PATCH 200', patchRes.status === 200, `status=${patchRes.status}`);
  check('priority actualizada a "low"', patched?.priority === 'low', `got=${patched?.priority}`);

  // ─── Test 5: PATCH con priority invalida -> 400 ───
  console.log('\n[5] PATCH con priority invalida -> 400');
  const badPatchRes = await fetch(`${API}/manager/tasks/${highTask.id}`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ priority: 'CRITICAL' })
  });
  check('priority invalida -> 400', badPatchRes.status === 400, `status=${badPatchRes.status}`);

  // ─── Test 6: GET /manager/tasks devuelve el campo priority ───
  console.log('\n[6] GET /manager/tasks expone priority');
  const listRes = await fetch(`${API}/manager/tasks?limit=200`, { headers: H });
  const listResp: any = await listRes.json();
  const list: any[] = Array.isArray(listResp) ? listResp : listResp?.data || [];
  const found = list.find((t: any) => t.id === medTask.id);
  check('GET incluye campo priority', found?.priority === 'medium', `got=${found?.priority}`);
  const high = list.find((t: any) => t.id === highTask.id);
  check('PATCH reflejado en GET (priority=low)', high?.priority === 'low', `got=${high?.priority}`);

  // ─── Test 7: la columna priority sigue siendo valida en BD ───
  console.log('\n[7] CHECK constraint de BD');
  const { error: badInsertErr } = await supabaseAdmin
    .from('tasks')
    .insert({
      manager_id: mgrId, title: 'direct BD insert', date: today,
      priority: 'extreme', // no esta en el enum
    });
  check('BD rechaza priority fuera del enum', badInsertErr !== null,
        badInsertErr ? `code=${badInsertErr.code}` : 'no error (unexpected)');

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===\n`);
  return fail === 0 ? 0 : 1;
}

async function cleanup() {
  if (taskIds.length > 0) {
    await supabaseAdmin.from('tasks').delete().in('id', taskIds);
  }
  console.log('Cleanup done.');
}

run().then(code => cleanup().then(() => process.exit(code)))
     .catch(err => { console.error('TEST CRASHED:', err); cleanup().then(() => process.exit(1)); });
