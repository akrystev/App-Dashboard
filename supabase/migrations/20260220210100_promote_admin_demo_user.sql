-- Promote admin@demo.com to admin role
-- Note: This assumes the user has already been created through registration

-- Update users table to set admin role
UPDATE users 
SET role = 'admin', 
    status = 'active',
    updated_at = timezone('UTC'::text, now())
WHERE email = 'admin@demo.com';

-- Insert into user_roles table
INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin'::user_role, timezone('UTC'::text, now())
FROM users
WHERE email = 'admin@demo.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET assigned_at = timezone('UTC'::text, now());

-- Verify the promotion
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM users
    WHERE email = 'admin@demo.com' AND role = 'admin';
    
    IF v_count > 0 THEN
        RAISE NOTICE 'Successfully promoted admin@demo.com to admin role';
    ELSE
        RAISE NOTICE 'User admin@demo.com not found. Please register the user first.';
    END IF;
END $$;
