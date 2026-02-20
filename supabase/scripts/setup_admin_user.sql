-- Setup Admin User
-- This script promotes an existing user to admin role
-- 
-- STEP 1: First, register the user through your app at /register
--         Email: admin@demo.com
--         Password: admin123
--
-- STEP 2: Then run this SQL script to promote them to admin

-- Promote admin@demo.com to admin role
UPDATE users 
SET role = 'admin', 
    status = 'active',
    updated_at = timezone('UTC'::text, now())
WHERE email = 'admin@demo.com';

-- Add admin role to user_roles table
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin'::user_role, timezone('UTC'::text, now())
FROM users
WHERE email = 'admin@demo.com'
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
WHERE u.email = 'admin@demo.com';
