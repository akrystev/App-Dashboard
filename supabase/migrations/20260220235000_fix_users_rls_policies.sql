-- Fix RLS policies on users table
-- Create a helper function for admin checks (SECURITY DEFINER to avoid RLS recursion)

-- First, create the admin check function
CREATE OR REPLACE FUNCTION is_admin_user(check_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = check_uid 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated;

-- Now drop all existing policies on users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Only admins can delete" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users cannot insert (handled by auth)" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Users can view their own record
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (is_admin_user(auth.uid()));

-- Admins can update users
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
USING (is_admin_user(auth.uid()));

-- Admins can delete users
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (is_admin_user(auth.uid()));

-- No one can insert
CREATE POLICY "users cannot insert"
ON users FOR INSERT
WITH CHECK (false);
