"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, ArrowRight } from "lucide-react";
import type { OnboardingData } from "../page";

interface Props {
  data: OnboardingData;
  onComplete: () => void;
}

export default function StepCampaign({ data, onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      onComplete();
      return;
    }
    setSending(true);
    // Simuler l'envoi (à remplacer par vrai appel API)
    setTimeout(() => {
      setSending(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
          <Mail className="w-4 h-4" />
          <span>Première campagne</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Envoyez votre première demande
        </h1>
        <p className="text-white/40 text-lg">
          Un email élégant sera envoyé à votre client pour collecter son
          témoignage.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: data.brandColor }}
            >
              {data.companyName.charAt(0).toUpperCase()}
            </div>
            <span>De : {data.companyName} via VOIX</span>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="text-white/80 font-medium">
              Votre avis compte beaucoup
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Bonjour,
              <br />
              <br />
              Votre expérience avec {data.companyName} nous tient à cœur.
              Pourriez-vous prendre 30 secondes pour partager votre témoignage ?
              <br />
              <br />
              <span className="text-indigo-400">[Partager mon avis →]</span>
            </p>
          </div>
        </div>

        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@exemple.com (optionnel)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-lg"
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Passer
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={sending}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {email ? "Envoyer la demande" : "Aller au dashboard"}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
