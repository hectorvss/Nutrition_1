import { supabaseAdmin } from './db/index.js';

async function testFetch() {
  const managerId = '544dcaef-3a55-4f29-9e03-5a6bd490c236';

  const { data: clients, error } = await supabaseAdmin
    .from('users')
    .select(`
        id, 
        email, 
        created_at,
        clients_profiles (weight, goal, notes, temp_password),
        nutrition_plans (id),
        training_programs (id),
        check_ins (id, date, reviewed_at)
    `)
    .eq('manager_id', managerId)
    .eq('role', 'CLIENT');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Formatted clients output:');
    const formatted = clients.map((c: any) => ({
      id: c.id,
      email: c.email,
      profiles_count: c.clients_profiles?.length,
      check_ins_count: c.check_ins?.length,
      first_check_in_id: c.check_ins?.[0]?.id
    }));
    console.log(JSON.stringify(formatted, null, 2));
  }
}

testFetch();
