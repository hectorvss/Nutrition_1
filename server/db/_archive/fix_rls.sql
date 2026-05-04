-- 1. Helper function to bypass RLS and get manager_id preventing infinite recursion
create or replace function public.get_my_manager_id()
returns uuid
language sql security definer set search_path = public
as $$
  select manager_id from users where id = auth.uid();
$$;

-- 2. Drop the recursive policy from users
drop policy if exists "Clients can view own profile and their manager" on public.users;

-- 3. Recreate the policy using the security definer function
create policy "Clients can view own profile and their manager"
on public.users for select
using ( auth.uid() = id or id = public.get_my_manager_id() );

-- 4. Just in case, let's fix the exercises policy to specifically only apply to modification, since ANYONE can select them
drop policy if exists "Managers can manage exercises" on public.exercises;

create policy "Managers can manage exercises" 
on public.exercises 
for all 
using (
  exists (select 1 from public.users where id = auth.uid() and role = 'MANAGER')
);
