import { getRecommendedWidget, getWidgetLabel } from "./catalog";
import type { VoixWorkspaceState, WidgetId } from "./types";

function makeWidget(id: WidgetId, views: number, progress: number) {
  return {
    id,
    name: getWidgetLabel(id),
    views,
    progress,
  };
}

export function createSeedWorkspace(): VoixWorkspaceState {
  const starterWidget = getRecommendedWidget("pricing");

  return {
    profile: {
      companyName: "Acme Labs",
      website: "acmelabs.com",
      teamSize: "11-25",
    },
    onboarding: {
      useCase: "pricing",
      proofSource: "written",
      widget: starterWidget,
      completedAt: null,
    },
    testimonials: [
      {
        id: "t-1",
        name: "Sophie Laurent",
        role: "Founder",
        company: "Payflux",
        email: "sophie@payflux.com",
        quote: "Tripled pricing-page conversion in 48 hours.",
        rating: 5,
        mode: "video",
        source: "video",
        status: "published",
        permissions: {
          site: true,
          social: true,
        },
        createdAt: "2 hours ago",
      },
      {
        id: "t-2",
        name: "Marcus King",
        role: "CEO",
        company: "Stacker AI",
        email: "marcus@stacker.ai",
        quote: "Collection time dropped from hours to minutes.",
        rating: 5,
        mode: "text",
        source: "written",
        status: "published",
        permissions: {
          site: true,
          social: false,
        },
        createdAt: "Yesterday",
      },
      {
        id: "t-3",
        name: "Julie Bernard",
        role: "Marketing Lead",
        company: "Docuflow",
        email: "julie@docuflow.com",
        quote: "Imported proof is ready for the pricing page refresh.",
        rating: 4,
        mode: "text",
        source: "import",
        status: "pending",
        permissions: {
          site: true,
          social: false,
        },
        createdAt: "Apr 20",
      },
    ],
    widgets: [
      makeWidget("carousel", 6200, 82),
      makeWidget("strip", 4900, 68),
      makeWidget("page", 3100, 44),
    ],
    activities: [
      {
        id: "a-1",
        label: "Sophie L. submitted a video testimonial",
        time: "2 hours ago",
      },
      {
        id: "a-2",
        label: "Pricing proof carousel crossed 6,000 views",
        time: "Yesterday",
      },
      {
        id: "a-3",
        label: "Imported proof is waiting for review",
        time: "Apr 20",
      },
    ],
  };
}
