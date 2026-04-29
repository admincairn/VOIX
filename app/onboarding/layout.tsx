"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Éléments décoratifs subtils */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Logo VOIX en haut */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-white/90 font-semibold tracking-tight">VOIX</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={usePathname()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl relative z-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Skip option subtile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <span className="text-white/30 text-sm">
          Étape optionnelle — Vous pouvez{" "}
          <a
            href="/dashboard"
            className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
          >
            passer cette étape
          </a>
        </span>
      </div>
    </div>
  );
}
