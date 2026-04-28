// ============================================================
// VOIX — Google Place Search API
// POST /api/import/search-google
// Powers the place autocomplete in the import UI
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth }                      from '@/lib/auth'
import { searchGooglePlace }         from '@/lib/importers/google'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { query: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 })
  }

  const query = body.query?.trim()
  if (!query || query.length < 2) {
    return NextResponse.json(
      { data: null, error: 'Query must be at least 2 characters' },
      { status: 422 }
    )
  }

  try {
    const results = await searchGooglePlace(query)
    return NextResponse.json({ data: results, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed'

    // If no API key, return helpful error
    if (message.includes('not configured')) {
      return NextResponse.json(
        {
          data: null,
          error: 'Google Places API key is not configured. Add GOOGLE_PLACES_API_KEY to your environment.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
