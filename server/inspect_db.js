import { supabaseAdmin } from './db/index.js';

async function inspect() {
  const { data: cols, error } = await supabaseAdmin
    .from('check_ins')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching check_ins:', error);
  } else {
    console.log('Check-in sample:', JSON.stringify(cols[0], null, 2));
  }

  const { data: userCols, error: userErr } = await supabaseAdmin
    .from('users')
    .select('*')
    .limit(1);

  if (userErr) {
    console.error('Error fetching users:', userErr);
  } else {
    console.log('User sample:', JSON.stringify(userCols[0], null, 2));
  }
}

inspect();
