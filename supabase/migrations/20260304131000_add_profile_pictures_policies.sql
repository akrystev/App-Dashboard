-- Add storage policies for profile-pictures bucket
-- Date: 2026-03-04

-- Profile pictures are publicly readable
DROP POLICY IF EXISTS "Profile pictures are publicly readable" ON storage.objects;
CREATE POLICY "Profile pictures are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Authenticated users can upload own profile pictures
DROP POLICY IF EXISTS "Authenticated users can upload own profile pictures" ON storage.objects;
CREATE POLICY "Authenticated users can upload own profile pictures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update own profile pictures
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
CREATE POLICY "Users can update own profile pictures"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete own profile pictures
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete own profile pictures"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
