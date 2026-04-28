import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$39",
    description:
      "For founder-led SaaS teams that need one clean proof loop before they add process.",
    features: ["100 testimonials", "10 video submissions / month", "1 embeddable widget", "Public proof page"],
  },
  {
    name: "Growth",
    price: "$79",
    description:
      "For lean GTM teams improving pricing pages, outbound follow-up, and onboarding touchpoints.",
    features: [
      "Unlimited testimonials",
      "40 video submissions / month",
      "Unlimited widgets",
      "Google and G2 import",
      "Proof performance analytics",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: "$159",
    description:
      "For SaaS teams that want proof spread across more surfaces without custom enterprise bloat.",
    features: ["Everything in Growth", "Unlimited video submissions", "API and webhooks", "Multi-workspace access", "Priority support"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-slate-500 transition hover:text-slate-950" href="/">
          Back to Voix
        </Link>
        <div className="mt-8 max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pricing</div>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-slate-950">
            Price the product so the business can breathe.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Voix is designed for US B2B SaaS teams that want visible return from customer proof, not an oversized stack that eats margin.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`rounded-[28px] border p-8 ${
                tier.featured
                  ? "border-violet-300 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                  : "border-slate-200 bg-white text-slate-950"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`text-sm font-semibold ${tier.featured ? "text-violet-300" : "text-slate-500"}`}>{tier.name}</div>
                  <div className="mt-4 text-5xl font-semibold tracking-[-0.06em]">
                    {tier.price}
                    <span className={`ml-2 text-base font-medium ${tier.featured ? "text-slate-300" : "text-slate-500"}`}>/ month</span>
                  </div>
                </div>
                {tier.featured ? (
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                    Best early margin profile
                  </span>
                ) : null}
              </div>
              <p className={`mt-5 text-sm leading-7 ${tier.featured ? "text-slate-300" : "text-slate-600"}`}>{tier.description}</p>
              <ul className={`mt-6 space-y-3 text-sm ${tier.featured ? "text-slate-100" : "text-slate-700"}`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${tier.featured ? "bg-white" : "bg-slate-950"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                  tier.featured
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
                href="/onboarding"
              >
                Start with {tier.name}
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold text-slate-950">Recommended next step</div>
              <div className="mt-2 text-sm leading-7 text-slate-600">
                Before wiring billing and campaigns, walk through onboarding and decide where the first proof asset should pay back.
              </div>
            </div>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/onboarding"
            >
              Run onboarding
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
