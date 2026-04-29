// ============================================================
// VOIX — Campaigns Page
// /campaigns
// ============================================================

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { CampaignsClient } from '@/components/dashboard/campaigns-client'
import type { Campaign } from '@/types'

export const metadata = { title: 'Campaigns' }

export default async function CampaignsPage() {
  const session = await auth()
  const userId  = session!.user.id

  const [{ data: campaigns }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('profiles')
      .select('company_name, plan:plans(features)')
      .eq('id', userId)
      .single(),
  ])

  const hasCampaigns = !!(profile?.plan as { features: Record<string, boolean> } | null)?.features?.campaigns

  return (
    <CampaignsClient
      campaigns={(campaigns ?? []) as Campaign[]}
      companyName={profile?.company_name ?? 'Us'}
      canUseCampaigns={hasCampaigns}
    />
  )
}
