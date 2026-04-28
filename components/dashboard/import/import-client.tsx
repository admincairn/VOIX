'use client'

// ============================================================
// VOIX — Import Client
// Multi-source import wizard: Google + G2 + Capterra + Trustpilot
// ============================================================

import { useState, useRef, useEffect }  from 'react'
import { Search, CheckCircle2, AlertCircle, Lock, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import type { ImportResult, ImportSource, ImportUIState }  from '@/types/import'
import type { Activity } from '@/types'
import type { GooglePlaceSearchResult } from '@/types/import'

// ── Source metadata ───────────────────────────────────────

const SOURCES: {
  id:       ImportSource
  label:    string
  icon:     string
  color:    string
  bgColor:  string
  border:   string
  desc:     string
  hint:     string
}[] = [
  {
    id: 'google', label: 'Google', icon: 'G',
    color: 'text-blue-600', bgColor: 'bg-blue-50', border: 'border-blue-200',
    desc: 'Import reviews from your Google Business Profile',
    hint: 'Search by business name or paste your Google Place ID',
  },
  {
    id: 'g2', label: 'G2', icon: 'G2',
    color: 'text-red-600', bgColor: 'bg-red-50', border: 'border-red-200',
    desc: 'Import reviews from your G2 product page',
    hint: 'Paste your G2 product URL (e.g. g2.com/products/your-product/reviews)',
  },
  {
    id: 'capterra', label: 'Capterra', icon: 'Ca',
    color: 'text-orange-600', bgColor: 'bg-orange-50', border: 'border-orange-200',
    desc: 'Import reviews from Capterra',
    hint: 'Paste your Capterra product page URL',
  },
  {
    id: 'trustpilot', label: 'Trustpilot', icon: 'Tp',
    color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-200',
    desc: 'Import reviews from Trustpilot',
    hint: 'Paste your Trustpilot company page URL',
  },
]

// ── Props ─────────────────────────────────────────────────

interface Props {
  history:      Activity[]
  sourceCounts: Record<string, number>
  canImport:    boolean
}

// ── Component ─────────────────────────────────────────────

export function ImportClient({ history: initialHistory, sourceCounts, canImport }: Props) {
  const [history, setHistory]   = useState<Activity[]>(initialHistory)
  const [ui, setUi]             = useState<ImportUIState>({
    source: null, status: 'idle', progress: 0, result: null, error: null,
  })

  // Form fields
  const [selectedSource, setSelectedSource]   = useState<ImportSource | null>(null)
  const [googleQuery, setGoogleQuery]         = useState('')
  const [googlePlaceId, setGooglePlaceId]     = useState('')
  const [googleResults, setGoogleResults]     = useState<GooglePlaceSearchResult[]>([])
  const [googleSearching, setGoogleSearching] = useState(false)
  const [g2Input, setG2Input]                 = useState('')
  const [pageUrl, setPageUrl]                 = useState('')
  const [maxReviews, setMaxReviews]           = useState(50)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()

  // ── Google place search autocomplete ─────────────────────

  useEffect(() => {
    if (!googleQuery.trim() || googleQuery.length < 2) {
      setGoogleResults([])
      return
    }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setGoogleSearching(true)
      try {
        const res = await fetch('/api/import/search-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: googleQuery }),
        })
        const json = await res.json()
        setGoogleResults(json.data ?? [])
      } catch {
        setGoogleResults([])
      } finally {
        setGoogleSearching(false)
      }
    }, 400)
    return () => clearTimeout(searchTimeout.current)
  }, [googleQuery])

  // ── Run import ────────────────────────────────────────────

  async function runImport() {
    if (!selectedSource) return

    setUi({ source: selectedSource, status: 'fetching', progress: 10, result: null, error: null })

    // Build payload
    const payload: Record<string, unknown> = {
      source:      selectedSource,
      max_reviews: maxReviews,
    }

    if (selectedSource === 'google') {
      if (googlePlaceId) {
        payload.place_id = googlePlaceId
      } else if (googleQuery) {
        payload.place_name = googleQuery
      } else {
        setUi(prev => ({ ...prev, status: 'error', error: 'Please search for and select a Google business.' }))
        return
      }
    } else if (selectedSource === 'g2') {
      payload.product_url = g2Input.trim()
    } else {
      payload.page_url = pageUrl.trim()
    }

    // Simulate progress ticks while waiting
    const progressInterval = setInterval(() => {
      setUi(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 8, 85),
      }))
    }, 800)

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      clearInterval(progressInterval)
      const json = await res.json()

      if (!res.ok || json.error) {
        setUi(prev => ({ ...prev, status: 'error', progress: 0, error: json.error ?? 'Import failed' }))
        return
      }

      const result: ImportResult = json.data
      setUi({ source: selectedSource, status: 'done', progress: 100, result, error: null })

      // Refresh history
      const histRes = await fetch('/api/import')
      const histJson = await histRes.json()
      if (histJson.data) setHistory(histJson.data)
    } catch (err) {
      clearInterval(progressInterval)
      setUi(prev => ({
        ...prev,
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }

  function resetImport() {
    setUi({ source: null, status: 'idle', progress: 0, result: null, error: null })
    setGooglePlaceId('')
    setGoogleQuery('')
    setGoogleResults([])
    setG2Input('')
    setPageUrl('')
  }

  const totalImported = Object.values(sourceCounts).reduce((a, b) => a + b, 0)
  const isBusy = ui.status === 'fetching' || ui.status === 'validating' || ui.status === 'processing'

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight">Import Reviews</h1>
        <p className="text-sm text-gray-500">
          Pull reviews from external platforms directly into Voix. Published automatically.
        </p>
      </div>

      {/* Plan gate */}
      {!canImport && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Lock size={18} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Review import requires Growth or Scale</p>
            <p className="text-sm text-gray-500 mt-0.5">Upgrade to import from Google, G2, Capterra, and Trustpilot.</p>
          </div>
          <a href="/settings/billing" className="btn-primary text-sm py-2 px-4 flex-shrink-0">
            Upgrade →
          </a>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {SOURCES.map(src => (
          <div key={src.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${src.bgColor} ${src.color}`}>
                {src.icon}
              </div>
              <span className="text-xs font-semibold text-gray-500">{src.label}</span>
            </div>
            <p className="text-xl font-black tracking-tight">{sourceCounts[src.id] ?? 0}</p>
            <p className="text-[10.5px] text-gray-400 mt-0.5">reviews imported</p>
          </div>
        ))}
      </div>

      {/* Import wizard */}
      {ui.status === 'done' && ui.result ? (
        /* ── Success state ── */
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">Import complete</h3>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { label: 'Fetched',  value: ui.result.fetched,   color: 'text-gray-700' },
                  { label: 'Imported', value: ui.result.imported,  color: 'text-green-600' },
                  { label: 'Skipped',  value: ui.result.skipped,   color: 'text-gray-400' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {ui.result.errors.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Partial errors ({ui.result.errors.length})</p>
                  {ui.result.errors.slice(0, 3).map((e, i) => (
                    <p key={i} className="text-xs text-amber-600">{e}</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Completed in {(ui.result.duration_ms / 1000).toFixed(1)}s ·{' '}
                {ui.result.imported > 0 && (
                  <a href="/testimonials" className="text-violet-600 underline">View imported reviews →</a>
                )}
              </p>
            </div>
          </div>
          <button onClick={resetImport} className="btn-secondary text-sm py-2 px-4 mt-4 flex items-center gap-1.5">
            <RefreshCw size={13} />
            Import more
          </button>
        </div>
      ) : (
        /* ── Import form ── */
        <div className="card overflow-hidden">
          {/* Source selector */}
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select source</p>
            <div className="grid grid-cols-4 gap-2">
              {SOURCES.map(src => (
                <button
                  key={src.id}
                  onClick={() => canImport && setSelectedSource(src.id)}
                  disabled={!canImport}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedSource === src.id
                      ? `${src.bgColor} ${src.border} ring-[3px] ring-offset-0`
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  } ${!canImport ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={selectedSource === src.id ? { ringColor: src.color } : undefined}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${src.bgColor} ${src.color}`}>
                    {src.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{src.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source-specific form */}
          {selectedSource && !isBusy && (
            <div className="p-5 border-b border-gray-100">
              {(() => {
                const src = SOURCES.find(s => s.id === selectedSource)!
                return (
                  <>
                    <p className="text-sm text-gray-500 mb-4">{src.desc}</p>

                    {/* Google */}
                    {selectedSource === 'google' && (
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <label className="label">Search your business</label>
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              className="input pl-9"
                              type="text"
                              placeholder="Acme Corp, New York"
                              value={googleQuery}
                              onChange={e => {
                                setGoogleQuery(e.target.value)
                                setGooglePlaceId('')
                              }}
                            />
                            {googleSearching && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
                            )}
                          </div>

                          {/* Autocomplete dropdown */}
                          {googleResults.length > 0 && !googlePlaceId && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                              {googleResults.map(r => (
                                <button
                                  key={r.place_id}
                                  onClick={() => {
                                    setGooglePlaceId(r.place_id)
                                    setGoogleQuery(r.name)
                                    setGoogleResults([])
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                                >
                                  <p className="text-sm font-semibold">{r.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{r.formatted_address}</p>
                                  {r.rating && (
                                    <p className="text-xs text-amber-500 mt-0.5">
                                      ★ {r.rating} · {r.user_ratings_total?.toLocaleString()} reviews
                                    </p>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {googlePlaceId && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                            <p className="text-xs text-blue-700 font-medium">Place selected: {googleQuery}</p>
                            <button onClick={() => { setGooglePlaceId(''); setGoogleQuery('') }} className="ml-auto text-blue-400 hover:text-blue-700 text-sm">✕</button>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-400 mb-1">— or —</p>
                          <label className="label">Paste Place ID directly</label>
                          <input
                            className="input font-mono text-xs"
                            type="text"
                            placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                            value={googlePlaceId}
                            onChange={e => { setGooglePlaceId(e.target.value); setGoogleQuery('') }}
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Find your Place ID at{' '}
                            <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                              Place ID Finder ↗
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* G2 */}
                    {selectedSource === 'g2' && (
                      <div>
                        <label className="label">G2 product URL or slug</label>
                        <input
                          className="input"
                          type="text"
                          placeholder="https://www.g2.com/products/your-product/reviews"
                          value={g2Input}
                          onChange={e => setG2Input(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">{src.hint}</p>
                      </div>
                    )}

                    {/* Capterra / Trustpilot */}
                    {['capterra', 'trustpilot'].includes(selectedSource) && (
                      <div>
                        <label className="label">{src.label} page URL</label>
                        <input
                          className="input"
                          type="url"
                          placeholder={`https://www.${selectedSource}.com/software/your-product`}
                          value={pageUrl}
                          onChange={e => setPageUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">{src.hint}</p>
                      </div>
                    )}

                    {/* Max reviews slider */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="label mb-0">Max reviews to import</label>
                        <span className="text-sm font-bold text-violet-600">{maxReviews}</span>
                      </div>
                      <input
                        type="range"
                        min={10} max={200} step={10}
                        value={maxReviews}
                        onChange={e => setMaxReviews(+e.target.value)}
                        className="w-full accent-violet-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>10</span>
                        <span>Note: Google Places API returns max 5 reviews on free tier</span>
                        <span>200</span>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          {/* Error state */}
          {ui.status === 'error' && (
            <div className="mx-5 my-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Import failed</p>
                <p className="text-sm text-red-600 mt-0.5">{ui.error}</p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {isBusy && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {ui.status === 'fetching' ? `Fetching reviews from ${ui.source}…` : 'Processing…'}
                </p>
                <span className="text-sm font-bold text-violet-600">{Math.round(ui.progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ui.progress}%`,
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This may take 10–30 seconds depending on the number of reviews.
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="px-5 py-4 flex items-center gap-3 bg-gray-50/50">
            <button
              onClick={runImport}
              disabled={!selectedSource || !canImport || isBusy}
              className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isBusy ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing…</>
              ) : (
                `Import from ${selectedSource ? SOURCES.find(s => s.id === selectedSource)?.label : '…'}`
              )}
            </button>

            <p className="text-xs text-gray-400 ml-auto">
              Imported reviews are auto-published and available in your widgets immediately.
            </p>
          </div>
        </div>
      )}

      {/* Import history */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm">Import history</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map((activity, i) => {
              const meta  = activity.metadata as Record<string, unknown>
              const src   = SOURCES.find(s => s.id === meta.source)
              const imported = meta.imported as number ?? 0
              const fetched  = meta.fetched  as number ?? 0
              const skipped  = meta.skipped  as number ?? 0

              return (
                <div key={activity.id ?? i} className="px-5 py-3.5 flex items-center gap-3">
                  {src && (
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${src.bgColor} ${src.color} flex-shrink-0`}>
                      {src.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <span className="font-semibold">{imported}</span> imported
                      {skipped > 0 && <span className="text-gray-400"> · {skipped} skipped</span>}
                      {' from '}
                      <span className="font-semibold capitalize">{String(meta.source ?? '')}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {fetched} reviews fetched · {String(meta.query ?? '')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                    <Clock size={11} />
                    {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Setup guide */}
      <div className="card p-5 border-dashed">
        <h3 className="font-bold text-sm mb-3">⚙️ Setup required</h3>
        <div className="flex flex-col gap-2.5">
          {[
            {
              label: 'Google Places API key',
              desc: 'Required for Google Business reviews. Get it from Google Cloud Console.',
              href: 'https://console.cloud.google.com/apis/credentials',
              env: 'GOOGLE_PLACES_API_KEY',
              done: !!process.env.NEXT_PUBLIC_HAS_GOOGLE_KEY,
            },
            {
              label: 'G2 import',
              desc: 'No API key needed — uses public review pages. Ready to use.',
              env: null,
              done: true,
            },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                {item.done
                  ? <CheckCircle2 size={12} className="text-green-600" />
                  : <span className="text-gray-400 text-[9px]">○</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                {item.env && (
                  <code className="text-[10.5px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600 mt-1 inline-block">
                    {item.env}=your_key_here
                  </code>
                )}
              </div>
              {item.href && (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-violet-600 hover:text-violet-700">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
