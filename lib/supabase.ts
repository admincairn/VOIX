// ============================================================
// VOIX — Supabase Client
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

// Lazy initialization to support Edge Runtime
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('[Voix] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey: supabaseServiceKey ?? supabaseAnonKey }
}

// ── Browser client (anon key, respects RLS) ──────────────
export const supabase = createClient<Database>(
  getSupabaseConfig().supabaseUrl,
  getSupabaseConfig().supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// ── Server client (service role — bypasses RLS) ───────────
// Use ONLY in trusted server contexts (API routes, webhooks)
export const supabaseAdmin = createClient<Database>(
  getSupabaseConfig().supabaseUrl,
  getSupabaseConfig().supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// ── Storage helpers ───────────────────────────────────────

export const STORAGE_BUCKET_VIDEOS = 'videos'

/**
 * Upload a file to Supabase Storage
 */
export async function uploadVideo(
  file: Buffer | ArrayBuffer,
  filename: string,
  contentType: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET_VIDEOS)
    .upload(filename, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error('[Supabase] Upload error:', error)
    return { data: null, error }
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET_VIDEOS)
    .getPublicUrl(data.path)

  return {
    data: {
      path: data.path,
      url: urlData.publicUrl,
    },
    error: null,
  }
}

/**
 * Get a signed URL for private video access (valid 24h)
 */
export async function getSignedVideoUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET_VIDEOS)
    .createSignedUrl(path, 86400)

  if (error) {
    return { data: null, error }
  }

  return { data: { url: data.signedUrl, expiresAt: data.expiresAt }, error: null }
}

/**
 * Delete a video from storage
 */
export async function deleteVideo(path: string) {
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET_VIDEOS)
    .remove([path])

  return { error }
}

// ── Typed query helpers ───────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, plan:plans(*)')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function getTestimonials(
  profileId: string,
  options: {
    status?: string
    source?: string
    limit?: number
    offset?: number
  } = {}
) {
  let query = supabaseAdmin
    .from('testimonials')
    .select('*', { count: 'exact' })
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (options.status) query = query.eq('status', options.status)
  if (options.source) query = query.eq('source', options.source)
  if (options.limit)  query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)

  return query
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
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', profileId),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', profileId).eq('source', 'video'),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', profileId).eq('status', 'pending'),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', profileId).eq('status', 'published'),
    supabaseAdmin.from('widgets').select('view_count').eq('profile_id', profileId),
    supabaseAdmin.from('testimonials').select('rating').eq('profile_id', profileId).eq('status', 'published').not('rating', 'is', null),
  ])

  const totalViews = widgetStats?.reduce((sum, w) => sum + (w.view_count ?? 0), 0) ?? 0
  const avgRating = ratingData && ratingData.length > 0
    ? ratingData.reduce((sum, t) => sum + (t.rating ?? 0), 0) / ratingData.length
    : 0

  return {
    total_testimonials: total ?? 0,
    video_testimonials: videos ?? 0,
    widget_views: totalViews,
    average_rating: Math.round(avgRating * 10) / 10,
    pending_count: pending ?? 0,
    published_count: published ?? 0,
  }
}

export async function logActivity(
  profileId: string,
  type: string,
  metadata: Record<string, unknown> = {}
) {
  await supabaseAdmin.from('activities').insert({ profile_id: profileId, type, metadata })
}
