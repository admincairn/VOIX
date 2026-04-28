// ============================================================
// VOIX — Invites API
// POST /api/invites — create a shareable collect link
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { customer_email?: string; customer_name?: string; campaign_id?: string } = {}
  try {
    body = await req.json()
  } catch { /* empty body is fine */ }

  const { data, error } = await supabaseAdmin
    .from('invites')
    .insert({
      profile_id:     session.user.id,
      campaign_id:    body.campaign_id ?? null,
      customer_email: body.customer_email ?? null,
      customer_name:  body.customer_name ?? null,
    })
    .select('id, token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('profile_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
