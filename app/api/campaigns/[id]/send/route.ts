// ============================================================
// VOIX — Campaign Send Route
// POST /api/campaigns/[id]/send
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendCampaign } from '@/app/api/campaigns/route'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return sendCampaign(req, params.id, session.user.id)
}
