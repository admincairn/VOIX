-- ============================================================
-- VOIX — Migration 004 — Supabase Storage Setup
-- Creates the video storage bucket for testimonials
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- STORAGE BUCKET: testimonial-videos
-- ──────────────────────────────────────────────────────────

-- Create the storage bucket (if using Supabase local or CLI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-videos',
  'testimonial-videos',
  true,  -- Public bucket for embedded videos
  104857600,  -- 100MB file size limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- STORAGE POLICIES
-- ──────────────────────────────────────────────────────────

-- Allow anyone to upload files (service role bypasses RLS)
-- The API route handles authentication and authorization
CREATE POLICY "Service role can upload videos"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'testimonial-videos');

-- Allow public read access to videos (for embed on websites)
CREATE POLICY "Public can view videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'testimonial-videos');

-- Allow authenticated users to update their own videos
CREATE POLICY "Users can update their own videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'testimonial-videos')
  WITH CHECK (bucket_id = 'testimonial-videos');

-- Allow service role to delete videos
CREATE POLICY "Service role can delete videos"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'testimonial-videos');

-- ──────────────────────────────────────────────────────────
-- NOTES FOR MANUAL SETUP
-- ──────────────────────────────────────────────────────────
-- If you're using the Supabase Dashboard instead of CLI:
--
-- 1. Go to Storage in your Supabase project
-- 2. Create a new bucket named "testimonial-videos"
-- 3. Set it to Public
-- 4. Add these policies in the Policies tab:
--
-- Policy 1 (Insert - for uploads):
--   Target roles: service_role
--   WITH CHECK: bucket_id = 'testimonial-videos'
--
-- Policy 2 (Select - for public viewing):
--   Target roles: public
--   USING: bucket_id = 'testimonial-videos'
--
-- 5. Set allowed MIME types:
--    video/mp4, video/webm, video/quicktime, video/x-msvideo
--
-- 6. Set max file size: 100MB
