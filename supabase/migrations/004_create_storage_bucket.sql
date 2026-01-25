-- Create Storage Bucket for Field-to-Invoice Media
-- This bucket will store photos, videos, and documents for sites and measurements

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'field-to-invoice-media',
    'field-to-invoice-media',
    false, -- Private bucket, requires authentication
    52428800, -- 50MB max file size
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'video/mp4',
        'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'field-to-invoice-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'field-to-invoice-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'field-to-invoice-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'field-to-invoice-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Helper function to generate storage path
CREATE OR REPLACE FUNCTION generate_storage_path(
    user_id UUID,
    site_id UUID,
    file_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || site_id::text || '/' || gen_random_uuid()::text || '.' || file_extension;
END;
$$ LANGUAGE plpgsql;
