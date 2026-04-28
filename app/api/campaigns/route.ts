// ============================================================
// VOIX — Campaigns API
// GET/POST /api/campaigns
// POST /api/campaigns/[id]/send
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin, logActivity } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://voix.app'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('profile_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check plan allows campaigns
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan:plans(features)')
    .eq('id', session.user.id)
    .single()

  const features = (profile?.plan as { features: Record<string, boolean> } | null)?.features
  if (features && !features.campaigns) {
    return NextResponse.json(
      { error: 'Campaigns are not available on your current plan. Upgrade to Growth.' },
      { status: 403 }
    )
  }

  let body: { name: string; type: string; config: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 })
  }

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({
      profile_id: session.user.id,
      name: body.name.trim(),
      type: body.type ?? 'email',
      status: 'draft',
      config: body.config ?? {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}

// ── POST /api/campaigns/[id]/send ───────────────────────

export async function sendCampaign(req: NextRequest, campaignId: string, profileId: string) {
  const { data: campaign } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('profile_id', profileId)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('company_name, logo_url')
    .eq('id', profileId)
    .single()

  const recipients: string[] = campaign.config?.recipients ?? []
  if (!recipients.length) {
    return NextResponse.json({ error: 'No recipients specified' }, { status: 422 })
  }

  let sentCount = 0
  const errors: string[] = []

  // Rate-limited batch send
  for (const email of recipients) {
    try {
      // Create unique invite token per recipient
      const { data: invite } = await supabaseAdmin
        .from('invites')
        .insert({
          profile_id:    profileId,
          campaign_id:   campaignId,
          customer_email: email,
        })
        .select('token')
        .single()

      if (!invite?.token) continue

      const collectUrl = `${APP_URL}/collect/${invite.token}`
      const subject = campaign.config?.subject ?? `Share your experience with ${profile?.company_name}`
      const body = campaign.config?.body ??
        `Hi,\n\nWe'd love to hear about your experience with ${profile?.company_name}. It only takes 2 minutes.\n\n[Leave your testimonial](${collectUrl})\n\nThank you!`

      await resend.emails.send({
        from:    `${profile?.company_name ?? 'Us'} <noreply@voix.app>`,
        to:      email,
        subject,
        html:    buildEmailHtml(profile?.company_name ?? '', body, collectUrl),
      })

      sentCount++

      // Throttle: ~50 emails/min
      await new Promise(r => setTimeout(r, 1200))
    } catch (err) {
      errors.push(email)
      console.error('[Campaign Send] Failed for:', email, err)
    }
  }

  // Update sent_count
  await supabaseAdmin
    .from('campaigns')
    .update({
      status: 'active',
      sent_count: campaign.sent_count + sentCount,
    })
    .eq('id', campaignId)

  await logActivity(profileId, 'campaign_sent', {
    campaign_id: campaignId,
    sent: sentCount,
    failed: errors.length,
  })

  return NextResponse.json({ sent: sentCount, failed: errors })
}

// ── Email HTML template ──────────────────────────────────

function buildEmailHtml(companyName: string, body: string, collectUrl: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#7c3aed">$1</a>')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:24px 32px">
      <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.02em">${companyName}</div>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;line-height:1.7">${escaped}</p>
      <div style="margin-top:28px;text-align:center">
        <a href="${collectUrl}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px">
          Share my experience →
        </a>
      </div>
      <p style="margin-top:24px;color:#9ca3af;font-size:12px;text-align:center">
        You received this because ${companyName} values your feedback.<br>
        <a href="#" style="color:#9ca3af">Unsubscribe</a>
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center">
      <span style="font-size:11px;color:#9ca3af">Powered by <a href="https://voix.app" style="color:#7c3aed;text-decoration:none">Voix</a></span>
    </div>
  </div>
</body>
</html>`
}
