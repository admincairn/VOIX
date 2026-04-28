// ============================================================
// VOIX — Import Orchestrator
// Coordinates source fetching → dedup → DB insert → activity log
// ============================================================

import { supabaseAdmin, logActivity } from '@/lib/supabase'
import { importFromGoogle }           from './google'
import { importFromG2 }               from './g2'
import type { ImportJobPayload, ImportResult, RawReview } from '@/types/import'

// ── Plan limits ───────────────────────────────────────────

async function checkImportAllowed(profileId: string): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan_status, plan:plans(features)')
    .eq('id', profileId)
    .single()

  if (!profile) throw new Error('Profile not found')

  const status = profile.plan_status
  if (!['trial', 'active'].includes(status)) {
    throw new Error('Your account is not active. Please renew your subscription.')
  }

  const features = (profile.plan as { features: Record<string, boolean> } | null)?.features
  if (features && features.import === false) {
    throw new Error('Review import is not available on the Starter plan. Upgrade to Growth.')
  }
}

// ── Deduplication ─────────────────────────────────────────
// Check which source_ids already exist in DB for this profile

async function getExistingSourceIds(
  profileId: string,
  sourceIds: string[]
): Promise<Set<string>> {
  if (!sourceIds.length) return new Set()

  const { data } = await supabaseAdmin
    .from('testimonials')
    .select('source_id')
    .eq('profile_id', profileId)
    .in('source_id', sourceIds)

  return new Set((data ?? []).map(r => r.source_id).filter(Boolean) as string[])
}

// ── Batch insert ──────────────────────────────────────────

async function insertReviews(
  profileId: string,
  reviews: RawReview[],
  existingIds: Set<string>
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const toInsert = reviews.filter(r => !existingIds.has(r.source_id))
  const errors: string[] = []

  if (!toInsert.length) {
    return { imported: 0, skipped: reviews.length, errors: [] }
  }

  // Insert in chunks of 25 to avoid payload limits
  const CHUNK = 25
  let imported = 0

  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK)

    const rows = chunk.map(r => ({
      profile_id:          profileId,
      customer_name:       r.customer_name.trim().slice(0, 200),
      customer_email:      null,
      customer_title:      r.customer_title?.trim().slice(0, 200) ?? null,
      customer_avatar_url: r.avatar_url ?? null,
      content:             r.content.trim().slice(0, 5000),
      rating:              Math.min(5, Math.max(1, Math.round(r.rating))),
      source:              r.source,
      source_id:           r.source_id,
      source_url:          r.source_url ?? null,
      status:              'published',               // imported reviews auto-published
      tags:                [],
      widget_ids:          [],
      featured:            false,
      // Set created_at to original publish date if available
      ...(r.published_at && { created_at: r.published_at }),
    }))

    const { error, count } = await supabaseAdmin
      .from('testimonials')
      .insert(rows, { count: 'exact' })

    if (error) {
      console.error('[Import] Batch insert error:', error)
      errors.push(`Batch ${Math.floor(i / CHUNK) + 1}: ${error.message}`)
    } else {
      imported += count ?? chunk.length
    }
  }

  const skipped = reviews.length - toInsert.length

  return { imported, skipped, errors }
}

// ── Main orchestrator ─────────────────────────────────────

export async function runImportJob(
  profileId: string,
  payload:   ImportJobPayload
): Promise<ImportResult> {
  const startedAt = Date.now()
  const errors: string[] = []

  // 1. Check plan
  await checkImportAllowed(profileId)

  // 2. Fetch reviews from source
  let rawReviews: RawReview[] = []

  try {
    switch (payload.source) {
      case 'google':
        rawReviews = await importFromGoogle(payload)
        break
      case 'g2':
        rawReviews = await importFromG2(payload)
        break
      default:
        throw new Error(`Unsupported import source: ${payload.source}`)
    }
  } catch (err) {
    throw new Error(
      `Failed to fetch from ${payload.source}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (!rawReviews.length) {
    return {
      source:      payload.source,
      fetched:     0,
      imported:    0,
      skipped:     0,
      errors:      ['No reviews found at the provided URL or place.'],
      duration_ms: Date.now() - startedAt,
    }
  }

  // 3. Dedup — skip if overwrite flag not set
  const sourceIds = rawReviews.map(r => r.source_id)
  const existingIds = payload.overwrite
    ? new Set<string>()
    : await getExistingSourceIds(profileId, sourceIds)

  // 4. Insert new reviews
  const { imported, skipped, errors: insertErrors } = await insertReviews(
    profileId,
    rawReviews,
    existingIds
  )

  errors.push(...insertErrors)

  // 5. Log activity
  await logActivity(profileId, 'import_completed', {
    source:   payload.source,
    fetched:  rawReviews.length,
    imported,
    skipped,
    query:    payload.place_id ?? payload.product_slug ?? payload.product_url ?? '',
  })

  return {
    source:      payload.source,
    fetched:     rawReviews.length,
    imported,
    skipped,
    errors,
    duration_ms: Date.now() - startedAt,
  }
}
