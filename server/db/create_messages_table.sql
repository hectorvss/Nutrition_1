-- Create messages table
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  attachment_url text,
  attachment_type text, -- 'image', 'file', 'audio'
  attachment_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages where they are sender or receiver
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK ( auth.uid() = sender_id );
