'use client'

// ============================================================
// VOIX — Performance Client
// Analytics dashboard — SVG charts, zero external chart deps
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Eye, Star, MessageSquare, BarChart2 } from 'lucide-react'
import type { AnalyticsPayload, AnalyticsRange, DailyPoint } from '@/app/api/analytics/route'

// ── Range picker ──────────────────────────────────────────

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

// ── SVG Line chart ────────────────────────────────────────

function LineChart({
  data,
  color = '#7c3aed',
  height = 120,
}: {
  data: DailyPoint[]
  color?: string
  height?: number
}) {
  if (!data.length) return null

  const W     = 600
  const H     = height
  const PAD   = { top: 8, right: 4, bottom: 24, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.testimonials)
  const maxVal = Math.max(...values, 1)
  const minVal = 0

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW
  const yScale = (v: number) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH

  // Build SVG path
  const points = data.map((d, i) => `${xScale(i)},${yScale(d.testimonials)}`)
  const linePath  = `M ${points.join(' L ')}`
  const areaPath  = `M ${xScale(0)},${PAD.top + innerH} L ${points.join(' L ')} L ${xScale(data.length - 1)},${PAD.top + innerH} Z`

  // X-axis labels — show every N-th day
  const labelEvery = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 14
  const xLabels = data
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % labelEvery === 0 || i === data.length - 1)

  // Y-axis ticks
  const yTicks = [0, Math.ceil(maxVal / 2), maxVal]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {yTicks.map(tick => {
        const y = yScale(tick)
        return (
          <g key={tick}>
            <line
              x1={PAD.left} y1={y}
              x2={PAD.left + innerW} y2={y}
              stroke="#f3f4f6" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {tick}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#grad-${color.replace('#', '')})`}
      />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        d.testimonials > 0 && (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.testimonials)}
            r="3"
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        )
      ))}

      {/* X labels */}
      {xLabels.map(({ i, d }) => (
        <text
          key={i}
          x={xScale(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      ))}
    </svg>
  )
}

// ── Bar chart for rating distribution ─────────────────────

