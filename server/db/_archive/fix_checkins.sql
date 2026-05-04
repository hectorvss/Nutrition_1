-- Fix check_ins table by adding missing columns
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS coach_notes TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS next_week_focus TEXT;
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Ensure RLS is correctly set up
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates (if they exist)
DROP POLICY IF EXISTS "Clients can manage their own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Managers can view their clients check-ins" ON public.check_ins;

-- Re-create policies using auth.uid()
CREATE POLICY "Clients can manage their own check-ins"
ON public.check_ins FOR ALL
USING ( auth.uid() = client_id );

CREATE POLICY "Managers can view/update their clients check-ins"
ON public.check_ins FOR ALL
USING ( exists (select 1 from public.users where id = public.check_ins.client_id and manager_id = auth.uid()) );
