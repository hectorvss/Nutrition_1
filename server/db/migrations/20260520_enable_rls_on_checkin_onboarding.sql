-- Close the 5 tables that shipped with RLS disabled — they were fully
-- exposed to anon/authenticated. The backend reads/writes them with the
-- service role (which bypasses RLS) so enabling RLS with no policies is
-- the correct secure default.
ALTER TABLE public.checkin_templates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checkin_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checkin_submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_submissions  ENABLE ROW LEVEL SECURITY;
