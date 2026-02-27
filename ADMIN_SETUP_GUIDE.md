# Quick Setup Guide: Creating Admin User

## Option 1: Using the Edge Function (Recommended)

If you have deployed the `create-demo-users` edge function to Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Find and invoke `create-demo-users`
4. This will create test accounts that you can use for testing

## Option 2: Using SQL Editor in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create the admin user in auth.users (if not exists)
-- Note: You may need to create the user through the Auth UI first, 
-- then run this to promote them to admin

-- Replace 'YOUR_USER_EMAIL' with the actual email
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'YOUR_USER_EMAIL';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found. Please create the user first through Supabase Auth.';
    ELSE
        -- Update users table
        INSERT INTO users (id, email, role, status)
        VALUES (v_user_id, 'YOUR_USER_EMAIL', 'admin', 'active')
        ON CONFLICT (id) 
        DO UPDATE SET role = 'admin', status = 'active', updated_at = NOW();
        
        -- Insert into user_roles
        INSERT INTO user_roles (user_id, role, assigned_at)
        VALUES (v_user_id, 'admin', NOW())
        ON CONFLICT (user_id, role) 
        DO UPDATE SET assigned_at = NOW();
        
        RAISE NOTICE 'User % has been promoted to admin', 'YOUR_USER_EMAIL';
    END IF;
END $$;

-- Verify the admin user
SELECT u.id, u.email, u.role, u.status, ur.role as user_roles_role
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'YOUR_USER_EMAIL';
```

5. Replace `YOUR_USER_EMAIL` with the actual email address
6. Click **Run** to execute the query

## Option 3: For Existing Registered Users

If a user has already registered through the app:

1. Get their email address
2. Use the SQL from Option 2 above
3. Replace `YOUR_USER_EMAIL` with their email
4. Run the query in Supabase SQL Editor

## Option 4: Manual Steps in Supabase Dashboard

### Step 1: Find the User
1. Go to **Authentication** → **Users**
2. Find the user you want to make admin
3. Copy their User UID

### Step 2: Update Users Table
1. Go to **Table Editor** → **users**
2. Find the row with the user's ID
3. Edit the `role` column to `admin`
4. Save changes

### Step 3: Add to User Roles Table
1. Go to **Table Editor** → **user_roles**
2. Click **Insert** → **Insert row**
3. Fill in:
   - `user_id`: paste the User UID
   - `role`: select `admin`
   - `assigned_at`: will auto-fill with current timestamp
4. Click **Save**

## Verification

After creating an admin user, verify by:

1. Login to the app with the admin account
2. Check the navbar - should show "Admin" badge
3. Look for "Admin Panel" link in the navigation
4. Navigate to `/admin` to access the admin panel
5. You should see tabs for "Users" and "All Shortcuts"

## Troubleshooting

### "Cannot access admin panel" 
- Make sure the user is in both `users` table (role='admin') and `user_roles` table (role='admin')
- Clear browser cache and reload
- Check browser console for errors

### "Admin Panel link not showing"
- Logout and login again
- Verify role is set correctly in database
- Check that migrations were applied successfully

### "RLS policies blocking access"
- Ensure the `user_roles` table has the correct RLS policies
- Run the migration: `20260220183746_create_user_roles_table.sql`
- Run the migration: `20260220184500_add_admin_shortcuts_policies.sql`

## Demo Accounts

For testing purposes, you should create your own test accounts:

- **Regular User**: Create via the registration page at `/register`
- **Admin User**: Create an account and then promote it to admin using the SQL scripts above

(Note: Demo credentials should never be hardcoded in the application)
