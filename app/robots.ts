// ============================================================
// VOIX — robots.txt
// /robots.txt
// ============================================================

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/'],
        disallow:  [
          '/api/',
          '/onboarding',
          '/collect/',     // private collect forms
          '/_next/',
        ],
      },
      // Allow Voix's own importer bot
      {
        userAgent: 'VoixBot',
        allow:     ['/'],
      },
    ],
    sitemap: 'https://voix.app/sitemap.xml',
  }
}
