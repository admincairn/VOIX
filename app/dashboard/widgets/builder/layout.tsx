// ============================================================
// VOIX — Widget Builder Layout
// Full-screen immersive layout without sidebar
// ============================================================

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Widget Builder — VOIX",
  description: "Create and customize your testimonial widgets",
};

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Top bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/widgets"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white/60 text-sm font-medium">
              Widget Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/20 text-xs">Auto-sauvegarde</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
