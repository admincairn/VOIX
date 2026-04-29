// ============================================================
// VOIX — Live Preview
// Real-time widget preview with device simulation
// ============================================================

"use client";

import { motion } from "framer-motion";
import type { WidgetConfig } from "../page";

interface Props {
  config: WidgetConfig;
  device: "desktop" | "tablet" | "mobile";
}

const DEVICE_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const FAKE_TESTIMONIALS = [
  {
    id: "1",
    name: "Sarah Mitchell",
    title: "CMO, TechFlow",
    avatar: "SM",
    content:
      "VOIX a transformé notre façon de collecter les témoignages. En quelques semaines, nous avons triplé nos avis.",
    rating: 5,
    source: "manual",
    date: "2024-03-15",
  },
  {
    id: "2",
    name: "David Chen",
    title: "Founder, StartupX",
    avatar: "DC",
    content:
      "L'intégration a pris moins de 5 minutes. Le widget est élégant et nos clients adorent laisser des avis.",
    rating: 5,
    source: "video",
    date: "2024-03-10",
  },
  {
    id: "3",
    name: "Emma Wilson",
    title: "Product Lead, ScaleUp",
    avatar: "EW",
    content:
      "Nous avons essayé 3 solutions avant VOIX. C'est de loin la plus simple et la plus puissante.",
    rating: 4,
    source: "google",
    date: "2024-03-05",
  },
];

export function LivePreview({ config, device }: Props) {
  const isDark = config.theme === "dark" || (config.theme === "auto" && true);

  const containerStyle: React.CSSProperties = {
    width: DEVICE_WIDTHS[device],
    maxWidth: "100%",
    backgroundColor: isDark ? "#0f172a" : config.backgroundColor,
    color: isDark ? "#f8fafc" : config.textColor,
    borderRadius: config.borderRadius,
    padding: config.spacing,
    fontFamily: config.fontFamily,
    transition: "all 0.3s ease",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "white",
    borderRadius: config.borderRadius,
    padding: config.spacing,
    border:
      config.cardStyle === "bordered"
        ? `1px solid ${config.accentColor}20`
        : "none",
    boxShadow:
      config.cardStyle === "elevated"
        ? isDark
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.08)"
        : "none",
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4"
          fill={star <= rating ? config.accentColor : "currentColor"}
          style={{ opacity: star <= rating ? 1 : 0.2 }}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const renderTestimonialCard = (
    t: (typeof FAKE_TESTIMONIALS)[0],
    index: number,
  ) => (
    <motion.div
      key={t.id}
      initial={config.animation === "none" ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={cardStyle}
      className="space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {config.showAvatar && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: config.accentColor }}
            >
              {t.avatar}
            </div>
          )}
          <div>
            <div className="font-medium text-sm">{t.name}</div>
            <div className="text-xs opacity-50">{t.title}</div>
          </div>
        </div>
        {config.showSource && (
          <span className="text-[10px] uppercase tracking-wider opacity-30 bg-white/5 px-2 py-1 rounded">
            {t.source}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed opacity-80">"{t.content}"</p>

      <div className="flex items-center justify-between pt-2">
        {config.showRating && renderStars(t.rating)}
        {config.showDate && (
          <span className="text-xs opacity-30">{t.date}</span>
        )}
      </div>
    </motion.div>
  );

  const renderLayout = () => {
    const testimonials = FAKE_TESTIMONIALS.slice(0, config.maxItems);

    switch (config.type) {
      case "carousel":
        return (
          <div className="space-y-4">
            {testimonials.map((t, i) => renderTestimonialCard(t, i))}
          </div>
        );
      case "grid":
        return (
          <div className="grid grid-cols-2 gap-4">
            {testimonials.map((t, i) => renderTestimonialCard(t, i))}
          </div>
        );
      case "masonry":
        return (
          <div className="columns-2 gap-4 space-y-4">
            {testimonials.map((t, i) => (
              <div key={t.id} className="break-inside-avoid">
                {renderTestimonialCard(t, i)}
              </div>
            ))}
          </div>
        );
      case "single":
        return testimonials[0]
          ? renderTestimonialCard(testimonials[0], 0)
          : null;
      case "badge":
        return (
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            {renderStars(5)}
            <span className="text-sm font-medium">4.9/5</span>
            <span className="text-xs opacity-50">(128 avis)</span>
          </div>
        );
      case "wall":
        return (
          <div className="space-y-2">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                style={cardStyle}
                className="flex items-center gap-4"
              >
                {config.showAvatar && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    {t.avatar}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate opacity-80">"{t.content}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium">{t.name}</span>
                    {config.showRating && renderStars(t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div style={containerStyle} className="shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ce que nos clients disent</h3>
          {config.type === "badge" && (
            <span className="text-xs opacity-30">Powered by VOIX</span>
          )}
        </div>
        {renderLayout()}
      </div>
    </div>
  );
}
