-- ==========================================
-- DYNAMIC CHECK-IN SYSTEM - COMPLETE SETUP
-- Phases 1-8 Consolidated
-- ==========================================

-- 1. Create Check-in Templates Library
CREATE TABLE IF NOT EXISTS checkin_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    template_schema JSONB NOT NULL DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Client Assignments (Template -> Client mapping)
CREATE TABLE IF NOT EXISTS client_checkin_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    template_id UUID NOT NULL REFERENCES checkin_templates(id),
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Dynamic Submissions (Answers & Snapshots)
CREATE TABLE IF NOT EXISTS client_checkin_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    template_id UUID NOT NULL REFERENCES checkin_templates(id),
    template_version INT NOT NULL DEFAULT 1,
    template_snapshot_json JSONB,
    answers_json JSONB NOT NULL DEFAULT '{}',
    coach_notes TEXT,
    next_week_focus TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_templates_manager ON checkin_templates(manager_id);
CREATE INDEX IF NOT EXISTS idx_assignments_client ON client_checkin_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_client ON client_checkin_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_template ON client_checkin_submissions(template_id);

-- 5. Helper function for Default Templates (Optional but recommended)
-- Ensures only one default template per manager
CREATE OR REPLACE FUNCTION handle_default_checkin_template() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE checkin_templates 
        SET is_default = false 
        WHERE manager_id = NEW.manager_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ensure_single_default_template ON checkin_templates;
CREATE TRIGGER tr_ensure_single_default_template
    BEFORE INSERT OR UPDATE ON checkin_templates
    FOR EACH ROW EXECUTE FUNCTION handle_default_checkin_template();
