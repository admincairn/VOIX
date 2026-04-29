// ============================================================
// VOIX — TypeScript Type Definitions
// ============================================================

// ──────────────────────────────────────────────────────────
// PLANS
// ──────────────────────────────────────────────────────────

export type PlanId = "starter" | "growth" | "scale";
export type PlanStatus = "trial" | "active" | "past_due" | "cancelled" | "free";

export interface PlanFeatures {
  public_page: boolean;
  import: boolean;
  api: boolean;
  custom_branding: boolean;
  analytics: boolean;
  campaigns: boolean;
  priority_support: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price_monthly: number; // cents
  price_yearly: number; // cents
  max_testimonials: number; // -1 = unlimited
  max_videos_monthly: number; // -1 = unlimited
  max_widgets: number; // -1 = unlimited
  ls_variant_id_monthly?: string;
  ls_variant_id_yearly?: string;
  features: PlanFeatures;
}

// ──────────────────────────────────────────────────────────
// PROFILE
// ──────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  company_name: string;
  company_slug: string;
  website_url: string | null;
  logo_url: string | null;
  plan_id: PlanId;
  plan_status: PlanStatus;
  trial_ends_at: string | null;
  subscription_id: string | null;
  customer_id: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
  // joined
  plan?: Plan;
}

export interface ProfileWithPlan extends Profile {
  plan: Plan;
}

// ──────────────────────────────────────────────────────────
// TESTIMONIALS
// ──────────────────────────────────────────────────────────

export type TestimonialSource =
  | "manual"
  | "video"
  | "google"
  | "g2"
  | "capterra"
  | "trustpilot";
export type TestimonialStatus =
  | "pending"
  | "published"
  | "archived"
  | "rejected";

export interface Testimonial {
  id: string;
  profile_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_title: string | null;
  customer_avatar_url: string | null;
  content: string;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_duration: number | null; // seconds
  transcript: string | null;
  rating: number | null;
  source: TestimonialSource;
  source_id: string | null;
  source_url: string | null;
  status: TestimonialStatus;
  tags: string[];
  widget_ids: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialCreateInput {
  customer_name: string;
  customer_email?: string;
  customer_title?: string;
  customer_avatar_url?: string;
  content: string;
  video_url?: string;
  video_thumbnail_url?: string;
  video_duration?: number;
  transcript?: string;
  rating?: number;
  source: TestimonialSource;
  source_id?: string;
  source_url?: string;
  tags?: string[];
}

export interface TestimonialUpdateInput extends Partial<TestimonialCreateInput> {
  status?: TestimonialStatus;
  featured?: boolean;
}

// ──────────────────────────────────────────────────────────
// WIDGETS
// ──────────────────────────────────────────────────────────

export type WidgetType =
  | "carousel"
  | "grid"
  | "masonry"
  | "single"
  | "badge"
  | "wall";

export interface WidgetConfig {
  theme: "light" | "dark";
  accentColor: string;
  showRating: boolean;
  showSource: boolean;
  showAvatar: boolean;
  autoplay?: boolean;
  autoplayInterval?: number; // ms
  maxItems?: number;
}

export interface WidgetFilters {
  minRating: number;
  sources: TestimonialSource[];
  tags: string[];
  status: TestimonialStatus;
}

export interface Widget {
  id: string;
  profile_id: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  filters: WidgetFilters;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface WidgetCreateInput {
  name: string;
  type: WidgetType;
  config?: Partial<WidgetConfig>;
  filters?: Partial<WidgetFilters>;
}

// ──────────────────────────────────────────────────────────
// CAMPAIGNS
// ──────────────────────────────────────────────────────────

export type CampaignType = "email" | "link" | "import";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface CampaignConfig {
  subject?: string;
  body?: string;
  from_name?: string;
  trigger?: "manual" | "post_purchase" | "post_onboarding";
  delay_days?: number;
  recipients?: string[]; // email list
  import_url?: string; // for import type
  import_source?: TestimonialSource;
}

export interface Campaign {
  id: string;
  profile_id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  config: CampaignConfig;
  sent_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────
// INVITES
// ──────────────────────────────────────────────────────────

export interface Invite {
  id: string;
  profile_id: string;
  campaign_id: string | null;
  token: string;
  customer_email: string | null;
  customer_name: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
  // joined
  profile?: Pick<Profile, "company_name" | "company_slug" | "logo_url">;
}

// ──────────────────────────────────────────────────────────
// ACTIVITIES
// ──────────────────────────────────────────────────────────

export type ActivityType =
  | "testimonial_submitted"
  | "testimonial_published"
  | "testimonial_rejected"
  | "widget_viewed"
  | "widget_created"
  | "campaign_sent"
  | "import_completed"
  | "subscription_activated"
  | "subscription_cancelled";

export interface Activity {
  id: string;
  profile_id: string;
  type: ActivityType;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ──────────────────────────────────────────────────────────
// DASHBOARD METRICS
// ──────────────────────────────────────────────────────────

export interface DashboardMetrics {
  total_testimonials: number;
  video_testimonials: number;
  widget_views: number;
  average_rating: number;
  pending_count: number;
  published_count: number;
  // trends (vs. last 7 days) — optionnelles pour compatibilité
  testimonials_delta?: number;
  video_delta?: number;
  views_delta_pct?: number;
}

// ──────────────────────────────────────────────────────────
// API RESPONSES
// ──────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ──────────────────────────────────────────────────────────
// LEMON SQUEEZY
// ──────────────────────────────────────────────────────────

export interface LsWebhookPayload {
  meta: {
    event_name: LsEventName;
    custom_data?: Record<string, string>;
    webhook_id: string;
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
    relationships?: Record<string, unknown>;
  };
}

export type LsEventName =
  | "order_created"
  | "order_refunded"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_payment_success"
  | "subscription_payment_failed";

// ──────────────────────────────────────────────────────────
// COLLECT (public form)
// ──────────────────────────────────────────────────────────

export interface CollectSubmitInput {
  customer_name: string;
  customer_email?: string;
  customer_title?: string;
  content: string;
  rating: number;
  video_url?: string;
  video_duration?: number;
  consent_display: boolean;
  consent_social?: boolean;
}

// ──────────────────────────────────────────────────────────
// EMBED (public widget script)
// ──────────────────────────────────────────────────────────

export interface EmbedData {
  widget: Pick<Widget, "id" | "type" | "config">;
  testimonials: Pick<
    Testimonial,
    | "id"
    | "customer_name"
    | "customer_title"
    | "customer_avatar_url"
    | "content"
    | "video_url"
    | "rating"
    | "source"
    | "featured"
  >[];
  profile: Pick<Profile, "company_name" | "logo_url">;
}
