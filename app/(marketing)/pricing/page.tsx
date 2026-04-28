// ============================================================
// VOIX — Pricing Page
// /pricing
// ============================================================

import Link       from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pricing — Voix' }

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 19, yearlyPrice: 15,
    desc: 'For indie founders & early-stage products.',
    featured: false,
    features: [
      { label: '50 testimonials',           available: true },
      { label: '5 video recordings/month',  available: true },
      { label: '1 embeddable widget',        available: true },
      { label: 'Public testimonial page',   available: true },
      { label: 'Review import (G2, Google)', available: false },
      { label: 'Email campaigns',           available: false },
      { label: 'Advanced analytics',        available: false },
      { label: 'Custom branding',           available: false },
      { label: 'API access',                available: false },
    ],
  },
  {
    id: 'growth', name: 'Growth', price: 39, yearlyPrice: 31,
    desc: 'For scaling teams that need more volume.',
    featured: true,
    features: [
      { label: 'Unlimited testimonials',    available: true },
      { label: '30 video recordings/month', available: true },
      { label: 'Unlimited widgets',          available: true },
      { label: 'Public testimonial page',   available: true },
      { label: 'Review import (G2, Google)', available: true },
      { label: 'Email campaigns',           available: true },
      { label: 'Advanced analytics',        available: true },
      { label: 'Custom branding',           available: false },
      { label: 'API access',                available: false },
    ],
  },
  {
    id: 'scale', name: 'Scale', price: 59, yearlyPrice: 47,
    desc: 'For ambitious marketing teams.',
    featured: false,
    features: [
      { label: 'Unlimited testimonials',    available: true },
      { label: 'Unlimited video recordings', available: true },
      { label: 'Unlimited widgets',          available: true },
      { label: 'Public testimonial page',   available: true },
      { label: 'Review import (G2, Google)', available: true },
      { label: 'Email campaigns',           available: true },
      { label: 'Advanced analytics',        available: true },
      { label: 'Custom branding',           available: true },
      { label: 'API access + Zapier',       available: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — all new accounts get a 14-day free trial on the Growth plan. No credit card required.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel anytime from your settings. Your account stays active until the end of the billing period.',
  },
  {
    q: 'How does the video recording work?',
    a: 'You send your customer a unique link. They record directly in their browser — no app, no download required. You receive an HD video with auto-transcription.',
  },
  {
    q: 'Which review platforms can I import from?',
    a: 'On Growth and Scale plans: Google Business Profile, G2, Capterra, and Trustpilot. Import is one-click and reviews appear immediately.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit/debit cards via Lemon Squeezy (our Merchant of Record). Sales tax is handled automatically for US customers.',
  },
  {
    q: 'Do the widgets slow down my website?',
    a: 'No. Widgets load asynchronously via a single script tag and use Shadow DOM — zero impact on your page\'s Core Web Vitals.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'You can export all your testimonials as CSV before cancelling. We retain your data for 30 days after cancellation, then permanently delete it.',
  },
  {
    q: 'Is Voix GDPR compliant?',
    a: 'Yes. All data is stored on EU-compliant infrastructure, collect forms include explicit consent, and you can delete any testimonial at any time.',
  },
]

export default function PricingPage() {
  return (
    <div className="bg-[#fafafa]">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          Pricing
        </div>
        <h1
          className="text-[clamp(2.2rem,5vw,3.5rem)] font-black tracking-tight leading-tight mb-4"
          style={{ letterSpacing: '-0.04em' }}
        >
          Simple, transparent pricing
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-base mb-3">
          No hidden fees. No long-term contracts. Start free, cancel anytime.
        </p>
        <p className="text-sm text-violet-600 font-semibold">
          Save 20% with annual billing →
        </p>
      </section>

      {/* Plans */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 transition-transform hover:-translate-y-1 ${
                plan.featured
                  ? 'text-white shadow-2xl shadow-violet-900/20'
                  : 'bg-white border border-gray-100'
              }`}
              style={plan.featured ? { background: '#0a0a0b' } : undefined}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                >
                  Most popular
                </div>
              )}

              <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>
                {plan.name}
              </p>

              <div className="mb-1 flex items-end gap-1">
                <span
                  className="text-[3rem] font-black leading-none tracking-tight"
                  style={plan.featured ? {
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : undefined}
                >
                  ${plan.price}
                </span>
                <span className={`text-sm pb-1.5 ${plan.featured ? 'text-white/40' : 'text-gray-400'}`}>/mo</span>
              </div>

              <p className={`text-xs mb-1 ${plan.featured ? 'text-white/30' : 'text-gray-400'}`}>
                ${plan.yearlyPrice}/mo billed annually
              </p>
              <p className={`text-sm mb-5 ${plan.featured ? 'text-white/50' : 'text-gray-500'}`}>{plan.desc}</p>

              <div className={`h-px mb-5 ${plan.featured ? 'bg-white/10' : 'bg-gray-100'}`} />

              <ul className="flex flex-col gap-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f.label} className={`text-sm flex items-center gap-2.5 ${
                    f.available
                      ? plan.featured ? 'text-white/80' : 'text-gray-600'
                      : plan.featured ? 'text-white/20' : 'text-gray-300'
                  }`}>
                    <span className={`flex-shrink-0 text-xs font-bold ${f.available ? 'text-green-500' : plan.featured ? 'text-white/20' : 'text-gray-200'}`}>
                      {f.available ? '✓' : '×'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={plan.featured ? {
                  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  color: '#fff',
                } : {
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  background: 'transparent',
                }}
              >
                {plan.featured ? 'Start 14-day trial →' : 'Get started free'}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans include a 14-day free trial on Growth. No credit card required.
        </p>
      </section>

      {/* Feature comparison table */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <h2
          className="text-2xl font-black tracking-tight text-center mb-8"
          style={{ letterSpacing: '-0.03em' }}
        >
          Full feature comparison
        </h2>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-gray-500 w-1/2">Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} className={`text-center px-4 py-3.5 text-sm font-bold ${p.featured ? 'text-violet-600' : 'text-gray-700'}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label} className={`border-b border-gray-50 last:border-none ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-3 text-sm text-gray-600">{row.label}</td>
                  {row.values.map((val, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      {typeof val === 'boolean' ? (
                        <span className={`text-sm font-bold ${val ? 'text-green-500' : 'text-gray-200'}`}>
                          {val ? '✓' : '×'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700 font-medium">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20 max-w-2xl mx-auto">
        <h2
          className="text-2xl font-black tracking-tight text-center mb-10"
          style={{ letterSpacing: '-0.03em' }}
        >
          Frequently asked questions
        </h2>

        <div className="flex flex-col gap-4">
          {FAQS.map(faq => (
            <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-sm mb-1.5">{faq.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="px-4 pb-16">
        <div
          className="max-w-3xl mx-auto rounded-2xl px-10 py-14 text-center"
          style={{ background: '#0a0a0b' }}
        >
          <h2 className="text-2xl font-black text-white tracking-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
            Start collecting testimonials today
          </h2>
          <p className="text-white/40 text-sm mb-7">14-day free trial. No credit card. Setup in 2 minutes.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
          >
            Start free trial →
          </Link>
        </div>
      </div>
    </div>
  )
}

const COMPARISON_ROWS = [
  { label: 'Testimonials',           values: ['50',       'Unlimited', 'Unlimited'] },
  { label: 'Video recordings/month', values: ['5',        '30',        'Unlimited'] },
  { label: 'Embeddable widgets',     values: ['1',        'Unlimited', 'Unlimited'] },
  { label: 'Public page',            values: [true,        true,        true] },
  { label: 'Video auto-transcription', values: [true,      true,        true] },
  { label: 'Review import',          values: [false,       true,        true] },
  { label: 'Email campaigns',        values: [false,       true,        true] },
  { label: 'Analytics dashboard',    values: [false,       true,        true] },
  { label: 'Custom branding',        values: [false,       false,       true] },
  { label: 'API access',             values: [false,       false,       true] },
  { label: 'Zapier integration',     values: [false,       false,       true] },
  { label: 'Priority support',       values: [false,       false,       true] },
]
