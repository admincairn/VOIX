// ============================================================
// VOIX — Dashboard Home Page
// Server Component — fetches metrics and recent testimonials
// ============================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getDashboardMetrics, supabaseAdmin } from "@/lib/supabase";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TestimonialTable } from "@/components/dashboard/testimonial-table";
import { WidgetsPanel } from "@/components/dashboard/widgets-panel";
import { MetricsSkeleton } from "@/components/dashboard/skeletons";
import { OnboardingSuccessBanner } from "@/components/dashboard/onboarding-success-banner";
import type { Testimonial, Widget } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const userId = session!.user.id;

  // Résoudre searchParams (Next.js 15+ async)
  const params = await searchParams;
  const showOnboardingSuccess = params?.onboarding === "complete";

  // Parallel data fetching
  const [metrics, { data: testimonials }, { data: widgets }] =
    await Promise.all([
      getDashboardMetrics(userId),
      supabaseAdmin
        .from("testimonials")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("widgets")
        .select("*")
        .eq("profile_id", userId)
        .order("view_count", { ascending: false })
        .limit(5),
    ]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Onboarding Success Banner ── */}
      {showOnboardingSuccess && <OnboardingSuccessBanner />}

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
            all: metrics.total_testimonials,
            pending: metrics.pending_count,
            published: metrics.published_count,
            video: metrics.video_testimonials,
          }}
        />

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <WidgetsPanel widgets={(widgets ?? []) as Widget[]} />
        </div>
      </div>
    </div>
  );
}
