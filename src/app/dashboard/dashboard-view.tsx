"use client";

import Link from "next/link";
import { getSourceLabel, getWidgetLabel } from "@/lib/voix/catalog";
import { useVoixWorkspace } from "@/lib/voix/workspace-store";

function sourceBadge(source: string) {
  switch (source) {
    case "video":
      return "bg-rose-100 text-rose-700";
    case "import":
      return "bg-amber-100 text-amber-700";
    case "written":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusBadge(status: string) {
  return status === "published"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-violet-100 text-violet-700";
}

export default function DashboardView() {
  const { state, isHydrated } = useVoixWorkspace();

  const totalTestimonials = state.testimonials.length;
  const publishedCount = state.testimonials.filter((item) => item.status === "published").length;
  const pendingCount = totalTestimonials - publishedCount;
  const totalViews = state.widgets.reduce((sum, widget) => sum + widget.views, 0);
  const averageRating =
    totalTestimonials > 0
      ? (
          state.testimonials.reduce((sum, item) => sum + item.rating, 0) / totalTestimonials
        ).toFixed(1)
      : "0.0";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4 lg:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[24px] bg-slate-950 p-5 text-white">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)] text-sm font-semibold text-white">
              V
            </div>
            <div>
              <div className="text-sm font-semibold">Voix</div>
              <div className="text-xs text-slate-400">Growth workspace</div>
            </div>
          </Link>

          <div className="mt-8 space-y-1 text-sm">
            {["Overview", "Testimonials", "Widgets", "Campaigns", "Settings"].map((item, index) => (
              <Link
                key={item}
                className={`flex min-h-11 items-center rounded-full px-4 transition ${
                  index === 0 ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                href={index === 0 ? "/dashboard" : "#"}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Workspace</div>
            <div className="mt-3 text-sm font-semibold text-white">
              {state.profile.companyName}
            </div>
            <div className="mt-1 text-sm text-slate-300">{state.profile.website}</div>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Current plan</div>
              <div className="mt-2 text-sm text-white">
                {getWidgetLabel(state.onboarding.widget)}
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Focused on {state.onboarding.useCase} with {state.onboarding.proofSource} proof.
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[24px] bg-slate-50 p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Dashboard preview</div>
              <div className="text-sm text-slate-500">
                An operator view for collection, approval, activation, and onboarding state.
              </div>
            </div>
            <div className="ml-auto flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                href="/collect/acme-labs"
              >
                Collection flow
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/onboarding"
              >
                Setup flow
              </Link>
            </div>
          </div>

          {!isHydrated ? (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-500">
              Loading workspace...
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Proof collected", String(totalTestimonials), `${pendingCount} pending review`],
                  ["Active widgets", String(state.widgets.length), `${totalViews.toLocaleString()} total views`],
                  ["Average rating", averageRating, `${publishedCount} already published`],
                ].map(([label, value, detail]) => (
                  <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{value}</div>
                    <div className="mt-2 text-sm text-slate-500">{detail}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Proof pipeline</div>
                    <div className="text-xs text-slate-500">Recent proof submissions flowing into the workspace.</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">All</div>
                    <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                      Pending {pendingCount}
                    </div>
                    <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                      Published {publishedCount}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  {state.testimonials.map((row) => (
                    <div
                      key={row.id}
                      className="grid gap-4 rounded-[22px] border border-slate-100 p-4 lg:grid-cols-[1.2fr_.5fr_.5fr_auto] lg:items-center"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{row.name}</div>
                        <div className="text-xs text-slate-500">
                          {[row.role, row.company].filter(Boolean).join(", ")}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{row.quote}</div>
                      </div>
                      <div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${sourceBadge(row.source)}`}>
                          {getSourceLabel(row.source === "manual" ? "written" : row.source)}
                        </span>
                      </div>
                      <div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-400">{row.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-950">Live widgets</div>
                <div className="mt-1 text-xs text-slate-500">Package proof by revenue moment, not just by layout.</div>
                <div className="mt-5 space-y-4">
                  {state.widgets.map((widget) => (
                    <div key={widget.id} className="rounded-[20px] border border-slate-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-slate-950">{widget.name}</div>
                        <div className="text-xs text-slate-500">{widget.views.toLocaleString()}</div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)]"
                          style={{ width: `${widget.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-slate-950">Recent activity</div>
                <div className="mt-4 space-y-3">
                  {state.activities.map((activity) => (
                    <div key={activity.id} className="rounded-[20px] border border-slate-100 p-4">
                      <div className="text-sm text-slate-700">{activity.label}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  href="/onboarding"
                >
                  Revisit onboarding plan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
