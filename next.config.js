/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Images ───────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },  // Google OAuth avatars
      { protocol: 'https', hostname: 'utfs.io' },                     // UploadThing
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // ── Security headers ─────────────────────────────────────
  async headers() {
    return [
      {
        source: '/api/widgets/:id/embed',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // ── Redirects ─────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // ── Experimental ─────────────────────────────────────────
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2'],
  },

  // ── Build ─────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
