-- Script to make a user an admin
-- Replace YOUR_USER_EMAIL with the email of the user you want to make admin

-- First, update the users table
UPDATE users 
SET role = 'admin', updated_at = timezone('UTC'::text, now())
WHERE email = 'YOUR_USER_EMAIL';

-- Then, insert into user_roles table (or update if exists)
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin', timezone('UTC'::text, now())
FROM users
WHERE email = 'YOUR_USER_EMAIL'
ON CONFLICT (user_id, role) 
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Verify the admin user
SELECT u.id, u.email, u.role, ur.role as role_table_role
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'YOUR_USER_EMAIL';
