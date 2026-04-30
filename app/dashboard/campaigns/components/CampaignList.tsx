// ============================================================
// VOIX — Campaign List
// Data table with sorting, filtering, and actions
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Link2,
  Upload,
  Play,
  Pause,
  MoreHorizontal,
  Send,
  BarChart3,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "link" | "import";
  status: "draft" | "active" | "paused" | "completed";
  sent_count: number;
  response_count: number;
  created_at: string;
  config?: {
    subject?: string;
  };
}

const TYPE_ICONS = {
  email: Mail,
  link: Link2,
  import: Upload,
};

const TYPE_LABELS = {
  email: "Email",
  link: "Lien",
  import: "Import",
};

const STATUS_STYLES = {
  draft: "bg-white/5 text-white/40 border-white/5",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  completed: "Terminée",
};

export function CampaignList() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCampaigns(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh list
      fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${campaign.name} (copie)`,
          type: campaign.type,
          config: campaign.config,
        }),
      });
      if (!res.ok) throw new Error("Erreur de duplication");
      fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
          <Mail className="w-8 h-8 text-white/20" />
        </div>
        <div>
          <p className="text-white/60 font-medium">Aucune campagne</p>
          <p className="text-white/30 text-sm mt-1">
            Créez votre première campagne pour collecter des témoignages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {campaigns.map((campaign, index) => {
          const TypeIcon = TYPE_ICONS[campaign.type];
          const responseRate = campaign.sent_count > 0
            ? Math.round((campaign.response_count / campaign.sent_count) * 1000) / 10
            : 0;

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <TypeIcon className="w-5 h-5 text-white/40" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium truncate">
                      {campaign.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_STYLES[campaign.status]}`}
                    >
                      {STATUS_LABELS[campaign.status]}
                    </span>
                  </div>
                  <p className="text-white/30 text-sm mt-0.5 truncate">
                    {campaign.config?.subject || "Sans sujet"}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-white font-medium">{campaign.sent_count}</p>
                    <p className="text-white/30 text-xs">envoyés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">{campaign.response_count}</p>
                    <p className="text-white/30 text-xs">réponses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">{responseRate}%</p>
                    <p className="text-white/30 text-xs">taux</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {campaign.status === "draft" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSend(campaign.id);
                      }}
                      disabled={sendingId === campaign.id}
                      className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {sendingId === campaign.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Envoyer
                    </motion.button>
                  )}

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === campaign.id ? null : campaign.id);
                      }}
                      className="p-2 text-white/30 hover:text-white/60 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {menuOpen === campaign.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(campaign);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Dupliquer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/campaigns/${campaign.id}`);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Statistiques
                          </button>
                          <div className="border-t border-white/5" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(campaign.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
