-- Columns required by the automations module (processTrigger + the daily cron).
-- Without these, the embedded selects in server/routes/automations.ts reference
-- non-existent columns and every automation query fails.
ALTER TABLE public.clients_profiles ADD COLUMN IF NOT EXISTS goal_weight  numeric;
ALTER TABLE public.clients_profiles ADD COLUMN IF NOT EXISTS check_in_day text;
ALTER TABLE public.clients_profiles ADD COLUMN IF NOT EXISTS last_login   timestamptz;
ALTER TABLE public.profiles        ADD COLUMN IF NOT EXISTS birthday     date;
