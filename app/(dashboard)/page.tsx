// ============================================================
// VOIX — Dashboard Home Page
// Server Component — fetches metrics and recent testimonials
// ============================================================

import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getDashboardMetrics, supabaseAdmin } from '@/lib/supabase'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { TestimonialTable } from '@/components/dashboard/testimonial-table'
import { WidgetsPanel } from '@/components/dashboard/widgets-panel'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { MetricsSkeleton } from '@/components/dashboard/skeletons'
import type { Testimonial, Widget, Activity } from '@/types'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  // Parallel data fetching
  const [metrics, { data: testimonials }, { data: widgets }, { data: activities }] =
    await Promise.all([
      getDashboardMetrics(userId),
      supabaseAdmin
        .from('testimonials')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('widgets')
        .select('*')
        .eq('profile_id', userId)
        .order('view_count', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('activities')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  return (
    <div className="flex flex-col gap-5">
      {/* ── KPI Cards ── */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsGrid metrics={metrics} />
      </Suspense>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Testimonial table */}
        <TestimonialTable
          testimonials={(testimonials ?? []) as Testimonial[]}
          totalCounts={{
            all:       metrics.total_testimonials,
            pending:   metrics.pending_count,
            published: metrics.published_count,
            video:     metrics.video_testimonials,
          }}
        />

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <WidgetsPanel widgets={(widgets ?? []) as Widget[]} />
          <ActivityFeed activities={(activities ?? []) as Activity[]} />
        </div>
      </div>
    </div>
  )
}
