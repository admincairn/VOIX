// ============================================================
// VOIX — Supabase Server Client
// ⚠️  server-only — NEVER import in browser components
// Use ONLY in API routes, Server Components, and webhooks
// ============================================================

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("[Voix] Missing Supabase service role key");
}

// ── Server client (service role — bypasses RLS) ───────────
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// ── Typed query helpers ───────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*, plan:plans(*)")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function getTestimonials(
  profileId: string,
  options: {
    status?: string;
    source?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  let query = supabaseAdmin
    .from("testimonials")
    .select("*", { count: "exact" })
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (options.status) query = query.eq("status", options.status);
  if (options.source) query = query.eq("source", options.source);
  if (options.limit) query = query.limit(options.limit);
  if (options.offset)
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 20) - 1,
    );

  return query;
}

export async function getDashboardMetrics(profileId: string) {
  const [
    { count: total },
    { count: videos },
    { count: pending },
    { count: published },
    { data: widgetStats },
    { data: ratingData },
  ] = await Promise.all([
    supabaseAdmin
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId),
    supabaseAdmin
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("source", "video"),
    supabaseAdmin
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "pending"),
    supabaseAdmin
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("status", "published"),
    supabaseAdmin
      .from("widgets")
      .select("view_count")
      .eq("profile_id", profileId),
    supabaseAdmin
      .from("testimonials")
      .select("rating")
      .eq("profile_id", profileId)
      .eq("status", "published")
      .not("rating", "is", null),
  ]);

  const totalViews =
    (widgetStats as any[] | null)?.reduce(
      (sum: number, w: any) => sum + (w.view_count ?? 0),
      0,
    ) ?? 0;
  const avgRating =
    (ratingData as any[] | null) && (ratingData as any[] | null)!.length > 0
      ? (ratingData as any[] | null)!.reduce(
          (sum: number, t: any) => sum + (t.rating ?? 0),
          0,
        ) / (ratingData as any[] | null)!.length
      : 0;

  return {
    total_testimonials: total ?? 0,
    video_testimonials: videos ?? 0,
    widget_views: totalViews,
    average_rating: Math.round(avgRating * 10) / 10,
    pending_count: pending ?? 0,
    published_count: published ?? 0,
  };
}

export async function logActivity(
  profileId: string,
  type: string,
  metadata: Record<string, any> = {},
) {
  await supabaseAdmin
    .from("activities")
    .insert({ profile_id: profileId, type, metadata } as any);
}
