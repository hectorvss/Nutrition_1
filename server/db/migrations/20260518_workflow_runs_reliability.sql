-- Workflow reliability: durable delays (waiting/resume) + idempotency.
ALTER TABLE public.workflow_runs DROP CONSTRAINT IF EXISTS workflow_runs_status_check;
ALTER TABLE public.workflow_runs ADD CONSTRAINT workflow_runs_status_check
  CHECK (status IN ('running','completed','failed','cancelled','waiting','skipped'));

ALTER TABLE public.workflow_runs ADD COLUMN IF NOT EXISTS resume_at    timestamptz;
ALTER TABLE public.workflow_runs ADD COLUMN IF NOT EXISTS resume_state jsonb;
ALTER TABLE public.workflow_runs ADD COLUMN IF NOT EXISTS dedupe_key   text;

-- An event must not spawn the same run twice (retries / double-fire).
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_runs_dedupe
  ON public.workflow_runs(dedupe_key) WHERE dedupe_key IS NOT NULL;

-- Fast sweep of paused runs ready to resume.
CREATE INDEX IF NOT EXISTS idx_workflow_runs_waiting
  ON public.workflow_runs(resume_at) WHERE status = 'waiting';
