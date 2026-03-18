import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('id, email').limit(2);
  console.log('Users Data:', data);
  if (error) {
    console.error('Users Error:', error);
  }
}

checkUsers();
