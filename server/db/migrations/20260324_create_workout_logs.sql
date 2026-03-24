-- Migration: create workout_logs table for client workout session data
-- Run this in Supabase SQL editor

create table if not exists workout_logs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references users(id) on delete cascade not null,
  plan_id      uuid references training_programs(id) on delete set null,
  workout_name text,
  day_key      text,
  logged_at    timestamp with time zone not null default now(),
  exercises    jsonb not null default '[]',
  notes        text,
  session_rpe  numeric(3,1)
);

-- Indexes for performance
create index if not exists workout_logs_client_id_idx on workout_logs(client_id);
create index if not exists workout_logs_logged_at_idx on workout_logs(logged_at desc);
create index if not exists workout_logs_plan_id_idx on workout_logs(plan_id);

-- Enable Row Level Security
alter table workout_logs enable row level security;

-- Policy: clients can read/write their own logs
create policy "client_own_logs" on workout_logs
  for all
  using (client_id = auth.uid());

-- Policy: managers can read their clients' logs
-- (managers access via service role in backend, so this is mainly for any direct queries)
create policy "manager_read_client_logs" on workout_logs
  for select
  using (
    client_id in (
      select id from users where manager_id = auth.uid()
    )
  );
