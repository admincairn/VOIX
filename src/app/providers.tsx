"use client";

import type { ReactNode } from "react";
import type { VoixWorkspaceState } from "@/lib/voix/types";
import { VoixWorkspaceProvider } from "@/lib/voix/workspace-store";

export default function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: VoixWorkspaceState;
}) {
  return (
    <VoixWorkspaceProvider initialState={initialState}>
      {children}
    </VoixWorkspaceProvider>
  );
}
