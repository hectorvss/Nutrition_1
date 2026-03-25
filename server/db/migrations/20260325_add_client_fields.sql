-- Add missing client profile fields
ALTER TABLE public.clients_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.clients_profiles ADD COLUMN IF NOT EXISTS age INTEGER;

-- Ensure users (or profiles) can have a full_name
-- If you use the profiles table for both roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
