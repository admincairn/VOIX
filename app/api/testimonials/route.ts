// ============================================================
// VOIX — Testimonials API
// GET/POST /api/testimonials
// PATCH/DELETE /api/testimonials/[id]
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin, logActivity } from '@/lib/supabase'
import type { TestimonialCreateInput, TestimonialStatus } from '@/types'

// ── GET /api/testimonials ─────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status') as TestimonialStatus | null
  const source  = searchParams.get('source')
  const limit   = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset  = parseInt(searchParams.get('offset') ?? '0', 10)

  let query = supabaseAdmin
    .from('testimonials')
    .select('*', { count: 'exact' })
    .eq('profile_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('source', source)

  const { data, error, count } = await query

  if (error) {
    console.error('[Testimonials GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, total: count, limit, offset })
}

// ── POST /api/testimonials ────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Enforce plan limits ─────────────────────────────────
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan_id, plan_status, plan:plans(max_testimonials, max_videos_monthly)')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const plan = profile.plan as { max_testimonials: number; max_videos_monthly: number } | null

  // Check total testimonials limit
  if (plan && plan.max_testimonials !== -1) {
    const { count } = await supabaseAdmin
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', session.user.id)

    if ((count ?? 0) >= plan.max_testimonials) {
      return NextResponse.json(
        { error: `Plan limit reached. Upgrade to add more than ${plan.max_testimonials} testimonials.` },
        { status: 403 }
      )
    }
  }

  // ── Parse and validate body ─────────────────────────────
  let body: TestimonialCreateInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.customer_name?.trim()) {
    return NextResponse.json({ error: 'customer_name is required' }, { status: 422 })
  }
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 422 })
  }

  // ── Insert ──────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({
      profile_id:          session.user.id,
      customer_name:       body.customer_name.trim(),
      customer_email:      body.customer_email?.trim() ?? null,
      customer_title:      body.customer_title?.trim() ?? null,
      customer_avatar_url: body.customer_avatar_url ?? null,
      content:             body.content.trim(),
      video_url:           body.video_url ?? null,
      video_duration:      body.video_duration ?? null,
      transcript:          body.transcript ?? null,
      rating:              body.rating ?? null,
      source:              body.source ?? 'manual',
      source_id:           body.source_id ?? null,
      source_url:          body.source_url ?? null,
      tags:                body.tags ?? [],
      status:              'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('[Testimonials POST]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logActivity(session.user.id, 'testimonial_submitted', {
    testimonial_id: data.id,
    source: data.source,
  })

  return NextResponse.json({ data }, { status: 201 })
}
