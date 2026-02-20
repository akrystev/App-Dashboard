-- Fix RLS policies to allow reading own roles
-- This removes the circular dependency issue

-- Drop the problematic admin check policies
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

-- Create new admin policies that don't rely on reading user_roles
-- Admins can view all roles (check users table instead)
CREATE POLICY "Admins can view all roles"
ON user_roles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
ON user_roles FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can update roles
CREATE POLICY "Admins can update roles"
ON user_roles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
ON user_roles FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Allow all authenticated users to read their own role
CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);
