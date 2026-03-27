-- 1. Create Check-in Templates Table
CREATE TABLE IF NOT EXISTS public.checkin_templates (
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

-- 2. Enable RLS
ALTER TABLE public.checkin_templates ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Managers can manage their own templates"
ON public.checkin_templates FOR ALL
USING ( auth.uid() = manager_id );

CREATE POLICY "Clients can view their manager's templates"
ON public.checkin_templates FOR SELECT
USING ( 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND manager_id = public.checkin_templates.manager_id
    )
);

-- 4. Initial Seed (Optional: can be done via API, but let's put the default one if possible)
-- We'll rely on the frontend to save the first template or use an INSERT if we want a global default.
-- For now, we'll keep it empty or insert one global row if needed.
