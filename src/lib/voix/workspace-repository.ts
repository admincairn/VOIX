import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSeedWorkspace } from "./mock-data";
import { applyOnboardingToState, applyTestimonialToState } from "./state-utils";
import type {
  SaveOnboardingInput,
  SubmitTestimonialInput,
  VoixWorkspaceState,
} from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "voix-demo-workspace.json");

async function ensureWorkspaceFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    const seed = createSeedWorkspace();
    await writeFile(dataFile, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function writeWorkspaceState(state: VoixWorkspaceState) {
  await writeFile(dataFile, JSON.stringify(state, null, 2), "utf8");
}

export async function getWorkspaceState(): Promise<VoixWorkspaceState> {
  await ensureWorkspaceFile();
  const raw = await readFile(dataFile, "utf8");

  return JSON.parse(raw) as VoixWorkspaceState;
}

export async function saveOnboardingPlan(
  input: SaveOnboardingInput,
): Promise<VoixWorkspaceState> {
  const current = await getWorkspaceState();
  const next = applyOnboardingToState(current, input);
  await writeWorkspaceState(next);
  return next;
}

export async function saveTestimonialSubmission(
  input: SubmitTestimonialInput,
): Promise<VoixWorkspaceState> {
  const current = await getWorkspaceState();
  const next = applyTestimonialToState(current, input);
  await writeWorkspaceState(next);
  return next;
}
