-- Recurrence support for the calendar. We store an iCalendar RRULE string on
-- the parent task and expand it in memory at read time (no materialised rows),
-- so a "weekly forever" event stays a single row in the DB. Exceptions to a
-- recurring series (skip / override one date) live in task_exceptions.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_end  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_rule
  ON public.tasks (manager_id)
  WHERE recurrence_rule IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_parent
  ON public.tasks (recurrence_parent_id)
  WHERE recurrence_parent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.task_exceptions (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('skip', 'override')),
  override_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, original_date)
);

ALTER TABLE public.task_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY task_exceptions_owner_select ON public.task_exceptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_exceptions.task_id AND t.manager_id = auth.uid())
  );

CREATE POLICY task_exceptions_owner_modify ON public.task_exceptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_exceptions.task_id AND t.manager_id = auth.uid())
  );
