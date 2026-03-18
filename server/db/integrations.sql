-- Create integrations table to store manager API keys
CREATE TABLE IF NOT EXISTS public.integrations (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    google_calendar_enabled BOOLEAN DEFAULT FALSE,
    google_calendar_api_key TEXT,
    google_calendar_id TEXT,
    stripe_enabled BOOLEAN DEFAULT FALSE,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can view their own integrations"
ON public.integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Managers can update their own integrations"
ON public.integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert their own integrations"
ON public.integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER on_integrations_updated
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
