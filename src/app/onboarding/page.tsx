import Link from "next/link";
import OnboardingFlow from "./onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link className="text-sm font-medium text-slate-500 transition hover:text-slate-950" href="/">
            Back to Voix
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Founder setup
          </span>
        </div>

        <OnboardingFlow />
      </div>
    </main>
  );
}
