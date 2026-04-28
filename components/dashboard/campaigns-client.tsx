'use client'

// ============================================================
// VOIX — Campaigns Client
// ============================================================

import { useState } from 'react'
import { Plus, Send, Link2, BarChart2, Copy, Check, Lock } from 'lucide-react'
import type { Campaign, CampaignStatus } from '@/types'

const STATUS_META: Record<CampaignStatus, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'pill bg-gray-100 text-gray-500' },
  active:    { label: 'Active',    cls: 'pill-published' },
  paused:    { label: 'Paused',    cls: 'pill-pending' },
  completed: { label: 'Completed', cls: 'pill bg-blue-50 text-blue-600' },
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voix.app'

interface Props {
  campaigns: Campaign[]
  companyName: string
  canUseCampaigns: boolean
}

export function CampaignsClient({ campaigns: initial, companyName, canUseCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [sending, setSending]       = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // Form state
  const [name, setName]               = useState('')
  const [type, setType]               = useState<'email' | 'link'>('email')
  const [subject, setSubject]         = useState(`Share your experience with ${companyName}`)
  const [body, setBody]               = useState(`Hi,\n\nWe'd love to hear about your experience with ${companyName}. It only takes 2 minutes and helps others make better decisions.\n\nThank you!`)
  const [recipients, setRecipients]   = useState('')
  const [creating, setCreating]       = useState(false)

  async function createCampaign() {
    if (!name.trim() || creating) return
    setCreating(true)

    const emailList = recipients
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'))

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        type,
        config: {
          subject,
          body,
          recipients: emailList,
        },
      }),
    })
    const json = await res.json()

    if (json.data) {
      setCampaigns(prev => [json.data, ...prev])
      setShowCreate(false)
      resetForm()
    }
    setCreating(false)
  }

  async function sendCampaign(id: string) {
    if (sending) return
    if (!confirm('Send this campaign now? Emails will be dispatched immediately.')) return

    setSending(id)
    const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
    const json = await res.json()

    setCampaigns(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: 'active' as CampaignStatus, sent_count: c.sent_count + (json.sent ?? 0) }
          : c
      )
    )
    setSending(null)
  }

  async function copyLink() {
    // Create a general invite link (no email pre-filled)
    const res = await fetch('/api/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const json = await res.json()
    if (json.data?.token) {
      await navigator.clipboard.writeText(`${APP_URL}/collect/${json.data.token}`)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  function resetForm() {
    setName(''); setRecipients('')
    setSubject(`Share your experience with ${companyName}`)
    setBody(`Hi,\n\nWe'd love to hear about your experience with ${companyName}. It only takes 2 minutes.\n\nThank you!`)
  }

  const responseRate = (c: Campaign) =>
    c.sent_count > 0 ? Math.round((c.response_count / c.sent_count) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500">Send collection requests to your customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5"
          >
            {linkCopied ? <Check size={13} className="text-green-600" /> : <Link2 size={13} />}
            {linkCopied ? 'Copied!' : 'Copy collect link'}
          </button>
          <button
            onClick={() => canUseCampaigns && setShowCreate(true)}
            className="btn-primary text-sm py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus size={13} strokeWidth={2.5} />
            New campaign
          </button>
        </div>
      </div>

      {/* Plan gate */}
      {!canUseCampaigns && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-xl p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Lock size={18} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Email campaigns require Growth or Scale</p>
            <p className="text-sm text-gray-500 mt-0.5">Upgrade to send branded collection emails to your customers.</p>
          </div>
          <a href="/settings/billing" className="btn-primary text-sm py-2 px-4 flex-shrink-0">
            Upgrade →
          </a>
        </div>
      )}

      {/* Quick stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total sent',      value: campaigns.reduce((s, c) => s + c.sent_count, 0).toLocaleString() },
            { label: 'Responses',       value: campaigns.reduce((s, c) => s + c.response_count, 0).toLocaleString() },
            { label: 'Avg. response rate', value: campaigns.length > 0 ? `${Math.round(campaigns.reduce((s, c) => s + responseRate(c), 0) / campaigns.length)}%` : '—' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl mb-4">✉️</div>
          <h3 className="font-bold text-base mb-1.5">No campaigns yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs">
            Send your first collection campaign and get testimonials in minutes.
          </p>
          <button
            onClick={() => canUseCampaigns && setShowCreate(true)}
            disabled={!canUseCampaigns}
            className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
          >
            Create first campaign
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-[14px]">{campaign.name}</h3>
                    <span className={STATUS_META[campaign.status]?.cls ?? 'pill'}>
                      {STATUS_META[campaign.status]?.label ?? campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {campaign.type === 'email' ? '✉️ Email' : '🔗 Link'} ·{' '}
                    Created {new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {campaign.status === 'draft' && campaign.type === 'email' && (
                    <button
                      onClick={() => sendCampaign(campaign.id)}
                      disabled={sending === campaign.id}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={11} />
                      {sending === campaign.id ? 'Sending…' : 'Send now'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <BarChart2 size={13} className="text-gray-400" />
                  <span className="text-sm font-semibold">{campaign.sent_count}</span>
                  <span className="text-xs text-gray-400">sent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{campaign.response_count}</span>
                  <span className="text-xs text-gray-400">responses</span>
                </div>
                {campaign.sent_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${responseRate(campaign)}%`, background: 'var(--grad-brand)' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{responseRate(campaign)}% response rate</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-base">New campaign</h3>
              <button onClick={() => { setShowCreate(false); resetForm() }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="label">Campaign name</label>
                <input className="input" type="text" placeholder="Post-onboarding testimonials" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>

              <div>
                <label className="label">Type</label>
                <div className="flex gap-2">
                  {(['email', 'link'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        type === t ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t === 'email' ? '✉️ Email campaign' : '🔗 Shareable link'}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'email' && (
                <>
                  <div>
                    <label className="label">Email subject</label>
                    <input className="input" type="text" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email body</label>
                    <textarea className="input resize-none" rows={5} value={body} onChange={e => setBody(e.target.value)} />
                    <p className="text-xs text-gray-400 mt-1">A personalized collect link is appended automatically.</p>
                  </div>
                  <div>
                    <label className="label">Recipients <span className="font-normal text-gray-400 normal-case tracking-normal">(one email per line)</span></label>
                    <textarea
                      className="input font-mono text-xs resize-none"
                      rows={4}
                      placeholder="customer1@company.com&#10;customer2@company.com"
                      value={recipients}
                      onChange={e => setRecipients(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {recipients.split(/[\n,]+/).filter(e => e.trim().includes('@')).length} valid recipients detected
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => { setShowCreate(false); resetForm() }} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
              <button onClick={createCampaign} disabled={!name.trim() || creating} className="btn-primary text-sm py-2.5 px-5 flex-1 disabled:opacity-50">
                {creating ? 'Creating…' : type === 'link' ? 'Create & get link →' : 'Save campaign →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
