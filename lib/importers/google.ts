// ============================================================
// VOIX — Google Reviews Importer
//
// Strategy:
//   1. Primary:  Google Places API (requires GOOGLE_PLACES_API_KEY)
//      → GET /maps/api/place/details/json?place_id=...&fields=reviews
//      → Returns up to 5 most recent reviews (API limitation)
//
//   2. Enriched: Google My Business API (OAuth — future phase)
//      → Returns all reviews with pagination
//
//   3. Search:   Places Text Search to find place_id from a name
//
// Note: The Places API free tier returns max 5 reviews.
// For more, the customer must connect Google My Business OAuth.
// ============================================================

import type {
  RawReview,
  GooglePlaceDetails,
  GooglePlaceSearchResult,
  ImportJobPayload,
} from '@/types/import'

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api'
const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? ''

// ── Place search (by business name + optional location) ───

export async function searchGooglePlace(
  query: string
): Promise<GooglePlaceSearchResult[]> {
  if (!API_KEY) throw new Error('GOOGLE_PLACES_API_KEY is not configured')

  const url = new URL(`${PLACES_API_BASE}/place/textsearch/json`)
  url.searchParams.set('query', query)
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Google Places search failed: ${res.status}`)

  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${data.status} — ${data.error_message ?? ''}`)
  }

  return (data.results ?? []).slice(0, 5).map((r: {
    place_id: string
    name: string
    formatted_address: string
    rating?: number
    user_ratings_total?: number
  }) => ({
    place_id:            r.place_id,
    name:                r.name,
    formatted_address:   r.formatted_address,
    rating:              r.rating,
    user_ratings_total:  r.user_ratings_total,
  }))
}

// ── Fetch place details + reviews ─────────────────────────

export async function fetchGooglePlaceDetails(
  placeId: string
): Promise<GooglePlaceDetails> {
  if (!API_KEY) throw new Error('GOOGLE_PLACES_API_KEY is not configured')

  const url = new URL(`${PLACES_API_BASE}/place/details/json`)
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'place_id,name,rating,reviews')
  url.searchParams.set('reviews_sort', 'newest')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString(), {
    next: { revalidate: 1800 }, // cache 30min
  })

  if (!res.ok) throw new Error(`Google Place Details failed: ${res.status}`)

  const data = await res.json()

  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status} — ${data.error_message ?? ''}`)
  }

  return data.result as GooglePlaceDetails
}

// ── Convert Google reviews → RawReview ───────────────────

export async function importFromGoogle(
  payload: ImportJobPayload
): Promise<RawReview[]> {
  const { place_id, place_name, max_reviews = 50 } = payload

  let resolvedPlaceId = place_id

  // Resolve place_id from name if not provided
  if (!resolvedPlaceId && place_name) {
    const results = await searchGooglePlace(place_name)
    if (!results.length) {
      throw new Error(`No Google Place found for: "${place_name}"`)
    }
    resolvedPlaceId = results[0].place_id
  }

  if (!resolvedPlaceId) {
    throw new Error('Either place_id or place_name is required for Google import')
  }

  const details = await fetchGooglePlaceDetails(resolvedPlaceId)
  const reviews = details.reviews ?? []

  return reviews
    .slice(0, max_reviews)
    .filter(r => r.text?.trim())                          // skip empty reviews
    .map(r => ({
      source_id:     `google_${resolvedPlaceId}_${r.time}`,
      source:        'google' as const,
      source_url:    `https://maps.google.com/?cid=${resolvedPlaceId}`,
      customer_name: r.author_name,
      content:       r.text.trim(),
      rating:        Math.round(r.rating),                // already 1–5
      published_at:  new Date(r.time * 1000).toISOString(),
      avatar_url:    r.profile_photo_url,
    }))
}

// ── Validate place_id format ──────────────────────────────

export function isValidPlaceId(id: string): boolean {
  // Google Place IDs start with ChIJ, EiE, etc. — at least 10 chars
  return typeof id === 'string' && id.length >= 10 && /^[A-Za-z0-9_-]+$/.test(id)
}
