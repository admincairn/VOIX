// ============================================================
// VOIX — Email Templates API
// GET /api/campaigns/templates
// Returns predefined email templates
// ============================================================

import { NextResponse } from "next/server";
import { DEFAULT_TEMPLATES } from "@/lib/campaigns/templates";

export async function GET() {
  return NextResponse.json({
    data: DEFAULT_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      variables: t.config.variables,
    })),
  });
}
