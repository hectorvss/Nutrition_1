
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResources() {
  console.log('Checking for nutrition_master_plans table...');
  const { error: tableError } = await supabase
    .from('nutrition_master_plans')
    .select('id')
    .limit(1);

  if (tableError) {
    if (tableError.code === '42P01') {
      console.log('Table nutrition_master_plans does not exist.');
    } else {
      console.error('Error checking table:', tableError);
    }
  } else {
    console.log('Table nutrition_master_plans exists.');
  }

  const foodNames = [
    'Greek Yogurt 0%', 'Oats', 'Blueberries', 'Almond Butter',
    'Skyr 0%', 'Apple', 'Almonds', 'Chicken Breast', 'White Rice cooked',
    'Broccoli', 'Olive Oil', 'Whey Protein', 'Banana', 'Salmon',
    'Potato boiled or baked', 'Zucchini'
  ];

  console.log('\nChecking for foods:');
  for (const name of foodNames) {
    const { data, error } = await supabase
      .from('foods')
      .select('id, name, protein, carbs, fats, calories')
      .ilike('name', `%${name}%`);

    if (error) {
       console.error(`Error searching for ${name}:`, error);
    } else if (data && data.length > 0) {
      console.log(`Found ${data.length} matches for "${name}":`);
      data.forEach(f => console.log(`  - [${f.id}] ${f.name} (P:${f.protein} C:${f.carbs} F:${f.fats} Kcal:${f.calories})`));
    } else {
      console.log(`No matches for "${name}"`);
    }
  }
}

checkResources();
