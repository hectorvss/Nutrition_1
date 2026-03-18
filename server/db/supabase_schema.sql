-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create custom Users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  role text not null check (role in ('MANAGER', 'CLIENT')),
  manager_id uuid references public.users(id), -- Null if MANAGER, set to manager's ID if CLIENT
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- RLS: Users Policies
-- Managers can see themselves and their clients.
create policy "Managers can view own profile and their clients"
on public.users for select
using ( auth.uid() = id or auth.uid() = manager_id );

-- Clients can see their own profile and their manager's basic profile
create policy "Clients can view own profile and their manager"
on public.users for select
using ( auth.uid() = id or id = (select manager_id from public.users where id = auth.uid()) );

-- Trigger to automatically create a public.user when auth.user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce((new.raw_user_meta_data->>'role'), 'CLIENT'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Client Profiles
create table public.clients_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  weight numeric,
  goal text,
  height numeric,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.clients_profiles enable row level security;

create policy "Users can view their own profile"
on public.clients_profiles for select
using ( auth.uid() = user_id );

create policy "Managers can view/update their clients profiles"
on public.clients_profiles for all
using ( exists (select 1 from public.users where id = public.clients_profiles.user_id and manager_id = auth.uid()) );

-- 3. Nutrition Plans
create table public.nutrition_plans (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid not null references public.users(id) on delete cascade,
  created_by uuid not null references public.users(id),
  name text not null,
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.nutrition_plans enable row level security;

create policy "Clients can view their nutrition plans"
on public.nutrition_plans for select
using ( auth.uid() = client_id );

create policy "Managers can ALL their clients nutrition plans"
on public.nutrition_plans for all
using ( auth.uid() = created_by );

-- 4. Training Programs
create table public.training_programs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid not null references public.users(id) on delete cascade,
  created_by uuid not null references public.users(id),
  name text not null,
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.training_programs enable row level security;

create policy "Clients can view their training programs"
on public.training_programs for select
using ( auth.uid() = client_id );

create policy "Managers can ALL their clients training programs"
on public.training_programs for all
using ( auth.uid() = created_by );

-- 5. Check-ins
create table public.check_ins (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.check_ins enable row level security;

create policy "Clients can manage their own check-ins"
on public.check_ins for all
using ( auth.uid() = client_id );

create policy "Managers can view their clients check-ins"
on public.check_ins for select
using ( exists (select 1 from public.users where id = public.check_ins.client_id and manager_id = auth.uid()) );
