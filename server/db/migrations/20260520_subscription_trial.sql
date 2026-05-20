-- Add the 'trial' tier and trial_ends_at so we can run the 14-day free trial
-- without a Stripe subscription. Existing rows stay untouched.

ALTER TABLE public.manager_subscriptions
  DROP CONSTRAINT IF EXISTS manager_subscriptions_plan_tier_check;

ALTER TABLE public.manager_subscriptions
  ADD CONSTRAINT manager_subscriptions_plan_tier_check
  CHECK (plan_tier IN ('trial', 'professional', 'scale', 'unlimited'));

ALTER TABLE public.manager_subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Index so the daily trial-expiry cron can scan only rows that may have expired.
CREATE INDEX IF NOT EXISTS idx_manager_subs_trial_ends_at
  ON public.manager_subscriptions (trial_ends_at)
  WHERE plan_tier = 'trial';
