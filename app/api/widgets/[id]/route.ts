// ============================================================
// VOIX — Widget API — GET/PATCH /api/widgets/[id]
// Get or update a specific widget
// ============================================================

import { auth } from "@/lib/auth";
import { supabaseAdminUntyped } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET — Récupérer un widget
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: widget, error } = await supabaseAdminUntyped
      .from("widgets")
      .select("*")
      .eq("id", id)
      .eq("profile_id", session.user.id)
      .single();

    if (error) throw error;
    if (!widget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, widget });
  } catch (error) {
    console.error("Widget fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget" },
      { status: 500 },
    );
  }
}

// PATCH — Mettre à jour un widget
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    // Vérifier que le widget appartient à l'utilisateur
    const { data: existing, error: checkError } = await supabaseAdminUntyped
      .from("widgets")
      .select("id")
      .eq("id", id)
      .eq("profile_id", session.user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Widget not found or unauthorized" },
        { status: 404 },
      );
    }

    const { data: widget, error } = await supabaseAdminUntyped
      .from("widgets")
      .update({
        name: body.name,
        type: body.type,
        config: {
          theme: body.theme,
          accentColor: body.accentColor,
          backgroundColor: body.backgroundColor,
          textColor: body.textColor,
          borderRadius: body.borderRadius,
          spacing: body.spacing,
          maxItems: body.maxItems,
          showRating: body.showRating,
          showSource: body.showSource,
          showAvatar: body.showAvatar,
          showDate: body.showDate,
          autoplay: body.autoplay,
          autoplayInterval: body.autoplayInterval,
          fontFamily: body.fontFamily,
          cardStyle: body.cardStyle,
          animation: body.animation,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, widget });
  } catch (error) {
    console.error("Widget update error:", error);
    return NextResponse.json(
      { error: "Failed to update widget" },
      { status: 500 },
    );
  }
}
