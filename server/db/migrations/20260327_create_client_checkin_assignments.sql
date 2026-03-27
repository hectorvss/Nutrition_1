-- Migration to create client_checkin_assignments table
-- This table tracks which template is assigned to each client.

CREATE TABLE IF NOT EXISTS public.client_checkin_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.checkin_templates(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure a client can only have one active assignment at a time
    -- This is reinforced by the application layer, but a partial index provides extra safety
    UNIQUE (client_id, is_active) WHERE (is_active = TRUE)
);

-- Row Level Security
ALTER TABLE public.client_checkin_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can see and manage assignments for their clients
-- Assuming 'users' table has a 'manager_id' field.
CREATE POLICY "Managers can manage checkin assignments"
ON public.client_checkin_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users AS client
        WHERE client.id = public.client_checkin_assignments.client_id
        AND client.manager_id = auth.uid()
    )
);

-- Policy: Clients can see their own active assignments
CREATE POLICY "Clients can view their own checkin assignments"
ON public.client_checkin_assignments
FOR SELECT
TO authenticated
USING (
    client_id = auth.uid()
    AND is_active = TRUE
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_client_checkin_assignments_client ON public.client_checkin_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checkin_assignments_active ON public.client_checkin_assignments(client_id) WHERE is_active = TRUE;
