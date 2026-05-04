-- ===========================================
-- Migration: 20260504_rls_checkins_and_storage.sql
-- Adds missing RLS policies to check-in tables
-- and fixes over-permissive storage policies on messages bucket
-- ===========================================

-- ─── 1. Enable RLS on check-in tables ──────────────────────────────────────

ALTER TABLE checkin_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_checkin_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_checkin_submissions ENABLE ROW LEVEL SECURITY;

-- ─── 2. checkin_templates policies ─────────────────────────────────────────

-- Managers can read their own templates
CREATE POLICY IF NOT EXISTS "managers_read_own_checkin_templates"
  ON checkin_templates
  FOR SELECT
  USING (manager_id = auth.uid());

-- Managers can insert templates for themselves
CREATE POLICY IF NOT EXISTS "managers_insert_own_checkin_templates"
  ON checkin_templates
  FOR INSERT
  WITH CHECK (manager_id = auth.uid());

-- Managers can update their own templates
CREATE POLICY IF NOT EXISTS "managers_update_own_checkin_templates"
  ON checkin_templates
  FOR UPDATE
  USING (manager_id = auth.uid());

-- Managers can delete their own templates
CREATE POLICY IF NOT EXISTS "managers_delete_own_checkin_templates"
  ON checkin_templates
  FOR DELETE
  USING (manager_id = auth.uid());

-- ─── 3. client_checkin_assignments policies ──────────────────────────────────

-- Managers can manage assignments for their clients
CREATE POLICY IF NOT EXISTS "managers_manage_checkin_assignments"
  ON client_checkin_assignments
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM users WHERE manager_id = auth.uid()
    )
  );

-- Clients can read their own assignments
CREATE POLICY IF NOT EXISTS "clients_read_own_checkin_assignments"
  ON client_checkin_assignments
  FOR SELECT
  USING (client_id = auth.uid());

-- ─── 4. client_checkin_submissions policies ──────────────────────────────────

-- Clients can insert and read their own submissions
CREATE POLICY IF NOT EXISTS "clients_insert_own_submissions"
  ON client_checkin_submissions
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY IF NOT EXISTS "clients_read_own_submissions"
  ON client_checkin_submissions
  FOR SELECT
  USING (client_id = auth.uid());

-- Managers can read submissions for their clients
CREATE POLICY IF NOT EXISTS "managers_read_client_submissions"
  ON client_checkin_submissions
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM users WHERE manager_id = auth.uid()
    )
  );

-- ─── 5. Fix messages-media storage bucket policies ──────────────────────────
-- Remove the over-permissive public-access policy if it exists

DELETE FROM storage.policies
WHERE bucket_id = 'messages-media'
  AND name ILIKE '%public%';

-- Authenticated users can upload to their own folder only
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
SELECT
  'auth_users_upload_own_messages_media',
  'messages-media',
  '(auth.role() = ''authenticated'')',
  '(bucket_id = ''messages-media'' AND (storage.foldername(name))[1] = auth.uid()::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE bucket_id = 'messages-media'
    AND name = 'auth_users_upload_own_messages_media'
);

-- Authenticated users can read any file in messages-media (since shared between users)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
SELECT
  'auth_users_read_messages_media',
  'messages-media',
  '(auth.role() = ''authenticated'')',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE bucket_id = 'messages-media'
    AND name = 'auth_users_read_messages_media'
);

-- ─── 6. Missing indexes for performance ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_id ON check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checkin_submissions_client_id ON client_checkin_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checkin_assignments_client_id ON client_checkin_assignments(client_id);
