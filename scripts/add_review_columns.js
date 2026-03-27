const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('Adding coach_notes and next_week_focus to client_checkin_submissions...');
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS coach_notes TEXT;
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS next_week_focus TEXT;
    `
  });

  if (error) {
    if (error.message.includes('function exec_sql(text) does not exist')) {
        console.log('exec_sql RPC not found, trying query via client.from... (might fail if no specific route)');
        // Fallback or just error out since I can't run raw SQL easily without RPC or psql
        console.error('Migration failed: No way to run raw SQL. Please run manually: ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS coach_notes TEXT; ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS next_week_focus TEXT;');
    } else {
        console.error('Migration error:', error);
    }
  } else {
    console.log('Migration successful!');
  }
}

migrate();
