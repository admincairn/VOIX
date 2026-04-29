"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Globe } from "lucide-react";
import type { OnboardingData } from "../page";

interface Props {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export default function StepIdentity({ data, updateData, onNext }: Props) {
  const [companyName, setCompanyName] = useState(data.companyName);
  const [websiteUrl, setWebsiteUrl] = useState(data.websiteUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    updateData({ companyName, websiteUrl });
    onNext();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Comment s'appelle votre entreprise ?
        </h1>
        <p className="text-white/40 text-lg">
          Personnalisons votre expérience VOIX dès le départ.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-lg"
              required
            />
          </div>

          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://votresite.com (optionnel)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-lg"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={!companyName.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          Continuer
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
}
