// ============================================================
// VOIX — Settings Page
// /settings
// ============================================================

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { SettingsClient } from '@/components/dashboard/settings-client'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  const userId  = session!.user.id

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*, plan:plans(*)')
    .eq('id', userId)
    .single()

  const { data: plans } = await supabaseAdmin
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  return (
    <SettingsClient
      profile={profile}
      plans={plans ?? []}
      userEmail={session!.user.email!}
    />
  )
}
