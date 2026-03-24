-- Create automations table
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_id TEXT NOT NULL, -- e.g., 'new-client', 'weekly-checkin', 'birthday'
    message TEXT NOT NULL,
    icon_info JSONB, -- Stores { iconName, iconBg, iconColor }
    delivery_rules JSONB, -- Stores frequency, audience, etc.
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for automations
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can manage their own automations"
    ON public.automations
    FOR ALL
    USING (auth.uid() = manager_id);

-- Create automation_logs table to track sent messages
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES public.automations(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT now(),
    trigger_context JSONB -- Stores details like which check-in triggered it
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_automations_trigger ON public.automations(trigger_id, enabled);
CREATE INDEX IF NOT EXISTS idx_automation_logs_client ON public.automation_logs(client_id, automation_id);
