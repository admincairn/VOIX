-- ============================================================
-- VOIX — Initial Schema Migration
-- PostgreSQL / Supabase
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────
-- TABLE: plans
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.plans (
  id                    TEXT PRIMARY KEY,                          -- starter | growth | scale
  name                  TEXT        NOT NULL,
  price_monthly         INTEGER     NOT NULL,                      -- cents
  price_yearly          INTEGER     NOT NULL,                      -- cents
  max_testimonials      INTEGER     NOT NULL,                      -- -1 = unlimited
  max_videos_monthly    INTEGER     NOT NULL,                      -- -1 = unlimited
  max_widgets           INTEGER     NOT NULL,                      -- -1 = unlimited
  ls_variant_id_monthly TEXT,                                      -- Lemon Squeezy variant ID
  ls_variant_id_yearly  TEXT,
  features              JSONB       NOT NULL DEFAULT '{}'
);

-- ──────────────────────────────────────────────────────────
-- TABLE: profiles (extends auth.users)
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name      TEXT        NOT NULL    DEFAULT 'My Company',
  company_slug      TEXT        UNIQUE      NOT NULL,             -- /c/acme-labs
  website_url       TEXT,
  logo_url          TEXT,
  plan_id           TEXT        NOT NULL    DEFAULT 'growth'      REFERENCES public.plans(id),
  plan_status       TEXT        NOT NULL    DEFAULT 'trial'       CHECK (plan_status IN ('trial','active','past_due','cancelled','free')),
  trial_ends_at     TIMESTAMPTZ             DEFAULT (now() + INTERVAL '14 days'),
  subscription_id   TEXT,                                         -- Lemon Squeezy subscription ID
  customer_id       TEXT,                                         -- Lemon Squeezy customer ID
  onboarded         BOOLEAN     NOT NULL    DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL    DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL    DEFAULT now()
);

-- ──────────────────────────────────────────────────────────
-- TABLE: testimonials
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.testimonials (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID        NOT NULL    REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name       TEXT        NOT NULL,
  customer_email      TEXT,
  customer_title      TEXT,                                       -- "CEO, Stacker AI"
  customer_avatar_url TEXT,
  content             TEXT        NOT NULL,
  video_url           TEXT,
  video_thumbnail_url TEXT,
  video_duration      INTEGER,                                    -- seconds
  transcript          TEXT,                                       -- auto-generated via Whisper
  rating              INTEGER     CHECK (rating BETWEEN 1 AND 5),
  source              TEXT        NOT NULL    DEFAULT 'manual'    CHECK (source IN ('manual','video','google','g2','capterra','trustpilot')),
  source_id           TEXT,                                       -- external review ID
  source_url          TEXT,                                       -- original review URL
  status              TEXT        NOT NULL    DEFAULT 'pending'   CHECK (status IN ('pending','published','archived','rejected')),
  tags                TEXT[]                  DEFAULT '{}',
  widget_ids          UUID[]                  DEFAULT '{}',       -- widgets this testimonial appears in
  featured            BOOLEAN     NOT NULL    DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL    DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL    DEFAULT now()
);

CREATE INDEX idx_testimonials_profile_id   ON public.testimonials(profile_id);
CREATE INDEX idx_testimonials_status       ON public.testimonials(status);
CREATE INDEX idx_testimonials_source       ON public.testimonials(source);
CREATE INDEX idx_testimonials_created_at   ON public.testimonials(created_at DESC);

-- ──────────────────────────────────────────────────────────
-- TABLE: widgets
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.widgets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL    REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL    CHECK (type IN ('carousel','grid','masonry','single','badge','wall')),
  config      JSONB       NOT NULL    DEFAULT '{"theme":"light","accentColor":"#7c3aed","showRating":true,"showSource":true,"showAvatar":true}',
  filters     JSONB                   DEFAULT '{"minRating":1,"sources":[],"tags":[],"status":"published"}',
  view_count  INTEGER     NOT NULL    DEFAULT 0,
  click_count INTEGER     NOT NULL    DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL    DEFAULT now()
);

CREATE INDEX idx_widgets_profile_id ON public.widgets(profile_id);

