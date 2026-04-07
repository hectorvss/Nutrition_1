require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const tables = ['foods', 'exercises', 'recipes', 'supplements', 'nutrition_templates', 'training_templates'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`Table ${table} check error:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`Table ${table} columns:`, Object.keys(data[0]).join(', '));
      } else {
        console.log(`Table ${table} is empty, column check skipped.`);
      }
    } catch (err) {
      console.log(`Table ${table} exception:`, err.message);
    }
  }
}

checkSchema();
