// ============================================================
// VOIX — Device Toggle
// Desktop / Tablet / Mobile switcher
// ============================================================

"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";

interface Props {
  device: "desktop" | "tablet" | "mobile";
  onChange: (device: "desktop" | "tablet" | "mobile") => void;
}

const DEVICES = [
  {
    key: "desktop" as const,
    icon: <Monitor className="w-4 h-4" />,
    label: "Desktop",
    width: "100%",
  },
  {
    key: "tablet" as const,
    icon: <Tablet className="w-4 h-4" />,
    label: "Tablet",
    width: "768px",
  },
  {
    key: "mobile" as const,
    icon: <Smartphone className="w-4 h-4" />,
    label: "Mobile",
    width: "375px",
  },
];

export function DeviceToggle({ device, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      {DEVICES.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
            device === key
              ? "bg-white/10 text-white"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
