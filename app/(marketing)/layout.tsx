// ============================================================
// VOIX — Marketing Layout
// Wraps landing page, pricing, etc.
// ============================================================

import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav isLoggedIn={!!session?.user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}

function MarketingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-100 glass"
      style={{ height: 60 }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span
            className="text-lg font-black tracking-tight"
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

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/#features',  label: 'Features' },
            { href: '/#examples',  label: 'Examples' },
            { href: '/pricing',    label: 'Pricing' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/"
              className="btn-primary text-sm py-2 px-4"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                Start free →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span
          className="text-sm font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Voix
        </span>

        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Docs', 'Blog'].map(label => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Voix, Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}
