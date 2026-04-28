// ============================================================
// VOIX — Dynamic Sitemap
// /sitemap.xml
// ============================================================

import { MetadataRoute } from 'next'

const BASE_URL = 'https://voix.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    // ── Marketing pages ────────────────────────────────────
    {
      url:             BASE_URL,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/pricing`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/blog`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/terms`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    {
      url:             `${BASE_URL}/privacy`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },

    // ── Auth pages ─────────────────────────────────────────
    {
      url:             `${BASE_URL}/auth/signin`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.5,
    },
    {
      url:             `${BASE_URL}/auth/signup`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
  ]
}
