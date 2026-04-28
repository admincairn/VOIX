'use client'

// ============================================================
// VOIX — Sign In Page
// /auth/signin
// ============================================================

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/'
  const errorParam   = searchParams.get('error')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState<'google' | 'email' | null>(null)
  const [error, setError]       = useState<string | null>(
    errorParam === 'OAuthAccountNotLinked'
      ? 'This email is already registered with a different sign-in method.'
      : errorParam
      ? 'Authentication failed. Please try again.'
      : null
  )

  async function handleGoogle() {
    setLoading('google')
    setError(null)
    await signIn('google', { callbackUrl })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading('email')
    setError(null)

    const result = await signIn('credentials', {
      email:       email.trim().toLowerCase(),
      password,
      redirect:    false,
      callbackUrl,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(null)
    } else if (result?.ok) {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="mb-8 block">
        <span
          className="text-2xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Voix
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your Voix account</p>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 mb-4"
        >
          {loading === 'google' ? (
            <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="jane@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-violet-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={!!loading || !email || !password}
            className="w-full btn-primary py-2.5 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'email' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-violet-600 font-medium hover:underline">
            Start free trial
          </Link>
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
