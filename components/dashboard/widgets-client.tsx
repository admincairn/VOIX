'use client'

// ============================================================
// VOIX — Widgets Client
// Widget builder with embed code generation
// ============================================================

import { useState } from 'react'
import { Plus, Copy, Check, Code2, Eye, BarChart2, Trash2 } from 'lucide-react'
import type { Widget, WidgetType } from '@/types'

const WIDGET_TYPES: { id: WidgetType; label: string; icon: string; desc: string }[] = [
  { id: 'carousel', label: 'Carousel',  icon: '◀▶', desc: 'Auto-scrolling horizontal slider' },
  { id: 'grid',     label: 'Grid',      icon: '▦',   desc: 'Responsive 2–3 column grid' },
  { id: 'wall',     label: 'Wall',      icon: '▩',   desc: 'Masonry wall of love' },
  { id: 'single',   label: 'Single',    icon: '◈',   desc: 'One testimonial, full width' },
  { id: 'badge',    label: 'Badge',     icon: '◉',   desc: 'Floating rating badge' },
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voix.app'

interface Props {
  widgets: Widget[]
  maxWidgets: number
}

export function WidgetsClient({ widgets: initial, maxWidgets }: Props) {
  const [widgets, setWidgets]       = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [copied, setCopied]         = useState<string | null>(null)
  const [creating, setCreating]     = useState(false)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<WidgetType>('carousel')
  const [accent, setAccent]   = useState('#7c3aed')
  const [theme, setTheme]     = useState<'light' | 'dark'>('light')

  const atLimit = maxWidgets !== -1 && widgets.length >= maxWidgets

  async function createWidget() {
    if (!newName.trim() || creating) return
    setCreating(true)

    const res = await fetch('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:   newName.trim(),
        type:   newType,
        config: { accentColor: accent, theme },
      }),
    })

    const json = await res.json()
    if (json.data) {
      setWidgets(prev => [json.data, ...prev])
      setShowCreate(false)
      setNewName('')
    }
    setCreating(false)
  }

  async function deleteWidget(id: string) {
    if (!confirm('Delete this widget? The embed will stop working immediately.')) return
    setWidgets(prev => prev.filter(w => w.id !== id))
    await fetch(`/api/widgets/${id}`, { method: 'DELETE' })
  }

  async function copyEmbed(widget: Widget) {
    const snippet = `<div id="voix-widget-${widget.id}"></div>\n<script src="${APP_URL}/api/widgets/${widget.id}/embed" async></script>`
    await navigator.clipboard.writeText(snippet)
    setCopied(widget.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const embedSnippet = (id: string) =>
    `<div id="voix-widget-${id}"></div>\n<script src="${APP_URL}/api/widgets/${id}/embed" async></script>`

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Widgets</h1>
          <p className="text-sm text-gray-500">
            {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            {maxWidgets !== -1 && ` · ${maxWidgets - widgets.length} remaining`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={atLimit}
          className="btn-primary text-sm py-2 px-3.5 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title={atLimit ? `Upgrade to create more than ${maxWidgets} widget${maxWidgets !== 1 ? 's' : ''}` : undefined}
        >
          <Plus size={13} strokeWidth={2.5} />
          New widget
        </button>
      </div>

      {/* Upgrade nudge */}
      {atLimit && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
          <p className="text-sm text-violet-700 font-medium">
            You've reached the {maxWidgets}-widget limit on your plan.
          </p>
          <a href="/settings/billing" className="text-sm font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-800">
            Upgrade →
          </a>
        </div>
      )}

      {/* Widget grid */}
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl mb-4">◈</div>
          <h3 className="font-bold text-base mb-1.5">No widgets yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs">Create your first widget to embed testimonials on your website.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2 px-5">
            Create first widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {widgets.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              copied={copied === widget.id}
              onCopy={() => copyEmbed(widget)}
              onDelete={() => deleteWidget(widget.id)}
              embedSnippet={embedSnippet(widget.id)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base">Create new widget</h3>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Widget name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Pricing page carousel"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Widget type</label>
                <div className="grid grid-cols-3 gap-2">
                  {WIDGET_TYPES.map(wt => (
                    <button
                      key={wt.id}
                      onClick={() => setNewType(wt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newType === wt.id
                          ? 'border-violet-400 bg-violet-50 ring-[3px] ring-violet-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{wt.icon}</div>
                      <div className="text-xs font-semibold">{wt.label}</div>
                      <div className="text-[10.5px] text-gray-400 mt-0.5">{wt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Accent color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-9 h-9 rounded-lg border border-gray-200 p-1 cursor-pointer" />
                    <input type="text" value={accent} onChange={e => setAccent(e.target.value)} className="input flex-1 font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label">Theme</label>
                  <div className="flex gap-2">
                    {(['light', 'dark'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          theme === t ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-2.5 px-4">
                Cancel
              </button>
              <button
                onClick={createWidget}
                disabled={!newName.trim() || creating}
                className="btn-primary text-sm py-2.5 px-5 flex-1 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create widget →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Widget Card ───────────────────────────────────────────

function WidgetCard({
  widget,
  copied,
  onCopy,
  onDelete,
  embedSnippet,
}: {
  widget: Widget
  copied: boolean
  onCopy: () => void
  onDelete: () => void
  embedSnippet: string
}) {
  const [showCode, setShowCode] = useState(false)

  const typeInfo = WIDGET_TYPES.find(t => t.id === widget.type)
  const views = widget.view_count >= 1000
    ? `${(widget.view_count / 1000).toFixed(1)}k`
    : widget.view_count.toLocaleString()

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${widget.config.accentColor}18` }}
            >
              {typeInfo?.icon ?? '▦'}
            </div>
            <div>
              <h3 className="font-bold text-[14px]">{widget.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 capitalize">{widget.type}</span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400 capitalize">{widget.config.theme}</span>
                <span className="text-gray-200">·</span>
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ background: widget.config.accentColor }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCode(!showCode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showCode ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Code2 size={12} />
              Embed
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all">
              <Eye size={12} />
              Preview
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <BarChart2 size={13} className="text-gray-400" />
            <span className="text-sm font-semibold">{views}</span>
            <span className="text-xs text-gray-400">views</span>
          </div>
          <div className="text-xs text-gray-400">
            Created {new Date(widget.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Embed code */}
        {showCode && (
          <div className="mt-4 animate-fade-in">
            <p className="text-xs font-semibold text-gray-500 mb-2">Paste this code anywhere on your website:</p>
            <div className="relative bg-gray-900 rounded-xl p-4">
              <pre className="text-[11.5px] text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {embedSnippet}
              </pre>
              <button
                onClick={onCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/10 text-white hover:bg-white/20"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Works with Webflow, WordPress, Framer, any HTML site. No dependencies.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
