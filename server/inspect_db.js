import { supabaseAdmin } from './db/index.js';

async function inspect() {
  const managerId = '544dcaef-3a55-4f29-9e03-5a6bd490c236'; // From previous inspect

  console.log('--- Checking Clients for Manager:', managerId, '---');
  const { data: clients, error } = await supabaseAdmin
    .from('users')
    .select('id, email, manager_id, role')
    .eq('manager_id', managerId);

  if (error) {
    console.error('Error fetching clients:', error);
  } else {
    console.log('Clients count:', clients.length);
    console.log('Clients:', JSON.stringify(clients, null, 2));
  }

  console.log('--- Checking All Users ---');
  const { data: allUsers, error: allErr } = await supabaseAdmin
    .from('users')
    .select('id, email, manager_id, role');
  
  if (allErr) {
    console.error('Error fetching all users:', allErr);
  } else {
    console.log('Total users:', allUsers.length);
    console.log('All Users summary:', allUsers.map(u => ({ id: u.id, email: u.email, m_id: u.manager_id, role: u.role })));
  }

  console.log('--- Checking Check-ins ---');
  const { data: checkins, error: ciErr } = await supabaseAdmin
    .from('check_ins')
    .select('id, client_id, date');
  
  if (ciErr) {
    console.error('Error fetching check-ins:', ciErr);
  } else {
    console.log('Check-ins count:', checkins.length);
    console.log('Check-ins summary:', checkins.map(ci => ({ id: ci.id, c_id: ci.client_id, date: ci.date })));
  }
}

inspect();
