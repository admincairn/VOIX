// ============================================================
// VOIX — Collect Form Layout
// Minimal immersive layout, no nav/sidebar
// ============================================================

import { ReactNode } from "react";

export const metadata = {
  title: "Partagez votre avis — VOIX",
  description: "Votre témoignage compte",
};

export default function CollectLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl">{children}</div>

      {/* Footer trust */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/20 text-xs">
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          SSL 256-bit
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span>GDPR Compliant</span>
        <span className="w-px h-3 bg-white/10" />
        <span>Powered by VOIX</span>
      </div>
    </div>
  );
}
