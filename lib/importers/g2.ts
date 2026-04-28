// ============================================================
// VOIX — G2 Reviews Importer
//
// Strategy: HTTP scraping of G2 public review pages
//
// G2 review pages are server-rendered HTML at:
//   https://www.g2.com/products/{slug}/reviews
//
// Each page contains structured JSON-LD (schema.org/Review)
// which we parse — more reliable than CSS selectors.
//
// Rate limiting: 1 req/2s, max 5 pages per import job.
// Respects robots.txt: G2 allows /products/* for crawlers.
//
// IMPORTANT: This scraper is for reviews the customer already
// owns (their own product page). Using it to scrape competitors
// or at scale violates G2's ToS.
// ============================================================

import type { RawReview, ImportJobPayload } from '@/types/import'

const G2_BASE      = 'https://www.g2.com'
const MAX_PAGES    = 5
const DELAY_MS     = 2000
const REVIEWS_PER_PAGE = 10

// Realistic browser headers to avoid bot detection
const SCRAPE_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (compatible; VoixBot/1.0; +https://voix.app/bot)',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control':   'no-cache',
  'Pragma':          'no-cache',
}

// ── Extract product slug from URL ─────────────────────────

export function extractG2Slug(input: string): string | null {
  // Handle full URLs: https://www.g2.com/products/linear/reviews
  try {
    const url = new URL(input)
    if (url.hostname.includes('g2.com')) {
      const match = url.pathname.match(/\/products\/([^/]+)/)
      return match?.[1] ?? null
    }
  } catch {
    // Not a URL — treat as raw slug
    if (/^[a-z0-9-]+$/.test(input)) return input
  }
  return null
}

// ── Fetch a single G2 reviews page ────────────────────────

async function fetchG2Page(slug: string, page: number): Promise<string> {
  const url = `${G2_BASE}/products/${slug}/reviews?page=${page}`

  const res = await fetch(url, {
    headers: SCRAPE_HEADERS,
    signal:  AbortSignal.timeout(15_000),
  })

  if (res.status === 404) throw new Error(`G2 product not found: "${slug}"`)
  if (res.status === 429) throw new Error('G2 rate limit reached. Try again in a few minutes.')
  if (!res.ok)            throw new Error(`G2 fetch failed: ${res.status} on page ${page}`)

  return res.text()
}

// ── Parse JSON-LD reviews from HTML ──────────────────────

interface JsonLdReview {
  '@type':        string
  author?:        { name?: string; jobTitle?: string; image?: { url?: string } }
  reviewBody?:    string
  description?:   string
  reviewRating?:  { ratingValue?: number | string }
  datePublished?: string
  url?:           string
  identifier?:    string
}

function parseJsonLd(html: string): RawReview[] {
  const reviews: RawReview[] = []

  // Extract all JSON-LD script blocks
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      const items: JsonLdReview[] = Array.isArray(data)
        ? data
        : data['@type'] === 'Review'
        ? [data]
        : data.review
        ? [].concat(data.review)
        : []

      for (const item of items) {
        if (item['@type'] !== 'Review') continue

        const name    = item.author?.name?.trim()
        const content = (item.reviewBody ?? item.description ?? '').trim()

        if (!name || !content) continue

        const rawRating = Number(item.reviewRating?.ratingValue ?? 0)
        // G2 rates 1–10, normalize to 1–5
        const rating = rawRating > 5
          ? Math.round(rawRating / 2)
          : Math.round(rawRating) || 5

        // Generate a stable source_id from url or content hash
        const sourceId = item.identifier
          ?? item.url
          ?? `g2_${name.replace(/\s/g, '_')}_${content.slice(0, 20).replace(/\W/g, '')}`

        reviews.push({
          source_id:     `g2_${sourceId}`,
          source:        'g2',
          source_url:    item.url,
          customer_name: name,
          customer_title: item.author?.jobTitle?.trim() || undefined,
          content,
          rating,
          published_at:  item.datePublished,
          avatar_url:    item.author?.image?.url,
        })
      }
    } catch {
      // Malformed JSON-LD block — skip
    }
  }

  return reviews
}

// ── HTML attribute fallback parser ────────────────────────
// When JSON-LD is absent, fall back to data-attributes

