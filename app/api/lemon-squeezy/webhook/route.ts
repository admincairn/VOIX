// ============================================================
// VOIX — Lemon Squeezy Webhook Handler
// POST /api/lemon-squeezy/webhook
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  parseWebhookAttributes,
  mapLsStatusToPlanStatus,
} from '@/lib/lemon-squeezy'
import { supabaseAdmin, logActivity } from '@/lib/supabase'
import type { LsWebhookPayload, PlanId } from '@/types'

export const runtime = 'nodejs'

// Stripe-style: read raw body for HMAC verification
export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-signature')

  // ── 1. Verify signature ─────────────────────────────────
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let payload: LsWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = payload.meta.event_name
  console.log(`[Webhook] Event received: ${eventName}`)

  try {
    switch (eventName) {
      // ── New order (one-time or first subscription payment) ─
      case 'order_created':
        await handleOrderCreated(payload)
        break

      // ── Subscription lifecycle ───────────────────────────
      case 'subscription_created':
        await handleSubscriptionCreated(payload)
        break

      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_payment_success':
        await handleSubscriptionUpdated(payload)
        break

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(payload)
        break

      case 'subscription_paused':
      case 'subscription_payment_failed':
        await handleSubscriptionPastDue(payload)
        break

      default:
        console.log(`[Webhook] Unhandled event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`[Webhook] Handler error for ${eventName}:`, err)
    // Return 200 to prevent LS from retrying — log to Sentry in prod
    return NextResponse.json({ received: true, warning: 'Handler failed' })
  }
}

// ── Handlers ─────────────────────────────────────────────

async function handleOrderCreated(payload: LsWebhookPayload) {
  const { userId, planId, customerId } = parseWebhookAttributes(payload)
  if (!userId || !planId) {
    console.warn('[Webhook] order_created missing user_id or plan_id in custom_data')
    return
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      plan_id:     planId as PlanId,
      plan_status: 'active',
      customer_id: customerId,
    })
    .eq('id', userId)

  await logActivity(userId, 'subscription_activated', { planId, event: 'order_created' })
}

async function handleSubscriptionCreated(payload: LsWebhookPayload) {
  const { userId, planId, subscriptionId, customerId, status } = parseWebhookAttributes(payload)
  if (!userId || !planId) {
    console.warn('[Webhook] subscription_created missing user_id')
    return
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      plan_id:         planId as PlanId,
      plan_status:     mapLsStatusToPlanStatus(status ?? 'active'),
      subscription_id: subscriptionId,
      customer_id:     customerId,
      trial_ends_at:   null,
    })
    .eq('id', userId)

  await logActivity(userId, 'subscription_activated', { planId, subscriptionId })
}

async function handleSubscriptionUpdated(payload: LsWebhookPayload) {
  const { userId, planId, subscriptionId, status } = parseWebhookAttributes(payload)
  if (!userId) return

  const updatePayload: Record<string, unknown> = {
    plan_status: mapLsStatusToPlanStatus(status ?? 'active'),
  }

  if (planId) updatePayload.plan_id = planId
  if (subscriptionId) updatePayload.subscription_id = subscriptionId

  await supabaseAdmin.from('profiles').update(updatePayload).eq('id', userId)
}

async function handleSubscriptionCancelled(payload: LsWebhookPayload) {
  const { userId, subscriptionId } = parseWebhookAttributes(payload)
  if (!userId) return

  await supabaseAdmin
    .from('profiles')
    .update({ plan_status: 'cancelled' })
    .eq('id', userId)

  await logActivity(userId, 'subscription_cancelled', { subscriptionId })
}

async function handleSubscriptionPastDue(payload: LsWebhookPayload) {
  const { userId } = parseWebhookAttributes(payload)
  if (!userId) return

  await supabaseAdmin
    .from('profiles')
    .update({ plan_status: 'past_due' })
    .eq('id', userId)
}
