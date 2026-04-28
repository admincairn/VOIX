// ============================================================
// VOIX — Root Layout
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Voix — Turn customers into your best salespeople',
    template: '%s | Voix',
  },
  description:
    'Collect video & text testimonials, import from Google and G2, and embed them anywhere — in minutes. Trusted by 2,400+ teams.',
  keywords: ['testimonials', 'social proof', 'reviews', 'video testimonials', 'customer reviews'],
  authors: [{ name: 'Voix' }],
  creator: 'Voix',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voix.app',
    siteName: 'Voix',
    title: 'Voix — Turn customers into your best salespeople',
    description: 'Collect, manage, and embed testimonials that convert. Free 14-day trial.',
    images: [{ url: 'https://voix.app/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voix',
    description: 'Social proof that actually converts.',
    creator: '@voixapp',
  },
  metadataBase: new URL('https://voix.app'),
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
