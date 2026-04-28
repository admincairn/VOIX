// ============================================================
// VOIX — API Route Unit Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest }                           from 'next/server'

// Mock auth before importing routes
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id:          'user-123',
      email:       'test@example.com',
      planId:      'growth',
      planStatus:  'trial',
      companyName: 'Test Co',
      companySlug: 'test-co',
      onboarded:   true,
    },
  }),
}))

vi.mock('@/lib/supabase', () => {
  const mockChain = {
    select:  vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    neq:     vi.fn().mockReturnThis(),
    in:      vi.fn().mockReturnThis(),
    gte:     vi.fn().mockReturnThis(),
    lt:      vi.fn().mockReturnThis(),
    not:     vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    limit:   vi.fn().mockReturnThis(),
    range:   vi.fn().mockReturnThis(),
    single:  vi.fn().mockResolvedValue({
      data: { id: 'plan-1', max_testimonials: -1, max_videos_monthly: 30, features: { campaigns: true, import: true } },
      error: null,
    }),
  }

  return {
    supabaseAdmin: {
      from: vi.fn().mockReturnValue({
        ...mockChain,
        // Override insert to return a mock testimonial
        insert: vi.fn().mockReturnValue({
          ...mockChain,
          single: vi.fn().mockResolvedValue({
            data: {
              id:            'testimonial-123',
              profile_id:    'user-123',
              customer_name: 'Jane Doe',
              content:       'Great product!',
              rating:        5,
              source:        'manual',
              status:        'pending',
              created_at:    new Date().toISOString(),
              updated_at:    new Date().toISOString(),
            },
            error: null,
          }),
        }),
        // select().eq().single() for profile check
        select: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            ...mockChain,
            single: vi.fn().mockResolvedValue({
              data: {
                plan_id:     'growth',
                plan_status: 'trial',
                plan: { max_testimonials: -1, max_videos_monthly: 30 },
              },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    logActivity: vi.fn().mockResolvedValue(undefined),
  }
})

// ── Testimonials API ──────────────────────────────────────

describe('POST /api/testimonials', () => {
  it('rejects unauthenticated requests', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce(null)

    const { POST } = await import('@/app/api/testimonials/route')
    const req = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body:   JSON.stringify({ customer_name: 'Jane', content: 'Great!' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('requires customer_name', async () => {
    const { POST } = await import('@/app/api/testimonials/route')
    const req = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body:   JSON.stringify({ content: 'Great product!' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('customer_name')
  })

  it('requires content', async () => {
    const { POST } = await import('@/app/api/testimonials/route')
    const req = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body:   JSON.stringify({ customer_name: 'Jane Doe' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('content')
  })

  it('creates testimonial with valid data', async () => {
    const { POST } = await import('@/app/api/testimonials/route')
    const req = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body:   JSON.stringify({
        customer_name: 'Jane Doe',
        customer_title: 'CEO, Acme',
        content: 'This product is amazing!',
        rating: 5,
        source: 'manual',
      }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.data).toBeDefined()
    expect(json.data.customer_name).toBe('Jane Doe')
    expect(json.data.status).toBe('pending')
  })

  it('rejects invalid JSON', async () => {
    const { POST } = await import('@/app/api/testimonials/route')
    const req = new NextRequest('http://localhost/api/testimonials', {
      method: 'POST',
      body:   'not json {{',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ── Checkout API ──────────────────────────────────────────

describe('POST /api/lemon-squeezy/checkout', () => {
  it('rejects invalid planId', async () => {
    const { POST } = await import('@/app/api/lemon-squeezy/checkout/route')
    const req = new NextRequest('http://localhost/api/lemon-squeezy/checkout', {
      method: 'POST',
      body:   JSON.stringify({ planId: 'ultra-premium' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('Invalid planId')
  })
})

// ── Import API ────────────────────────────────────────────

describe('POST /api/import', () => {
  it('rejects missing source', async () => {
    const { POST } = await import('@/app/api/import/route')
    const req = new NextRequest('http://localhost/api/import', {
      method: 'POST',
      body:   JSON.stringify({ product_url: 'https://g2.com/products/test/reviews' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('Invalid source')
  })

  it('validates google requires place_id or place_name', async () => {
    const { POST } = await import('@/app/api/import/route')
    const req = new NextRequest('http://localhost/api/import', {
      method: 'POST',
      body:   JSON.stringify({ source: 'google' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('place_id or place_name')
  })

  it('validates g2 URL format', async () => {
    const { POST } = await import('@/app/api/import/route')
    const req = new NextRequest('http://localhost/api/import', {
      method: 'POST',
      body:   JSON.stringify({ source: 'g2', product_url: 'https://github.com/org/repo' }),
    })

    const res  = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.error).toContain('Invalid G2 URL')
  })
})
