-- Setup Admin User
-- This script promotes an existing user to admin role
-- 
-- STEP 1: First, register the user through your app at /register
--
-- STEP 2: Then run this SQL script to promote them to admin
-- Replace 'your-email@example.com' with the actual email

-- Promote your chosen user to admin role
UPDATE users 
SET role = 'admin', 
    status = 'active',
    updated_at = timezone('UTC'::text, now())
WHERE email = 'your-email@example.com';

-- Add admin role to user_roles table
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin'::user_role, timezone('UTC'::text, now())
FROM users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Verify the admin user was created
SELECT 
    u.id, 
    u.email, 
    u.role as users_role, 
    u.status,
    ur.role as user_roles_role,
    ur.assigned_at
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role = 'admin'
WHERE u.email = 'your-email@example.com';
