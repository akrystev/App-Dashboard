-- Add RLS policies to allow admins to view and manage all shortcuts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all shortcuts" ON shortcuts;
DROP POLICY IF EXISTS "Admins can delete any shortcuts" ON shortcuts;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Admins can view all shortcuts
CREATE POLICY "Admins can view all shortcuts"
ON shortcuts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can delete any shortcuts
CREATE POLICY "Admins can delete any shortcuts"
ON shortcuts FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can view all users data
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can update users
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can delete users
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);
