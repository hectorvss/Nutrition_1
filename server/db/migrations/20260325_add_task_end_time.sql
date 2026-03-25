-- Add end_time to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS end_time TIME;
