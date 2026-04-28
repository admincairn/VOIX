import Link from "next/link";

const proofStats = [
  { label: "Median time to first proof", value: "6 days" },
  { label: "Collection completion rate", value: "41%" },
  { label: "Teams using proof on pricing pages", value: "78%" },
  { label: "Target payback for Voix customers", value: "< 30 days" },
];

const featureGroups = [
  {
    title: "Collect proof without chasing people",
    description:
      "Send one link, let customers record or write in under two minutes, and capture consent at the same time.",
    accent: "from-violet-500/20 to-fuchsia-500/10",
    bullets: ["Video or text", "Branded collection page", "Usage rights captured"],
  },
  {
    title: "Activate proof where revenue happens",
    description:
      "Package customer quotes for pricing pages, demos, outbound follow-up, and onboarding moments.",
    accent: "from-emerald-500/20 to-cyan-500/10",
    bullets: ["Pricing carousel", "Hero proof strip", "Sales follow-up page"],
  },
  {
    title: "Keep the stack lean enough to stay profitable",
    description:
      "Voix is designed for founder-led SaaS teams that want visible ROI without buying an enterprise review platform.",
    accent: "from-amber-500/20 to-rose-500/10",
    bullets: ["SMB-friendly pricing", "Fast setup", "Focused feature surface"],
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$39",
    audience: "Founder-led SaaS teams getting their first repeatable proof system in place.",
    cta: "Start with Starter",
    featured: false,
    items: ["100 testimonials", "10 video submissions / month", "1 production widget", "Public proof page"],
  },
  {
    name: "Growth",
    price: "$79",
    audience: "Lean marketing teams optimizing pricing, onboarding, and outbound with customer proof.",
    cta: "Start 14-day trial",
    featured: true,
    items: [
      "Unlimited testimonials",
      "40 video submissions / month",
      "Unlimited widgets",
      "Import from Google and G2",
      "Proof performance analytics",
    ],
  },
  {
    name: "Scale",
    price: "$159",
    audience: "US SaaS teams that want proof embedded across more pages, campaigns, and workflows.",
    cta: "Talk to Voix",
    featured: false,
    items: [
      "Everything in Growth",
      "Unlimited video submissions",
      "API and webhook access",
      "Multi-workspace controls",
      "Priority support",
    ],
  },
];

const dashboardRows = [
  {
    name: "Sophie Laurent",
    role: "Founder, Payflux",
    source: "Video",
    sourceClass: "bg-rose-100 text-rose-700",
    status: "Published",
    statusClass: "bg-emerald-100 text-emerald-700",
    quote: "Tripled pricing-page conversion in 48 hours.",
  },
  {
    name: "Marcus King",
    role: "CEO, Stacker AI",
    source: "Google",
    sourceClass: "bg-sky-100 text-sky-700",
    status: "Published",
    statusClass: "bg-emerald-100 text-emerald-700",
    quote: "Collection time dropped from hours to minutes.",
  },
  {
    name: "Julie Bernard",
    role: "Marketing Lead, Docuflow",
    source: "G2",
    sourceClass: "bg-amber-100 text-amber-700",
    status: "Pending",
    statusClass: "bg-violet-100 text-violet-700",
    quote: "Imported social proof now sits directly on our pricing page.",
  },
];

