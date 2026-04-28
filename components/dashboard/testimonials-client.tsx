'use client'

// ============================================================
// VOIX — Testimonials Client Page
// Full management UI with search, drawer, bulk actions
// ============================================================

import { useState, useMemo, useTransition } from 'react'
import { Search, Plus, Star, Video, Filter, Download } from 'lucide-react'
import type { Testimonial, TestimonialStatus } from '@/types'

const SOURCE_META: Record<string, { label: string; cls: string }> = {
  video:       { label: 'Video',        cls: 'source-video' },
  google:      { label: 'Google',       cls: 'source-google' },
  g2:          { label: 'G2',           cls: 'source-g2' },
  capterra:    { label: 'Capterra',     cls: 'source-capterra' },
  trustpilot:  { label: 'Trustpilot',   cls: 'source-trustpilot' },
  manual:      { label: 'Manual',       cls: 'source-manual' },
}

const STATUS_META: Record<TestimonialStatus, { label: string; cls: string }> = {
  published:  { label: 'Published',  cls: 'pill-published' },
  pending:    { label: 'Pending',    cls: 'pill-pending' },
  rejected:   { label: 'Rejected',   cls: 'pill-rejected' },
  archived:   { label: 'Archived',   cls: 'pill-archived' },
}

interface Props {
  initialTestimonials: Testimonial[]
  totalCounts: { all: number; pending: number; published: number; archived: number }
}

