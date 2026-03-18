-- Run this in your Supabase SQL Editor to add the temp_password column
ALTER TABLE public.clients_profiles 
ADD COLUMN temp_password text;
