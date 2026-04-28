// ============================================================
// VOIX — Importer Unit Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractG2Slug, validateG2Input }        from '@/lib/importers/g2'
import { isValidPlaceId }                        from '@/lib/importers/google'
import { slugify, formatNumber, timeAgo, initials, ratingToStars } from '@/lib/utils'

// ── G2 importer ───────────────────────────────────────────

describe('G2 Importer', () => {
  describe('extractG2Slug', () => {
    it('extracts slug from full G2 URL', () => {
      expect(extractG2Slug('https://www.g2.com/products/linear/reviews')).toBe('linear')
      expect(extractG2Slug('https://www.g2.com/products/notion/reviews?page=2')).toBe('notion')
      expect(extractG2Slug('https://g2.com/products/my-tool/reviews')).toBe('my-tool')
    })

    it('accepts raw slug', () => {
      expect(extractG2Slug('linear')).toBe('linear')
      expect(extractG2Slug('my-cool-product')).toBe('my-cool-product')
    })

    it('returns null for invalid input', () => {
      expect(extractG2Slug('https://example.com/products/linear')).toBeNull()
      expect(extractG2Slug('not a url and has spaces')).toBeNull()
      expect(extractG2Slug('')).toBeNull()
    })
  })

  describe('validateG2Input', () => {
    it('validates correct G2 URL', () => {
      const result = validateG2Input('https://www.g2.com/products/voix/reviews')
      expect(result.valid).toBe(true)
      expect(result.slug).toBe('voix')
      expect(result.error).toBeUndefined()
    })

    it('returns error for empty input', () => {
      const result = validateG2Input('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('returns error for non-G2 URL', () => {
      const result = validateG2Input('https://github.com/products/linear')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid G2 URL')
    })
  })
})

// ── Google importer ───────────────────────────────────────

describe('Google Importer', () => {
  describe('isValidPlaceId', () => {
    it('validates known Place ID formats', () => {
      expect(isValidPlaceId('ChIJN1t_tDeuEmsRUsoyG83frY4')).toBe(true)
      expect(isValidPlaceId('EiE1MDAgSGF2ZW5zIG9mIEhlYXZlbiwgSGVya2ltZXIgU3Q')).toBe(true)
    })

    it('rejects short or invalid IDs', () => {
      expect(isValidPlaceId('abc')).toBe(false)
      expect(isValidPlaceId('')).toBe(false)
      expect(isValidPlaceId('has spaces here!!')).toBe(false)
    })
  })
})

// ── Utility functions ─────────────────────────────────────

describe('Utils', () => {
  describe('slugify', () => {
    it('converts string to valid slug', () => {
      expect(slugify('Acme Corp')).toBe('acme-corp')
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('  Foo   Bar  ')).toBe('foo-bar')
      expect(slugify('Café Résumé')).toBe('cafe-resume')
    })

    it('handles edge cases', () => {
      expect(slugify('')).toBe('')
      expect(slugify('---')).toBe('')
      expect(slugify('123')).toBe('123')
    })
  })

  describe('formatNumber', () => {
    it('formats thousands', () => {
      expect(formatNumber(1000)).toBe('1.0k')
      expect(formatNumber(14820)).toBe('14.8k')
      expect(formatNumber(999)).toBe('999')
    })

    it('formats millions', () => {
      expect(formatNumber(1_500_000)).toBe('1.5M')
    })
  })

  describe('timeAgo', () => {
    it('returns "just now" for recent dates', () => {
      const now = new Date().toISOString()
      expect(timeAgo(now)).toBe('just now')
    })

    it('returns minutes for recent past', () => {
      const d = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      expect(timeAgo(d)).toBe('5m ago')
    })

    it('returns "Yesterday" for yesterday', () => {
      const d = new Date(Date.now() - 86400 * 1000).toISOString()
      expect(timeAgo(d)).toBe('Yesterday')
    })
  })

  describe('initials', () => {
    it('extracts initials from full names', () => {
      expect(initials('Sophie Laurent')).toBe('SL')
      expect(initials('Marcus')).toBe('M')
      expect(initials('John Paul Jones')).toBe('JP')
    })
  })

  describe('ratingToStars', () => {
    it('renders correct stars', () => {
      expect(ratingToStars(5)).toBe('★★★★★')
      expect(ratingToStars(3)).toBe('★★★☆☆')
      expect(ratingToStars(null)).toBe('—')
    })
  })
})
