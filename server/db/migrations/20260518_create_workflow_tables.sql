-- Advanced Workflow builder: manager-scoped visual automations (no tenant/workspace model).
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text NOT NULL,
  description        text,
  current_version_id uuid,
  enabled            boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id    uuid NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  nodes          jsonb NOT NULL DEFAULT '[]',
  edges          jsonb NOT NULL DEFAULT '[]',
  trigger        jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  published_at   timestamptz
);

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_version_id uuid NOT NULL REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
  manager_id          uuid NOT NULL,
  client_id           uuid,
  trigger_type        text NOT NULL DEFAULT 'manual',
  trigger_payload     jsonb NOT NULL DEFAULT '{}',
  status              text NOT NULL DEFAULT 'running'
                       CHECK (status IN ('running','completed','failed','cancelled')),
  context             jsonb NOT NULL DEFAULT '{}',
  error               text,
  started_at          timestamptz NOT NULL DEFAULT now(),
  ended_at            timestamptz
);

CREATE TABLE IF NOT EXISTS public.workflow_run_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  node_id         text NOT NULL,
  node_type       text NOT NULL,
  node_key        text,
  status          text NOT NULL DEFAULT 'pending',
  input           jsonb NOT NULL DEFAULT '{}',
  output          jsonb NOT NULL DEFAULT '{}',
  error           text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_workflow_defs_manager ON public.workflow_definitions(manager_id);
CREATE INDEX IF NOT EXISTS idx_workflow_versions_wf  ON public.workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_version ON public.workflow_runs(workflow_version_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_manager ON public.workflow_runs(manager_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_run_steps_run ON public.workflow_run_steps(workflow_run_id);

ALTER TABLE public.workflow_definitions
  DROP CONSTRAINT IF EXISTS workflow_definitions_current_version_fk;
ALTER TABLE public.workflow_definitions
  ADD CONSTRAINT workflow_definitions_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES public.workflow_versions(id) ON DELETE SET NULL;

-- RLS: backend uses the service role (bypasses RLS). Managers may read their own rows.
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_run_steps   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers read own workflows" ON public.workflow_definitions;
CREATE POLICY "Managers read own workflows" ON public.workflow_definitions
  FOR SELECT USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Managers read own workflow versions" ON public.workflow_versions;
CREATE POLICY "Managers read own workflow versions" ON public.workflow_versions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.workflow_definitions d
    WHERE d.id = workflow_versions.workflow_id AND d.manager_id = auth.uid()));

DROP POLICY IF EXISTS "Managers read own workflow runs" ON public.workflow_runs;
CREATE POLICY "Managers read own workflow runs" ON public.workflow_runs
  FOR SELECT USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Managers read own workflow run steps" ON public.workflow_run_steps;
CREATE POLICY "Managers read own workflow run steps" ON public.workflow_run_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.workflow_runs r
    WHERE r.id = workflow_run_steps.workflow_run_id AND r.manager_id = auth.uid()));
