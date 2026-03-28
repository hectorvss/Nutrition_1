-- Add is_read to messages
ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT false;
