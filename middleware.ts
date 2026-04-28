// ============================================================
// VOIX — Middleware
// Auth guard for dashboard routes
// ============================================================

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/pricing',
  '/terms',
  '/privacy',
]

const PUBLIC_PREFIXES = [
  '/collect/',      // public collect form
  '/api/collect/',  // public collect API
  '/api/widgets/',  // embed script (public)
  '/api/auth/',     // Auth.js internals
  '/api/lemon-squeezy/webhook', // LS webhook (verified by signature)
  '/_next/',
  '/favicon',
  '/og.',
]

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl
  const session = (req as unknown as { auth: { user?: unknown } | null }).auth

  // Allow public routes and prefixes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users
  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect non-onboarded users to onboarding
  // (except if they're already on /onboarding or /api/*)
  const user = session.user as { onboarded?: boolean }
  if (
    !user.onboarded &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
