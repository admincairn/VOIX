"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, ArrowRight, ArrowLeft } from "lucide-react";
import type { OnboardingData } from "../page";

interface Props {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_COLORS = [
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Emerald", value: "#10b981", class: "bg-emerald-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Sky", value: "#0ea5e9", class: "bg-sky-500" },
  { name: "Slate", value: "#64748b", class: "bg-slate-500" },
  {
    name: "Custom",
    value: "custom",
    class: "bg-gradient-to-br from-white/20 to-white/5",
  },
];

export default function StepBranding({
  data,
  updateData,
  onNext,
  onBack,
}: Props) {
  const [selectedColor, setSelectedColor] = useState(data.brandColor);
  const [customColor, setCustomColor] = useState(data.brandColor);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (color !== "custom") {
      updateData({ brandColor: color });
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    updateData({ brandColor: e.target.value });
  };

  const isCustom = selectedColor === "custom";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
          <Palette className="w-4 h-4" />
          <span>Identité visuelle</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
          Quelle est votre couleur de marque ?
        </h1>
        <p className="text-white/40 text-lg">
          Votre widget s'adaptera automatiquement à votre charte graphique.
        </p>
      </motion.div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorSelect(color.value)}
              className={`relative aspect-square rounded-2xl ${color.class} flex items-center justify-center transition-all ${
                selectedColor === color.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950"
                  : "hover:ring-1 hover:ring-white/20"
              }`}
            >
              {color.name === "Custom" && (
                <span className="text-white/60 text-xs font-medium">
                  Custom
                </span>
              )}
              {selectedColor === color.value && (
                <motion.div
                  layoutId="check"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <label className="text-white/40 text-sm">
              Couleur personnalisée
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomChange}
                className="w-12 h-12 rounded-xl bg-transparent border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomChange}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </motion.div>
        )}

        {/* Preview live miniature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3"
        >
          <span className="text-white/30 text-xs uppercase tracking-wider font-medium">
            Aperçu en direct
          </span>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: data.brandColor }}
            >
              {data.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-medium">{data.companyName}</div>
              <div className="text-white/30 text-sm">Widget VOIX</div>
            </div>
          </div>
        </motion.div>
      </div>

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
          Continuer
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
