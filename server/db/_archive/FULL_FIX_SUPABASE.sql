-- 1. FIX DATABASE SCHEMA: Add missing columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='attachment_type') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='attachment_name') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_name text;
    END IF;
END $$;

-- 2. SETUP STORAGE BUCKET: Ensure messages-media exists and is public
INSERT INTO storage.buckets (id, name, public)
SELECT 'messages-media', 'messages-media', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'messages-media'
);

-- 3. STORAGE RLS POLICIES: Clean up old policies and add new ones
-- Drop specific policy names if they exist to avoid conflict
DROP POLICY IF EXISTS "Allow authenticated uploads to messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated views in messages-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from messages-media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_view_messages_media" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_messages_media" ON storage.objects;

-- Allow authenticated users to upload to their own user_id folder
CREATE POLICY "authenticated_upload_messages_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'messages-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to see all files in the bucket (shared chat)
CREATE POLICY "authenticated_view_messages_media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'messages-media'
);

-- Allow users to delete their own uploads
CREATE POLICY "authenticated_delete_messages_media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'messages-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
