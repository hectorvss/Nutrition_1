-- Consolidated Migration for Check-in System Refactor (Phases 7 & 8)

-- 1. Enhance checkin_templates with versioning and lifecycle states
ALTER TABLE checkin_templates ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
ALTER TABLE checkin_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE checkin_templates ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE checkin_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Enhance client_checkin_submissions for historical stability
ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS template_version INT;
ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS template_snapshot_json JSONB;
ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS coach_notes TEXT;
ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS next_week_focus TEXT;
ALTER TABLE client_checkin_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- 3. Add index for faster history lookups
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON client_checkin_submissions(client_id);
