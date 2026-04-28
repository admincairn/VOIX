// ============================================================
// VOIX — Lemon Squeezy Integration
// Merchant of Record for US market — no Stripe
// ============================================================

import crypto from 'crypto'
import type { LsWebhookPayload, PlanId } from '@/types'

const LS_API_URL = 'https://api.lemonsqueezy.com/v1'
const LS_API_KEY = process.env.LEMON_SQUEEZY_API_KEY!
const LS_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID!
const LS_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!

// ── Plan → Variant ID mapping (set in your LS dashboard) ─
export const LS_PLANS: Record<PlanId, { variantId: string; price: number }> = {
  starter: { variantId: process.env.LS_VARIANT_STARTER!, price: 19 },
  growth:  { variantId: process.env.LS_VARIANT_GROWTH!,  price: 39 },
  scale:   { variantId: process.env.LS_VARIANT_SCALE!,   price: 59 },
}

// ── HTTP helper ───────────────────────────────────────────

async function lsRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${LS_API_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LS_API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[LemonSqueezy] ${res.status} ${res.statusText}: ${body}`)
  }

  return res.json()
}

// ── Create checkout session ───────────────────────────────

export async function createCheckout(params: {
  planId: PlanId
  userEmail: string
  userId: string
  companyName: string
}): Promise<string> {
  const variant = LS_PLANS[params.planId]
  if (!variant?.variantId) {
    throw new Error(`[LemonSqueezy] Unknown plan: ${params.planId}`)
  }

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: params.userEmail,
          custom: {
            user_id:      params.userId,
            plan_id:      params.planId,
            company_name: params.companyName,
          },
        },
        checkout_options: {
          embed: false,
          media: false,
          logo: true,
        },
        expires_at: null,
      },
      relationships: {
        store: {
          data: { type: 'stores', id: LS_STORE_ID },
        },
        variant: {
          data: { type: 'variants', id: variant.variantId },
        },
      },
    },
  }

  const response = await lsRequest<{ data: { attributes: { url: string } } }>(
    '/checkouts',
    { method: 'POST', body: JSON.stringify(body) }
  )

  return response.data.attributes.url
}

// ── Get subscription details ──────────────────────────────

export async function getSubscription(subscriptionId: string) {
  return lsRequest<{ data: { attributes: Record<string, unknown> } }>(
    `/subscriptions/${subscriptionId}`
  )
}

// ── Cancel subscription ───────────────────────────────────

export async function cancelSubscription(subscriptionId: string) {
  return lsRequest(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
}

// ── Webhook signature verification ───────────────────────

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature || !LS_WEBHOOK_SECRET) return false

  const hmac = crypto
    .createHmac('sha256', LS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(hmac, 'hex'),
    Buffer.from(signature, 'hex')
  )
}

// ── Parse webhook attributes ─────────────────────────────

export function parseWebhookAttributes(payload: LsWebhookPayload) {
  const attrs = payload.data.attributes as Record<string, unknown>

  return {
    userId:         (payload.meta.custom_data?.user_id as string)     ?? null,
    planId:         (payload.meta.custom_data?.plan_id as PlanId)     ?? null,
    subscriptionId: (attrs.subscription_id as string)                 ?? payload.data.id,
    customerId:     (attrs.customer_id as string)                     ?? null,
    status:         (attrs.status as string)                          ?? null,
    variantId:      (attrs.variant_id as string)                      ?? null,
    trialEndsAt:    (attrs.trial_ends_at as string | null)            ?? null,
    renewsAt:       (attrs.renews_at as string | null)                ?? null,
    endsAt:         (attrs.ends_at as string | null)                  ?? null,
  }
}

// ── Map LS status → PlanStatus ────────────────────────────

export function mapLsStatusToPlanStatus(
  lsStatus: string
): 'active' | 'past_due' | 'cancelled' | 'trial' {
  switch (lsStatus) {
    case 'active':
    case 'past_due':
      return lsStatus
    case 'cancelled':
    case 'expired':
      return 'cancelled'
    case 'on_trial':
      return 'trial'
    default:
      return 'active'
  }
}
