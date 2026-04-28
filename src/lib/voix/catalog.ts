import type { ProofSourceId, UseCaseId, WidgetId } from "./types";

export const useCases: Array<{
  id: UseCaseId;
  title: string;
  description: string;
  signal: string;
}> = [
  {
    id: "pricing",
    title: "Pricing page conversion",
    description:
      "Move proof next to pricing decisions and reduce hesitation where buyers compare plans.",
    signal: "Best first wedge for fast payback",
  },
  {
    id: "demo",
    title: "Demo follow-up",
    description:
      "Turn proof into a page your AE or founder can send after calls to reinforce trust.",
    signal: "Strong for founder-led sales",
  },
  {
    id: "homepage",
    title: "Homepage trust layer",
    description:
      "Publish proof on the hero and social proof sections to tighten the top-of-funnel message.",
    signal: "Good when positioning is already clear",
  },
  {
    id: "trial",
    title: "Trial to paid conversion",
    description:
      "Place customer proof in onboarding and lifecycle moments where activation needs social validation.",
    signal: "Useful for product-led teams",
  },
];

export const proofSources: Array<{
  id: ProofSourceId;
  title: string;
  description: string;
  signal: string;
}> = [
  {
    id: "video",
    title: "Video testimonials",
    description:
      "Highest trust format for pricing pages, sales follow-up, and outbound.",
    signal: "Best for premium perception",
  },
  {
    id: "written",
    title: "Written testimonials",
    description:
      "Fast to collect, easier to edit, and reliable for the first launch loop.",
    signal: "Fastest path to first live proof",
  },
  {
    id: "import",
    title: "Import existing reviews",
    description:
      "Start from Google or G2 proof you already earned, then enrich with collection campaigns.",
    signal: "Good if proof already exists elsewhere",
  },
];

export const widgets: Array<{
  id: WidgetId;
  title: string;
  description: string;
}> = [
  {
    id: "carousel",
    title: "Pricing proof carousel",
    description:
      "A tight proof module built for pricing pages and comparison-heavy buying moments.",
  },
  {
    id: "strip",
    title: "Hero quote strip",
    description:
      "A lightweight social proof layer for homepage sections and launch pages.",
  },
  {
    id: "page",
    title: "Follow-up proof page",
    description:
      "A shareable page for demos, outbound follow-up, and founder-led sales.",
  },
  {
    id: "wall",
    title: "Proof wall",
    description:
      "A broader library view for buyers who need more depth before they commit.",
  },
];

export function getRecommendedWidget(useCase: UseCaseId): WidgetId {
  switch (useCase) {
    case "demo":
      return "page";
    case "homepage":
      return "strip";
    case "trial":
      return "carousel";
    case "pricing":
    default:
      return "carousel";
  }
}

export function getSourceLabel(source: ProofSourceId) {
  return proofSources.find((item) => item.id === source)?.title ?? "Written testimonials";
}

export function getUseCaseLabel(useCase: UseCaseId) {
  return useCases.find((item) => item.id === useCase)?.title ?? "Pricing page conversion";
}

export function getWidgetLabel(widget: WidgetId) {
  return widgets.find((item) => item.id === widget)?.title ?? "Pricing proof carousel";
}
