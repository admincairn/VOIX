// ============================================================
// VOIX — Import API Route
// POST /api/import
// GET  /api/import  → import history
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth }                      from '@/lib/auth'
import { supabaseAdmin }             from '@/lib/supabase'
import { runImportJob }              from '@/lib/importers/orchestrator'
import { validateG2Input }           from '@/lib/importers/g2'
import { isValidPlaceId }            from '@/lib/importers/google'
import type { ImportJobPayload, ImportSource } from '@/types/import'

// ── Simple in-memory rate limiter (per user, per process) ─
// In production, replace with Upstash Redis or Vercel KV
const importCooldowns = new Map<string, number>()
const COOLDOWN_MS     = 60_000 // 1 minute between imports per user

function isRateLimited(userId: string): boolean {
  const last = importCooldowns.get(userId)
  if (!last) return false
  return Date.now() - last < COOLDOWN_MS
}

function setRateLimit(userId: string): void {
  importCooldowns.set(userId, Date.now())
  // Clean up after cooldown to prevent memory leak
  setTimeout(() => importCooldowns.delete(userId), COOLDOWN_MS)
}

// ── POST /api/import ──────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Rate limit check
  if (isRateLimited(userId)) {
    return NextResponse.json(
      { data: null, error: 'Please wait 60 seconds between import jobs.' },
      { status: 429 }
    )
  }

  // Parse body
  let body: ImportJobPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { source } = body

  // ── Source-specific validation ─────────────────────────

  const VALID_SOURCES: ImportSource[] = ['google', 'g2', 'capterra', 'trustpilot']
  if (!source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { data: null, error: `Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}` },
      { status: 422 }
    )
  }

  if (source === 'google') {
    if (!body.place_id && !body.place_name) {
      return NextResponse.json(
        { data: null, error: 'Google import requires place_id or place_name' },
        { status: 422 }
      )
    }
    if (body.place_id && !isValidPlaceId(body.place_id)) {
      return NextResponse.json(
        { data: null, error: 'Invalid Google place_id format' },
        { status: 422 }
      )
    }
  }

  if (source === 'g2') {
    const input = body.product_slug ?? body.product_url ?? ''
    const { valid, error: valError } = validateG2Input(input)
    if (!valid) {
      return NextResponse.json({ data: null, error: valError }, { status: 422 })
    }
  }

  if (['capterra', 'trustpilot'].includes(source) && !body.page_url) {
    return NextResponse.json(
      { data: null, error: `${source} import requires page_url` },
      { status: 422 }
    )
  }

  // Sanitize max_reviews
  body.max_reviews = Math.min(Math.max(body.max_reviews ?? 50, 1), 200)

  // Apply rate limit
  setRateLimit(userId)

  // ── Run import job ─────────────────────────────────────

  try {
    const result = await runImportJob(userId, body)

    return NextResponse.json({ data: result, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('[Import API]', message)

    return NextResponse.json(
      { data: null, error: message },
      { status: source === 'google' && message.includes('not configured') ? 503 : 500 }
    )
  }
}

// ── GET /api/import — import history ─────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('profile_id', session.user.id)
    .eq('type', 'import_completed')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null })
}

// ── GET /api/import/search-google — place search ─────────

// Also expose a search endpoint for the UI autocomplete
// POST /api/import/search with { query: string }
