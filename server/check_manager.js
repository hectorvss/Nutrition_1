
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const clientId = 'd6d95f63-687b-4f2b-8a63-d530cc6df24f';
  console.log('--- Checking Check-ins for Client:', clientId, '---');
  const { data: checkins, error: err } = await supabase
    .from('check_ins')
    .select('*')
    .eq('client_id', clientId);
  
  if (err) console.error('Error:', err);
  else {
    console.log(`Found ${checkins.length} check-ins`);
    console.table(checkins);
  }
}

check();
