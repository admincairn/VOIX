'use client'

// ============================================================
// VOIX — Onboarding Flow
// /onboarding
// Shown once after signup to collect company details
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const STEPS = [
  { id: 'company',  title: 'Set up your workspace',  sub: 'Tell us about your company so we can personalize your experience.' },
  { id: 'goal',     title: 'What\'s your main goal?', sub: 'We\'ll tailor Voix to help you get there faster.' },
  { id: 'first',    title: 'Create your first campaign', sub: 'Get your first testimonial in the next 5 minutes.' },
]

const GOALS = [
  { id: 'convert',  icon: '📈', label: 'Improve conversion rate',  desc: 'Add social proof to pricing & landing pages' },
  { id: 'collect',  icon: '🎥', label: 'Collect more testimonials', desc: 'Build a steady stream from happy customers' },
  { id: 'import',   icon: '⬇️', label: 'Centralize existing reviews', desc: 'Import from Google, G2, Capterra' },
  { id: 'embed',    icon: '✨', label: 'Embed on my website',       desc: 'Display testimonials anywhere with a snippet' },
]

export default function OnboardingPage() {
  const router        = useRouter()
  const { update }    = useSession()
  const [step, setStep]       = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite]         = useState('')
  const [slug, setSlug]               = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [saving, setSaving]   = useState(false)

  function deriveSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleCompanyChange(val: string) {
    setCompanyName(val)
    if (!slugTouched) setSlug(deriveSlug(val))
  }

  async function saveCompany() {
    if (!companyName.trim()) return
    setSaving(true)

    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName.trim(),
        company_slug: slug || deriveSlug(companyName),
        website_url:  website.trim() || null,
      }),
    })

    // Refresh session so sidebar shows updated company name
    await update({ companyName: companyName.trim() })
    setSaving(false)
    setStep(1)
  }

  async function finishOnboarding() {
    setSaving(true)

    // Mark onboarded
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarded: true }),
    })

    // Optionally send first campaign invite
    if (recipientEmail.trim()) {
      const campaign = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:   'First testimonial',
          type:   'email',
          config: {
            recipients: [recipientEmail.trim()],
            subject:    `Share your experience with ${companyName}`,
          },
        }),
      }).then(r => r.json())

      if (campaign.data?.id) {
        await fetch(`/api/campaigns/${campaign.data.id}/send`, { method: 'POST' })
      }
    }

    await update({ onboarded: true })
    router.push('/')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div
        className="text-xl font-black tracking-tight mb-10"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Voix
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[480px] mb-6">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-1">{STEPS[step].title}</h1>
        <p className="text-sm text-gray-500 mb-6">{STEPS[step].sub}</p>

        {/* STEP 0 — Company details */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Company name *</label>
              <input
                type="text"
                className="input"
                placeholder="Acme Corp"
                value={companyName}
                onChange={e => handleCompanyChange(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Your public page slug</label>
              <div className="flex items-center gap-0 border border-gray-200 rounded-[10px] overflow-hidden focus-within:border-violet-400 focus-within:ring-[3px] focus-within:ring-violet-100">
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap select-none">
                  voix.app/c/
                </span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={e => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    setSlugTouched(true)
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">This is your public testimonials page URL.</p>
            </div>
            <div>
              <label className="label">Website <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span></label>
              <input
                type="url"
                className="input"
                placeholder="https://acme.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
            <button
              onClick={saveCompany}
              disabled={!companyName.trim() || saving}
              className="btn-primary py-2.5 text-sm mt-2 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* STEP 1 — Goal selection */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  selectedGoal === goal.id
                    ? 'border-violet-400 bg-violet-50 ring-[3px] ring-violet-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl flex-shrink-0">{goal.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{goal.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{goal.desc}</p>
                </div>
                {selectedGoal === goal.id && (
                  <span className="ml-auto text-violet-600 font-bold text-lg">✓</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setStep(2)}
              disabled={!selectedGoal}
              className="btn-primary py-2.5 text-sm mt-2 disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — First campaign */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-4 border border-violet-100">
              <p className="text-sm font-semibold text-violet-800 mb-1">🚀 Quick win</p>
              <p className="text-sm text-violet-700 leading-relaxed">
                Enter one customer email below. We'll send them a branded request for a testimonial. Takes 10 seconds.
              </p>
            </div>

            <div>
              <label className="label">Customer email</label>
              <input
                type="email"
                className="input"
                placeholder="happy.customer@company.com"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                They'll receive a 2-minute form to share their experience.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={finishOnboarding}
                disabled={saving}
                className="btn-primary py-2.5 text-sm disabled:opacity-50"
              >
                {saving
                  ? 'Setting up…'
                  : recipientEmail
                  ? 'Send & go to dashboard →'
                  : 'Skip & go to dashboard →'}
              </button>
              {recipientEmail && (
                <button
                  onClick={() => { setRecipientEmail(''); finishOnboarding() }}
                  className="text-sm text-gray-400 hover:text-gray-600 text-center py-1"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
