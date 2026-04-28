'use client'

// ============================================================
// VOIX — Dashboard Topbar
// ============================================================

import { useState } from 'react'
import { Search, Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Session } from 'next-auth'

type User = Session['user']

export function DashboardTopbar({ user }: { user: User }) {
  const [search, setSearch] = useState('')

  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Determine page title from pathname
  const title = 'Dashboard'

  return (
    <header className="h-[56px] bg-white border-b border-[var(--color-border)] flex items-center px-6 gap-3 flex-shrink-0">
      {/* Title */}
      <h1 className="text-[14.5px] font-bold tracking-tight flex-1">{title}</h1>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#f5f5f7] border border-[var(--color-border)] rounded-[9px] px-3 py-1.5 w-[210px]">
        <Search size={12} className="text-[var(--color-muted)] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-[12.5px] text-[var(--color-ink)] outline-none w-full placeholder:text-[var(--color-hint)]"
        />
      </div>

      {/* Share page */}
      <button className="btn-secondary text-[12.5px] py-1.5 px-3.5">
        Share page
      </button>

      {/* New campaign CTA */}
      <Link
        href="/campaigns/new"
        className="btn-primary text-[12.5px] py-1.5 px-3.5 flex items-center gap-1.5"
      >
        <Plus size={13} strokeWidth={2.5} />
        New campaign
      </Link>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={16} className="text-[var(--color-muted)]" strokeWidth={1.8} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-pink)] border border-white" />
      </button>

      {/* Avatar */}
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 hover:opacity-90 transition-opacity"
        style={{ background: 'var(--grad-brand)' }}
      >
        {initials}
      </button>
    </header>
  )
}
