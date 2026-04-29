// ============================================================
// VOIX — Builder Shell
// Split-screen container
// ============================================================

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function BuilderShell({ children }: Props) {
  return <div className="flex h-full">{children}</div>;
}
