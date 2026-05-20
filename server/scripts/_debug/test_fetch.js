import { supabaseAdmin } from './db/index.js';

async function test() {
  console.log('--- Inspecting ALL Check-ins with User Info ---');
  const { data: checkins, error } = await supabaseAdmin
    .from('check_ins')
    .select('id, client_id, reviewed_at, users!inner(manager_id, name, email)');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(checkins, null, 2));
  }
}

test();
