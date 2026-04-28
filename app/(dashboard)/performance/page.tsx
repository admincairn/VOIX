// ============================================================
// VOIX — Performance Page
// /performance
// ============================================================

import { auth }              from '@/lib/auth'
import { PerformanceClient } from '@/components/dashboard/analytics/performance-client'

export const metadata = { title: 'Performance' }

export default async function PerformancePage() {
  const session = await auth()
  if (!session?.user) return null

  // Initial data fetch server-side (30d default)
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/analytics?range=30d`,
    {
      headers: { cookie: `next-auth.session-token=${session}` },
      next: { revalidate: 300 },
    }
  ).catch(() => null)

  const json = res?.ok ? await res.json() : null

  return <PerformanceClient initialData={json?.data ?? null} />
}
