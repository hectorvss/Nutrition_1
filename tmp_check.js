import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkExercises() {
  const { data, error } = await supabase.from('exercises').select('id, name').limit(2);
  console.log('Data:', data);
  if (error) {
    console.error('Error:', error);
  }
}

checkExercises();
