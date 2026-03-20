-- Create roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_json JSONB NOT NULL DEFAULT '{"nutrition": [], "training": []}',
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS roadmap_client_idx ON public.roadmaps(client_id);
CREATE INDEX IF NOT EXISTS roadmap_manager_idx ON public.roadmaps(manager_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_roadmap_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER roadmap_timestamp_trigger
    BEFORE UPDATE ON public.roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_roadmap_timestamp();

-- Enable RLS
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Policies (assuming manager should access)
CREATE POLICY "Managers can view/edit their clients' roadmaps" ON public.roadmaps
    FOR ALL
    USING (auth.uid() = manager_id);

CREATE POLICY "Clients can view their own roadmap" ON public.roadmaps
    FOR SELECT
    USING (auth.uid() = client_id);
