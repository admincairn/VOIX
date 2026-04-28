// ============================================================
// VOIX — Widgets Page
// /widgets
// ============================================================

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { WidgetsClient } from '@/components/dashboard/widgets-client'
import type { Widget } from '@/types'

export const metadata = { title: 'Widgets' }

export default async function WidgetsPage() {
  const session = await auth()
  const userId  = session!.user.id

  const [{ data: widgets }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('widgets')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('profiles')
      .select('plan:plans(max_widgets, features)')
      .eq('id', userId)
      .single(),
  ])

  const maxWidgets = (profile?.plan as { max_widgets: number } | null)?.max_widgets ?? 1

  return (
    <WidgetsClient
      widgets={(widgets ?? []) as Widget[]}
      maxWidgets={maxWidgets}
    />
  )
}
