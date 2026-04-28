"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getRecommendedWidget,
  getSourceLabel,
  getUseCaseLabel,
  getWidgetLabel,
  proofSources,
  useCases,
  widgets,
} from "@/lib/voix/catalog";
import type { ProofSourceId, UseCaseId, WidgetId } from "@/lib/voix/types";
import { useVoixWorkspace } from "@/lib/voix/workspace-store";

const steps = [
  {
    eyebrow: "Step 1 of 4",
    title: "Define the account you want Voix to serve first.",
    description:
      "We start narrow so the product can find fast payback and a stable retention profile.",
  },
  {
    eyebrow: "Step 2 of 4",
    title: "Choose the first revenue surface to improve.",
    description:
      "Voix gets sharper when proof is attached to a single buying moment before it expands elsewhere.",
  },
  {
    eyebrow: "Step 3 of 4",
    title: "Pick the first proof format to operationalize.",
    description:
      "The first collection loop should balance speed, trust, and how much setup your team can support.",
  },
  {
    eyebrow: "Step 4 of 4",
    title: "Launch the first widget with a clear activation plan.",
    description:
      "The output should not be a vague setup. It should be a specific proof asset and the next action to get it live.",
  },
];

export default function OnboardingFlow() {
  const { state, saveOnboarding, isHydrated } = useVoixWorkspace();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(state.profile.companyName);
  const [website, setWebsite] = useState(state.profile.website);
  const [teamSize, setTeamSize] = useState(state.profile.teamSize);
  const [useCase, setUseCase] = useState<UseCaseId>(state.onboarding.useCase);
  const [proofSource, setProofSource] = useState<ProofSourceId>(state.onboarding.proofSource);
  const [widget, setWidget] = useState<WidgetId>(state.onboarding.widget);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recommendedWidget = useMemo(() => getRecommendedWidget(useCase), [useCase]);
  const widgetMatchesRecommendation = widget === recommendedWidget;

  const activationPlan = useMemo(() => {
    const fastPathSource =
      proofSource === "written"
        ? "Launch with written proof first"
        : "Lead with higher-trust proof";
    const widgetPath =
      widget === "page"
        ? "Share it after demos"
        : widget === "carousel"
          ? "Place it on pricing first"
          : widget === "strip"
            ? "Use it on your hero section"
            : "Use it where buyers want depth";
    const payback =
      useCase === "pricing"
        ? "Best path to a fast payback signal"
        : useCase === "demo"
          ? "Strong fit for founder-led sales loops"
          : useCase === "trial"
            ? "Good fit for product-led retention"
            : "Useful when trust needs to rise early";

    return [fastPathSource, widgetPath, payback];
  }, [proofSource, useCase, widget]);

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveOnboarding({
        companyName,
        website,
        teamSize,
        useCase,
        proofSource,
        widget,
      });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Activation plan
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
          Set up Voix around the first outcome that can pay for it.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The goal is not to configure everything. It is to choose the first proof loop that is most likely to produce visible business value.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Company</div>
            <div className="mt-3 text-lg font-semibold">{companyName || "Your workspace"}</div>
            <div className="mt-1 text-sm text-slate-300">{website || "company.com"}</div>
            <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              Team size: {teamSize}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">First target</div>
            <div className="mt-3 text-lg font-semibold">{getUseCaseLabel(useCase)}</div>
            <div className="mt-1 text-sm text-slate-300">{getSourceLabel(proofSource)}</div>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">First widget</div>
              <div className="mt-2 text-sm font-medium text-white">{getWidgetLabel(widget)}</div>
              <div className="mt-2 text-xs text-slate-300">
                {widgetMatchesRecommendation
                  ? "Matches the recommended path for this first use case."
                  : `Recommended instead: ${getWidgetLabel(recommendedWidget)}.`}
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Activation notes</div>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {activationPlan.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {steps[step]?.eyebrow}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {steps[step]?.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">{steps[step]?.description}</p>
          </div>
          <div className="flex gap-2">
            {steps.map((stepItem, index) => (
              <div
                key={stepItem.eyebrow}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? "w-14 bg-[linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)]"
                    : index < step
                      ? "w-10 bg-violet-300"
                      : "w-10 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {!isHydrated ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            Loading workspace...
          </div>
        ) : null}

        <div className="mt-6">
          {step === 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Company name
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Acme Labs"
                />
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Website
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="acmelabs.com"
                />
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Team size</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {["1-10", "11-25", "26-50", "51-75"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTeamSize(option)}
                      className={`rounded-[20px] border px-4 py-4 text-left text-sm transition ${
                        option === teamSize
                          ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold">{option}</div>
                      <div className="mt-1 text-xs text-slate-500">Primary operator shape</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {useCases.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setUseCase(option.id);
                    setWidget(getRecommendedWidget(option.id));
                  }}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    option.id === useCase
                      ? "border-violet-200 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                      {option.title}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        option.id === useCase ? "bg-white text-violet-700" : "bg-white text-slate-500"
                      }`}
                    >
                      {option.signal}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{option.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {proofSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setProofSource(source.id)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    source.id === proofSource
                      ? "border-violet-200 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                    {source.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{source.description}</p>
                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    {source.signal}
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                {widgets.map((option) => {
                  const recommended = option.id === recommendedWidget;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setWidget(option.id)}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        option.id === widget
                          ? "border-violet-200 bg-violet-50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                          {option.title}
                        </div>
                        {recommended ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-700">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{option.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold text-slate-950">Recommended launch sequence</div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {[
                    `1. Finish onboarding for ${companyName || "your workspace"}.`,
                    `2. Launch ${getWidgetLabel(widget)} on ${getUseCaseLabel(useCase).toLowerCase()}.`,
                    `3. Send the first ${getSourceLabel(proofSource).toLowerCase()} request through the collection flow.`,
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={previousStep}
            className={`inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 ${
              step === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                  isSaving
                    ? "bg-slate-300 text-white"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save workspace plan"}
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                href="/collect/acme-labs"
              >
                Create first collection flow
              </Link>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            {saved ? (
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Workspace saved
              </div>
            ) : null}
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Focus first. Expand later.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
