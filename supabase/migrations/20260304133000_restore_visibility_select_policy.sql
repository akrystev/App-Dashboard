-- Restore shortcut_visibility SELECT permissions for shared shortcuts
-- Date: 2026-03-04
-- Issue: Users can't see shortcuts shared with them after policy update

-- The visibility_select_policy allows users to see:
-- 1. Visibility entries where they are the recipient (user_id = auth.uid())
-- 2. All entries if they're admin
-- This is needed for the frontend to load shared shortcuts via JOIN

-- Ensure the SELECT policy exists (it may have been preserved, but let's be explicit)
DROP POLICY IF EXISTS "visibility_select_policy" ON public.shortcut_visibility;

CREATE POLICY "visibility_select_policy"
ON public.shortcut_visibility
FOR SELECT
TO authenticated
USING (
    (auth.uid() = user_id) OR is_admin_user(auth.uid())
);
