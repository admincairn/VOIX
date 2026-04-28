// ============================================================
// VOIX — Auth.js v5 Configuration
// ============================================================

import NextAuth, { type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { supabaseAdmin } from './supabase'
import type { Profile } from '@/types'

const config: NextAuthConfig = {
  // ── Adapter ─────────────────────────────────────────────
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  // ── Providers ───────────────────────────────────────────
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(googleProfile) {
        return {
          id: googleProfile.sub,
          name: googleProfile.name,
          email: googleProfile.email,
          image: googleProfile.picture,
        }
      },
    }),

    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (error || !data.user) return null

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name ?? null,
          image: data.user.user_metadata?.avatar_url ?? null,
        }
      },
    }),
  ],

  // ── Session ─────────────────────────────────────────────
  session: { strategy: 'jwt' },

  // ── Pages ───────────────────────────────────────────────
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // ── Callbacks ───────────────────────────────────────────
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On sign-in, enrich the token with profile data
      if (user?.id) {
        token.userId = user.id
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*, plan:plans(*)')
          .eq('id', user.id)
          .single()

        if (profile) {
          token.profileId      = profile.id
          token.planId         = profile.plan_id
          token.planStatus     = profile.plan_status
          token.companyName    = profile.company_name
          token.companySlug    = profile.company_slug
          token.onboarded      = profile.onboarded
          token.trialEndsAt    = profile.trial_ends_at
        }
      }

      // Manual session refresh (e.g., after plan upgrade)
      if (trigger === 'update' && session?.planId) {
        token.planId     = session.planId
        token.planStatus = session.planStatus
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id          = token.userId as string
        session.user.planId      = token.planId as string
        session.user.planStatus  = token.planStatus as string
        session.user.companyName = token.companyName as string
        session.user.companySlug = token.companySlug as string
        session.user.onboarded   = token.onboarded as boolean
        session.user.trialEndsAt = token.trialEndsAt as string | null
      }
      return session
    },

    async signIn({ user, account }) {
      // Block sign-in if account is suspended (past_due / cancelled check)
      if (!user?.email) return false

      // Allow all valid sign-ins — profile creation handled by Supabase trigger
      return true
    },
  },

  // ── Events ──────────────────────────────────────────────
  events: {
    async signIn({ user, isNewUser }) {
      // Welcome email for new users
      if (isNewUser && user.email) {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/email/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.name }),
          })
        } catch {
          // Non-critical — log but don't block sign-in
          console.error('[Auth] Failed to send welcome email')
        }
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// ── Type augmentation ────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      planId: string
      planStatus: string
      companyName: string
      companySlug: string
      onboarded: boolean
      trialEndsAt: string | null
    }
  }
}
