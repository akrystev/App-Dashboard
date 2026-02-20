-- Fix missing user records and user_roles
-- This migration:
-- 1. Adds admin@demo.com to users table as admin
-- 2. Adds missing user_roles records for both users
-- 3. Ensures demo@demo.com is a regular user

-- Add admin@demo.com to users table (if not exists)
INSERT INTO users (id, email, role, status, created_at, updated_at)
VALUES (
    '784feab0-f863-4cbb-ad84-5b7c7d93f0e3'::uuid, 
    'admin@demo.com', 
    'admin', 
    'active',
    timezone('UTC'::text, now()),
    timezone('UTC'::text, now())
)
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    status = 'active',
    updated_at = timezone('UTC'::text, now());

-- Ensure demo@demo.com is in users table with user role
INSERT INTO users (id, email, role, status, created_at, updated_at)
VALUES (
    '2100e6c2-fe86-4ea4-ba18-8ccb4dd9799a'::uuid,
    'demo@demo.com',
    'user',
    'active',
    timezone('UTC'::text, now()),
    timezone('UTC'::text, now())
)
ON CONFLICT (id)
DO UPDATE SET
    role = 'user',
    status = 'active',
    updated_at = timezone('UTC'::text, now());

-- Add user_roles record for admin@demo.com
INSERT INTO user_roles (user_id, role, assigned_at)
VALUES (
    '784feab0-f863-4cbb-ad84-5b7c7d93f0e3'::uuid,
    'admin',
    timezone('UTC'::text, now())
)
ON CONFLICT (user_id, role)
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Add user_roles record for demo@demo.com (regular user)
INSERT INTO user_roles (user_id, role, assigned_at)
VALUES (
    '2100e6c2-fe86-4ea4-ba18-8ccb4dd9799a'::uuid,
    'user',
    timezone('UTC'::text, now())
)
ON CONFLICT (user_id, role)
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE '=== User Setup Complete ===';
    RAISE NOTICE 'Admin User: admin@demo.com (password: admin123)';
    RAISE NOTICE 'Demo User: demo@demo.com (password: demo123)';
    RAISE NOTICE '';
END $$;

-- Show all users and roles
SELECT 
    u.email,
    u.role as users_role,
    u.status,
    STRING_AGG(ur.role::text, ', ') as user_roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
GROUP BY u.id, u.email, u.role, u.status
ORDER BY u.email;
