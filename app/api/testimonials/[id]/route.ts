// ============================================================
// VOIX — Testimonial by ID
// PATCH /api/testimonials/[id]
// DELETE /api/testimonials/[id]
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin, logActivity } from '@/lib/supabase'
import type { TestimonialUpdateInput } from '@/types'

type Params = { params: { id: string } }

// ── PATCH /api/testimonials/[id] ─────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: TestimonialUpdateInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Ensure the testimonial belongs to this user
  const { data: existing } = await supabaseAdmin
    .from('testimonials')
    .select('id, profile_id, status')
    .eq('id', params.id)
    .single()

  if (!existing || existing.profile_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update({
      ...(body.customer_name       && { customer_name: body.customer_name.trim() }),
      ...(body.customer_email      && { customer_email: body.customer_email.trim() }),
      ...(body.customer_title      && { customer_title: body.customer_title.trim() }),
      ...(body.content             && { content: body.content.trim() }),
      ...(body.rating              && { rating: body.rating }),
      ...(body.status              && { status: body.status }),
      ...(body.tags                && { tags: body.tags }),
      ...(body.featured !== undefined && { featured: body.featured }),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[Testimonials PATCH]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log status transitions
  if (body.status && body.status !== existing.status) {
    const activityType = body.status === 'published' ? 'testimonial_published'
      : body.status === 'rejected' ? 'testimonial_rejected'
      : 'testimonial_submitted'

    await logActivity(session.user.id, activityType, { testimonial_id: params.id })
  }

  return NextResponse.json({ data })
}

// ── DELETE /api/testimonials/[id] ────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabaseAdmin
    .from('testimonials')
    .select('id, profile_id')
    .eq('id', params.id)
    .single()

  if (!existing || existing.profile_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('testimonials')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
