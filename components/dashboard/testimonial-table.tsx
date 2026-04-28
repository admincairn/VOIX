'use client'

// ============================================================
// VOIX — Testimonial Table
// Filterable, with optimistic status updates
// ============================================================

import { useState, useTransition } from 'react'
import type { Testimonial, TestimonialStatus } from '@/types'

type TabKey = 'all' | 'pending' | 'published' | 'video'

const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  video:      { label: 'Video',       className: 'source-video' },
  google:     { label: 'Google',      className: 'source-google' },
  g2:         { label: 'G2',          className: 'source-g2' },
  capterra:   { label: 'Capterra',    className: 'source-capterra' },
  trustpilot: { label: 'Trustpilot',  className: 'source-trustpilot' },
  manual:     { label: 'Manual',      className: 'source-manual' },
}

const STATUS_PILLS: Record<TestimonialStatus, string> = {
  published: 'pill-published',
  pending:   'pill-pending',
  rejected:  'pill-rejected',
  archived:  'pill-archived',
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-[11px]">—</span>
  return (
    <span className="text-amber-400 text-[11px] tracking-tighter">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700']
  const color = colors[name.charCodeAt(0) % colors.length]

  if (url) {
    return <img src={url} alt={name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

interface TestimonialTableProps {
  testimonials: Testimonial[]
  totalCounts: { all: number; pending: number; published: number; video: number }
}

export function TestimonialTable({ testimonials: initial, totalCounts }: TestimonialTableProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initial)
  const [activeTab, setActiveTab]       = useState<TabKey>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [isPending, startTransition]    = useTransition()

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all',       label: 'All',       count: totalCounts.all },
    { key: 'pending',   label: 'Pending',   count: totalCounts.pending },
    { key: 'published', label: 'Published', count: totalCounts.published },
    { key: 'video',     label: 'Video',     count: totalCounts.video },
  ]

  const sources = ['all', 'google', 'g2', 'video', 'manual']

  const filtered = testimonials.filter(t => {
    if (activeTab === 'pending'   && t.status !== 'pending')   return false
    if (activeTab === 'published' && t.status !== 'published') return false
    if (activeTab === 'video'     && t.source !== 'video')     return false
    if (sourceFilter !== 'all'    && t.source !== sourceFilter) return false
    return true
  })

  async function updateStatus(id: string, status: TestimonialStatus) {
    // Optimistic update
    setTestimonials(prev =>
      prev.map(t => t.id === id ? { ...t, status } : t)
    )

    startTransition(async () => {
      try {
        await fetch(`/api/testimonials/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      } catch {
        // Revert on error
        setTestimonials(prev =>
          prev.map(t => t.id === id ? { ...t, status: t.status } : t)
        )
      }
    })
  }

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[12.5px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--color-violet)] text-[var(--color-violet)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-center gap-2">
        {sources.map(src => (
          <button
            key={src}
            onClick={() => setSourceFilter(src)}
            className={`px-2.5 py-1 rounded-md border text-[11.5px] font-medium transition-all ${
              sourceFilter === src
                ? 'bg-[#f5f5f7] text-[var(--color-ink)] border-[var(--color-border-md)]'
                : 'border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)]'
            }`}
          >
            {src === 'all' ? 'All sources' : SOURCE_LABELS[src]?.label ?? src}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[11.5px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
            Latest ↓
          </button>
          <button className="px-2.5 py-1 rounded-md border border-[var(--color-border)] text-[11.5px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Customer', 'Rating', 'Source', 'Status', 'Date', 'Actions'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10.5px] font-semibold text-[var(--color-hint)] uppercase tracking-wider px-4 py-2.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[var(--color-muted)] text-sm">
                  No testimonials match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--color-border)] last:border-none hover:bg-[#fafafa] transition-colors"
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={t.customer_name} url={t.customer_avatar_url} />
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold truncate">{t.customer_name}</p>
                        {t.customer_title && (
                          <p className="text-[11px] text-[var(--color-muted)] truncate">{t.customer_title}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <Stars rating={t.rating} />
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <span className={SOURCE_LABELS[t.source]?.className ?? 'source-manual'}>
                      {SOURCE_LABELS[t.source]?.label ?? t.source}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={STATUS_PILLS[t.status] ?? 'pill'}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-[11.5px] text-[var(--color-muted)]">
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => updateStatus(t.id, 'published')}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(t.id, 'rejected')}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-gray-50 hover:text-[var(--color-ink)] transition-all">
                            Edit
                          </button>
                          <button
                            onClick={() => updateStatus(t.id, 'archived')}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          >
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