function RatingBar({ rating, count, pct, maxCount }: {
  rating: number; count: number; pct: number; maxCount: number
}) {
  const barW = maxCount > 0 ? (count / maxCount) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-amber-500 w-8 flex-shrink-0">
        {'★'.repeat(rating)}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barW}%`,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">
        {count} <span className="text-gray-300">({pct}%)</span>
      </span>
    </div>
  )
}

// ── Source donut chart ────────────────────────────────────

function SourceDonut({
  sources,
}: {
  sources: { source: string; count: number; pct: number }[]
}) {
  const SOURCE_COLORS: Record<string, string> = {
    google:     '#3b82f6',
    g2:         '#ef4444',
    video:      '#ec4899',
    manual:     '#9ca3af',
    capterra:   '#f97316',
    trustpilot: '#10b981',
  }

  const R    = 52
  const CX   = 64
  const CY   = 64
  const CIRC = 2 * Math.PI * R

  let cumPct = 0
  const segments = sources.map(s => {
    const dashArray  = (s.pct / 100) * CIRC
    const dashOffset = CIRC - (cumPct / 100) * CIRC
    cumPct += s.pct
    return { ...s, dashArray, dashOffset }
  })

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 128 128" className="w-28 h-28 flex-shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {segments.map(seg => (
          <circle
            key={seg.source}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={SOURCE_COLORS[seg.source] ?? '#6366f1'}
            strokeWidth="16"
            strokeDasharray={`${seg.dashArray} ${CIRC - seg.dashArray}`}
            strokeDashoffset={seg.dashOffset}
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        ))}
        <text x={CX} y={CY - 4}  textAnchor="middle" fontSize="11" fontWeight="700" fill="#111">
          {sources.reduce((s, x) => s + x.count, 0)}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8"  fill="#9ca3af">
          total
        </text>
      </svg>

      <div className="flex flex-col gap-2 flex-1">
        {sources.slice(0, 5).map(s => (
          <div key={s.source} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: SOURCE_COLORS[s.source] ?? '#6366f1' }}
            />
            <span className="text-xs capitalize flex-1 text-gray-600">{s.source}</span>
            <span className="text-xs font-semibold text-gray-700">{s.count}</span>
            <span className="text-[10px] text-gray-400">({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Delta badge ───────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-gray-400">No change</span>
  const up = delta > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}{delta}%
    </span>
  )
}

// ── Main component ────────────────────────────────────────

export function PerformanceClient({ initialData }: { initialData: AnalyticsPayload | null }) {
  const [range, setRange]   = useState<AnalyticsRange>('30d')
  const [data, setData]     = useState<AnalyticsPayload | null>(initialData)
  const [loading, setLoading] = useState(!initialData)

  const fetchData = useCallback(async (r: AnalyticsRange) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/analytics?range=${r}`)
      const json = await res.json()
      setData(json.data)
    } catch {
      // keep previous data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(range)
  }, [range, fetchData])

  const s = data?.summary

  const kpiCards = [
    {
      label:  'Total testimonials',
      value:  s?.total_testimonials ?? 0,
      delta:  s?.testimonials_delta ?? 0,
      icon:   <MessageSquare size={15} className="text-violet-500" />,
      color:  'from-violet-400 to-pink-400',
    },
    {
      label:  'Widget views',
      value:  s?.total_views ?? 0,
      delta:  s?.views_delta ?? 0,
      icon:   <Eye size={15} className="text-teal-500" />,
      color:  'from-teal-400 to-emerald-400',
    },
    {
      label:  'Avg. rating',
      value:  s?.avg_rating?.toFixed(1) ?? '—',
      delta:  s?.rating_delta ?? 0,
      icon:   <Star size={15} className="text-amber-400" />,
      color:  'from-amber-400 to-yellow-300',
    },
    {
      label:  'Published',
      value:  s?.published ?? 0,
      delta:  0,
      icon:   <BarChart2 size={15} className="text-blue-500" />,
      color:  'from-blue-400 to-indigo-400',
    },
  ]

  const maxRating = Math.max(...(data?.ratings?.map(r => r.count) ?? [1]), 1)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-gray-500">Analytics across your testimonials and widgets</p>
        </div>

        {/* Range picker */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === r.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-[14px] border border-gray-100 p-4 overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.color}`} />
            <div className="flex items-center gap-1.5 mb-2 mt-0.5">
              {card.icon}
              <p className="text-[11px] font-medium text-gray-500">{card.label}</p>
            </div>
            <p className="text-2xl font-black tracking-tight mb-1.5">{card.value.toLocaleString()}</p>
            <DeltaBadge delta={card.delta} />
          </div>
        ))}
      </div>

      {/* Time-series chart */}
      <div className="bg-white rounded-[14px] border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-sm">New testimonials over time</h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily submissions in the selected period</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#7c3aed' }} />
            <span className="text-xs text-gray-500">Testimonials</span>
          </div>
        </div>
        {loading ? (
          <div className="h-32 skeleton rounded-xl" />
        ) : data?.daily?.length ? (
          <LineChart data={data.daily} color="#7c3aed" height={130} />
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400">
            No data for this period
          </div>
        )}
      </div>

      {/* Bottom grid: Sources + Ratings + Widget table */}
      <div className="grid grid-cols-3 gap-4">
        {/* Source breakdown */}
        <div className="bg-white rounded-[14px] border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4">Source breakdown</h3>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-3 rounded" />)}
            </div>
          ) : data?.sources?.length ? (
            <SourceDonut sources={data.sources} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          )}
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-[14px] border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Rating distribution</h3>
            {s?.avg_rating ? (
              <span className="text-sm font-black text-amber-500">
                ★ {s.avg_rating.toFixed(1)}
              </span>
            ) : null}
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[5,4,3,2,1].map(i => <div key={i} className="skeleton h-3 rounded" />)}
            </div>
          ) : data?.ratings?.length ? (
            <div className="flex flex-col gap-2.5">
              {data.ratings.map(r => (
                <RatingBar key={r.rating} {...r} maxCount={maxRating} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No ratings yet</p>
          )}
        </div>

        {/* Widget performance */}
        <div className="bg-white rounded-[14px] border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4">Top widgets</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          ) : data?.widgets?.length ? (
            <div className="flex flex-col gap-2">
              {data.widgets.slice(0, 5).map((w, i) => {
                const maxViews = data.widgets[0]?.view_count ?? 1
                const barW = (w.view_count / maxViews) * 100
                return (
                  <div key={w.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate max-w-[140px] group-hover:text-violet-600 transition-colors">
                        {i + 1}. {w.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Eye size={10} className="text-gray-400" />
                        <span className="text-xs font-semibold">{w.view_count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barW}%`,
                          background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No widgets yet</p>
          )}
        </div>
      </div>

      {/* Coming soon: conversion tracking */}
      <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 border-dashed rounded-[14px] p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg flex-shrink-0">
          🚀
        </div>
        <div>
          <p className="font-semibold text-sm text-violet-900">Conversion tracking — coming soon</p>
          <p className="text-xs text-violet-600 mt-0.5">
            Track which testimonial widgets directly influence signups and purchases with our JS pixel.
          </p>
        </div>
      </div>
    </div>
  )
}