export default function Home() {
  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#ffffff_100%)] text-slate-950">
      <section className="border-b border-slate-200/80 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 lg:px-10">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)] text-sm font-semibold text-white shadow-[0_14px_34px_rgba(124,58,237,0.28)]">
              V
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[-0.02em]">Voix</div>
              <div className="text-xs text-slate-500">Social proof for US SaaS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            <a className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950" href="#product">
              Product
            </a>
            <a className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950" href="#proof">
              Proof
            </a>
            <Link className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950" href="/pricing">
              Pricing
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex" href="/dashboard">
              Dashboard preview
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/onboarding"
            >
              Start onboarding
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-18 pt-16 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              Built for profitable SaaS teams
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl">
              Turn customer proof into revenue assets, not another content backlog.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Voix helps US B2B SaaS teams collect testimonials, package them for pricing and sales moments, and publish them fast enough to feel the lift.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/onboarding"
              >
                Start onboarding
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                href="/dashboard"
              >
                Explore product preview
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {proofStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                  <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{stat.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 text-xs font-medium text-slate-400">voix.app/dashboard</div>
              </div>
              <div className="grid gap-4 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Proof collected</div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">247</div>
                    <div className="mt-2 text-sm text-emerald-300">+12 this week</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Widgets live</div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">8</div>
                    <div className="mt-2 text-sm text-cyan-300">14.8k views this month</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Payback signal</div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">4.8</div>
                    <div className="mt-2 text-sm text-amber-300">Average rating</div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-4">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Proof pipeline</div>
                      <div className="text-xs text-slate-500">Active testimonials across review, publish, and reuse.</div>
                    </div>
                    <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">Growth plan</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dashboardRows.map((row) => (
                      <div key={row.name} className="grid gap-3 rounded-2xl border border-slate-100 p-4 md:grid-cols-[1.2fr_.6fr_.6fr] md:items-center">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{row.name}</div>
                          <div className="text-xs text-slate-500">{row.role}</div>
                          <div className="mt-2 text-sm text-slate-600">{row.quote}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.sourceClass}`}>{row.source}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.statusClass}`}>{row.status}</span>
                          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950">
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y border-slate-200/80 bg-white px-6 py-18 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Product thesis</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              The first version of Voix should win on focus, not breadth.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              We are not building a generic review platform first. We are building a proof system for SaaS teams that need visible conversion impact without enterprise overhead.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {featureGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-[26px] border border-slate-200 bg-slate-50 p-7"
              >
                <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${group.accent}`} />
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{group.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">{group.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {group.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-slate-950" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="px-6 py-18 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Why it can be profitable</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              A sharp wedge gives Voix a better path to payback.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-slate-600">
              <p>
                The customers most likely to pay quickly are founder-led and lean marketing SaaS teams. They already believe in proof. What they need is a faster way to collect it, approve it, and reuse it on pages tied to revenue.
              </p>
              <p>
                That is why the first product sequence matters: landing page, collection flow, dashboard, and proof widgets mapped to revenue moments. Every extra surface beyond that must earn its keep.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-950">Ideal customer profile</div>
                  <div className="mt-2 text-sm text-slate-600">US B2B SaaS teams, 5 to 75 employees, founder-led sales or lean growth team.</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">ICP 1</div>
              </div>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-950">Core promise</div>
              <div className="mt-2 text-sm text-slate-600">Capture proof from happy customers and publish it where it lifts conversion.</div>
            </div>
            <div className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-950">What we avoid early</div>
              <div className="mt-2 text-sm text-slate-600">Agency sprawl, multi-vertical copy, custom service work, and enterprise workflows that slow margin and complicate onboarding.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-950 px-6 py-18 text-white lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Pricing</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Price high enough to support a real product, low enough for fast SMB adoption.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              For the first Voix SaaS, profitability beats vanity signups. The plans below are designed for teams that care about proof tied to revenue, not free-tier tourism.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-[28px] border p-8 ${
                  tier.featured
                    ? "border-violet-400 bg-white text-slate-950 shadow-[0_24px_60px_rgba(124,58,237,0.26)]"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-sm font-semibold ${tier.featured ? "text-violet-700" : "text-slate-300"}`}>{tier.name}</div>
                    <div className="mt-4 text-5xl font-semibold tracking-[-0.06em]">
                      {tier.price}
                      <span className={`ml-2 text-base font-medium ${tier.featured ? "text-slate-500" : "text-slate-400"}`}>/ month</span>
                    </div>
                  </div>
                  {tier.featured ? (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">Most likely to scale profitably</span>
                  ) : null}
                </div>
                <p className={`mt-5 text-sm leading-7 ${tier.featured ? "text-slate-600" : "text-slate-300"}`}>{tier.audience}</p>
                <ul className={`mt-6 space-y-3 text-sm ${tier.featured ? "text-slate-700" : "text-slate-200"}`}>
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${tier.featured ? "bg-slate-950" : "bg-white"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                    tier.featured
                      ? "bg-slate-950 text-white hover:bg-slate-800"
                      : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                  href={tier.name === "Scale" ? "/dashboard" : "/onboarding"}
                >
                  {tier.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-18 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Next move</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Build the first profitable version around collection, activation, and payback.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                The fastest path is simple: collect proof, approve it, publish it on pricing and sales surfaces, then measure whether it moves the right pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/onboarding"
              >
                Start onboarding
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                href="/collect/acme-labs"
              >
                Open collect flow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
