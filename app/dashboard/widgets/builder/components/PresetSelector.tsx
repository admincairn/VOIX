// ============================================================
// VOIX — Preset Selector
// Quick-start templates
// ============================================================

"use client";

import { motion } from "framer-motion";
import { Palette, Sparkles, Moon, Building2 } from "lucide-react";

interface Preset {
  name: string;
  type: string;
  theme: string;
  accentColor: string;
}

interface Props {
  presets: Record<string, Preset>;
  onSelect: (key: string) => void;
  activePreset: string;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  minimal: <Palette className="w-4 h-4" />,
  bold: <Sparkles className="w-4 h-4" />,
  elegant: <Moon className="w-4 h-4" />,
  corporate: <Building2 className="w-4 h-4" />,
};

export function PresetSelector({ presets, onSelect, activePreset }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider">
        Presets
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(presets).map(([key, preset]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(key)}
            className={`relative p-3 rounded-xl border text-left transition-all ${
              activePreset === preset.name
                ? "border-indigo-500/50 bg-indigo-500/10"
                : "border-white/5 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: preset.accentColor }}
              >
                {PRESET_ICONS[key]}
              </div>
              <span className="text-white text-sm font-medium">
                {preset.name}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                {preset.type}
              </span>
              <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                {preset.theme}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
