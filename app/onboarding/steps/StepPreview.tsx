"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Code,
  Sparkles,
} from "lucide-react";
import type { OnboardingData } from "../page";

interface Props {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPreview({ data, onNext, onBack }: Props) {
  const [copied, setCopied] = useState(false);
  const [widgetId, setWidgetId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(true);

  // Simuler la création du widget (à remplacer par un vrai appel API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidgetId(`voix-${Math.random().toString(36).substr(2, 9)}`);
      setIsCreating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const embedCode = `<div id="voix-widget-${widgetId}"></div>
<script src="https://voix.app/api/widgets/${widgetId}/embed" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Votre widget est prêt</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Voici votre widget {data.companyName}
        </h1>
        <p className="text-white/40 text-lg">
          Il est déjà configuré avec votre identité visuelle.
        </p>
      </motion.div>

      {isCreating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm">
            Génération de votre widget...
          </span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Widget Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: data.brandColor }}
              >
                {data.companyName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {data.companyName}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  "L'équipe de {data.companyName} a transformé notre façon de
                  collecter les avis clients. En quelques clics, nous avons
                  triplé nos témoignages."
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Sarah M.
                    </div>
                    <div className="text-xs text-slate-500">
                      Directrice Marketing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Embed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code d'intégration
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </motion.button>
            </div>
            <div className="bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-sm text-white/60 overflow-x-auto">
              <pre>{embedCode}</pre>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          Envoyer ma première campagne
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
