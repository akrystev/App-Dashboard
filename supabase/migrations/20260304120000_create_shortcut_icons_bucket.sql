-- Create and secure storage bucket for personal shortcut icons
-- Date: 2026-03-04

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'shortcut-icons',
    'shortcut-icons',
    true,
    2097152,
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Shortcut icons are publicly readable" ON storage.objects;
CREATE POLICY "Shortcut icons are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'shortcut-icons');

DROP POLICY IF EXISTS "Authenticated users can upload own shortcut icons" ON storage.objects;
CREATE POLICY "Authenticated users can upload own shortcut icons"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'shortcut-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own shortcut icons" ON storage.objects;
CREATE POLICY "Users can update own shortcut icons"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'shortcut-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'shortcut-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own shortcut icons" ON storage.objects;
CREATE POLICY "Users can delete own shortcut icons"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'shortcut-icons'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
