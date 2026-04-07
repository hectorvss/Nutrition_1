-- ===========================================
-- Migration: 20260407_security_and_fixes.sql
-- Adds soft-delete columns to messages,
-- ensures sent_at exists in automation_logs,
-- and adds language column to profiles
-- ===========================================

-- 1. Soft-delete columns for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;

-- Index for filtering soft-deletes efficiently
CREATE INDEX IF NOT EXISTS idx_messages_deleted_sender ON messages(sender_id) WHERE deleted_by_sender = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_deleted_receiver ON messages(receiver_id) WHERE deleted_by_receiver = FALSE;

-- 2. Ensure sent_at exists in automation_logs with default
ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Language preference on profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'es';

-- 4. Basic RLS policies for messages (if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND rowsecurity = true) THEN
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Users can see messages where they are sender or receiver
CREATE POLICY IF NOT EXISTS "Users can read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages as sender
CREATE POLICY IF NOT EXISTS "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they are involved in (mark read, soft-delete)
CREATE POLICY IF NOT EXISTS "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
