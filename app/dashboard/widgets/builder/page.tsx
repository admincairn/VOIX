// ============================================================
// VOIX — Widget Builder Page
// Connected to database — create & edit widgets
// ============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SaveBar } from "./components/SaveBar";
import { ControlPanel } from "./components/ControlPanel";
import { LivePreview } from "./components/LivePreview";
import { DeviceToggle } from "./components/DeviceToggle";
import { PresetSelector } from "./components/PresetSelector";
import { EmbedExporter } from "./components/EmbedExporter";

export type WidgetType =
  | "carousel"
  | "grid"
  | "masonry"
  | "single"
  | "badge"
  | "wall";
export type WidgetTheme = "light" | "dark" | "auto";

export interface WidgetConfig {
  name: string;
  type: WidgetType;
  theme: WidgetTheme;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  spacing: number;
  maxItems: number;
  showRating: boolean;
  showSource: boolean;
  showAvatar: boolean;
  showDate: boolean;
  autoplay: boolean;
  autoplayInterval: number;
  fontFamily: string;
  cardStyle: "flat" | "elevated" | "bordered";
  animation: "none" | "fade" | "slide" | "scale";
}

const DEFAULT_CONFIG: WidgetConfig = {
  name: "Mon Widget",
  type: "carousel",
  theme: "light",
  accentColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: 12,
  spacing: 24,
  maxItems: 6,
  showRating: true,
  showSource: true,
  showAvatar: true,
  showDate: true,
  autoplay: true,
  autoplayInterval: 5000,
  fontFamily: "system-ui",
  cardStyle: "elevated",
  animation: "fade",
};

const PRESETS = {
  minimal: {
    ...DEFAULT_CONFIG,
    name: "Minimal",
    cardStyle: "flat" as const,
    showSource: false,
    showDate: false,
    borderRadius: 8,
    spacing: 16,
  },
  bold: {
    ...DEFAULT_CONFIG,
    name: "Bold",
    type: "grid" as const,
    cardStyle: "elevated" as const,
    borderRadius: 20,
    spacing: 32,
    accentColor: "#ec4899",
    animation: "scale" as const,
  },
  elegant: {
    ...DEFAULT_CONFIG,
    name: "Elegant",
    type: "masonry" as const,
    theme: "dark" as const,
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    cardStyle: "bordered" as const,
    borderRadius: 16,
    accentColor: "#f59e0b",
  },
  corporate: {
    ...DEFAULT_CONFIG,
    name: "Corporate",
    type: "wall" as const,
    cardStyle: "flat" as const,
    fontFamily: "Georgia, serif",
    showAvatar: false,
    borderRadius: 4,
    spacing: 12,
  },
};

export default function WidgetBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [showExporter, setShowExporter] = useState(false);

  // Save states
  const [widgetId, setWidgetId] = useState<string | undefined>(
    editId || undefined,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialConfig, setInitialConfig] =
    useState<WidgetConfig>(DEFAULT_CONFIG);

  // Load existing widget if editing
  useEffect(() => {
    if (editId) {
      fetch(`/api/widgets/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.widget) {
            const loaded: WidgetConfig = {
              name: data.widget.name,
              type: data.widget.type,
              ...data.widget.config,
            };
            setConfig(loaded);
            setInitialConfig(loaded);
            setWidgetId(editId);
          }
        })
        .catch((err) => console.error("Failed to load widget:", err));
    }
  }, [editId]);

  const updateConfig = useCallback(
    (updates: Partial<WidgetConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...updates };
        setHasChanges(JSON.stringify(next) !== JSON.stringify(initialConfig));
        return next;
      });
    },
    [initialConfig],
  );

  const applyPreset = useCallback(
    (presetKey: string) => {
      const preset = PRESETS[presetKey as keyof typeof PRESETS];
      if (preset) {
        setConfig(preset);
        setHasChanges(JSON.stringify(preset) !== JSON.stringify(initialConfig));
      }
    },
    [initialConfig],
  );
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const url = widgetId ? `/api/widgets/${widgetId}` : "/api/widgets";
      const method = widgetId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setIsSaved(true);
        setHasChanges(false);
        setInitialConfig(config);
        if (!widgetId && data.widget?.id) {
          setWidgetId(data.widget.id);
          // Redirect to edit mode
          router.replace(`/dashboard/widgets/builder?edit=${data.widget.id}`);
        }
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Save Bar */}
      <SaveBar
        widgetName={config.name}
        isSaving={isSaving}
        isSaved={isSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        widgetId={widgetId}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Controls */}
        <div className="w-[380px] flex-shrink-0 border-r border-white/5 bg-slate-900/50 overflow-y-auto">
          <div className="p-6 space-y-8">
            <PresetSelector
              presets={PRESETS}
              onSelect={applyPreset}
              activePreset={config.name}
            />
            <ControlPanel config={config} onChange={updateConfig} />
          </div>
        </div>

        {/* Right Panel — Preview */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          <div className="h-14 border-b border-white/5 flex items-center justify-center gap-4">
            <DeviceToggle device={device} onChange={setDevice} />
          </div>

          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <LivePreview config={config} device={device} />
          </div>

          {/* Export button */}
          <div className="absolute bottom-6 right-6">
            <button
              onClick={() => setShowExporter(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              Exporter le code
            </button>
          </div>
        </div>

        {/* Export Modal */}
        {showExporter && (
          <EmbedExporter
            config={config}
            onClose={() => setShowExporter(false)}
          />
        )}
      </div>
    </div>
  );
}
