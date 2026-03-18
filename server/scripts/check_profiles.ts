import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProfiles() {
  const { data, error } = await supabaseAdmin
    .from('clients_profiles')
    .select('*');
  
  if (error) console.error('Error:', error);
  else console.log('Profiles:', JSON.stringify(data, null, 2));
}

checkProfiles();
