-- 20260331_add_is_permanent_to_templates.sql
-- Add is_permanent column to checkin_templates table

ALTER TABLE public.checkin_templates 
ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT false;

-- Specifically for Hector Vidal's context / existing account, 
-- we ensure any future logic can identify these "core" templates.
COMMENT ON COLUMN public.checkin_templates.is_permanent IS 'If true, this template cannot be deleted or renamed by the manager.';
