// ============================================================
// VOIX — Save Bar
// Sticky save bar with status and actions
// ============================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Check, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Props {
  widgetName: string;
  isSaving: boolean;
  isSaved: boolean;
  hasChanges: boolean;
  onSave: () => void;
  widgetId?: string;
}

export function SaveBar({
  widgetName,
  isSaving,
  isSaved,
  hasChanges,
  onSave,
  widgetId,
}: Props) {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/widgets"
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
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
        <div className="w-px h-4 bg-white/10" />
        <span className="text-white/40 text-sm truncate max-w-[200px]">
          {widgetName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <AnimatePresence mode="wait">
          {isSaving && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 text-white/30 text-sm"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </motion.div>
          )}
          {isSaved && !hasChanges && !isSaving && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 text-emerald-400 text-sm"
            >
              <Check className="w-4 h-4" />
              Sauvegardé
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview button */}
        {widgetId && (
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white/70 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Aperçu
          </button>
        )}

        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={isSaving || (!hasChanges && isSaved)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            hasChanges || !isSaved
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {widgetId ? "Mettre à jour" : "Créer le widget"}
            </>
          )}
        </motion.button>
      </div>

      {/* Embed preview modal */}
      <AnimatePresence>
        {showEmbed && widgetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEmbed(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full"
            >
              <h3 className="text-white font-semibold mb-4">
                Code d'intégration
              </h3>
              <pre className="bg-slate-950 border border-white/5 rounded-xl p-4 text-sm text-white/60 font-mono overflow-x-auto">
                {`<div id="voix-widget-${widgetId}"></div>
<script src="https://voix.app/api/widgets/${widgetId}/embed" async></script>`}
              </pre>
              <button
                onClick={() => setShowEmbed(false)}
                className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 rounded-lg transition-all text-sm"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
