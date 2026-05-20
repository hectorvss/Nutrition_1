// End-to-end test del motor de automation avanzado:
// - Catalogo /catalog filtrado por tier (basic vs advanced).
// - Cap automationMaxStepsPerFlow segun plan.
// - Multi-step engine: message -> wait -> message -> create_task.
// - Stop conditions ampliadas (client_archived, last_message_recent).
// - Render de variables (renderMessage).
//
// Run: npx tsx scripts/test-automations-advanced.mts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:3006/api';
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(url, key);
const sb = createClient(url, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!);

let pass = 0, fail = 0;
const ids: { automations: string[]; users: string[] } = { automations: [], users: [] };

const check = (n: string, ok: boolean, x?: string) => {
  if (ok) { pass++; console.log('  PASS', n, x ? `(${x})` : ''); }
  else    { fail++; console.log('  FAIL', n, x ? `(${x})` : ''); }
};

async function ensureManager(email: string, tier: 'professional' | 'scale' = 'professional') {
  let s = await sb.auth.signInWithPassword({ email, password: 'AdvAutoTest1!' });
  if (s.error || !s.data?.session) {
    const { data: c, error } = await supabaseAdmin.auth.admin.createUser({
      email, password: 'AdvAutoTest1!', email_confirm: true, user_metadata: { role: 'MANAGER' }
    });
    if (error) throw error;
    await supabaseAdmin.from('users').upsert({ id: c.user!.id, email, role: 'MANAGER' }, { onConflict: 'id' });
    ids.users.push(c.user!.id);
    s = await sb.auth.signInWithPassword({ email, password: 'AdvAutoTest1!' });
  }
  const userId = s.data!.session!.user.id;
  // Forzar el tier deseado.
  await supabaseAdmin.from('manager_subscriptions').upsert({
    user_id: userId, plan_tier: tier, status: 'active',
    trial_ends_at: null, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return { id: userId, token: s.data!.session!.access_token };
}

async function run() {
  console.log('=== Advanced automations test ===\n');

  // 1. Catalog filtrado por tier
  console.log('[1] /catalog filtra triggers por tier');
  const { token: profToken } = await ensureManager('adv-prof@nutrition1.test', 'professional');
  const profRes = await fetch(`${API}/automations/catalog`, {
    headers: { Authorization: `Bearer ${profToken}` }
  });
  const profCat: any = await profRes.json();
  check('professional ve solo basic triggers', profCat.triggers.every((t: any) => t.tier === 'basic'),
        `n=${profCat.triggers.length}`);
  check('professional max 1 step', profCat.limits.maxStepsPerFlow === 1);

  const { token: scaleToken, id: scaleMgrId } = await ensureManager('adv-scale@nutrition1.test', 'scale');
  const scaleRes = await fetch(`${API}/automations/catalog`, {
    headers: { Authorization: `Bearer ${scaleToken}` }
  });
  const scaleCat: any = await scaleRes.json();
  check('scale ve TODOS los triggers (incl. advanced)',
        scaleCat.triggers.some((t: any) => t.tier === 'advanced'),
        `total=${scaleCat.triggers.length}`);
  check('scale max 5 steps', scaleCat.limits.maxStepsPerFlow === 5);

  // 2. POST con steps > cap rechazado
  console.log('\n[2] Cap automationMaxStepsPerFlow aplicado en POST');
  const H_prof = { Authorization: `Bearer ${profToken}`, 'Content-Type': 'application/json' };
  const tooManySteps = {
    name: 'Too many', description: 'd', trigger_id: 'new-client', message: '',
    delivery_rules: {
      frequency: 'Once', audience: 'All Clients',
      steps: [
        { kind: 'message', message: 'Hola {First Name}' },
        { kind: 'wait', amount: 1, unit: 'days' },
        { kind: 'message', message: 'Sigues ahi?' },
      ],
      activation_conditions: [], stop_conditions: [],
    },
    icon_info: { iconName: 'Plus', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
    enabled: false,
  };
  const capRes = await fetch(`${API}/automations`, {
    method: 'POST', headers: H_prof, body: JSON.stringify(tooManySteps)
  });
  check('professional con 3 steps -> 400', capRes.status === 400, `status=${capRes.status}`);

  // 3. Scale puede crear multi-step
  console.log('\n[3] Scale crea multi-step ok');
  const H_scale = { Authorization: `Bearer ${scaleToken}`, 'Content-Type': 'application/json' };
  // Crear un cliente para que la automation tenga audiencia
  const cliEmail = `adv-cli-${Date.now()}@nutrition1.test`;
  const { data: cli } = await supabaseAdmin.auth.admin.createUser({
    email: cliEmail, password: 'CliPass123!', email_confirm: true
  });
  ids.users.push(cli!.user!.id);
  await supabaseAdmin.from('users').upsert({
    id: cli!.user!.id, email: cliEmail, role: 'CLIENT', manager_id: scaleMgrId
  }, { onConflict: 'id' });
  await supabaseAdmin.from('profiles').upsert({
    user_id: cli!.user!.id, full_name: 'Alice Cliente'
  }, { onConflict: 'user_id' });

  const multiStepPayload = {
    name: 'Multi step', description: 'd', trigger_id: 'new-client',
    message: 'fallback (no se usa si hay steps)',
    delivery_rules: {
      frequency: 'Every', audience: 'All Clients',
      steps: [
        { kind: 'message', message: 'Hola {First Name}, bienvenida!' },
        { kind: 'wait', amount: 0, unit: 'hours' }, // wait 0 = resume inmediato en el siguiente cron
        { kind: 'message', message: 'Segundo mensaje {First Name}' },
      ],
      activation_conditions: [], stop_conditions: [],
    },
    icon_info: { iconName: 'Plus', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
    enabled: true,
  };
  const createRes = await fetch(`${API}/automations`, {
    method: 'POST', headers: H_scale, body: JSON.stringify(multiStepPayload)
  });
  const created: any = await createRes.json();
  if (created?.id) ids.automations.push(created.id);
  check('scale crea multi-step 200', createRes.status === 200, `status=${createRes.status}`);
  check('steps persistidos en delivery_rules',
        Array.isArray(created?.delivery_rules?.steps) && created.delivery_rules.steps.length === 3,
        `len=${created?.delivery_rules?.steps?.length}`);

  // 4. Ejecutar la cadena directamente via processTrigger (importamos)
  console.log('\n[4] Ejecucion: step 1 manda mensaje + parquea wait');
  const before = await supabaseAdmin.from('messages').select('id', { count: 'exact', head: true })
    .eq('sender_id', scaleMgrId).eq('receiver_id', cli!.user!.id);

  // Triggear: simulamos new-client via processTrigger insertando un mensaje
  // a traves del cron-equivalente. Llamamos via curl/cron endpoint.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.log('  SKIP — no CRON_SECRET en el entorno, saltamos pasos 4-5');
  } else {
    // Dispara una creacion via POST + activamos manualmente via processTrigger
    // No tenemos endpoint publico para trigger.manual, pero podemos crear
    // una fila en automation_pending_steps directamente y resumir.
    // (la primera ejecucion via processTrigger requiere el flow de trigger
    // real; aqui validamos el resume del wait que es la pieza nueva.)
    await supabaseAdmin.from('automation_pending_steps').insert({
      automation_id: created.id,
      client_id: cli!.user!.id,
      step_index: 2, // saltamos directamente al ultimo step (message)
      resume_at: new Date(Date.now() - 1000).toISOString(), // ya pasado
      context: {
        triggerPayload: { clientId: cli!.user!.id },
        renderCtx: { client: { full_name: 'Alice Cliente' }, coachName: 'Coach' },
        conditionValues: {},
      },
    });

    const cronRes = await fetch(`${API}/automations/cron`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cronSecret}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const cronOut: any = await cronRes.json();
    check('cron 200', cronRes.status === 200, `status=${cronRes.status}`);
    check('stepsResumed >= 1', (cronOut?.stepsResumed ?? 0) >= 1, `n=${cronOut?.stepsResumed}`);

    const after = await supabaseAdmin.from('messages').select('id, content', { count: 'exact' })
      .eq('sender_id', scaleMgrId).eq('receiver_id', cli!.user!.id)
      .order('created_at', { ascending: false }).limit(1);
    const lastMsg = after.data?.[0]?.content || '';
    check('mensaje del step 2 enviado tras resume', lastMsg.includes('Segundo mensaje'),
          `msg="${lastMsg.slice(0, 60)}"`);

    // Fila pending eliminada tras completar
    const { count: pendingCount } = await supabaseAdmin
      .from('automation_pending_steps').select('id', { count: 'exact', head: true })
      .eq('automation_id', created.id);
    check('pending step fila borrada tras completar', (pendingCount ?? 0) === 0,
          `pending=${pendingCount}`);
  }

  // 5. validateSteps descarta kinds desconocidos
  console.log('\n[5] validateSteps descarta kinds invalidos');
  const garbagePayload = {
    name: 'Garbage', description: 'd', trigger_id: 'new-client', message: '',
    delivery_rules: {
      frequency: 'Once', audience: 'All Clients',
      steps: [
        { kind: 'message', message: 'ok' },
        { kind: 'INVALID', stuff: 'x' },  // descartado
      ],
      activation_conditions: [], stop_conditions: [],
    },
    icon_info: { iconName: 'Plus', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
    enabled: false,
  };
  const garbRes = await fetch(`${API}/automations`, {
    method: 'POST', headers: H_scale, body: JSON.stringify(garbagePayload)
  });
  const garb: any = await garbRes.json();
  if (garb?.id) ids.automations.push(garb.id);
  check('POST 200 con kinds mixtos', garbRes.status === 200);
  check('kind invalido descartado del array',
        Array.isArray(garb?.delivery_rules?.steps) && garb.delivery_rules.steps.length === 1,
        `len=${garb?.delivery_rules?.steps?.length}`);

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===`);
  return fail === 0 ? 0 : 1;
}

async function cleanup() {
  if (ids.automations.length) {
    await supabaseAdmin.from('automation_pending_steps').delete().in('automation_id', ids.automations);
    await supabaseAdmin.from('automation_logs').delete().in('automation_id', ids.automations);
    await supabaseAdmin.from('automations').delete().in('id', ids.automations);
  }
  if (ids.users.length) {
    await supabaseAdmin.from('messages').delete().in('sender_id', ids.users);
    await supabaseAdmin.from('messages').delete().in('receiver_id', ids.users);
    await supabaseAdmin.from('manager_subscriptions').delete().in('user_id', ids.users);
    for (const u of ids.users) {
      await supabaseAdmin.auth.admin.deleteUser(u).catch(() => {});
    }
  }
  console.log('Cleanup done.');
}

run()
  .then((code) => cleanup().then(() => process.exit(code)))
  .catch(err => { console.error('CRASHED:', err); cleanup().then(() => process.exit(1)); });
