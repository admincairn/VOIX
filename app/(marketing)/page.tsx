// ============================================================
// VOIX — Landing Page
// /
// Server Component — static, no auth required
// ============================================================

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voix — Turn customers into your best salespeople',
}

// ── Data ─────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '▶',
    iconBg: 'bg-violet-100',
    tag: 'Async recording',
    tagCls: 'bg-violet-100 text-violet-700',
    title: 'Video testimonials',
    desc: 'Send a link. Your customers record directly in their browser — no downloads, no friction. You get HD video with auto-transcription, ready to embed.',
    wide: true,
  },
  {
    icon: '↓',
    iconBg: 'bg-pink-100',
    tag: 'Multi-source',
    tagCls: 'bg-pink-100 text-pink-700',
    title: '1-click import',
    desc: 'Pull reviews from Google, G2, Capterra & Trustpilot automatically. All your social proof in one place.',
  },
  {
    icon: '◈',
    iconBg: 'bg-teal-100',
    tag: 'No-code',
    tagCls: 'bg-teal-100 text-teal-700',
    title: 'Embeddable widgets',
    desc: 'Carousels, grids, single quotes — copy a snippet, paste into any CMS. Works everywhere.',
  },
  {
    icon: '✦',
    iconBg: 'bg-amber-100',
    tag: 'Shareable',
    tagCls: 'bg-amber-100 text-amber-700',
    title: 'Shareable pages',
    desc: 'A branded public page ready to share in proposals, sales decks, and campaigns.',
  },
  {
    icon: '⚡',
    iconBg: 'bg-violet-100',
    tag: 'Automated',
    tagCls: 'bg-violet-100 text-violet-700',
    title: 'Automated campaigns',
    desc: 'Trigger collection emails post-purchase or post-onboarding. Set once, collect forever.',
  },
]

const TESTIMONIALS = [
  {
    source: 'Google',
    srcCls: 'bg-blue-50 text-blue-600 border-blue-200',
    quote: 'We tripled our pricing page conversion by adding the Voix widget. Results visible in 48 hours.',
    name: 'Sophie Laurent',
    role: 'Founder, Payflux',
    initials: 'SL',
    avatarGrad: 'from-violet-500 to-violet-700',
  },
  {
    source: 'Video',
    srcCls: 'bg-pink-50 text-pink-600 border-pink-200',
    quote: 'Before, I spent 3 hours chasing clients for testimonials. Now I send a link and it\'s done in 10 minutes.',
    name: 'Marcus King',
    role: 'CEO, Stacker AI',
    initials: 'MK',
    avatarGrad: 'from-pink-500 to-rose-600',
  },
  {
    source: 'G2',
    srcCls: 'bg-red-50 text-red-600 border-red-200',
    quote: 'The G2 import is magic. 47 reviews displayed on my site in under an hour. Immediate ROI.',
    name: 'Julie Bernard',
    role: 'Marketing Lead, Docuflow',
    initials: 'JB',
    avatarGrad: 'from-teal-500 to-emerald-600',
  },
]

const METRICS = [
  { value: '+34%', label: 'Avg. conversion lift on pricing pages' },
  { value: '2min', label: 'To embed your first widget' },
  { value: '92%',  label: 'Buyers read reviews before purchasing' },
  { value: '2.4k', label: 'Teams actively using Voix' },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    desc: 'For indie founders & early-stage',
    features: ['50 testimonials', '5 video recordings/mo', '1 embeddable widget', 'Public page'],
    featured: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 39,
    desc: 'For scaling teams',
    features: ['Unlimited testimonials', '30 videos/mo', 'Unlimited widgets', 'G2, Google & Trustpilot import', 'Advanced analytics'],
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 59,
    desc: 'For ambitious marketing teams',
    features: ['Everything in Growth', 'Unlimited videos', 'Custom branding', 'API & Zapier', 'Priority support'],
    featured: false,
  },
]