export function TestimonialsClient({ initialTestimonials, totalCounts }: Props) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [search, setSearch]             = useState('')
  const [tab, setTab]                   = useState<'all' | TestimonialStatus>('all')
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [drawer, setDrawer]             = useState<Testimonial | null>(null)
  const [, startTransition]             = useTransition()

  // ── Filter + search ────────────────────────────────────
  const filtered = useMemo(() => {
    return testimonials.filter(t => {
      if (tab !== 'all' && t.status !== tab) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          t.customer_name.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          (t.customer_title ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [testimonials, tab, search])

  // ── Actions ────────────────────────────────────────────
  async function updateStatus(ids: string[], status: TestimonialStatus) {
    // Optimistic
    setTestimonials(prev =>
      prev.map(t => ids.includes(t.id) ? { ...t, status } : t)
    )
    setSelected(new Set())

    startTransition(async () => {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/testimonials/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      )
    })
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(t => t.id)))
    }
  }

  const avatarColor = (name: string) => {
    const colors = ['bg-violet-100 text-violet-700','bg-pink-100 text-pink-700','bg-teal-100 text-teal-700','bg-amber-100 text-amber-700','bg-blue-100 text-blue-700']
    return colors[name.charCodeAt(0) % colors.length]
  }

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const tabs = [
    { key: 'all',       label: 'All',       count: totalCounts.all },
    { key: 'pending',   label: 'Pending',   count: totalCounts.pending },
    { key: 'published', label: 'Published', count: totalCounts.published },
    { key: 'archived',  label: 'Archived',  count: totalCounts.archived },
  ] as const

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Testimonials</h1>
          <p className="text-sm text-gray-500">{totalCounts.all} total · {totalCounts.pending} pending review</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5">
            <Download size={13} />
            Export
          </button>
          <button className="btn-primary text-sm py-2 px-3.5 flex items-center gap-1.5">
            <Plus size={13} strokeWidth={2.5} />
            Add testimonial
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden flex flex-col flex-1">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as typeof tab); setSelected(new Set()) }}
              className={`px-4 py-3 text-[12.5px] font-medium border-b-2 transition-all ${
                tab === t.key
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search testimonials…"
              className="bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter size={13} />
            Filter
          </button>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-gray-500 font-medium">{selected.size} selected</span>
              <button
                onClick={() => updateStatus([...selected], 'published')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
              >
                Approve all
              </button>
              <button
                onClick={() => updateStatus([...selected], 'archived')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Archive all
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-violet-600"
                  />
                </th>
                {['Customer', 'Testimonial', 'Rating', 'Source', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                    {search ? `No results for "${search}"` : 'No testimonials here yet.'}
                  </td>
                </tr>
              ) : filtered.map(t => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 last:border-none hover:bg-gray-50/70 transition-colors cursor-pointer ${
                    selected.has(t.id) ? 'bg-violet-50/60' : ''
                  }`}
                  onClick={() => setDrawer(t)}
                >
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(t.id) }}>
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="accent-violet-600"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${avatarColor(t.customer_name)}`}>
                        {initials(t.customer_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold truncate max-w-[140px]">{t.customer_name}</p>
                        {t.customer_title && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{t.customer_title}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 max-w-[240px]">
                    <div className="flex items-start gap-1.5">
                      {t.video_url && <Video size={12} className="text-pink-500 flex-shrink-0 mt-0.5" />}
                      <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">
                        {t.content}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < (t.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`source-badge ${SOURCE_META[t.source]?.cls ?? 'source-manual'}`}>
                      {SOURCE_META[t.source]?.label ?? t.source}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={STATUS_META[t.status]?.cls ?? 'pill'}>
                      {STATUS_META[t.status]?.label ?? t.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11.5px] text-gray-400">
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    {t.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateStatus([t.id], 'published')} className="px-2 py-1 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all text-gray-500">Approve</button>
                        <button onClick={() => updateStatus([t.id], 'rejected')} className="px-2 py-1 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-gray-500">Reject</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateStatus([t.id], t.status === 'archived' ? 'published' : 'archived')}
                        className="px-2 py-1 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-gray-100 transition-all text-gray-500"
                      >
                        {t.status === 'archived' ? 'Restore' : 'Archive'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <TestimonialDrawer
          testimonial={drawer}
          onClose={() => setDrawer(null)}
          onUpdate={(id, status) => {
            updateStatus([id], status)
            setDrawer(null)
          }}
        />
      )}
    </div>
  )
}

// ── Drawer ────────────────────────────────────────────────

function TestimonialDrawer({
  testimonial: t,
  onClose,
  onUpdate,
}: {
  testimonial: Testimonial
  onClose: () => void
  onUpdate: (id: string, status: TestimonialStatus) => void
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[14.5px] tracking-tight">Testimonial detail</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Customer */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-violet-100 text-violet-700">
              {t.customer_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{t.customer_name}</p>
              {t.customer_title && <p className="text-sm text-gray-500">{t.customer_title}</p>}
              {t.customer_email && <p className="text-xs text-gray-400">{t.customer_email}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Rating</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < (t.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              ))}
              <span className="text-sm text-gray-500 ml-1">{t.rating}/5</span>
            </div>
          </div>

          {/* Video */}
          {t.video_url && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Video</p>
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
                <a
                  href={t.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'var(--grad-brand)' }}
                >
                  ▶
                </a>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Testimonial</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 italic">
              "{t.content}"
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Source</p>
              <span className={`source-badge ${SOURCE_META[t.source]?.cls ?? 'source-manual'}`}>
                {SOURCE_META[t.source]?.label ?? t.source}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <span className={STATUS_META[t.status]?.cls ?? 'pill'}>
                {STATUS_META[t.status]?.label ?? t.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-sm font-medium">
                {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {t.tags?.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          {t.status === 'pending' ? (
            <>
              <button
                onClick={() => onUpdate(t.id, 'published')}
                className="flex-1 btn-primary py-2.5 text-sm"
              >
                ✓ Approve & publish
              </button>
              <button
                onClick={() => onUpdate(t.id, 'rejected')}
                className="btn-danger py-2.5 px-4 text-sm"
              >
                Reject
              </button>
            </>
          ) : t.status === 'published' ? (
            <button
              onClick={() => onUpdate(t.id, 'archived')}
              className="btn-secondary py-2.5 text-sm flex-1"
            >
              Archive
            </button>
          ) : (
            <button
              onClick={() => onUpdate(t.id, 'published')}
              className="btn-primary py-2.5 text-sm flex-1"
            >
              Restore & publish
            </button>
          )}
        </div>
      </div>
    </>
  )
}
