// ============================================================
// VOIX — Auth Layout
// Split-screen premium layout for signin/signup
// ============================================================

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Authentication — VOIX",
  description: "Sign in to your VOIX dashboard",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left Panel — Content ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-28 relative">
        {/* Background gradient subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-12 lg:left-20 xl:left-28 flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white/90 font-semibold tracking-tight text-lg">
            VOIX
          </span>
        </div>

        {/* Auth form container */}
        <div className="relative z-10 w-full max-w-md mx-auto lg:mx-0">
          {children}
        </div>

        {/* Trust badges */}
        <div className="absolute bottom-8 left-8 sm:left-12 lg:left-20 xl:left-28 flex items-center gap-4 text-white/20 text-xs z-10">
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
            SOC 2 Type II
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span>GDPR Compliant</span>
          <span className="w-px h-3 bg-white/10" />
          <span>SSL 256-bit</span>
        </div>
      </div>

      {/* ── Right Panel — Social Proof ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-violet-950/30 relative flex-col justify-between p-12 border-l border-white/5">
        {/* Quote */}
        <div className="relative z-10 mt-auto mb-auto">
          <div className="mb-8">
            <svg
              className="w-10 h-10 text-indigo-500/20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          <blockquote className="text-xl xl:text-2xl text-white/80 font-light leading-relaxed mb-8">
            VOIX a transformé notre façon de collecter les témoignages clients.
            En quelques semaines, nous avons triplé nos avis vérifiés et
            augmenté nos conversions de 34%.
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold">
              SM
            </div>
            <div>
              <div className="text-white font-medium">Sarah Mitchell</div>
              <div className="text-white/40 text-sm">CMO, TechFlow Inc.</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
          <div>
            <div className="text-2xl font-semibold text-white">10k+</div>
            <div className="text-white/30 text-sm">Entreprises</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">1.2M</div>
            <div className="text-white/30 text-sm">Témoignages</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">99.9%</div>
            <div className="text-white/30 text-sm">Uptime</div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
