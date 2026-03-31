import { supabaseAdmin } from './db/index.js';

async function checkStatus() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, status')
    .ilike('status', 'Archived');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Archived Users:', JSON.stringify(data, null, 2));
  }
}

checkStatus();
