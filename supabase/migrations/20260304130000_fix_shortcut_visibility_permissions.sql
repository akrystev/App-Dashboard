-- Fix shortcut_visibility permissions so owners can share their shortcuts
-- Date: 2026-03-04
-- Issue: Only admins could manage shortcut_visibility, blocking regular users from sharing

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "visibility_write_policy" ON public.shortcut_visibility;

-- Allow shortcut owners to manage visibility for their own shortcuts
CREATE POLICY "shortcut_owners_manage_visibility"
ON public.shortcut_visibility
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM shortcuts 
        WHERE shortcuts.id = shortcut_visibility.shortcut_id 
        AND shortcuts.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM shortcuts 
        WHERE shortcuts.id = shortcut_visibility.shortcut_id 
        AND shortcuts.user_id = auth.uid()
    )
);

-- Allow admins to manage all visibility entries
CREATE POLICY "admins_manage_all_visibility"
ON public.shortcut_visibility
FOR ALL
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));
