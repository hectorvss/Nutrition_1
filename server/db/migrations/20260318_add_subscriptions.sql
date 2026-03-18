-- Create manager_subscriptions table
create table if not exists public.manager_subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_tier text check (plan_tier in ('professional', 'scale', 'unlimited')),
  status text,
  current_period_end timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.manager_subscriptions enable row level security;

-- Policies
create policy "Managers can view their own subscription"
on public.manager_subscriptions for select
using ( auth.uid() = user_id );
