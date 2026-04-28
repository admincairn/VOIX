import { getWidgetLabel } from "./catalog";
import type {
  SaveOnboardingInput,
  SubmitTestimonialInput,
  VoixWorkspaceState,
  WidgetId,
} from "./types";

function ensureWidget(
  widgets: VoixWorkspaceState["widgets"],
  widgetId: WidgetId,
) {
  const existing = widgets.find((item) => item.id === widgetId);

  if (existing) {
    return widgets.map((item) =>
      item.id === widgetId
        ? {
            ...item,
            name: getWidgetLabel(widgetId),
            progress: Math.max(item.progress, 60),
          }
        : item,
    );
  }

  return [
    {
      id: widgetId,
      name: getWidgetLabel(widgetId),
      views: 0,
      progress: 24,
    },
    ...widgets,
  ];
}

export function applyOnboardingToState(
  current: VoixWorkspaceState,
  input: SaveOnboardingInput,
): VoixWorkspaceState {
  return {
    ...current,
    profile: {
      companyName: input.companyName,
      website: input.website,
      teamSize: input.teamSize,
    },
    onboarding: {
      useCase: input.useCase,
      proofSource: input.proofSource,
      widget: input.widget,
      completedAt: new Date().toISOString(),
    },
    widgets: ensureWidget(current.widgets, input.widget),
    activities: [
      {
        id: `activity-${Date.now()}`,
        label: `Onboarding completed for ${input.companyName} with ${getWidgetLabel(input.widget)}`,
        time: "Just now",
      },
      ...current.activities.slice(0, 5),
    ],
  };
}

export function applyTestimonialToState(
  current: VoixWorkspaceState,
  input: SubmitTestimonialInput,
): VoixWorkspaceState {
  const testimonial = {
    id: `testimonial-${Date.now()}`,
    name: input.name,
    role: input.role,
    company: input.company,
    email: input.email,
    quote: input.quote,
    rating: input.rating,
    mode: input.mode,
    source: input.mode === "video" ? "video" : "written",
    status: "pending" as const,
    permissions: input.permissions,
    createdAt: "Just now",
  };

  return {
    ...current,
    testimonials: [testimonial, ...current.testimonials],
    widgets: current.widgets.map((item) =>
      item.id === current.onboarding.widget
        ? {
            ...item,
            views: item.views + 120,
            progress: Math.min(item.progress + 6, 100),
          }
        : item,
    ),
    activities: [
      {
        id: `activity-${Date.now()}`,
        label: `${input.name} submitted a ${input.mode === "video" ? "video" : "written"} testimonial`,
        time: "Just now",
      },
      ...current.activities.slice(0, 5),
    ],
  };
}
