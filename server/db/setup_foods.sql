-- Create a new table in public schema to store food items.
create table if not exists public.foods (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text default 'General',
  calories float8 not null default 0,
  protein float8 not null default 0,
  carbs float8 not null default 0,
  fats float8 not null default 0,
  serving_size text default '100g',
  emoji text,
  is_custom boolean default false,
  manager_id uuid references auth.users(id), -- Null for global library
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.foods enable row level security;

-- Policies
create policy "Anyone can view foods" on public.foods for select using (true);

create policy "Managers can manage foods" on public.foods for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'MANAGER')
);
