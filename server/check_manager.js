
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
  console.log('--- Checking Profiles Schema ---');
  const { data: profiles, error: err } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (err) console.error('Error:', err);
  else if (profiles && profiles.length > 0) {
    console.log('Profile columns:', Object.keys(profiles[0]));
  } else {
    console.log('No profiles found');
  }
}

check();
