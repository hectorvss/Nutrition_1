-- Add language column to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='language') THEN
        ALTER TABLE public.profiles ADD COLUMN language TEXT DEFAULT 'es';
    END IF;
END $$;

-- Create manager_settings table if not exists
CREATE TABLE IF NOT EXISTS public.manager_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_color TEXT DEFAULT '#10b981',
    dark_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.manager_settings ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies
DROP POLICY IF EXISTS "Managers can view their own settings" ON public.manager_settings;
CREATE POLICY "Managers can view their own settings" 
ON public.manager_settings FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can update their own settings" ON public.manager_settings;
CREATE POLICY "Managers can update their own settings" 
ON public.manager_settings FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can insert their own settings" ON public.manager_settings;
CREATE POLICY "Managers can insert their own settings" 
ON public.manager_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);
