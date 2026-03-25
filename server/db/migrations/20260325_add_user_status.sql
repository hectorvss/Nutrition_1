-- Migration: Add status column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Optional: Update existing clients to 'Active' if they are null
UPDATE public.users 
SET status = 'Active' 
WHERE status IS NULL;
