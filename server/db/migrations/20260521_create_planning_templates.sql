-- Planning (roadmap) templates: reusable strategic blueprints a coach can
-- create once and assign to any client. Mirrors nutrition_templates /
-- training_templates (per-manager ownership + language filter).
--
-- The table may already exist on some environments; CREATE IF NOT EXISTS +
-- ADD COLUMN IF NOT EXISTS keeps this migration idempotent and reconciles
-- older shapes that lacked intensity/phases.
CREATE TABLE IF NOT EXISTS public.planning_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    goal_type TEXT,
    intensity TEXT,
    duration_weeks INTEGER,
    phases INTEGER,
    data_json JSONB NOT NULL DEFAULT '{}',
    language TEXT DEFAULT 'es',
    manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.planning_templates ADD COLUMN IF NOT EXISTS intensity TEXT;
ALTER TABLE public.planning_templates ADD COLUMN IF NOT EXISTS phases INTEGER;
ALTER TABLE public.planning_templates ADD COLUMN IF NOT EXISTS duration_weeks INTEGER;
ALTER TABLE public.planning_templates ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

ALTER TABLE public.planning_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_planning_templates_manager
    ON public.planning_templates (manager_id);
