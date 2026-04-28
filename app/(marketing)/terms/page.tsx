// ============================================================
// VOIX — Terms of Service
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — Voix' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: January 1, 2025</p>

      <div className="prose prose-gray max-w-none space-y-8">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h2 className="text-lg font-bold mb-2">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body:  'By accessing or using Voix ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including visitors, registered users, and paying customers.',
  },
  {
    title: '2. Description of Service',
    body:  'Voix is a testimonial collection and display platform. We allow businesses to collect video and text testimonials from their customers, import reviews from third-party platforms, and embed testimonial widgets on their websites.',
  },
  {
    title: '3. Account Registration',
    body:  'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account.',
  },
  {
    title: '4. Subscription & Billing',
    body:  'Voix offers paid plans billed monthly or annually. Payments are processed by Lemon Squeezy as our Merchant of Record, which handles applicable sales taxes. Plans auto-renew unless cancelled. You may cancel at any time; cancellation takes effect at the end of the current billing period.',
  },
  {
    title: '5. Free Trial',
    body:  'New accounts receive a 14-day free trial on the Growth plan. No credit card is required during the trial. After the trial ends, your account is downgraded to a free tier unless you subscribe to a paid plan.',
  },
  {
    title: '6. User Content',
    body:  'You retain ownership of all testimonials and content you collect through the Service. By using Voix, you grant us a limited license to store and display your content for the purpose of providing the Service. You are responsible for obtaining proper consent from your customers before collecting their testimonials.',
  },
  {
    title: '7. Prohibited Uses',
    body:  'You may not use Voix to collect false or misleading testimonials, harass users, violate any laws, infringe intellectual property rights, or attempt to gain unauthorized access to our systems. We reserve the right to terminate accounts that violate these rules.',
  },
  {
    title: '8. Data Privacy',
    body:  'Your use of the Service is also governed by our Privacy Policy. We process data in accordance with GDPR and CCPA. Customer testimonial data is stored securely and is not shared with third parties except as necessary to provide the Service.',
  },
  {
    title: '9. Intellectual Property',
    body:  'All intellectual property in the Voix platform, including software, design, and trademarks, belongs to Voix, Inc. You may not copy, modify, or distribute any part of the platform without explicit written permission.',
  },
  {
    title: '10. Limitation of Liability',
    body:  'To the maximum extent permitted by law, Voix shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability to you shall not exceed the amount you paid us in the last 12 months.',
  },
  {
    title: '11. Changes to Terms',
    body:  'We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new Terms.',
  },
  {
    title: '12. Contact',
    body:  'If you have questions about these Terms, contact us at legal@voix.app.',
  },
]
