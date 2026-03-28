import { supabaseAdmin } from './server/db/index.js';

async function checkTables() {
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_templates')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
       console.error('Error checking onboarding_templates:', error);
    } else {
       console.log('onboarding_templates exists, count:', data);
    }
  } catch (err) {
    console.error('Crash checking tables:', err);
  }
}

checkTables();
