// ============================================================
// VOIX — Onboarding Success Banner
// Shown on dashboard after completing onboarding flow
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper, ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";

export function OnboardingSuccessBanner() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-dismiss après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("<!-- VOIX Widget -->");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10"
        >
          {/* Effet de brillance subtil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

          <div className="relative flex items-start justify-between p-5 gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <PartyPopper className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-emerald-100">
                  Onboarding terminé — Votre widget est prêt
                </h3>
                <p className="text-sm text-emerald-200/60">
                  Vous avez créé votre premier widget. Intégrez-le sur votre
                  site ou envoyez votre première campagne de collecte.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href="/dashboard/widgets"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                  >
                    Voir mes widgets
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier le code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="shrink-0 text-emerald-200/30 hover:text-emerald-200/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
