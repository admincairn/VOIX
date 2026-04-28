-- ============================================================
-- VOIX — Migration 002 — Utility Functions
-- ============================================================

-- RPC: Safely increment campaign response count
-- Called from the public collect endpoint (service role)
CREATE OR REPLACE FUNCTION public.increment_campaign_responses(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.campaigns
  SET response_count = response_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Dashboard metrics helper
-- Returns aggregate stats for a given profile
CREATE OR REPLACE FUNCTION public.get_profile_metrics(p_profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total',     COUNT(*),
    'pending',   COUNT(*) FILTER (WHERE status = 'pending'),
    'published', COUNT(*) FILTER (WHERE status = 'published'),
    'archived',  COUNT(*) FILTER (WHERE status = 'archived'),
    'video',     COUNT(*) FILTER (WHERE source = 'video'),
    'avg_rating', ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL AND status = 'published'), 1)
  )
  INTO result
  FROM public.testimonials
  WHERE profile_id = p_profile_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for widget embed performance (public queries)
CREATE INDEX IF NOT EXISTS idx_testimonials_widget_embed
  ON public.testimonials (profile_id, status)
  WHERE status = 'published';

-- Index for token lookup on collect page
CREATE INDEX IF NOT EXISTS idx_invites_token_active
  ON public.invites (token)
  WHERE used = false;
