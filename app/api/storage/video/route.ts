// ============================================================
// VOIX — Video Storage API
// GET /api/storage/video?path=xxx
// Returns a signed public URL for viewing uploaded videos
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const STORAGE_BUCKET = 'videos'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  // Generate signed URL (valid for 24 hours)
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 86400) // 24 hours

  if (error || !data) {
    console.error('[Storage] Signed URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate video URL' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    url: data.signedUrl,
    expiresAt: data.expiresAt,
  })
}

// DELETE /api/storage/video?path=xxx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) {
    console.error('[Storage] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
