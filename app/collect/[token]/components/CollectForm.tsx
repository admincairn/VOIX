// ============================================================
// VOIX — Collect Form
// Premium step-by-step testimonial submission
// ============================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Video,
  User,
  Building2,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { VideoUploader } from "./VideoUploader";
import { BrandHeader } from "./BrandHeader";
import { SuccessScreen } from "./SuccessScreen";

interface Theme {
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
  cardStyle: string;
}

interface Profile {
  company_name?: string;
  logo_url?: string;
  website_url?: string;
}

interface Props {
  widgetId: string;
  token: string;
  theme: Theme;
  profile: Profile;
}

type Step = "rating" | "content" | "details" | "video" | "success";

export function CollectForm({ widgetId, token, theme, profile }: Props) {
  const [step, setStep] = useState<Step>("rating");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    content: "",
    customerName: "",
    customerTitle: "",
    customerEmail: "",
    videoUrl: "",
    source: "manual",
  });

  const totalSteps = 4;
  const currentStepIndex =
    ["rating", "content", "details", "video"].indexOf(step) + 1;

  const updateData = (partial: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const nextStep = () => {
    const steps: Step[] = ["rating", "content", "details", "video"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["rating", "content", "details", "video"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          widgetId,
          token,
        }),
      });

      if (response.ok) {
        setStep("success");
      } else {
        throw new Error("Submit failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "rating":
        return formData.rating > 0;
      case "content":
        return formData.content.trim().length > 10;
      case "details":
        return formData.customerName.trim().length > 1;
      case "video":
        return true; // Video optional
      default:
        return false;
    }
  };

  // Dynamic styles based on theme
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    boxShadow:
      theme.cardStyle === "elevated"
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        : "none",
    border:
      theme.cardStyle === "bordered"
        ? `1px solid ${theme.accentColor}20`
        : "none",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: theme.accentColor,
    borderRadius: theme.borderRadius,
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <BrandHeader profile={profile} theme={theme} />

      {/* Progress Bar */}
      {step !== "success" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/40 font-medium">
              Étape {currentStepIndex} sur {totalSteps}
            </span>
            <span className="text-white/40 font-mono text-xs">
              {Math.round((currentStepIndex / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: theme.accentColor }}
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      {/* Form Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={cardStyle}
          className="p-8 space-y-6"
        >
          {step === "rating" && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: theme.textColor }}
                >
                  Comment évaluez-vous votre expérience ?
                </h2>
                <p className="text-sm opacity-60">
                  Votre avis aide {profile.company_name || "nous"} à s'améliorer
                </p>
              </div>
              <StarRating
                rating={formData.rating}
                onChange={(rating) => updateData({ rating })}
                accentColor={theme.accentColor}
                size={48}
              />
              <div className="text-sm opacity-40">
                {formData.rating === 0 && "Cliquez sur une étoile pour noter"}
                {formData.rating === 1 && "😞 Décevant"}
                {formData.rating === 2 && "😐 Peut mieux faire"}
                {formData.rating === 3 && "🙂 Correct"}
                {formData.rating === 4 && "😊 Très bien"}
                {formData.rating === 5 && "🤩 Excellent !"}
              </div>
            </div>
          )}

          {step === "content" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: theme.textColor }}
                >
                  Racontez votre expérience
                </h2>
                <p className="text-sm opacity-60">
                  Qu'est-ce qui vous a plu ? Que pourrions-nous améliorer ?
                </p>
              </div>
              <div className="space-y-3">
                <textarea
                  value={formData.content}
                  onChange={(e) => updateData({ content: e.target.value })}
                  placeholder="Votre témoignage..."
                  rows={5}
                  className="w-full bg-black/5 border border-black/10 rounded-xl p-4 text-base resize-none focus:outline-none focus:ring-2 transition-all placeholder:opacity-30"
                  style={
                    {
                      borderRadius: theme.borderRadius,
                      "--tw-ring-color": theme.accentColor + "40",
                    } as React.CSSProperties
                  }
                />
                <div className="flex justify-between text-xs opacity-40">
                  <span>Minimum 10 caractères</span>
                  <span>{formData.content.length} caractères</span>
                </div>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: theme.textColor }}
                >
                  Qui êtes-vous ?
                </h2>
                <p className="text-sm opacity-60">
                  Ces informations seront affichées avec votre témoignage
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-60 transition-opacity"
                    style={{ color: theme.accentColor }}
                  />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      updateData({ customerName: e.target.value })
                    }
                    placeholder="Votre nom complet"
                    className="w-full bg-black/5 border border-black/10 rounded-xl py-4 pl-12 pr-4 text-base focus:outline-none focus:ring-2 transition-all placeholder:opacity-30"
                    style={
                      {
                        borderRadius: theme.borderRadius,
                        "--tw-ring-color": theme.accentColor + "40",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="relative group">
                  <Building2
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-60 transition-opacity"
                    style={{ color: theme.accentColor }}
                  />
                  <input
                    type="text"
                    value={formData.customerTitle}
                    onChange={(e) =>
                      updateData({ customerTitle: e.target.value })
                    }
                    placeholder="Votre fonction / entreprise (optionnel)"
                    className="w-full bg-black/5 border border-black/10 rounded-xl py-4 pl-12 pr-4 text-base focus:outline-none focus:ring-2 transition-all placeholder:opacity-30"
                    style={
                      {
                        borderRadius: theme.borderRadius,
                        "--tw-ring-color": theme.accentColor + "40",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="relative group">
                  <MessageSquare
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-60 transition-opacity"
                    style={{ color: theme.accentColor }}
                  />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      updateData({ customerEmail: e.target.value })
                    }
                    placeholder="Votre email (optionnel, pour follow-up)"
                    className="w-full bg-black/5 border border-black/10 rounded-xl py-4 pl-12 pr-4 text-base focus:outline-none focus:ring-2 transition-all placeholder:opacity-30"
                    style={
                      {
                        borderRadius: theme.borderRadius,
                        "--tw-ring-color": theme.accentColor + "40",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === "video" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: theme.textColor }}
                >
                  Ajouter une vidéo (optionnel)
                </h2>
                <p className="text-sm opacity-60">
                  Un témoignage vidéo a 3x plus d'impact qu'un texte
                </p>
              </div>
              <VideoUploader
                onUpload={(url) => updateData({ videoUrl: url })}
                accentColor={theme.accentColor}
                borderRadius={theme.borderRadius}
              />
            </div>
          )}

          {step === "success" && (
            <SuccessScreen profile={profile} theme={theme} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step !== "success" && (
        <div className="flex gap-3">
          {step !== "rating" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              style={{ borderRadius: theme.borderRadius }}
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={step === "video" ? handleSubmit : nextStep}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            style={buttonStyle}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : step === "video" ? (
              <>
                <Send className="w-5 h-5" />
                Envoyer mon témoignage
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
