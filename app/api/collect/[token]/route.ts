// ============================================================
// VOIX — Public Collect Route
// POST /api/collect/[token]
// No authentication required — validated by token
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdminUntyped } from '@/lib/supabase'
import type { CollectSubmitInput } from '@/types'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type Params = { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params

  // ── 1. Validate the invite token ─────────────────────────
  const { data: invite, error: inviteError } = await supabaseAdminUntyped
    .from('invites')
    .select('*, profile:profiles(id, company_name, plan_id, plan_status)')
    .eq('token', token)
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  if ((invite as Record<string, unknown>).used) {
    return NextResponse.json({ error: 'This link has already been used' }, { status: 409 })
  }

  const profile = (invite as Record<string, unknown>).profile as { id: string; company_name: string; plan_id: string; plan_status: string } | null
  if (!profile) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  // ── 2. Check if account is active (trial or active) ──────
  if (!['trial', 'active'].includes(profile.plan_status)) {
    return NextResponse.json(
      { error: 'This account is no longer accepting testimonials' },
      { status: 403 }
    )
  }

  // ── 3. Parse and validate submission ─────────────────────
  let body: CollectSubmitInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.customer_name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 })
  }
  if (!body.content?.trim() && !body.video_url) {
    return NextResponse.json({ error: 'Testimonial text or video is required' }, { status: 422 })
  }
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 422 })
  }
  if (!body.consent_display) {
    return NextResponse.json({ error: 'Display consent is required' }, { status: 422 })
  }

  // ── 4. Create testimonial (status: pending) ───────────────
  const { data: testimonial, error: testimonialError } = await supabaseAdminUntyped
    .from('testimonials')
    .insert({
      profile_id:     profile.id,
      customer_name:  body.customer_name.trim(),
      customer_email: body.customer_email?.trim() ?? (invite as Record<string, unknown>).customer_email ?? null,
      customer_title: body.customer_title?.trim() ?? null,
      content:        body.content?.trim() ?? '',
      video_url:      body.video_url ?? null,
      video_duration: body.video_duration ?? null,
      rating:         body.rating,
      source:         body.video_url ? 'video' : 'manual',
      status:         'pending',
      tags:           [],
    })
    .select()
    .single()

  if (testimonialError) {
    console.error('[Collect POST] testimonial insert failed:', testimonialError)
    return NextResponse.json({ error: 'Failed to save testimonial' }, { status: 500 })
  }

  // ── 5. Mark invite as used ────────────────────────────────
  await supabaseAdminUntyped
    .from('invites')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('token', token)

  // ── 6. Increment campaign response count ─────────────────
  const campaignId = (invite as Record<string, unknown>).campaign_id
  if (campaignId) {
    await supabaseAdminUntyped.rpc('increment_campaign_responses', {
      campaign_id: campaignId,
    })
  }

  // ── 7. Log activity ───────────────────────────────────────
  const testimonialData = testimonial as Record<string, unknown> | null
  await supabaseAdminUntyped.from('activities').insert({
    profile_id: profile.id,
    type: 'testimonial_submitted',
    description: `New testimonial from ${body.customer_name}`,
    metadata: {
      testimonial_id: testimonialData?.id,
      source: testimonialData?.source,
      campaign_id: campaignId,
    },
  })

  // ── 8. Notify the profile owner ───────────────────────────
  try {
    // Récupérer l'email du owner via la table profiles
    const { data: ownerProfile } = await supabaseAdminUntyped
      .from('profiles')
      .select('email')
      .eq('id', profile.id)
      .single()

    const ownerEmail = (ownerProfile as Record<string, unknown> | null)?.email as string | undefined

    if (ownerEmail) {
      await resend.emails.send({
        from:    'Voix <notifications@voix.app>',
        to:      ownerEmail,
        subject: `New testimonial from ${body.customer_name} ⭐`,
        html: `
          <p>Hi there,</p>
          <p><strong>${body.customer_name}</strong> just submitted a ${body.rating}-star testimonial on Voix.</p>
          <blockquote style="border-left: 3px solid #7c3aed; padding-left: 12px; margin: 16px 0; color: #374151;">
            "${body.content?.substring(0, 200) ?? 'Video testimonial'}${(body.content?.length ?? 0) > 200 ? '…' : ''}"
          </blockquote>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/testimonials?id=${testimonialData?.id}" 
               style="display:inline-block;padding:10px 20px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;">
              Review testimonial →
            </a>
          </p>
          <p style="color:#9ca3af;font-size:12px;">Powered by Voix</p>
        `,
      })
    }
  } catch (emailErr) {
    // Non-critical
    console.error('[Collect POST] Owner notification failed:', emailErr)
  }

  return NextResponse.json(
    { message: 'Testimonial submitted successfully', id: testimonialData?.id },
    { status: 201 }
  )
}

// ── GET /api/collect/[token] — validate token for the form ─

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const { data: invite } = await supabaseAdminUntyped
    .from('invites')
    .select('customer_name, customer_email, used, profile:profiles(company_name, logo_url, company_slug)')
    .eq('token', token)
    .single()

  if (!invite || (invite as Record<string, unknown>).used) {
    return NextResponse.json({ error: 'Invalid or used link' }, { status: 404 })
  }

  const inviteData = invite as Record<string, unknown>

  return NextResponse.json({
    customer_name:  inviteData.customer_name,
    customer_email: inviteData.customer_email,
    company:        inviteData.profile,
  })
}
