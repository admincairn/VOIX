// ============================================================
// VOIX — Testimonials Management Page
// /testimonials
// ============================================================

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TestimonialsClient } from '@/components/dashboard/testimonials-client'
import type { Testimonial } from '@/types'

export const metadata = { title: 'Testimonials' }

export default async function TestimonialsPage() {
  const session = await auth()
  const userId  = session!.user.id

  const { data: testimonials, count } = await supabaseAdmin
    .from('testimonials')
    .select('*', { count: 'exact' })
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const counts = await Promise.all([
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', userId).eq('status', 'pending'),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', userId).eq('status', 'published'),
    supabaseAdmin.from('testimonials').select('*', { count: 'exact', head: true }).eq('profile_id', userId).eq('status', 'archived'),
  ])

  return (
    <TestimonialsClient
      initialTestimonials={(testimonials ?? []) as Testimonial[]}
      totalCounts={{
        all:       count ?? 0,
        pending:   counts[0].count ?? 0,
        published: counts[1].count ?? 0,
        archived:  counts[2].count ?? 0,
      }}
    />
  )
}
