'use client'

// ============================================================
// VOIX — Mobile Sidebar Drawer
// Slide-in drawer for screens < lg
// ============================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Zap, Code2,
  Download, TrendingUp, Puzzle, Settings, Menu, X,
} from 'lucide-react'
import type { Session } from 'next-auth'

type User = Session['user']

const NAV_ITEMS = [
  { href: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/campaigns',    label: 'Campaigns',    icon: Zap },
  { href: '/widgets',      label: 'Widgets',      icon: Code2 },
  { href: '/import',       label: 'Import',       icon: Download },
  { href: '/performance',  label: 'Performance',  icon: TrendingUp },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings',     label: 'Settings',     icon: Settings },
]

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  growth:  'bg-violet-100 text-violet-700',
  scale:   'bg-pink-100 text-pink-700',
}

// ── Mobile topbar with hamburger ──────────────────────────

export function MobileTopbar({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const pageTitle = NAV_ITEMS.find(n =>
    n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)
  )?.label ?? 'Dashboard'

  const initials = (user.name ?? user.email ?? 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={18} className="text-gray-600" />
        </button>

        <span
          className="font-black tracking-tight text-base flex-1"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Voix
        </span>

        <span className="text-sm font-semibold text-gray-700">{pageTitle}</span>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ml-auto flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
        >
          {initials}
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between">
          <span
            className="font-black tracking-tight text-lg"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Voix
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} strokeWidth={1.8} className={active ? 'text-violet-600' : 'text-gray-400'} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Workspace pill */}
        <div className="border-t border-gray-100 p-4">
          {user.planStatus === 'trial' && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-[11px] font-semibold text-violet-700">Trial active</p>
              <Link href="/settings/billing" className="text-[11px] text-violet-600 underline">
                Upgrade →
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border border-gray-100 bg-gray-50">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate">{user.companyName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[user.planId ?? 'growth'] ?? PLAN_COLORS.growth}`}>
              {user.planId}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
