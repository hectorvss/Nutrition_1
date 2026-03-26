import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  console.log('Checking "roadmaps" table...');
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Table check failed:', error.message);
    if (error.message.includes('relation "roadmaps" does not exist')) {
      console.log('SUGGESTION: Run the migration 20260326_create_roadmaps.sql');
    }
  } else {
    console.log('Table "roadmaps" exists. Rows found:', data.length);
  }
}

checkTable();
