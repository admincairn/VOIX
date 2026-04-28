'use client'

// ============================================================
// VOIX — Widgets Panel + Activity Feed
// ============================================================

import type { Widget, Activity, ActivityType } from '@/types'

// ── Widgets Panel ─────────────────────────────────────────

interface WidgetsPanelProps {
  widgets: Widget[]
}

const WIDGET_ICONS: Record<string, string> = {
  carousel: '▦', grid: '▦', masonry: '▦', single: '◈', badge: '◉', wall: '▦',
}

const WIDGET_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-pink-100',   text: 'text-pink-600' },
  { bg: 'bg-teal-100',   text: 'text-teal-600' },
  { bg: 'bg-amber-100',  text: 'text-amber-700' },
  { bg: 'bg-blue-100',   text: 'text-blue-600' },
]

export function WidgetsPanel({ widgets }: WidgetsPanelProps) {
  const maxViews = Math.max(...widgets.map(w => w.view_count), 1)

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-[13px] font-bold">Active widgets</h3>
        <a
          href="/widgets"
          className="text-[11.5px] text-[var(--color-violet)] font-medium hover:underline"
        >
          View all →
        </a>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {widgets.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[12.5px] text-[var(--color-muted)]">No widgets yet.</p>
            <a href="/widgets" className="text-[12px] text-[var(--color-violet)] underline mt-1 block">
              Create your first widget →
            </a>
          </div>
        ) : (
          widgets.map((widget, i) => {
            const color = WIDGET_COLORS[i % WIDGET_COLORS.length]
            const pct = Math.round((widget.view_count / maxViews) * 100)
            const views = widget.view_count >= 1000
              ? `${(widget.view_count / 1000).toFixed(1)}k`
              : widget.view_count.toLocaleString()

            return (
              <div
                key={widget.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${color.bg} ${color.text}`}>
                  {WIDGET_ICONS[widget.type] ?? '▦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate">{widget.name}</p>
                  <div className="mt-1 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'var(--grad-brand)',
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-[var(--color-muted)] flex-shrink-0">
                  {views}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────

interface ActivityFeedProps {
  activities: Activity[]
}

const ACTIVITY_META: Record<ActivityType, { label: string; color: string }> = {
  testimonial_submitted:  { label: 'submitted a testimonial',  color: 'bg-green-400' },
  testimonial_published:  { label: 'testimonial published',    color: 'bg-violet-400' },
  testimonial_rejected:   { label: 'testimonial rejected',     color: 'bg-red-400' },
  widget_viewed:          { label: 'widget viewed',            color: 'bg-blue-400' },
  widget_created:         { label: 'widget created',           color: 'bg-teal-400' },
  campaign_sent:          { label: 'campaign sent',            color: 'bg-amber-400' },
  import_completed:       { label: 'import completed',         color: 'bg-pink-400' },
  subscription_activated: { label: 'plan activated',           color: 'bg-green-500' },
  subscription_cancelled: { label: 'subscription cancelled',   color: 'bg-red-500' },
}

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60)    return 'just now'
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  const days = Math.floor(secs / 86400)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

function activityLabel(activity: Activity): string {
  const meta = ACTIVITY_META[activity.type]
  if (!meta) return activity.type.replace(/_/g, ' ')

  const m = activity.metadata as Record<string, unknown>
  if (activity.type === 'campaign_sent' && m.sent) {
    return `Campaign sent to ${m.sent} recipients`
  }
  if (activity.type === 'import_completed' && m.count) {
    return `${m.count} reviews imported`
  }
  return meta.label
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-[var(--color-border)]">
        <h3 className="text-[13px] font-bold">Recent activity</h3>
      </div>

      <div className="px-4 pb-2">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-[var(--color-muted)]">
            No activity yet.
          </p>
        ) : (
          activities.map((activity, i) => {
            const meta  = ACTIVITY_META[activity.type]
            const color = meta?.color ?? 'bg-gray-300'

            return (
              <div
                key={activity.id}
                className={`flex gap-2.5 items-start py-2.5 ${
                  i < activities.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
                <div>
                  <p className="text-[12px] text-[var(--color-ink)] leading-snug">
                    {activityLabel(activity)}
                  </p>
                  <p className="text-[11px] text-[var(--color-hint)] mt-0.5">
                    {timeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] border border-[var(--color-border)] p-4 h-[96px]">
          <div className="skeleton h-2.5 w-20 mb-3 rounded" />
          <div className="skeleton h-8 w-14 mb-2 rounded" />
          <div className="skeleton h-2.5 w-24 rounded" />
        </div>
      ))}
    </div>
  )
}
