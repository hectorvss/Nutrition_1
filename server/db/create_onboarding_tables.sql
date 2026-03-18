-- Create onboarding_messages table
CREATE TABLE IF NOT EXISTS onboarding_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create onboarding_assignments table
CREATE TABLE IF NOT EXISTS onboarding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES onboarding_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'seen', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Add RLS policies
ALTER TABLE onboarding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_messages
CREATE POLICY "Managers can do everything with onboarding_messages"
ON onboarding_messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  )
);

CREATE POLICY "Clients can view published onboarding_messages assigned to them"
ON onboarding_messages FOR SELECT
TO authenticated
USING (
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM onboarding_assignments
    WHERE onboarding_assignments.message_id = onboarding_messages.id
    AND onboarding_assignments.user_id = auth.uid()
  )
);

-- Policies for onboarding_assignments
CREATE POLICY "Managers can do everything with onboarding_assignments"
ON onboarding_assignments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'MANAGER'
  )
);

CREATE POLICY "Clients can view and update their own assignments"
ON onboarding_assignments FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE onboarding_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE onboarding_assignments;
