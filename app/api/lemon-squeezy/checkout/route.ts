// ============================================================
// VOIX — Create Checkout Session
// POST /api/lemon-squeezy/checkout
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckout } from '@/lib/lemon-squeezy'
import type { PlanId } from '@/types'

const VALID_PLANS: PlanId[] = ['starter', 'growth', 'scale']

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Validate body ───────────────────────────────────────
  let body: { planId: PlanId }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { planId } = body

  if (!planId || !VALID_PLANS.includes(planId)) {
    return NextResponse.json(
      { error: `Invalid planId. Must be one of: ${VALID_PLANS.join(', ')}` },
      { status: 422 }
    )
  }

  // ── Create checkout URL ─────────────────────────────────
  try {
    const checkoutUrl = await createCheckout({
      planId,
      userEmail:   session.user.email!,
      userId:      session.user.id,
      companyName: session.user.companyName,
    })

    return NextResponse.json({ url: checkoutUrl })
  } catch (err) {
    console.error('[Checkout] Failed to create checkout session:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
