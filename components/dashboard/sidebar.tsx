'use client'

// ============================================================
// VOIX — Dashboard Sidebar
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Zap, Code2,
  Download, TrendingUp, Puzzle, Settings, ChevronUp,
} from 'lucide-react'
import type { Session } from 'next-auth'

type User = Session['user']

interface SidebarProps {
  user: User
}

const NAV_ITEMS = [
  { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare, badge: true },
  { href: '/campaigns',   label: 'Campaigns',    icon: Zap },
  { href: '/widgets',     label: 'Widgets',      icon: Code2 },
  { href: '/import',      label: 'Import',       icon: Download },
]

const ANALYTICS_ITEMS = [
  { href: '/performance',   label: 'Performance',  icon: TrendingUp },
  { href: '/integrations',  label: 'Integrations', icon: Puzzle },
]

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  growth:  'bg-violet-100 text-violet-700',
  scale:   'bg-pink-100 text-pink-700',
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const planColor = PLAN_COLORS[user.planId ?? 'growth'] ?? PLAN_COLORS.growth
  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Trial days remaining
  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null

  return (
    <aside className="w-[220px] bg-white border-r border-[var(--color-border)] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
          style={{ background: 'var(--grad-brand)' }}
        >
          V
        </div>
        <span className="text-grad-full text-[15px] font-black tracking-tight">Voix</span>
      </div>

      {/* Trial banner */}
      {user.planStatus === 'trial' && trialDaysLeft !== null && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-violet-50 border border-violet-100">
          <p className="text-[11px] font-semibold text-violet-700">
            {trialDaysLeft > 0
              ? `${trialDaysLeft} days left in trial`
              : 'Trial expired'}
          </p>
          <Link
            href="/settings/billing"
            className="text-[11px] text-violet-600 underline underline-offset-2 mt-0.5 block"
          >
            Upgrade now →
          </Link>
        </div>
      )}

      {/* Main nav */}
      <nav className="px-3 pt-4 pb-2 flex flex-col gap-0.5">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={15} className="flex-shrink-0" strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Analytics nav */}
      <nav className="px-3 pt-3 pb-2 flex flex-col gap-0.5">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">
          Analytics
        </p>
        {ANALYTICS_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={15} className="flex-shrink-0" strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <nav className="px-3 pt-2 pb-2">
        <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
          <Settings size={15} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Workspace card */}
      <div className="mt-auto border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-[var(--color-border)] bg-[#f9fafb] cursor-pointer hover:bg-gray-100 transition-colors">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
            style={{ background: 'var(--grad-brand)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold truncate">{user.companyName}</p>
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${planColor}`}>
            {user.planId ?? 'Growth'}
          </span>
        </div>
      </div>
    </aside>
  )
}
