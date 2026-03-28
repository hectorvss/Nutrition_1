-- 1. Create Onboarding Templates Table
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    template_schema JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Client Onboarding Assignments Table
CREATE TABLE IF NOT EXISTS public.client_onboarding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.onboarding_templates(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Partial index to ensure only one active assignment per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_onboarding_active_unique 
ON public.client_onboarding_assignments (client_id) 
WHERE (is_active = TRUE);

-- 3. Create Client Onboarding Submissions Table
CREATE TABLE IF NOT EXISTS public.client_onboarding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.onboarding_templates(id),
    template_version INT DEFAULT 1,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed')),
    template_snapshot_json JSONB
);

-- 4. Enable RLS
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Onboarding Templates
CREATE POLICY "Managers can manage their own onboarding templates"
ON public.onboarding_templates FOR ALL
USING ( auth.uid() = manager_id );

CREATE POLICY "Clients can view their manager's onboarding templates"
ON public.onboarding_templates FOR SELECT
USING ( 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND manager_id = public.onboarding_templates.manager_id
    )
);

-- 6. RLS Policies for Assignments
CREATE POLICY "Managers can manage onboarding assignments"
ON public.client_onboarding_assignments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users AS client
        WHERE client.id = public.client_onboarding_assignments.client_id
        AND client.manager_id = auth.uid()
    )
);

CREATE POLICY "Clients can view their own onboarding assignments"
ON public.client_onboarding_assignments FOR SELECT
TO authenticated
USING (client_id = auth.uid() AND is_active = TRUE);

-- 7. RLS Policies for Submissions
CREATE POLICY "Clients can manage their own onboarding submissions"
ON public.client_onboarding_submissions FOR ALL
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Managers can view onboarding submissions"
ON public.client_onboarding_submissions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users AS client
        WHERE client.id = public.client_onboarding_submissions.client_id
        AND client.manager_id = auth.uid()
    )
);

-- 8. Indexing
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_manager ON public.onboarding_templates(manager_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_assignments_client ON public.client_onboarding_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_submissions_client ON public.client_onboarding_submissions(client_id);
