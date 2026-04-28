// ============================================================
// VOIX — Widget API by ID
// GET/PATCH/DELETE /api/widgets/[id]
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('widgets')
    .select('*')
    .eq('id', params.id)
    .eq('profile_id', session.user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('widgets')
    .select('id')
    .eq('id', params.id)
    .eq('profile_id', session.user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Filter allowed fields
  const allowedFields = ['name', 'type', 'config', 'filters']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  const { data, error } = await supabaseAdmin
    .from('widgets')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership before delete
  const { data: existing } = await supabaseAdmin
    .from('widgets')
    .select('id')
    .eq('id', params.id)
    .eq('profile_id', session.user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('widgets')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}