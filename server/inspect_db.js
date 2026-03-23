import { supabaseAdmin } from './db/index.js';

async function inspect() {
  console.log('--- Inspecting Users ---');
  const { data: users, error: userErr } = await supabaseAdmin
    .from('users')
    .select('id, email, manager_id, role');

  if (userErr) {
    console.error('User Error:', userErr);
  } else {
    console.log(JSON.stringify(users, null, 2));
  }

  console.log('--- Inspecting Check-ins ---');
  const { data: checkins, error: ciErr } = await supabaseAdmin
    .from('check_ins')
    .select('id, client_id, date');

  if (ciErr) {
    console.error('Check-in Error:', ciErr);
  } else {
    console.log(JSON.stringify(checkins, null, 2));
  }
}

inspect();
