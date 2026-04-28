export type UseCaseId = "pricing" | "demo" | "homepage" | "trial";
export type ProofSourceId = "video" | "written" | "import";
export type WidgetId = "carousel" | "strip" | "page" | "wall";
export type TestimonialStatus = "pending" | "published";
export type TestimonialMode = "video" | "text";

export interface WorkspaceProfile {
  companyName: string;
  website: string;
  teamSize: string;
}

export interface OnboardingPlan {
  useCase: UseCaseId;
  proofSource: ProofSourceId;
  widget: WidgetId;
  completedAt: string | null;
}

export interface TestimonialPermissions {
  site: boolean;
  social: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  quote: string;
  rating: number;
  mode: TestimonialMode;
  source: ProofSourceId | "manual";
  status: TestimonialStatus;
  permissions: TestimonialPermissions;
  createdAt: string;
}

export interface WidgetPerformance {
  id: WidgetId;
  name: string;
  views: number;
  progress: number;
}

export interface ActivityItem {
  id: string;
  label: string;
  time: string;
}

export interface VoixWorkspaceState {
  profile: WorkspaceProfile;
  onboarding: OnboardingPlan;
  testimonials: Testimonial[];
  widgets: WidgetPerformance[];
  activities: ActivityItem[];
}

export interface SaveOnboardingInput {
  companyName: string;
  website: string;
  teamSize: string;
  useCase: UseCaseId;
  proofSource: ProofSourceId;
  widget: WidgetId;
}

export interface SubmitTestimonialInput {
  name: string;
  role: string;
  company: string;
  email: string;
  quote: string;
  rating: number;
  mode: TestimonialMode;
  permissions: TestimonialPermissions;
}
