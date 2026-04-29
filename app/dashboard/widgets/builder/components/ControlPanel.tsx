// ============================================================
// VOIX — Control Panel
// All widget configuration controls
// ============================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  Palette,
  Layout,
  Settings,
  ChevronDown,
  Monitor,
  Star,
  User,
  Calendar,
  Play,
} from "lucide-react";
import type { WidgetConfig, WidgetType, WidgetTheme } from "../page";

interface Props {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

type SectionKey = "appearance" | "layout" | "content" | "behavior";

// ── Composant ToggleRow réutilisable ──────────────────────

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-2 text-white/50 group-hover:text-white/70 transition-colors">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-indigo-500" : "bg-white/10"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </label>
  );
}

// ── Composant Section pliable ─────────────────────────────

function Section({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-white/70">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Label helper ──────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-white/40 text-xs font-medium uppercase tracking-wider">
      {children}
    </label>
  );
}

// ── Control Panel principal ───────────────────────────────

export function ControlPanel({ config, onChange }: Props) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      appearance: true,
      layout: true,
      content: true,
      behavior: false,
    },
  );

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Widget Name */}
      <div className="space-y-2">
        <Label>Nom du widget</Label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Appearance */}
      <Section
        title="Apparence"
        icon={<Palette className="w-4 h-4" />}
        isOpen={openSections.appearance}
        onToggle={() => toggleSection("appearance")}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Thème</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "auto"] as WidgetTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => onChange({ theme })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                    config.theme === theme
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Style de carte</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["flat", "elevated", "bordered"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onChange({ cardStyle: style })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                    config.cardStyle === style
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {style === "flat"
                    ? "Plat"
                    : style === "elevated"
                      ? "Relief"
                      : "Bordé"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arrondi ({config.borderRadius}px)</Label>
            <input
              type="range"
              min={0}
              max={32}
              value={config.borderRadius}
              onChange={(e) =>
                onChange({ borderRadius: Number(e.target.value) })
              }
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section
        title="Mise en page"
        icon={<Layout className="w-4 h-4" />}
        isOpen={openSections.layout}
        onToggle={() => toggleSection("layout")}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Type de widget</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  "carousel",
                  "grid",
                  "masonry",
                  "single",
                  "badge",
                  "wall",
                ] as WidgetType[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ type })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                    config.type === type
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {type === "carousel"
                    ? "Carrousel"
                    : type === "grid"
                      ? "Grille"
                      : type === "masonry"
                        ? "Masonry"
                        : type === "single"
                          ? "Unique"
                          : type === "badge"
                            ? "Badge"
                            : "Mur"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Espacement ({config.spacing}px)</Label>
            <input
              type="range"
              min={8}
              max={64}
              value={config.spacing}
              onChange={(e) => onChange({ spacing: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum d'éléments</Label>
            <input
              type="number"
              min={1}
              max={50}
              value={config.maxItems}
              onChange={(e) => onChange({ maxItems: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
      </Section>

      {/* Content */}
      <Section
        title="Contenu"
        icon={<Type className="w-4 h-4" />}
        isOpen={openSections.content}
        onToggle={() => toggleSection("content")}
      >
        <div className="space-y-3">
          <ToggleRow
            icon={<Star className="w-4 h-4" />}
            label="Afficher les étoiles"
            checked={config.showRating}
            onChange={(checked) => onChange({ showRating: checked })}
          />
          <ToggleRow
            icon={<Monitor className="w-4 h-4" />}
            label="Afficher la source"
            checked={config.showSource}
            onChange={(checked) => onChange({ showSource: checked })}
          />
          <ToggleRow
            icon={<User className="w-4 h-4" />}
            label="Afficher les avatars"
            checked={config.showAvatar}
            onChange={(checked) => onChange({ showAvatar: checked })}
          />
          <ToggleRow
            icon={<Calendar className="w-4 h-4" />}
            label="Afficher la date"
            checked={config.showDate}
            onChange={(checked) => onChange({ showDate: checked })}
          />
        </div>
      </Section>

      {/* Behavior */}
      <Section
        title="Comportement"
        icon={<Settings className="w-4 h-4" />}
        isOpen={openSections.behavior}
        onToggle={() => toggleSection("behavior")}
      >
        <div className="space-y-3">
          <ToggleRow
            icon={<Play className="w-4 h-4" />}
            label="Lecture automatique"
            checked={config.autoplay}
            onChange={(checked) => onChange({ autoplay: checked })}
          />

          {config.autoplay && (
            <div className="space-y-2">
              <Label>Intervalle ({config.autoplayInterval / 1000}s)</Label>
              <input
                type="range"
                min={2000}
                max={10000}
                step={500}
                value={config.autoplayInterval}
                onChange={(e) =>
                  onChange({ autoplayInterval: Number(e.target.value) })
                }
                className="w-full accent-indigo-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Animation</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["none", "fade", "slide", "scale"] as const).map((anim) => (
                <button
                  key={anim}
                  onClick={() => onChange({ animation: anim })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                    config.animation === anim
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {anim === "none"
                    ? "Aucune"
                    : anim === "fade"
                      ? "Fondu"
                      : anim === "slide"
                        ? "Glissement"
                        : "Zoom"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
