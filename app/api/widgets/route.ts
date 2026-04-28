// ============================================================
// VOIX — Widgets API
// GET/POST /api/widgets
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { WidgetCreateInput } from '@/types'

const APP_URL = process.env.NEXTAUTH_URL ?? 'https://voix.app'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('widgets')
    .select('*')
    .eq('profile_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Enforce plan widget limit
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan:plans(max_widgets)')
    .eq('id', session.user.id)
    .single()

  const maxWidgets = (profile?.plan as { max_widgets: number } | null)?.max_widgets ?? 1

  if (maxWidgets !== -1) {
    const { count } = await supabaseAdmin
      .from('widgets')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', session.user.id)

    if ((count ?? 0) >= maxWidgets) {
      return NextResponse.json(
        { error: `Widget limit reached (${maxWidgets}). Upgrade your plan.` },
        { status: 403 }
      )
    }
  }

  let body: WidgetCreateInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 422 })
  }

  const { data, error } = await supabaseAdmin
    .from('widgets')
    .insert({
      profile_id: session.user.id,
      name: body.name.trim(),
      type: body.type,
      config: {
        theme: 'light',
        accentColor: '#7c3aed',
        showRating: true,
        showSource: true,
        showAvatar: true,
        autoplay: true,
        autoplayInterval: 5000,
        maxItems: 10,
        ...body.config,
      },
      filters: {
        minRating: 1,
        sources: [],
        tags: [],
        status: 'published',
        ...body.filters,
      },
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Generate and return the embed snippet
  const embedSnippet = `<div id="voix-widget-${data.id}"></div>\n<script src="${APP_URL}/api/widgets/${data.id}/embed" async></script>`

  return NextResponse.json({ data: { ...data, embed_snippet: embedSnippet } }, { status: 201 })
}
