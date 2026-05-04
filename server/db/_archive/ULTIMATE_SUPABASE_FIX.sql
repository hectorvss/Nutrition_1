-- 1. DIRECT DATABASE SCHEMA FIX
-- We add the columns directly. If they exist, the command might fail, so we use a check.
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.messages ADD COLUMN attachment_type text;
    EXCEPTION WHEN duplicate_column THEN 
        RAISE NOTICE 'column attachment_type already exists';
    END;

    BEGIN
        ALTER TABLE public.messages ADD COLUMN attachment_name text;
    EXCEPTION WHEN duplicate_column THEN 
        RAISE NOTICE 'column attachment_name already exists';
    END;
END $$;

-- 2. STORAGE BUCKET SETUP
-- Ensure the bucket is public and exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages-media', 'messages-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. CLEAN & RECREATE STORAGE POLICIES
-- We use very explicit names to avoid conflicts and ensure they match the folder structure
DROP POLICY IF EXISTS "authenticated_upload_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated views in messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from messages-media" ON storage.objects;

-- Simplified policy: Any authenticated user can upload to THIS bucket
-- This is more reliable for troubleshooting folder segment mismatches
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
USING ( bucket_id = 'messages-media' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 4. NUDGE POSTGREST CACHE
-- This special command tells Supabase to refresh its internal API schema
NOTIFY pgrst, 'reload schema';
