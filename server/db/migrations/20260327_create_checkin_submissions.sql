-- Migration to create client_checkin_submissions table
-- This table stores responses from clients associated with a specific template.

CREATE TABLE IF NOT EXISTS public.client_checkin_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.checkin_templates(id),
    template_version INT DEFAULT 1,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed')),
    template_snapshot_json JSONB -- Optional: Store a snapshot of the template at submission time
);

-- Row Level Security
ALTER TABLE public.client_checkin_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can see and manage their own submissions
CREATE POLICY "Clients can manage their own submissions"
ON public.client_checkin_submissions
FOR ALL
TO authenticated
USING (client_id = auth.uid());

-- Policy: Managers can view submissions for their clients
CREATE POLICY "Managers can view client submissions"
ON public.client_checkin_submissions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users AS client
        WHERE client.id = public.client_checkin_submissions.client_id
        AND client.manager_id = auth.uid()
    )
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_client_checkin_submissions_client ON public.client_checkin_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checkin_submissions_status ON public.client_checkin_submissions(status);
