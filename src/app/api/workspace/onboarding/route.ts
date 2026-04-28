import { NextResponse } from "next/server";
import { saveOnboardingPlan } from "@/lib/voix/workspace-repository";
import type { SaveOnboardingInput } from "@/lib/voix/types";

export async function POST(request: Request) {
  const input = (await request.json()) as SaveOnboardingInput;
  const state = await saveOnboardingPlan(input);

  return NextResponse.json({ state });
}
