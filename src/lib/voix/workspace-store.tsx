"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  SaveOnboardingInput,
  SubmitTestimonialInput,
  VoixWorkspaceState,
} from "./types";

interface VoixWorkspaceContextValue {
  state: VoixWorkspaceState;
  isHydrated: boolean;
  saveOnboarding: (input: SaveOnboardingInput) => Promise<void>;
  submitTestimonial: (input: SubmitTestimonialInput) => Promise<void>;
}

const VoixWorkspaceContext = createContext<VoixWorkspaceContextValue | null>(null);

async function postWorkspaceUpdate<TInput>(
  url: string,
  input: TInput,
): Promise<VoixWorkspaceState> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Workspace update failed at ${url}`);
  }

  const payload = (await response.json()) as { state: VoixWorkspaceState };
  return payload.state;
}

export function VoixWorkspaceProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: VoixWorkspaceState;
}) {
  const [state, setState] = useState<VoixWorkspaceState>(initialState);

  const value = useMemo<VoixWorkspaceContextValue>(
    () => ({
      state,
      isHydrated: true,
      async saveOnboarding(input) {
        const nextState = await postWorkspaceUpdate(
          "/api/workspace/onboarding",
          input,
        );
        setState(nextState);
      },
      async submitTestimonial(input) {
        const nextState = await postWorkspaceUpdate(
          "/api/workspace/testimonials",
          input,
        );
        setState(nextState);
      },
    }),
    [state],
  );

  return (
    <VoixWorkspaceContext.Provider value={value}>
      {children}
    </VoixWorkspaceContext.Provider>
  );
}

export function useVoixWorkspace() {
  const context = useContext(VoixWorkspaceContext);

  if (!context) {
    throw new Error("useVoixWorkspace must be used within VoixWorkspaceProvider");
  }

  return context;
}
