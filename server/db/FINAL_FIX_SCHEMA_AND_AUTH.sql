-- 1. ADD MISSING COLUMNS TO MESSAGES TABLE
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'attachment_type') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_type text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'attachment_name') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_name text;
    END IF;
END $$;

-- 2. ENSURE STORAGE BUCKET EXISTS AND IS PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages-media', 'messages-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. REFRESH STORAGE POLICIES
-- Clean up all potential conflicting policy names
DROP POLICY IF EXISTS "authenticated_upload_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated views in messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from messages-media" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "msg_media_delete_policy" ON storage.objects;

-- Create ultra-simple policies for testing
CREATE POLICY "msg_media_upload_policy" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'messages-media' );

CREATE POLICY "msg_media_view_policy" 
ON storage.objects FOR SELECT 
TO authenticated 
USING ( bucket_id = 'messages-media' );

CREATE POLICY "msg_media_delete_policy" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'messages-media' );

-- 4. FORCIBLY REFRESH POSTGREST SCHEMA CACHE
-- This is necessary so the API recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';

-- 5. DIAGNOSTIC RPC (Optional but helpful for the server logs)
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE(column_name text) AS $$
BEGIN
    RETURN QUERY 
    SELECT c.column_name::text
    FROM information_schema.columns c
    WHERE c.table_name = $1 AND c.table_schema = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
