-- Delete admin@demo.com user from all tables
-- This migration removes the admin demo user if it exists

-- Delete from user_roles table
DELETE FROM user_roles 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@demo.com'
);

-- Delete from users table
DELETE FROM users 
WHERE email = 'admin@demo.com';

-- Delete from auth.users table
-- Note: This requires service role key to execute
-- If running via SQL editor, you may need admin privileges
DELETE FROM auth.users 
WHERE email = 'admin@demo.com';

-- Verify deletion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com') THEN
        RAISE NOTICE 'Warning: admin@demo.com still exists in auth.users';
    ELSE
        RAISE NOTICE 'Successfully deleted admin@demo.com from all tables';
    END IF;
END $$;
