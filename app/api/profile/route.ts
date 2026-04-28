// ============================================================
// VOIX — Profile API
// PATCH /api/profile
// GET   /api/profile
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, plan:plans(*)')
    .eq('id', session.user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Whitelist of updatable fields
  const allowed = ['company_name', 'company_slug', 'website_url', 'logo_url', 'onboarded']
  const update: Record<string, unknown> = {}

  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  // Validate slug uniqueness if being changed
  if (update.company_slug) {
    const slug = (update.company_slug as string)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .trim()

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 422 })
    }

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('company_slug', slug)
      .neq('id', session.user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This slug is already taken.' }, { status: 409 })
    }

    update.company_slug = slug
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(update)
    .eq('id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
