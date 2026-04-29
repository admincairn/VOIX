// ============================================================
// VOIX — Success Screen
// Premium celebration screen after submission
// ============================================================

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, PartyPopper, MessageSquare, Share2 } from "lucide-react";

interface Profile {
  company_name?: string;
}

interface Theme {
  accentColor: string;
  textColor: string;
  borderRadius: number;
}

interface Props {
  profile: Profile;
  theme: Theme;
}

export function SuccessScreen({ profile, theme }: Props) {
  return (
    <div className="text-center space-y-6 py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: theme.accentColor + "20" }}
      >
        <PartyPopper
          className="w-10 h-10"
          style={{ color: theme.accentColor }}
        />
      </motion.div>

      <div className="space-y-2">
        <h2
          className="text-2xl font-semibold"
          style={{ color: theme.textColor }}
        >
          Merci pour votre témoignage !
        </h2>
        <p className="text-sm opacity-60 max-w-sm mx-auto">
          Votre avis a été envoyé à {profile.company_name || "l'équipe"}. Il
          sera publié après validation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <div
          className="p-4 rounded-xl bg-black/5 space-y-2"
          style={{ borderRadius: theme.borderRadius }}
        >
          <MessageSquare className="w-5 h-5 mx-auto opacity-40" />
          <p className="text-xs opacity-60">Témoignage texte</p>
          <p className="text-sm font-medium">Enregistré</p>
        </div>
        <div
          className="p-4 rounded-xl bg-black/5 space-y-2"
          style={{ borderRadius: theme.borderRadius }}
        >
          <CheckCircle2
            className="w-5 h-5 mx-auto opacity-40"
            style={{ color: theme.accentColor }}
          />
          <p className="text-xs opacity-60">Statut</p>
          <p className="text-sm font-medium">En attente</p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="text-sm opacity-40 hover:opacity-60 transition-opacity flex items-center gap-1.5 mx-auto"
      >
        <Share2 className="w-3.5 h-3.5" />
        Soumettre un autre témoignage
      </button>
    </div>
  );
}
