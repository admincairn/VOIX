// ============================================================
// VOIX — Campaign Stats
// KPI cards for campaigns dashboard
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, MousePointerClick, TrendingUp } from "lucide-react";

interface Stats {
  total_campaigns: number;
  total_sent: number;
  total_responses: number;
  avg_response_rate: number;
}

export function CampaignStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        const campaigns = data.data || [];
        const totalSent = campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + (c.sent_count as number || 0), 0);
        const totalResponses = campaigns.reduce((sum: number, c: Record<string, unknown>) => sum + (c.response_count as number || 0), 0);
        const avgRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 1000) / 10 : 0;

        setStats({
          total_campaigns: campaigns.length,
          total_sent: totalSent,
          total_responses: totalResponses,
          avg_response_rate: avgRate,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Campagnes",
      value: stats?.total_campaigns ?? 0,
      icon: Mail,
      color: "#6366f1",
    },
    {
      label: "Emails envoyés",
      value: stats?.total_sent ?? 0,
      icon: Send,
      color: "#06b6d4",
    },
    {
      label: "Réponses",
      value: stats?.total_responses ?? 0,
      icon: MousePointerClick,
      color: "#10b981",
    },
    {
      label: "Taux de réponse",
      value: `${stats?.avg_response_rate ?? 0}%`,
      icon: TrendingUp,
      color: "#f59e0b",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-semibold text-white">{card.value}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: card.color + "15" }}
            >
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
