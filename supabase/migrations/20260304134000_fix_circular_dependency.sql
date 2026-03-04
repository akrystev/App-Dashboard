-- Fix circular dependency in shortcut_visibility policies
-- Date: 2026-03-04
-- Issue: ALL policy on shortcut_visibility causes infinite recursion when shortcuts SELECT checks visibility

-- Remove the ALL policy that causes circular dependency
DROP POLICY IF EXISTS "shortcut_owners_manage_visibility" ON public.shortcut_visibility;
DROP POLICY IF EXISTS "admins_manage_all_visibility" ON public.shortcut_visibility;

-- Separate policies for INSERT/UPDATE/DELETE (not SELECT) to avoid circular dependency
CREATE POLICY "shortcut_owners_can_insert_visibility"
ON public.shortcut_visibility
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM shortcuts 
        WHERE shortcuts.id = shortcut_visibility.shortcut_id 
        AND shortcuts.user_id = auth.uid()
    )
);

CREATE POLICY "shortcut_owners_can_update_visibility"
ON public.shortcut_visibility
FOR UPDATE
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

CREATE POLICY "shortcut_owners_can_delete_visibility"
ON public.shortcut_visibility
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM shortcuts 
        WHERE shortcuts.id = shortcut_visibility.shortcut_id 
        AND shortcuts.user_id = auth.uid()
    )
);

-- Admin policies for write operations only (not SELECT)
CREATE POLICY "admins_can_insert_visibility"
ON public.shortcut_visibility
FOR INSERT
TO authenticated
WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "admins_can_update_visibility"
ON public.shortcut_visibility
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "admins_can_delete_visibility"
ON public.shortcut_visibility
FOR DELETE
TO authenticated
USING (is_admin_user(auth.uid()));

-- Keep the SELECT policy separate (no circular dependency)
-- This policy is preserved from previous migration
