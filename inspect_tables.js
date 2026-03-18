
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  console.log('Inspecting nutrition_master_plans columns...');
  // We can't easily get full schema via anon key if RLS is on, but we can try to guess or use a dummy insert error
  // Better: try to get the first row if any, or use a system query if permitted.
  
  const { data, error } = await supabase
    .from('nutrition_master_plans')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from nutrition_master_plans:', error);
  } else {
    console.log('Existing row sample:', data);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    }
  }

  // Also check if there are related tables like nutrition_master_plan_meals
  const relatedTables = [
    'nutrition_master_plan_meals',
    'nutrition_master_plan_meal_foods',
    'nutrition_master_plan_general_blocks'
  ];

  for (const table of relatedTables) {
    const { error: tError } = await supabase.from(table).select('id').limit(1);
    if (tError) {
      if (tError.code === '42P01') {
        console.log(`Table ${table} does not exist.`);
      } else {
        console.log(`Table ${table} error: ${tError.message}`);
      }
    } else {
      console.log(`Table ${table} exists.`);
    }
  }
}

inspectTable();
