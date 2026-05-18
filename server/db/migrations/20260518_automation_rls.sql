-- Secure the automation tables. The backend uses the service role key
-- (which bypasses RLS), so these policies only affect the anon/authenticated
-- client roles.

-- automation_logs: a manager may read the logs of their own automations only.
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers read own automation logs" ON public.automation_logs;
CREATE POLICY "Managers read own automation logs" ON public.automation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.automations a
      WHERE a.id = automation_logs.automation_id
        AND a.manager_id = auth.uid()
    )
  );

-- automation_once_deliveries: internal bookkeeping, only the backend touches it.
-- Enable RLS with no policies => denied for anon/authenticated, allowed for service role.
ALTER TABLE public.automation_once_deliveries ENABLE ROW LEVEL SECURITY;
