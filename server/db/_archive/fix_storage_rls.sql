-- 1. Ensure the messages-media bucket exists (backup for the backend logic)
insert into storage.buckets (id, name, public)
select 'messages-media', 'messages-media', true
where not exists (
    select 1 from storage.buckets where id = 'messages-media'
);

-- 2. Allow authenticated users to upload files to the 'messages-media' bucket
-- Each user can only upload to their own folder (user_id/filename)
CREATE POLICY "Allow authenticated uploads to messages-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'messages-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from messages-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'messages-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow authenticated users to view all files in the 'messages-media' bucket
-- (Since messages are between users, they need to see each other's attachments)
CREATE POLICY "Allow authenticated views in messages-media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'messages-media'
);
