// ============================================================
// VOIX — Analytics API
// GET /api/analytics?range=7d|30d|90d
// Returns: time-series, top widgets, source breakdown, ratings
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth }                      from '@/lib/auth'
import { supabaseAdmin }             from '@/lib/supabase'

export type AnalyticsRange = '7d' | '30d' | '90d'

export interface DailyPoint {
  date:        string   // YYYY-MM-DD
  testimonials: number
  views:       number
}

export interface SourceBreakdown {
  source: string
  count:  number
  pct:    number
}

export interface WidgetPerf {
  id:          string
  name:        string
  type:        string
  view_count:  number
  click_count: number
  ctr:         number   // click-through rate %
}

export interface RatingDistribution {
  rating: number   // 1-5
  count:  number
  pct:    number
}

export interface AnalyticsPayload {
  range:       AnalyticsRange
  summary: {
    total_testimonials:  number
    published:           number
    pending:             number
    total_views:         number
    avg_rating:          number
    response_rate:       number
    // vs previous period
    testimonials_delta:  number
    views_delta:         number
    rating_delta:        number
  }
  daily:        DailyPoint[]
  sources:      SourceBreakdown[]
  widgets:      WidgetPerf[]
  ratings:      RatingDistribution[]
}

// ── Helpers ───────────────────────────────────────────────

function rangeToInterval(range: AnalyticsRange): number {
  return range === '7d' ? 7 : range === '30d' ? 30 : 90
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Fill in zero-value days for a complete time series
function fillTimeSeries(
  data: { date: string; testimonials: number }[],
  days: number
): DailyPoint[] {
  const map = new Map(data.map(d => [d.date, d.testimonials]))
  const result: DailyPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    const key = isoDate(d)
    result.push({ date: key, testimonials: map.get(key) ?? 0, views: 0 })
  }
  return result
}

// ── Handler ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const range  = (req.nextUrl.searchParams.get('range') ?? '30d') as AnalyticsRange
  const days   = rangeToInterval(range)
  const since  = daysAgo(days)
  const prevSince = daysAgo(days * 2)

  // ── Parallel queries ─────────────────────────────────────
  const [
    { data: allTestimonials },
    { data: currentPeriodT },
    { data: prevPeriodT },
    { data: widgets },
    { data: sources },
    { data: campaigns },
  ] = await Promise.all([
    // All testimonials (for ratings distribution + totals)
    supabaseAdmin
      .from('testimonials')
      .select('id, status, rating, source, created_at')
      .eq('profile_id', userId),

    // Current period
    supabaseAdmin
      .from('testimonials')
      .select('id, created_at')
      .eq('profile_id', userId)
      .gte('created_at', since),

    // Previous period (for deltas)
    supabaseAdmin
      .from('testimonials')
      .select('id, created_at')
      .eq('profile_id', userId)
      .gte('created_at', prevSince)
      .lt('created_at', since),

    // Widget performance
    supabaseAdmin
      .from('widgets')
      .select('id, name, type, view_count, click_count')
      .eq('profile_id', userId)
      .order('view_count', { ascending: false })
      .limit(10),

    // Source breakdown
    supabaseAdmin
      .from('testimonials')
      .select('source')
      .eq('profile_id', userId),

    // Campaigns for response rate calculation
    supabaseAdmin
      .from('campaigns')
      .select('sent_count, response_count')
      .eq('profile_id', userId),
  ])

  const all = allTestimonials ?? []
  const curr = currentPeriodT ?? []
  const prev = prevPeriodT ?? []

  // ── Summary stats ─────────────────────────────────────────
  const published  = all.filter(t => t.status === 'published').length
  const pending    = all.filter(t => t.status === 'pending').length
  const rated      = all.filter(t => t.rating != null)
  const avgRating  = rated.length
    ? Math.round((rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length) * 10) / 10
    : 0

  const totalViews = (widgets ?? []).reduce((s, w) => s + (w.view_count ?? 0), 0)

  // Calculate response rate from campaigns
  const totalSent = (campaigns ?? []).reduce((s, c) => s + (c.sent_count ?? 0), 0)
  const totalResponses = (campaigns ?? []).reduce((s, c) => s + (c.response_count ?? 0), 0)
  const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0

  const testimonialsCurrentCount = curr.length
  const testimonialsPrevCount    = prev.length
  const testimonialsDelta = testimonialsPrevCount
    ? Math.round(((testimonialsCurrentCount - testimonialsPrevCount) / testimonialsPrevCount) * 100)
    : testimonialsCurrentCount > 0 ? 100 : 0

  // ── Daily time series ──────────────────────────────────────
  const dailyMap = new Map<string, number>()
  for (const t of curr) {
    const day = (t.created_at as string).split('T')[0]
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
  }

  const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    testimonials: count,
  }))

  const daily = fillTimeSeries(dailyData, days)

  // ── Source breakdown ──────────────────────────────────────
  const sourceMap = new Map<string, number>()
  for (const { source } of (sources ?? [])) {
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1)
  }

  const totalSources = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0)
  const sourcesArr: SourceBreakdown[] = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      pct: totalSources ? Math.round((count / totalSources) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // ── Widget performance ─────────────────────────────────────
  const widgetPerf: WidgetPerf[] = (widgets ?? []).map(w => ({
    id:          w.id,
    name:        w.name,
    type:        w.type,
    view_count:  w.view_count ?? 0,
    click_count: w.click_count ?? 0,
    ctr:         w.view_count
      ? Math.round(((w.click_count ?? 0) / w.view_count) * 100 * 10) / 10
      : 0,
  }))

  // ── Rating distribution ────────────────────────────────────
  const ratingMap = new Map<number, number>([1, 2, 3, 4, 5].map(r => [r, 0]))
  for (const t of all.filter(t => t.rating)) {
    ratingMap.set(t.rating!, (ratingMap.get(t.rating!) ?? 0) + 1)
  }

  const totalRated = Array.from(ratingMap.values()).reduce((a, b) => a + b, 0)
  const ratingsArr: RatingDistribution[] = Array.from(ratingMap.entries())
    .map(([rating, count]) => ({
      rating,
      count,
      pct: totalRated ? Math.round((count / totalRated) * 100) : 0,
    }))
    .sort((a, b) => b.rating - a.rating)

  const payload: AnalyticsPayload = {
    range,
    summary: {
      total_testimonials: all.length,
      published,
      pending,
      total_views: totalViews,
      avg_rating: avgRating,
      response_rate: responseRate,
      testimonials_delta: testimonialsDelta,
      views_delta: 0,
      rating_delta: 0,
    },
    daily,
    sources: sourcesArr,
    widgets: widgetPerf,
    ratings: ratingsArr,
  }

  return NextResponse.json({ data: payload })
}
