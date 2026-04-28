-- ============================================================
-- VOIX — Migration 004 — Video Storage Bucket
-- ============================================================

-- Create the bucket for testimonial videos
-- The bucket ID must be "testimonial-videos" to match the API route
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-videos',
  'testimonial-videos',
  true,  -- Public bucket so videos can be embedded
  104857600,  -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the videos bucket

-- Allow authenticated users to upload videos (service role bypasses RLS)
-- For the public collect form, we use signed URLs or service role
-- from API routes instead of direct browser uploads

-- Anyone can view (read) videos (they're public testimonials)
CREATE POLICY "Videos are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'testimonial-videos');

-- Allow service role to upload (API routes use supabaseAdmin)
CREATE POLICY "Service role can upload videos"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'testimonial-videos');

-- Allow service role to delete videos
CREATE POLICY "Service role can delete videos"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'testimonial-videos');

-- Note: For the public collect form, videos are uploaded through
-- the /api/upload/video endpoint which uses the service role key
-- This ensures videos are properly validated and associated with
-- the correct profile before being stored
