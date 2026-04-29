"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepIdentity from "./steps/StepIdentity";
import StepBranding from "./steps/StepBranding";
import StepPreview from "./steps/StepPreview";
import StepCampaign from "./steps/StepCampaign";
import ProgressBar from "./components/ProgressBar";

export type OnboardingData = {
  companyName: string;
  websiteUrl: string;
  brandColor: string;
  widgetId?: string;
};

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    websiteUrl: "",
    brandColor: "#6366f1",
  });

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="space-y-8">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 && (
            <StepIdentity
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {step === 2 && (
            <StepBranding
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 3 && (
            <StepPreview
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 4 && (
            <StepCampaign
              data={data}
              onComplete={() =>
                (window.location.href = "/dashboard?onboarding=complete")
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
