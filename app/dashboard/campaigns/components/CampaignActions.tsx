// ============================================================
// VOIX — Campaign Actions
// Create campaign button + quick actions
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Mail, Link2, Upload } from "lucide-react";

export function CampaignActions() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push("/dashboard/campaigns/new")}
      className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
    >
      <Plus className="w-4 h-4" />
      Nouvelle campagne
    </motion.button>
  );
}
