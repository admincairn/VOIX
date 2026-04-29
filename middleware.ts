// ============================================================
// VOIX — Middleware
// Auth guard + Onboarding redirect for dashboard routes
// ============================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/pricing",
  "/terms",
  "/privacy",
];

const PUBLIC_PREFIXES = [
  "/collect/", // public collect form
  "/api/collect/", // public collect API
  "/api/widgets/", // embed script (public)
  "/api/auth/", // Auth.js internals
  "/api/lemon-squeezy/webhook", // LS webhook (verified by signature)
  "/_next/",
  "/favicon",
  "/og.",
];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = (req as unknown as { auth: { user?: unknown } | null }).auth;

  // Allow public routes and prefixes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── ONBOARDING REDIRECT LOGIC ──
  const user = session.user as {
    id: string;
    onboarded?: boolean;
    email?: string;
  };

  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isApiRoute = pathname.startsWith("/api/");

  // If user hasn't completed onboarding, redirect them there
  // (except if they're already on onboarding or hitting an API)
  if (user.onboarded === false && !isOnboardingRoute && !isApiRoute) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If user IS onboarded and tries to access onboarding, redirect to dashboard
  if (user.onboarded === true && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
