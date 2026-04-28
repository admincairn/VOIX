'use client'

// ============================================================
// VOIX — Metrics Grid
// 4 KPI cards with colored accent bars
// ============================================================

import type { DashboardMetrics } from '@/types'

interface MetricsGridProps {
  metrics: DashboardMetrics
}

interface MetricCard {
  label:   string
  value:   string | number
  delta?:  string
  color:   string
  accent:  string
  sub?:    string
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const cards: MetricCard[] = [
    {
      label:  'Total testimonials',
      value:  metrics.total_testimonials.toLocaleString(),
      delta:  `↑ +${metrics.testimonials_delta ?? 0} this week`,
      color:  'from-violet-500 to-pink-500',
      accent: 'from-violet-400 to-pink-400',
    },
    {
      label:  'Video testimonials',
      value:  metrics.video_testimonials.toLocaleString(),
      delta:  `↑ +${metrics.video_delta ?? 0} this week`,
      color:  '#ec4899',
      accent: 'from-pink-400 to-rose-400',
    },
    {
      label:  'Widget views',
      value:  metrics.widget_views >= 1000
        ? `${(metrics.widget_views / 1000).toFixed(1)}k`
        : metrics.widget_views.toLocaleString(),
      delta:  metrics.views_delta_pct
        ? `↑ +${metrics.views_delta_pct.toFixed(1)}% vs last month`
        : undefined,
      color:  '#0d9488',
      accent: 'from-teal-400 to-emerald-400',
    },
    {
      label:  'Average rating',
      value:  metrics.average_rating > 0 ? metrics.average_rating.toFixed(1) : '—',
      sub:    '★★★★★',
      color:  '#f59e0b',
      accent: 'from-amber-400 to-yellow-400',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <MetricCard key={i} card={card} />
      ))}
    </div>
  )
}

function MetricCard({ card }: { card: MetricCard }) {
  const isGradientValue = card.color.includes('from-')

  return (
    <div className="relative bg-white rounded-[14px] border border-[var(--color-border)] p-4 overflow-hidden hover:-translate-y-px transition-transform">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.accent}`} />

      <p className="text-[11px] font-medium text-[var(--color-muted)] mb-2 mt-1">
        {card.label}
      </p>

      <p
        className={`text-[1.9rem] font-black tracking-tight leading-none mb-1.5 ${
          isGradientValue ? `text-grad bg-gradient-to-r ${card.color}` : ''
        }`}
        style={!isGradientValue ? { color: card.color } : undefined}
      >
        {card.value}
      </p>

      {card.delta && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
            {card.delta.split(' ')[0]}&nbsp;{card.delta.split(' ')[1]}
          </span>
          <span className="text-[10.5px] text-[var(--color-muted)]">
            {card.delta.split(' ').slice(2).join(' ')}
          </span>
        </div>
      )}

      {card.sub && (
        <p className="text-sm mt-0.5" style={{ color: card.color }}>
          {card.sub}
        </p>
      )}
    </div>
  )
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] border border-[var(--color-border)] p-4 h-[100px]">
          <div className="skeleton h-3 w-24 mb-3" />
          <div className="skeleton h-9 w-16 mb-2" />
          <div className="skeleton h-3 w-28" />
        </div>
      ))}
    </div>
  )
}
