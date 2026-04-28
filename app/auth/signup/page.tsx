'use client'

// ============================================================
// VOIX — Sign Up Page
// /auth/signup
// ============================================================

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName]           = useState('')
  const [company, setCompany]     = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState<'google' | 'email' | null>(null)
  const [error, setError]         = useState<string | null>(null)

  async function handleGoogle() {
    setLoading('google')
    await signIn('google', { callbackUrl: '/onboarding' })
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !name) return

    setLoading('email')
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(null)
      return
    }

    // Create user in Supabase Auth
    // The handle_new_user trigger will auto-create their profile
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name:    name.trim(),
          company_name: company.trim() || name.trim().split(' ')[0] + "'s Company",
          company_slug: company.trim()
            ? company.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            : undefined,
        },
      },
    })

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'An account with this email already exists.'
          : signUpError.message
      )
      setLoading(null)
      return
    }

    // Sign in immediately after creation
    const result = await signIn('credentials', {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/onboarding')
    } else {
      // Email confirmation flow
      router.push('/auth/verify-email')
    }
  }

  const passwordStrength = (pw: string) => {
    if (pw.length === 0)  return null
    if (pw.length < 6)    return { label: 'Too short', color: 'bg-red-400',    w: '25%' }
    if (pw.length < 8)    return { label: 'Weak',      color: 'bg-orange-400', w: '50%' }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      return { label: 'Fair', color: 'bg-amber-400', w: '70%' }
    }
    return { label: 'Strong', color: 'bg-green-500', w: '100%' }
  }

  const strength = passwordStrength(password)

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-10">
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
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-up">
        {/* Trial pill */}
        <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span className="text-[11.5px] font-semibold text-violet-700">14-day free trial · No credit card</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Start collecting testimonials in minutes.</p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google */}
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

        {/* Form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full name *</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                type="text"
                className="input"
                placeholder="Acme Corp"
                value={company}
                onChange={e => setCompany(e.target.value)}
                autoComplete="organization"
              />
            </div>
          </div>

          <div>
            <label className="label">Work email *</label>
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
            <label className="label">Password *</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {strength && (
              <div className="mt-1.5">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.w }}
                  />
                </div>
                <p className="text-[10.5px] text-gray-400 mt-0.5">{strength.label}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!!loading || !email || !password || !name}
            className="w-full btn-primary py-2.5 text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'email' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              'Create account →'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-violet-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-sm">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
        We process your data under GDPR/CCPA.
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
