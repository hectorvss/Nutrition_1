-- Create manager_settings table
CREATE TABLE IF NOT EXISTS public.manager_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    theme_color TEXT DEFAULT '#17cf54',
    dark_mode BOOLEAN DEFAULT FALSE,
    density TEXT DEFAULT 'Comfortable',
    font_scale INTEGER DEFAULT 100,
    notification_prefs JSONB DEFAULT '{
        "new_client_check_ins_email": true,
        "new_client_check_ins_push": true,
        "new_messages_email": false,
        "new_messages_push": true,
        "appointment_reminders_email": true,
        "appointment_reminders_push": true,
        "system_updates_email": true,
        "system_updates_push": false
    }'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.manager_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can view their own settings"
ON public.manager_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Managers can update their own settings"
ON public.manager_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert their own settings"
ON public.manager_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_manager_settings_updated
    BEFORE UPDATE ON public.manager_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
