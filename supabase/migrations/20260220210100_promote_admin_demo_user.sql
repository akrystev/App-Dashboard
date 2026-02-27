-- Promote admin user to admin role
-- Note: This assumes the user has already been created through registration
-- Replace 'your-email@example.com' with the actual admin user email

-- Update users table to set admin role
UPDATE users 
SET role = 'admin', 
    status = 'active',
    updated_at = timezone('UTC'::text, now())
WHERE email = 'your-email@example.com';

-- Insert into user_roles table
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin'::user_role, timezone('UTC'::text, now())
FROM users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Verify the promotion
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM users
    WHERE email = 'your-email@example.com' AND role = 'admin';
    
    IF v_count > 0 THEN
        RAISE NOTICE 'Successfully promoted admin user to admin role';
    ELSE
        RAISE NOTICE 'User not found. Please register the user first.';
    END IF;
END $$;