-- ──────────────────────────────────────────────────────────
-- TABLE: campaigns
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.campaigns (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID        NOT NULL    REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL    DEFAULT 'email'         CHECK (type IN ('email','link','import')),
  status          TEXT        NOT NULL    DEFAULT 'draft'         CHECK (status IN ('draft','active','paused','completed')),
  config          JSONB       NOT NULL    DEFAULT '{}',           -- {subject, body, trigger, delay}
  sent_count      INTEGER     NOT NULL    DEFAULT 0,
  response_count  INTEGER     NOT NULL    DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL    DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL    DEFAULT now()
);

CREATE INDEX idx_campaigns_profile_id ON public.campaigns(profile_id);

-- ──────────────────────────────────────────────────────────
-- TABLE: invites
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.invites (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID        NOT NULL    REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id     UUID                    REFERENCES public.campaigns(id) ON DELETE SET NULL,
  token           TEXT        UNIQUE      NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  customer_email  TEXT,
  customer_name   TEXT,
  used            BOOLEAN     NOT NULL    DEFAULT false,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL    DEFAULT now()
);

CREATE INDEX idx_invites_token      ON public.invites(token);
CREATE INDEX idx_invites_profile_id ON public.invites(profile_id);

-- ──────────────────────────────────────────────────────────
-- TABLE: activities
-- ──────────────────────────────────────────────────────────
CREATE TABLE public.activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL    REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,                               -- testimonial_submitted | testimonial_published | widget_viewed | campaign_sent | import_completed
  metadata    JSONB                   DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT now()
);

CREATE INDEX idx_activities_profile_id  ON public.activities(profile_id);
CREATE INDEX idx_activities_created_at  ON public.activities(created_at DESC);

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans        ENABLE ROW LEVEL SECURITY;

-- plans: public read
CREATE POLICY "Plans are publicly readable"
  ON public.plans FOR SELECT
  TO public USING (true);

-- profiles: owner only
CREATE POLICY "Users manage their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- testimonials: owner only (public collect handled via service_role in API)
CREATE POLICY "Users manage their own testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Published testimonials readable by embed script (anon)
CREATE POLICY "Published testimonials are publicly readable"
  ON public.testimonials FOR SELECT
  TO anon
  USING (status = 'published');

-- widgets: owner only
CREATE POLICY "Users manage their own widgets"
  ON public.widgets FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Widgets readable by embed script (anon)
CREATE POLICY "Widgets are publicly readable"
  ON public.widgets FOR SELECT
  TO anon
  USING (true);

-- campaigns, invites, activities: owner only
CREATE POLICY "Users manage their own campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users manage their own invites"
  ON public.invites FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Invites readable by anon via token (public collect page)
CREATE POLICY "Invites readable by token holder"
  ON public.invites FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users manage their own activities"
  ON public.activities FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ──────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ──────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_testimonials_updated
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_widgets_updated
  BEFORE UPDATE ON public.widgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter   INTEGER := 0;
BEGIN
  -- Derive slug from email or metadata
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'company_slug', SPLIT_PART(NEW.email, '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  ));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE company_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    company_name,
    company_slug,
    plan_id,
    plan_status,
    trial_ends_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    final_slug,
    'growth',                                    -- trial on Growth plan
    'trial',
    now() + INTERVAL '14 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- SEED DATA
-- ──────────────────────────────────────────────────────────

INSERT INTO public.plans
  (id, name, price_monthly, price_yearly, max_testimonials, max_videos_monthly, max_widgets, features)
VALUES
  (
    'starter',
    'Starter',
    1900,                                         -- $19.00
    19000,                                        -- $190.00 (≈ 2 months free)
    50,
    5,
    1,
    '{"public_page":true,"import":false,"api":false,"custom_branding":false,"analytics":false,"campaigns":false,"priority_support":false}'
  ),
  (
    'growth',
    'Growth',
    3900,                                         -- $39.00
    39000,
    -1,
    30,
    -1,
    '{"public_page":true,"import":true,"api":false,"custom_branding":false,"analytics":true,"campaigns":true,"priority_support":false}'
  ),
  (
    'scale',
    'Scale',
    5900,                                         -- $59.00
    59000,
    -1,
    -1,
    -1,
    '{"public_page":true,"import":true,"api":true,"custom_branding":true,"analytics":true,"campaigns":true,"priority_support":true}'
  )
ON CONFLICT (id) DO NOTHING;
