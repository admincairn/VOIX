// ============================================================
// VOIX — Import Page
// /import
// ============================================================

import { auth }          from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ImportClient }  from '@/components/dashboard/import/import-client'

export const metadata = { title: 'Import Reviews' }

export default async function ImportPage() {
  const session = await auth()
  const userId  = session!.user.id

  // Import history from activities
  const { data: history } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('profile_id', userId)
    .eq('type', 'import_completed')
    .order('created_at', { ascending: false })
    .limit(10)

  // Count of imported testimonials per source
  const { data: sourceCounts } = await supabaseAdmin
    .from('testimonials')
    .select('source')
    .eq('profile_id', userId)
    .in('source', ['google', 'g2', 'capterra', 'trustpilot'])

  const counts = (sourceCounts ?? []).reduce(
    (acc, { source }) => ({ ...acc, [source]: (acc[source] ?? 0) + 1 }),
    {} as Record<string, number>
  )

  // Check plan features
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan:plans(features)')
    .eq('id', userId)
    .single()

  const canImport = !!(
    (profile?.plan as { features: Record<string, boolean> } | null)?.features?.import
  )

  return (
    <ImportClient
      history={history ?? []}
      sourceCounts={counts}
      canImport={canImport}
    />
  )
}
