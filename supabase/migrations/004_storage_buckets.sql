-- ============================================================
-- VOIX — Migration 004 — Supabase Storage Buckets
-- ============================================================

-- Create bucket for testimonial videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-videos',
  'testimonial-videos',
  true,
  104857600,  -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-m4v']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for video storage (allow public read for testimonials)
CREATE POLICY "Public can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'testimonial-videos');

-- Only authenticated users can upload (service role bypasses this for API routes)
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'testimonial-videos');

-- Profile owners can delete their own videos
CREATE POLICY "Users can delete their own videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'testimonial-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create bucket for customer avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public can view avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated users can update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );