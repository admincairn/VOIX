// ============================================================
// VOIX — Widget Data API
// GET /api/widgets/[id]/data → JSON testimonials for embed
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdminUntyped } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Récupérer le widget avec sa config
  const { data: widget, error: widgetError } = await supabaseAdminUntyped
    .from("widgets")
    .select("*, profile:profiles(company_name, logo_url)")
    .eq("id", id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  // Récupérer les testimonials publiés
  const { data: testimonials, error: testimonialsError } =
    await supabaseAdminUntyped
      .from("testimonials")
      .select("*")
      .eq("profile_id", widget.profile_id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(widget.config?.maxItems || 6);

  if (testimonialsError) {
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }

  // Incrémenter le compteur de vues
  await supabaseAdminUntyped
    .from("widgets")
    .update({ view_count: (widget.view_count || 0) + 1 })
    .eq("id", id);

  return NextResponse.json({
    widget: {
      id: widget.id,
      name: widget.name,
      config: widget.config,
      profile: widget.profile,
    },
    testimonials: testimonials || [],
  });
}
