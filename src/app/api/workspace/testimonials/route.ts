import { NextResponse } from "next/server";
import { saveTestimonialSubmission } from "@/lib/voix/workspace-repository";
import type { SubmitTestimonialInput } from "@/lib/voix/types";

export async function POST(request: Request) {
  const input = (await request.json()) as SubmitTestimonialInput;
  const state = await saveTestimonialSubmission(input);

  return NextResponse.json({ state });
}
