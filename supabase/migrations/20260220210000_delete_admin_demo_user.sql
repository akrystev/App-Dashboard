-- Delete demo user account
-- This migration removes demo user accounts if they exist
-- Replace 'demo-email@example.com' with the actual user email to delete

-- Delete from user_roles table
DELETE FROM user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'demo-email@example.com'
);

-- Delete from users table
DELETE FROM users 
WHERE email = 'demo-email@example.com';

-- Delete from auth.users table
-- Note: This requires service role key to execute
-- If running via SQL editor, you may need admin privileges
DELETE FROM auth.users 
WHERE email = 'demo-email@example.com';

-- Verify deletion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo-email@example.com') THEN
        RAISE NOTICE 'Warning: User still exists in auth.users';
    ELSE
        RAISE NOTICE 'Successfully deleted user from all tables';
    END IF;
END $$;
