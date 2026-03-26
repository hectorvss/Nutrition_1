-- Create roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_json JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can manage roadmaps for their clients') THEN
        CREATE POLICY "Managers can manage roadmaps for their clients"
            ON public.roadmaps
            FOR ALL
            USING (auth.uid() = manager_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can view their own roadmap') THEN
        CREATE POLICY "Clients can view their own roadmap"
            ON public.roadmaps
            FOR SELECT
            USING (auth.uid() = client_id);
    END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_roadmaps_client ON public.roadmaps(client_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_manager ON public.roadmaps(manager_id);
