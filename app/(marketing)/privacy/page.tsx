// ============================================================
// VOIX — Privacy Policy
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — Voix' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2025</p>

      <div className="space-y-8">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h2 className="text-lg font-bold mb-2">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly:
• Account information: name, email, company name
• Testimonial data: customer names, emails, video recordings, written reviews
• Payment information: handled by Lemon Squeezy; we never store card numbers
• Usage data: how you interact with the Service (pages visited, features used)`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to:
• Provide, maintain, and improve the Service
• Process payments and manage subscriptions
• Send transactional emails (receipts, notifications, alerts)
• Provide customer support
• Analyze usage to improve features
We do not sell your personal information to third parties.`,
  },
  {
    title: '3. Data Storage & Security',
    body: 'All data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure in the United States. We use industry-standard encryption (TLS in transit, AES-256 at rest). Access is restricted via Row Level Security policies ensuring users can only access their own data.',
  },
  {
    title: '4. Third-Party Services',
    body: `We use the following third-party services:
• Lemon Squeezy: Payment processing (their privacy policy applies to payment data)
• Resend: Transactional email delivery
• Vercel: Application hosting and edge infrastructure
• Google OAuth: Optional authentication provider
• Google Places API: For the review import feature`,
  },
  {
    title: '5. Customer Testimonials',
    body: 'When your customers submit testimonials through Voix, they consent to their testimonial being displayed as specified. You (the Voix account holder) are responsible for obtaining proper consent from your customers. You can delete any testimonial at any time, which removes it from our systems.',
  },
  {
    title: '6. GDPR Rights (EU Users)',
    body: `If you are located in the European Union, you have the right to:
• Access your personal data
• Rectify inaccurate data
• Erase your data ("right to be forgotten")
• Restrict or object to processing
• Data portability
To exercise these rights, contact privacy@voix.app.`,
  },
  {
    title: '7. CCPA Rights (California Users)',
    body: 'California residents have the right to know what personal information we collect, the right to delete personal information, the right to opt-out of the sale of personal information (we do not sell personal information), and the right to non-discrimination.',
  },
  {
    title: '8. Cookies',
    body: 'We use essential cookies for authentication (session management) and optional analytics cookies to understand usage. You can disable cookies in your browser settings, though this may affect Service functionality.',
  },
  {
    title: '9. Data Retention',
    body: 'We retain your data for as long as your account is active. When you delete your account, we delete your personal data within 30 days, except where we are required to retain it by law (e.g., financial records for tax compliance, retained for 7 years).',
  },
  {
    title: '10. Contact',
    body: 'For privacy questions or to exercise your rights, contact us at privacy@voix.app or write to: Voix, Inc., [Address], United States.',
  },
]
