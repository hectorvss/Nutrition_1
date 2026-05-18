-- Soft-delete flags for messages.
-- Server code (server/routes/messages.ts and server/routes/manager.ts) already
-- references these columns to hide conversations per-side, but they were never
-- created in the database — every soft-delete query failed silently.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS deleted_by_sender   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN NOT NULL DEFAULT false;
