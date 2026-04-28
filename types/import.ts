// ============================================================
// VOIX — Import Module Types
// ============================================================

import type { TestimonialSource } from './index'

// ── Import Sources ────────────────────────────────────────

export type ImportSource = Extract<TestimonialSource, 'google' | 'g2' | 'capterra' | 'trustpilot'>

export type ImportStatus =
  | 'idle'
  | 'validating'
  | 'fetching'
  | 'processing'
  | 'done'
  | 'error'

// ── Raw review from external source ──────────────────────

export interface RawReview {
  source_id:       string           // Unique ID from the external platform
  source:          ImportSource
  source_url?:     string
  customer_name:   string
  customer_title?: string           // job title if available
  content:         string
  rating:          number           // 1–5
  published_at?:   string           // ISO date from the platform
  avatar_url?:     string
  verified?:       boolean
}

// ── Import job payload ────────────────────────────────────

export interface ImportJobPayload {
  source:        ImportSource
  // Google
  place_id?:     string             // Google Place ID (e.g. ChIJ...)
  place_name?:   string
  // G2
  product_slug?: string             // e.g. "linear" from g2.com/products/linear
  product_url?:  string             // full G2 product URL
  // Capterra / Trustpilot
  page_url?:     string
  // Options
  max_reviews?:  number             // cap at N reviews (default: 50)
  overwrite?:    boolean            // re-import already-imported reviews
}

// ── Import result ─────────────────────────────────────────

export interface ImportResult {
  source:     ImportSource
  fetched:    number                // raw reviews fetched
  imported:   number                // new testimonials created
  skipped:    number                // duplicates skipped
  errors:     string[]              // per-review error messages
  duration_ms: number
}

// ── Import history record (stored in activities) ──────────

export interface ImportActivityMeta {
  source:     ImportSource
  fetched:    number
  imported:   number
  skipped:    number
  query:      string                // place_id or product_slug
}

// ── Google Places API types ───────────────────────────────

export interface GooglePlaceSearchResult {
  place_id:   string
  name:       string
  formatted_address: string
  rating?:    number
  user_ratings_total?: number
}

export interface GooglePlaceReview {
  author_name:         string
  author_url?:         string
  profile_photo_url?:  string
  rating:              number
  relative_time_description: string
  text:                string
  time:                number        // Unix timestamp
}

export interface GooglePlaceDetails {
  place_id: string
  name:     string
  rating?:  number
  reviews?: GooglePlaceReview[]
}

// ── G2 scrape types ───────────────────────────────────────

export interface G2Review {
  id:          string
  title:       string
  body:        string
  rating:      number               // 1–10 on G2, we convert to 1–5
  reviewer: {
    name:      string
    title?:    string
    avatar?:   string
  }
  date:        string
  url:         string
}

// ── Import API request/response ───────────────────────────

export interface ImportApiRequest extends ImportJobPayload {}

export interface ImportApiResponse {
  data:  ImportResult | null
  error: string | null
}

// ── UI state ──────────────────────────────────────────────

export interface ImportUIState {
  source:   ImportSource | null
  status:   ImportStatus
  progress: number                  // 0–100
  result:   ImportResult | null
  error:    string | null
}
