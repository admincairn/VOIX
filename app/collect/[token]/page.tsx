// ============================================================
// VOIX — Public Collect Page
// /collect/[token]
// ============================================================

import type { Metadata } from 'next'
import { CollectForm } from '@/components/collect/collect-form'

export const metadata: Metadata = {
  title: 'Share your experience',
  robots: { index: false, follow: false },
}

export default function CollectPage({ params }: { params: { token: string } }) {
  return <CollectForm token={params.token} />
}
