import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
);

async function migrate() {
  console.log('Running Phase 7 Migration...');
  const { error } = await supabaseAdmin.rpc('exec_sql', {
    sql_query: `
      -- 1. Update checkin_templates
      ALTER TABLE checkin_templates ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

      -- 2. Update client_checkin_submissions
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS template_version INT;
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS template_snapshot_json JSONB;
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS coach_notes TEXT;
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS next_week_focus TEXT;
      ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    `
  });

  if (error) {
    console.error('Migration error:', error);
  } else {
    console.log('Migration successful!');
  }
}

migrate();
