// ============================================================
// VOIX — Campaigns Dashboard
// List campaigns with KPIs and actions
// ============================================================

import { Suspense } from "react";
import { Metadata } from "next";
import { CampaignList } from "./components/CampaignList";
import { CampaignStats } from "./components/CampaignStats";
import { CampaignActions } from "./components/CampaignActions";

export const metadata: Metadata = {
  title: "Campagnes — VOIX",
  description: "Gérez vos campagnes de collecte de témoignages",
};

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Campagnes
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Envoyez des demandes de témoignages à vos clients
          </p>
        </div>
        <CampaignActions />
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <CampaignStats />
      </Suspense>

      {/* List */}
      <Suspense fallback={<ListSkeleton />}>
        <CampaignList />
      </Suspense>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 bg-white/5 border border-white/5 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}