// ── Page ──────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center px-4">
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(124,58,237,.1) 0%, rgba(236,72,153,.06) 45%, transparent 70%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
            <span className="text-[12.5px] font-semibold text-violet-700">Trusted by 2,400+ teams</span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2.8rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-5"
            style={{ letterSpacing: '-0.04em' }}
          >
            Turn customers into<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              your best salespeople
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-[500px] mx-auto mb-9 leading-relaxed font-light">
            Collect video &amp; text testimonials, import from Google and G2, and embed them anywhere — in minutes.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              Start for free
            </Link>
            <Link
              href="/#examples"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              See it in action →
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex">
              {['SL','MK','JB','AR'].map((init, i) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    marginLeft: i === 0 ? 0 : -10,
                    background: ['linear-gradient(135deg,#7c3aed,#a78bfa)','linear-gradient(135deg,#ec4899,#f9a8d4)','linear-gradient(135deg,#0d9488,#5eead4)','linear-gradient(135deg,#f59e0b,#fde68a)'][i],
                    zIndex: 4 - i,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <div>
              <div className="text-amber-400 text-sm tracking-tighter">★★★★★</div>
              <span className="text-sm text-gray-500">Loved by <strong className="text-gray-800">2,400+</strong> founders &amp; marketers</span>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <div className="border-y border-gray-100 py-5 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-8 justify-center flex-wrap">
          <span className="text-[11.5px] font-semibold text-gray-300 uppercase tracking-wider">Used by teams at</span>
          {['Stripe','Linear','Vercel','Notion','Loom','Webflow'].map(brand => (
            <span key={brand} className="text-sm font-bold text-gray-300 tracking-tight">{brand}</span>
          ))}
        </div>
      </div>

      {/* FEATURES BENTO */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Features
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black tracking-tight leading-tight mb-3"
              style={{ letterSpacing: '-0.04em' }}
            >
              Everything you need to convert<br />with social proof
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              One platform to collect, manage, and display every testimonial you&apos;ve ever earned.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform group ${f.wide ? 'col-span-2' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[15px] mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{f.desc}</p>
                <span className={`inline-block text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${f.tagCls}`}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="mx-4 mb-4">
        <div
          className="max-w-5xl mx-auto rounded-2xl px-12 py-14"
          style={{ background: '#0a0a0b' }}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 border border-violet-500/30 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 bg-violet-500/10">
              Impact
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-black tracking-tight text-white leading-tight"
              style={{ letterSpacing: '-0.04em' }}
            >
              Numbers that speak for themselves
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            {METRICS.map(m => (
              <div key={m.value} className="bg-white/5 px-6 py-7 text-center">
                <div
                  className="text-[2.6rem] font-black leading-none mb-2 tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {m.value}
                </div>
                <p className="text-xs text-white/40 leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section id="examples" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-pink-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Real examples
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-black tracking-tight leading-tight"
              style={{ letterSpacing: '-0.04em' }}
            >
              What your customers<br />are already saying
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform"
              >
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border mb-3 ${t.srcCls}`}>
                  {t.source}
                </span>
                <div className="text-amber-400 text-sm tracking-tighter mb-3">★★★★★</div>
                <p className="text-sm text-gray-700 italic leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.avatarGrad.replace('from-', '').replace(' to-', ', ')})` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{t.name}</p>
                    <p className="text-[11.5px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Pricing
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-black tracking-tight leading-tight mb-3"
              style={{ letterSpacing: '-0.04em' }}
            >
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500">No hidden fees. No long-term contracts. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 transition-transform hover:-translate-y-1 ${
                  plan.featured
                    ? 'text-white'
                    : 'bg-white border border-gray-100'
                }`}
                style={plan.featured ? {
                  background: '#0a0a0b',
                  boxShadow: '0 0 0 2px transparent, 0 8px 32px rgba(124,58,237,0.25)',
                } : undefined}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold text-gray-900"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff' }}
                  >
                    Most popular
                  </div>
                )}

                <div className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>
                  {plan.name}
                </div>

                <div className="mb-1">
                  <span
                    className="text-[2.8rem] font-black leading-none tracking-tight"
                    style={plan.featured ? {
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : undefined}
                  >
                    ${plan.price}
                  </span>
                  <span className={`text-sm font-normal ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>/mo</span>
                </div>

                <p className={`text-sm mb-5 ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>{plan.desc}</p>

                <div className={`h-px mb-5 ${plan.featured ? 'bg-white/10' : 'bg-gray-100'}`} />

                <ul className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map(feat => (
                    <li key={feat} className={`text-sm flex items-center gap-2.5 ${plan.featured ? 'text-white/80' : 'text-gray-500'}`}>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px]"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                      >
                        ✓
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.featured
                      ? 'text-gray-900 hover:opacity-90'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={plan.featured ? {
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    color: '#fff',
                  } : undefined}
                >
                  {plan.featured ? 'Start 14-day trial →' : 'Get started free'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            All plans include a 14-day free trial on Growth. No credit card required.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="px-4 pb-16">
        <div
          className="max-w-4xl mx-auto rounded-2xl px-12 py-16 text-center relative overflow-hidden"
          style={{ background: '#0a0a0b' }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,.2) 0%, rgba(236,72,153,.08) 50%, transparent 70%)' }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 border border-violet-500/30 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 bg-violet-500/10">
              Get started
            </div>
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-black tracking-tight text-white mb-4 leading-tight"
              style={{ letterSpacing: '-0.04em' }}
            >
              Your next customers are<br />convinced by your current ones
            </h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto mb-8">
              Join 2,400 teams converting more with social proof. Free for 14 days.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              Start free today →
            </Link>
            <p className="text-white/25 text-xs mt-4">No credit card · Cancel anytime · Setup in 2 minutes</p>
          </div>
        </div>
      </div>
    </>
  )
}
