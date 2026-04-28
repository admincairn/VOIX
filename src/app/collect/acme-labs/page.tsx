import Link from "next/link";
import CollectFlow from "./collect-flow";

export default function CollectPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link className="text-sm font-medium text-slate-500 transition hover:text-slate-950" href="/">
            Back to Voix
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Requested by Acme Labs
          </span>
        </div>

        <div className="mb-5 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Customer proof
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">
              Share the story behind your results.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This is the part of Voix your customer actually feels. It needs to be calm, fast, and clear enough that people finish the flow without friction.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Short and specific beats generic praise.",
                "A visible outcome makes proof more persuasive.",
                "Consent captured here reduces publishing delays.",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="rounded-[28px] border border-slate-200 bg-white/70 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  UX goal
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-950">
                  Finish in under two minutes
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Trust goal
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-950">
                  Capture better proof with less effort
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Product goal
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-950">
                  Make Voix feel premium from the first interaction
                </div>
              </div>
            </div>
          </div>
        </div>

        <CollectFlow />
      </div>
    </main>
  );
}
