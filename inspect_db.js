import { supabaseAdmin } from './server/db/index.ts';

async function inspect() {
  console.log('--- DB INSPECTION: Managers & Profiles ---');
  try {
    const { data: managers, error: mgrError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('role', 'MANAGER');
    
    if (mgrError) {
      console.error('Manager Select Error:', mgrError);
    } else {
      console.log('Managers:', managers.map(m => m.email).join(', '));
      
      for (const m of managers) {
        // Try to find a profile with a password or similar
        const { data: prof, error: pError } = await supabaseAdmin
          .from('managers_profiles') // Assumed table name
          .select('*')
          .eq('user_id', m.id);
        
        if (!pError && prof.length > 0) {
          console.log(`- Profile for ${m.email}:`, prof[0]);
        }
      }
    }
  } catch (err) {
    console.error('Inspection CRASH:', err.message);
  }
}

inspect();
