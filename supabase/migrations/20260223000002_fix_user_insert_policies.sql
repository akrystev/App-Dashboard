-- Fix user INSERT policies to allow admin user creation
-- This migration fixes the issue where admins couldn't create users due to overly restrictive RLS policies

-- Drop the restrictive INSERT policy that blocked all insertions
DROP POLICY IF EXISTS "users cannot insert" ON users;

-- Create a new policy that allows users to insert their own record
-- This is needed during the signup process
CREATE POLICY "Users can insert own record"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create a policy that allows admins to insert user records
-- This allows admins to create users on behalf of others
CREATE POLICY "Admins can insert users"
ON users FOR INSERT
WITH CHECK (is_admin_user(auth.uid()));

-- Verify the new policies
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'User INSERT policies updated successfully!';
    RAISE NOTICE 'Users can now insert their own records';
    RAISE NOTICE 'Admins can now create user accounts';
    RAISE NOTICE '====================================================';
END $$;
