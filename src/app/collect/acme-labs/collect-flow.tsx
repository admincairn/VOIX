"use client";

import { useMemo, useState } from "react";
import { useVoixWorkspace } from "@/lib/voix/workspace-store";

type Mode = "video" | "text";

const prompts = [
  {
    title: "What problem did Acme Labs solve?",
    body: "Name the blocker, the repetitive task, or the uncertainty you wanted gone.",
  },
  {
    title: "What changed after rollout?",
    body: "Mention a visible result: time saved, higher conversion, faster delivery, or clearer decisions.",
  },
  {
    title: "Who would you recommend it to?",
    body: "This helps future buyers recognize themselves quickly.",
  },
];

const ratingLabels = [
  "Needs improvement",
  "Below expectations",
  "Solid experience",
  "Very strong outcome",
  "Excellent, easy to recommend",
];

export default function CollectFlow() {
  const { state, submitTestimonial, isHydrated } = useVoixWorkspace();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("video");
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("Sophie Laurent");
  const [role, setRole] = useState("Founder");
  const [company, setCompany] = useState("Payflux");
  const [email, setEmail] = useState("sophie@payflux.com");
  const [text, setText] = useState(
    "We needed stronger proof around our pricing page. Voix made it easy to collect customer stories, publish them quickly, and support buying decisions with real outcomes.",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [consentSite, setConsentSite] = useState(true);
  const [consentSocial, setConsentSocial] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepMeta = [
    {
      eyebrow: "Step 1 of 3",
      title: "Tell us who you are.",
      description:
        `A few details make the testimonial more credible and easier for the ${state.profile.companyName} team to publish with confidence.`,
    },
    {
      eyebrow: "Step 2 of 3",
      title: "Share the outcome in video or text.",
      description:
        "The best submissions are short, specific, and tied to one visible business result.",
    },
    {
      eyebrow: "Step 3 of 3",
      title: "Review and approve usage.",
      description:
        "This final step reduces back-and-forth and helps the team put your proof to work faster.",
    },
  ];

  const textCount = text.length;
  const summarySnippet = useMemo(() => {
    if (mode === "video") {
      return recorded
        ? "Short video response ready for review."
        : "Video mode selected. Recording can be added before submission.";
    }

    return text.length > 160 ? `${text.slice(0, 157)}...` : text;
  }, [mode, recorded, text]);

  const canSubmit =
    consentSite &&
    (mode === "text" ? text.trim().length > 0 : true) &&
    name.trim().length > 0 &&
    email.trim().length > 0;

  async function nextStep() {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    if (canSubmit) {
      setIsSubmitting(true);
      try {
        await submitTestimonial({
          name,
          role,
          company,
          email,
          quote:
            mode === "video"
              ? `${state.profile.companyName} collected a video response from ${name}.`
              : text,
          rating,
          mode,
          permissions: {
            site: consentSite,
            social: consentSocial,
          },
        });
        setSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function previousStep() {
    setStep(Math.max(0, step - 1));
  }

  if (submitted) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#dcfce7,#ede9fe)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-emerald-600 shadow-sm">
              OK
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
            Thank you, your testimonial is in.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The {state.profile.companyName} team can now review your submission and reuse it across its website, sales, and marketing flows according to the permissions you approved.
          </p>

          <div className="mt-8 grid w-full gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Submission type
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-950">
                {mode === "video" ? "Video testimonial" : "Written testimonial"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {mode === "video" ? "High-trust format for revenue pages." : "Fast to publish and easy to reuse."}
              </div>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Next effect
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-950">Dashboard updated</div>
              <div className="mt-1 text-sm text-slate-500">
                Your submission now appears in the Voix workspace as pending proof.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {stepMeta[step]?.eyebrow}
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 lg:text-4xl">
            {stepMeta[step]?.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {stepMeta[step]?.description}
          </p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
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

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
        <div>
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Full name
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Work email
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Role
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                />
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Company
                </label>
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Your rating
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg transition ${
                        value <= rating
                          ? "border-amber-200 bg-amber-50 text-amber-500 shadow-sm"
                          : "border-slate-200 bg-white text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      *
                    </button>
                  ))}
                </div>
                <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {ratingLabels[rating - 1]}
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("video")}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    mode === "video"
                      ? "border-violet-200 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-950">Video testimonial</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    Best for pricing pages, demos, and outbound follow-up where trust matters most.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    mode === "text"
                      ? "border-violet-200 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-950">Written testimonial</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    Fast to submit and easy for the team to reuse across pages and campaigns.
                  </div>
                </button>
              </div>

              {mode === "video" ? (
                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-4">
                  <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,#111827,#0f172a_55%,#1f2937)] p-6">
                    <div
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                        isRecording
                          ? "border border-rose-400/30 bg-rose-400/10 text-rose-200"
                          : recorded
                            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border border-slate-400/20 bg-white/5 text-slate-200"
                      }`}
                    >
                      {isRecording ? "Recording..." : recorded ? "Video saved" : "Ready to record"}
                    </div>

                    <div className="mt-16 flex min-h-72 items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/5">
                      <div className="text-center text-white">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold">
                          Cam
                        </div>
                        <div className="mt-4 text-lg font-semibold">
                          {isRecording
                            ? "Recording in progress. Keep it short and concrete."
                            : recorded
                              ? "Great. Your video is ready for review."
                              : "A 30 to 60 second answer is perfect."}
                        </div>
                        <div className="mt-2 text-sm text-slate-300">
                          Problem, result, recommendation.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isRecording) {
                          setIsRecording(false);
                          setRecorded(true);
                        } else {
                          setIsRecording(true);
                          setRecorded(false);
                        }
                      }}
                      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                        isRecording
                          ? "bg-rose-500 text-white hover:bg-rose-400"
                          : "bg-white text-slate-950 hover:bg-slate-100"
                      }`}
                    >
                      {isRecording ? "Stop recording" : recorded ? "Record again" : "Start recording"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Upload clip
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Your testimonial
                  </label>
                  <textarea
                    className="mt-3 min-h-56 w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-950 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Keep it specific. Buyers trust detail more than generic praise.
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      {textCount} characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Submission summary
                </div>
                <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                        {name || "Your name"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {[role, company].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                      {mode === "video" ? "Video response" : "Written response"}
                    </div>
                  </div>
                  <div className="mt-5 text-sm leading-7 text-slate-600">{summarySnippet}</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Usage permissions
                </div>
                <div className="mt-4 space-y-3">
                  <label className="flex gap-3 rounded-[22px] border border-slate-200 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={consentSite}
                      onChange={(event) => setConsentSite(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-violet-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        Website and product marketing
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        {state.profile.companyName} may publish this proof on public-facing pages and product materials.
                      </div>
                    </div>
                  </label>
                  <label className="flex gap-3 rounded-[22px] border border-slate-200 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={consentSocial}
                      onChange={(event) => setConsentSocial(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-violet-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        Social posts and outbound usage
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        {state.profile.companyName} may reuse excerpts in social media, decks, and follow-up campaigns.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-950">Prompt ideas</div>
          <div className="mt-4 space-y-3">
            {prompts.map((prompt) => (
              <div key={prompt.title} className="rounded-[20px] border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-950">{prompt.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-500">{prompt.body}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-950">Why this experience matters</div>
            <div className="mt-3 text-sm leading-6 text-slate-500">
              A smooth collection flow increases completion rate, captures better proof, and makes the product feel premium to both the customer and the SaaS team using Voix.
            </div>
          </div>
        </aside>
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
        <button
          type="button"
          onClick={nextStep}
          className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
            step === 2
              ? canSubmit
                ? isSubmitting
                  ? "bg-slate-300 text-white"
                  : "bg-slate-950 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-400"
              : "bg-slate-950 text-white hover:bg-slate-800"
          }`}
          disabled={step === 2 && (isSubmitting || !canSubmit)}
        >
          {step === 2 ? (isSubmitting ? "Submitting..." : "Submit testimonial") : "Continue"}
        </button>
        <div className="ml-auto text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Premium UX builds trust
        </div>
      </div>
    </section>
  );
}
