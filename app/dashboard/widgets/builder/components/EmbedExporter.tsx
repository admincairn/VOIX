// ============================================================
// VOIX — Embed Exporter
// Modal to copy embed code
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Code, ExternalLink } from 'lucide-react'
import type { WidgetConfig } from '../page'

interface Props {
  config: WidgetConfig
  onClose: () => void
}

export function EmbedExporter({ config, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'html' | 'react' | 'vue'>('html')

  const widgetId = 'demo-widget-id'

  const getEmbedCode = (tab: 'html' | 'react' | 'vue'): string => {
    if (tab === 'html') {
      return `<!-- VOIX Widget -->
<div id="voix-widget-${widgetId}"></div>
<script src="https://voix.app/api/widgets/${widgetId}/embed" async></script>`
    }
    if (tab === 'react') {
      return `import { VoixWidget } from '@voix/react';

function App() {
  return (
    <VoixWidget 
      widgetId="${widgetId}"
      theme="${config.theme}"
      accentColor="${config.accentColor}"
      maxItems={${config.maxItems}}
    />
  );
}`
    }
    return `<template>
  <VoixWidget 
    widget-id="${widgetId}"
    theme="${config.theme}"
    :accent-color="${config.accentColor}"
    :max-items="${config.maxItems}"
  />
</template>

<script setup>
import { VoixWidget } from '@voix/vue'
</script>`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode(activeTab))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Code className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Exporter le widget</h3>
                <p className="text-white/40 text-sm">Copiez le code d&apos;intégration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {(['html', 'react', 'vue'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Code */}
          <div className="p-6 space-y-4">
            <div className="relative">
              <pre className="bg-slate-950 border border-white/5 rounded-xl p-4 overflow-x-auto text-sm text-white/70 font-mono leading-relaxed">
                <code>{getEmbedCode(activeTab)}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/70 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-white/20 text-xs">
              <ExternalLink className="w-3 h-3" />
              <span>Le script utilise Shadow DOM pour l&apos;isolation CSS</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleCopy}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier le code
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
