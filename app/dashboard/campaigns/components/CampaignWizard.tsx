// ============================================================
// VOIX — Campaign Wizard
// 3-step creation with validation and preview
// Step 1: Choose template
// Step 2: Edit email (subject, body, from)
// Step 3: Add recipients and send
// ============================================================

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Mail,
  PenLine,
  Users,
  Send,
  Loader2,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import { DEFAULT_TEMPLATES, substituteVariables } from "@/lib/campaigns/templates";
import type { CampaignConfig } from "@/lib/campaigns/validation";

type WizardStep = 1 | 2 | 3;

interface WizardData {
  name: string;
  type: "email" | "link" | "import";
  config: CampaignConfig;
}

const STEPS = [
  { number: 1, label: "Template", icon: Sparkles },
  { number: 2, label: "Contenu", icon: PenLine },
  { number: 3, label: "Destinataires", icon: Users },
];

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [data, setData] = useState<WizardData>({
    name: "",
    type: "email",
    config: {
      subject: "",
      body: "",
      from_name: "",
      recipients: [],
      variables: {},
    },
  });

  const [recipientsInput, setRecipientsInput] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setError("");
  }, []);

  const selectTemplate = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    updateData({
      name: template.name,
      config: {
        ...data.config,
        subject: template.config.subject,
        body: template.config.body,
        from_name: template.config.from_name,
        variables: template.config.variables.reduce((acc, v) => {
          acc[v] = "";
          return acc;
        }, {} as Record<string, string>),
      },
    });
    setStep(2);
  };

  const parseRecipients = (input: string): string[] => {
    return input
      .split(/[\r\n,;]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes("@"));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        if (!data.config.subject.trim()) {
          setError("Le sujet est requis");
          return false;
        }
        if (!data.config.body.trim() || data.config.body.length < 10) {
          setError("Le corps de l'email doit faire au moins 10 caractères");
          return false;
        }
        if (!data.config.from_name.trim()) {
          setError("L'expéditeur est requis");
          return false;
        }
        return true;
      case 3:
        const recipients = parseRecipients(recipientsInput);
        if (recipients.length === 0) {
          setError("Ajoutez au moins un destinataire");
          return false;
        }
        if (recipients.length > 10000) {
          setError("Maximum 10 000 destinataires");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step < 3) setStep((step + 1) as WizardStep);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  const handleSave = async (sendNow: boolean = false) => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const recipients = parseRecipients(recipientsInput);

      // 1. Create campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || "Nouvelle campagne",
          type: data.type,
          config: {
            ...data.config,
            recipients,
          },
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Erreur de création");

      const campaignId = createData.data.id;

      // 2. Send if requested
      if (sendNow) {
        const sendRes = await fetch(`/api/campaigns/${campaignId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaign_id: campaignId }),
        });

        const sendData = await sendRes.json();
        if (!sendRes.ok) throw new Error(sendData.error || "Erreur d'envoi");
      }

      // 3. Test email if provided
      if (testEmail && !sendNow) {
        await fetch(`/api/campaigns/${campaignId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id: campaignId,
            test_mode: true,
            test_email: testEmail,
          }),
        });
      }

      router.push("/dashboard/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview data
  const previewVariables: Record<string, string> = {
    customer_name: "Jean Dupont",
    company_name: "Mon Entreprise",
    collect_url: "https://voix.app/collect/demo",
    sender_name: data.config.from_name || "Vous",
    rating_link: "https://voix.app/collect/demo?mode=rating",
  };

  const previewSubject = substituteVariables(data.config.subject, previewVariables);
  const previewBody = substituteVariables(data.config.body, previewVariables);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, index) => {
          const isActive = step === s.number;
          const isCompleted = step > s.number;
          const Icon = s.icon;

          return (
            <div key={s.number} className="flex items-center gap-2 flex-1">
              <motion.div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : isCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/5 text-white/30 border border-white/5"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? "bg-indigo-500 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </motion.div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    isCompleted ? "bg-emerald-500/30" : "bg-white/5"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Choisissez un template
              </h2>
              <p className="text-white/40 text-sm">
                Sélectionnez un modèle préconçu ou partez de zéro
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => selectTemplate(template.id)}
                  className="text-left p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="px-2 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor:
                          template.category === "post_purchase"
                            ? "rgba(99,102,241,0.15)"
                            : template.category === "onboarding"
                            ? "rgba(6,182,212,0.15)"
                            : template.category === "nps"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          template.category === "post_purchase"
                            ? "#818cf8"
                            : template.category === "onboarding"
                            ? "#22d3ee"
                            : template.category === "nps"
                            ? "#34d399"
                            : "#fbbf24",
                      }}
                    >
                      {template.category}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  <h3 className="text-white font-medium mb-1">{template.name}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.config.variables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-white/30"
                      >
                        {"{{"}{v}{"}}"}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}

              {/* Custom option */}
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  updateData({
                    name: "Campagne personnalisée",
                    config: {
                      ...data.config,
                      subject: "Votre avis compte",
                      body: "<p>Bonjour {{customer_name}},</p><p>...</p>",
                      from_name: "{{company_name}}",
                    },
                  });
                  setStep(2);
                }}
                className="text-left p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/10 hover:border-white/20 rounded-2xl transition-all group flex flex-col items-center justify-center min-h-[180px]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                  <PenLine className="w-6 h-6 text-white/30 group-hover:text-white/50" />
                </div>
                <h3 className="text-white/60 font-medium">Partir de zéro</h3>
                <p className="text-white/30 text-sm mt-1">
                  Créez votre email from scratch
                </p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">
                  Éditez votre email
                </h2>
                <p className="text-white/40 text-sm">
                  Personnalisez le contenu avec les variables disponibles
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  showPreview
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                }`}
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Masquer" : "Prévisualiser"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                {/* Campaign name */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Nom de la campagne
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    placeholder="Campagne post-achat Q2"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* From name */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Nom de l&apos;expéditeur
                  </label>
                  <input
                    type="text"
                    value={data.config.from_name}
                    onChange={(e) =>
                      updateData({
                        config: { ...data.config, from_name: e.target.value },
                      })
                    }
                    placeholder="Mon Entreprise"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={data.config.subject}
                    onChange={(e) =>
                      updateData({
                        config: { ...data.config, subject: e.target.value },
                      })
                    }
                    placeholder="Votre avis compte énormément"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Corps de l&apos;email (HTML)
                  </label>
                  <textarea
                    value={data.config.body}
                    onChange={(e) =>
                      updateData({
                        config: { ...data.config, body: e.target.value },
                      })
                    }
                    rows={12}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono text-sm resize-y"
                  />
                </div>

                {/* Variables helper */}
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Variables disponibles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["customer_name", "company_name", "collect_url", "sender_name", "rating_link"].map(
                      (v) => (
                        <button
                          key={v}
                          onClick={() => {
                            const textarea = document.querySelector(
                              "textarea"
                            ) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const newBody =
                                data.config.body.substring(0, start) +
                                `{{${v}}}` +
                                data.config.body.substring(end);
                              updateData({
                                config: { ...data.config, body: newBody },
                              });
                              setTimeout(() => {
                                textarea.focus();
                                textarea.setSelectionRange(
                                  start + v.length + 4,
                                  start + v.length + 4
                                );
                              }, 0);
                            }
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white/70 transition-all"
                        >
                          {"{{"}{v}{"}}"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                      {/* Email header */}
                      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-medium text-gray-500">De :</span>
                          <span>{data.config.from_name || "Expéditeur"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="font-medium text-gray-500">Objet :</span>
                          <span className="text-gray-700">{previewSubject}</span>
                        </div>
                      </div>
                      {/* Email body */}
                      <div
                        className="p-6 text-gray-800 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: previewBody }}
                      />
                    </div>

                    <div className="text-center text-xs text-white/20">
                      Prévisualisation avec des données fictives
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Destinataires
              </h2>
              <p className="text-white/40 text-sm">
                Ajoutez les emails de vos clients (un par ligne, séparés par virgule ou point-virgule)
              </p>
            </div>

            <div className="space-y-4">
              {/* Recipients textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white/60">
                    Liste des destinataires
                  </label>
                  <span className="text-xs text-white/30">
                    {parseRecipients(recipientsInput).length} email
                    {parseRecipients(recipientsInput).length > 1 ? "s" : ""} détecté
                    {parseRecipients(recipientsInput).length > 1 ? "s" : ""}
                  </span>
                </div>
                <textarea
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  placeholder="jean@exemple.com&#10;marie@exemple.com&#10;pierre@exemple.com"
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono text-sm"
                />
              </div>

              {/* Test email */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-medium text-white/60">
                    Email de test (optionnel)
                  </span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-white/20">
                  Recevez un email de test avant d&apos;envoyer Ã  votre liste
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-medium text-white/60">Récapitulatif</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-white/30">Nom :</div>
                  <div className="text-white/70">{data.name || "Non défini"}</div>
                  <div className="text-white/30">Sujet :</div>
                  <div className="text-white/70 truncate">{data.config.subject}</div>
                  <div className="text-white/30">Expéditeur :</div>
                  <div className="text-white/70">{data.config.from_name}</div>
                  <div className="text-white/30">Destinataires :</div>
                  <div className="text-white/70">
                    {parseRecipients(recipientsInput).length}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="flex items-center gap-3">
          {step === 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-30"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Sauvegarder
            </motion.button>
          )}

          {step === 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? "Envoi..." : "Envoyer la campagne"}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Continuer
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