function parseHtmlFallback(html: string): RawReview[] {
  const reviews: RawReview[] = []

  // Match review cards by common G2 DOM patterns
  // G2 uses data-sg-review-id attributes on containers
  const reviewIdRegex = /data-sg-review-id="([^"]+)"/g
  const ids: string[] = []
  let m: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((m = reviewIdRegex.exec(html)) !== null) {
    ids.push(m[1])
  }

  // Extract star ratings from itemprop="ratingValue"
  const ratingRegex = /itemprop="ratingValue"[^>]*content="([^"]+)"/g
  const ratings: number[] = []

  // eslint-disable-next-line no-cond-assign
  while ((m = ratingRegex.exec(html)) !== null) {
    ratings.push(Math.round(Number(m[1]) / 2))
  }

  // Extract reviewer names from itemprop="author"
  const authorRegex = /itemprop="author"[^>]*>\s*([^<]+)</g
  const authors: string[] = []

  // eslint-disable-next-line no-cond-assign
  while ((m = authorRegex.exec(html)) !== null) {
    const name = m[1].trim()
    if (name) authors.push(name)
  }

  // Extract review text from itemprop="reviewBody"
  const bodyRegex = /itemprop="reviewBody"[^>]*>([\s\S]*?)<\/[^>]+>/g
  const bodies: string[] = []

  // eslint-disable-next-line no-cond-assign
  while ((m = bodyRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim()
    if (text.length > 10) bodies.push(text)
  }

  const count = Math.min(ids.length, authors.length, bodies.length, ratings.length)

  for (let i = 0; i < count; i++) {
    if (!authors[i] || !bodies[i]) continue
    reviews.push({
      source_id:     `g2_${ids[i] ?? `fallback_${i}`}`,
      source:        'g2',
      customer_name: authors[i],
      content:       bodies[i],
      rating:        ratings[i] ?? 5,
    })
  }

  return reviews
}

// ── Detect if more pages exist ────────────────────────────

function hasNextPage(html: string, currentPage: number): boolean {
  // G2 includes rel="next" link when more pages exist
  return (
    html.includes('rel="next"') ||
    html.includes(`page=${currentPage + 1}`) ||
    html.includes('pagination__next')
  )
}

// ── Main import function ──────────────────────────────────

export async function importFromG2(
  payload: ImportJobPayload
): Promise<RawReview[]> {
  const { product_slug, product_url, max_reviews = 50 } = payload

  // Resolve slug
  let slug = product_slug
  if (!slug && product_url) {
    slug = extractG2Slug(product_url) ?? undefined
  }
  if (!slug) {
    throw new Error('Either product_slug or product_url is required for G2 import')
  }

  const allReviews: RawReview[] = []
  const maxPages = Math.min(MAX_PAGES, Math.ceil(max_reviews / REVIEWS_PER_PAGE))

  for (let page = 1; page <= maxPages; page++) {
    try {
      const html = await fetchG2Page(slug, page)

      // Try JSON-LD first, fall back to HTML parsing
      let pageReviews = parseJsonLd(html)
      if (pageReviews.length === 0) {
        pageReviews = parseHtmlFallback(html)
      }

      allReviews.push(...pageReviews)

      // Stop if we have enough or no more pages
      if (allReviews.length >= max_reviews) break
      if (!hasNextPage(html, page)) break

      // Rate limit between pages
      if (page < maxPages) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    } catch (err) {
      // Re-throw on page 1 (fatal), log and stop on subsequent pages
      if (page === 1) throw err
      console.warn(`[G2 Import] Stopped at page ${page}:`, err)
      break
    }
  }

  return allReviews.slice(0, max_reviews)
}

// ── Validate G2 product URL / slug ───────────────────────

export function validateG2Input(input: string): { valid: boolean; slug: string | null; error?: string } {
  if (!input?.trim()) {
    return { valid: false, slug: null, error: 'G2 product URL or slug is required' }
  }

  const slug = extractG2Slug(input.trim())
  if (!slug) {
    return {
      valid: false,
      slug:  null,
      error: 'Invalid G2 URL. Expected format: https://www.g2.com/products/your-product/reviews',
    }
  }

  return { valid: true, slug }
}
