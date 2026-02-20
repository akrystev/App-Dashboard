-- Create shortcut_visibility table to manage which users can see which shortcuts
CREATE TABLE IF NOT EXISTS shortcut_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shortcut_id UUID NOT NULL REFERENCES shortcuts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT timezone('UTC'::text, now()),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(shortcut_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shortcut_visibility_shortcut_id ON shortcut_visibility(shortcut_id);
CREATE INDEX IF NOT EXISTS idx_shortcut_visibility_user_id ON shortcut_visibility(user_id);

-- Enable RLS
ALTER TABLE shortcut_visibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shortcut_visibility
-- Users can view their own visibility entries
CREATE POLICY "Users can view their visibility entries"
ON shortcut_visibility FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all visibility entries
CREATE POLICY "Admins can view all visibility entries"
ON shortcut_visibility FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Admins can insert visibility entries
CREATE POLICY "Admins can insert visibility entries"
ON shortcut_visibility FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Admins can update visibility entries
CREATE POLICY "Admins can update visibility entries"
ON shortcut_visibility FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Admins can delete visibility entries
CREATE POLICY "Admins can delete visibility entries"
ON shortcut_visibility FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);
