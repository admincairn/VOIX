'use client'

// ============================================================
// VOIX — Settings Client
// Profile, billing, plan management
// ============================================================

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { Check, ExternalLink, AlertTriangle } from 'lucide-react'
import type { Profile, Plan } from '@/types'

interface Props {
  profile: Profile | null
  plans: Plan[]
  userEmail: string
}

const TABS = ['Profile', 'Billing', 'Account'] as const
type Tab = typeof TABS[number]

export function SettingsClient({ profile, plans, userEmail }: Props) {
  const { update }    = useSession()
  const [tab, setTab] = useState<Tab>('Profile')

  // Profile form
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [website, setWebsite]         = useState(profile?.website_url ?? '')
  const [slug, setSlug]               = useState(profile?.company_slug ?? '')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  // Billing
  const [upgrading, setUpgrading]     = useState<string | null>(null)

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName.trim(),
        company_slug: slug.trim(),
        website_url:  website.trim() || null,
      }),
    })

    if (res.ok) {
      await update({ companyName: companyName.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function startUpgrade(planId: string) {
    setUpgrading(planId)
    const res = await fetch('/api/lemon-squeezy/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    const json = await res.json()
    if (json.url) {
      window.location.href = json.url
    }
    setUpgrading(null)
  }

  const currentPlan = profile?.plan as Plan | null
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86_400_000))
    : null

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500">Manage your workspace and subscription</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'Profile' && (
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-bold">Workspace settings</h2>

          <div className="grid gap-4">
            <div>
              <label className="label">Company name</label>
              <input
                className="input"
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Public page slug</label>
              <div className="flex items-center border border-gray-200 rounded-[10px] overflow-hidden focus-within:border-violet-400 focus-within:ring-[3px] focus-within:ring-violet-100">
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none whitespace-nowrap">
                  voix.app/c/
                </span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
                <a
                  href={`https://voix.app/c/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div>
              <label className="label">Website</label>
              <input
                className="input"
                type="url"
                placeholder="https://yoursite.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
            >
              {saved ? (
                <><Check size={14} /> Saved!</>
              ) : saving ? (
                'Saving…'
              ) : (
                'Save changes'
              )}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Changes saved.</span>}
          </div>
        </div>
      )}

      {/* ── BILLING TAB ── */}
      {tab === 'Billing' && (
        <div className="flex flex-col gap-4">
          {/* Current plan */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Current plan</h2>
              {profile?.plan_status === 'trial' && trialDaysLeft !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                  <AlertTriangle size={12} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">{trialDaysLeft}d left in trial</span>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(236,72,153,0.03))',
                borderColor: 'rgba(124,58,237,0.2)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'var(--grad-brand)' }}
              >
                {currentPlan?.name?.[0] ?? 'G'}
              </div>
              <div className="flex-1">
                <p className="font-bold">{currentPlan?.name ?? 'Growth'} Plan</p>
                <p className="text-sm text-gray-500">
                  ${((currentPlan?.price_monthly ?? 3900) / 100).toFixed(0)}/month ·{' '}
                  {profile?.plan_status === 'trial' ? '14-day trial' : profile?.plan_status}
                </p>
              </div>
              {profile?.subscription_id && (
                <a
                  href="https://app.lemonsqueezy.com/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <ExternalLink size={11} />
                  Manage
                </a>
              )}
            </div>
          </div>

          {/* Plan comparison */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold">Available plans</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {plans.map(plan => {
                const isCurrent = plan.id === profile?.plan_id
                return (
                  <div key={plan.id} className={`px-5 py-4 flex items-center gap-4 ${isCurrent ? 'bg-violet-50/50' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm">{plan.name}</p>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold">${(plan.price_monthly / 100).toFixed(0)}<span className="font-normal text-gray-400">/mo</span></p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                        {[
                          plan.max_testimonials === -1 ? 'Unlimited testimonials' : `${plan.max_testimonials} testimonials`,
                          plan.max_videos_monthly === -1 ? 'Unlimited videos' : `${plan.max_videos_monthly} videos/mo`,
                          plan.max_widgets === -1 ? 'Unlimited widgets' : `${plan.max_widgets} widget`,
                        ].map(feat => (
                          <span key={feat} className="text-xs text-gray-500 flex items-center gap-1">
                            <Check size={10} className="text-green-500" /> {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => startUpgrade(plan.id)}
                      disabled={isCurrent || !!upgrading}
                      className={`text-sm py-2 px-4 rounded-lg border font-medium transition-all flex-shrink-0 ${
                        isCurrent
                          ? 'border-gray-200 text-gray-400 cursor-default'
                          : 'btn-primary'
                      } disabled:opacity-50`}
                    >
                      {upgrading === plan.id ? 'Loading…' : isCurrent ? 'Active' : plan.price_monthly > (currentPlan?.price_monthly ?? 0) ? 'Upgrade' : 'Downgrade'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ACCOUNT TAB ── */}
      {tab === 'Account' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Account</h2>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: 'var(--grad-brand)' }}
              >
                {userEmail[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{profile?.company_name}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
          </div>

          <div className="card p-5 border-red-100">
            <h2 className="font-bold text-red-600 mb-1">Danger zone</h2>
            <p className="text-sm text-gray-500 mb-4">These actions are irreversible. Please proceed with caution.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="w-fit px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
              <button className="w-fit px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
