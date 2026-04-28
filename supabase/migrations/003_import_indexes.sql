-- ============================================================
-- VOIX — Migration 003 — Import Optimizations
-- ============================================================

-- Composite index for source deduplication
-- Used by: getExistingSourceIds() in the import orchestrator
-- Query: WHERE profile_id = $1 AND source_id = ANY($2)
CREATE INDEX IF NOT EXISTS idx_testimonials_dedup
  ON public.testimonials (profile_id, source_id)
  WHERE source_id IS NOT NULL;

-- Index for filtering by source on the dashboard
CREATE INDEX IF NOT EXISTS idx_testimonials_profile_source
  ON public.testimonials (profile_id, source);

-- Partial index for activity feed (import events only)
CREATE INDEX IF NOT EXISTS idx_activities_imports
  ON public.activities (profile_id, created_at DESC)
  WHERE type = 'import_completed';
