// ============================================================
// VOIX — Vitest Setup
// Global mocks and test utilities
// ============================================================

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── Mock next/navigation ──────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter:      () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname:    () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect:       vi.fn(),
}))

// ── Mock next-auth/react ──────────────────────────────────
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id:          'test-user-id',
        email:       'test@example.com',
        name:        'Test User',
        planId:      'growth',
        planStatus:  'trial',
        companyName: 'Test Company',
        companySlug: 'test-company',
        onboarded:   true,
        trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    },
    status: 'authenticated',
  }),
  signIn:  vi.fn(),
  signOut: vi.fn(),
}))

// ── Mock Supabase ─────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase:      createMockSupabase(),
  supabaseAdmin: createMockSupabase(),
  getDashboardMetrics: vi.fn().mockResolvedValue({
    total_testimonials: 42,
    video_testimonials: 8,
    widget_views:       1200,
    average_rating:     4.7,
    pending_count:      3,
    published_count:    39,
    testimonials_delta: 5,
    video_delta:        1,
    views_delta_pct:    12.5,
  }),
  logActivity: vi.fn().mockResolvedValue(undefined),
}))

// ── Mock fetch for API routes ─────────────────────────────
global.fetch = vi.fn()

// ── Suppress console.error in tests ──────────────────────
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })

// ── Supabase mock factory ─────────────────────────────────
function createMockSupabase() {
  const chain = {
    select:  vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    upsert:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    neq:     vi.fn().mockReturnThis(),
    in:      vi.fn().mockReturnThis(),
    gte:     vi.fn().mockReturnThis(),
    lt:      vi.fn().mockReturnThis(),
    not:     vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    limit:   vi.fn().mockReturnThis(),
    range:   vi.fn().mockReturnThis(),
    single:  vi.fn().mockResolvedValue({ data: null, error: null }),
    then:    vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
  }
  return {
    from:  vi.fn().mockReturnValue(chain),
    auth:  {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp:             vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      admin: {
        getUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}
