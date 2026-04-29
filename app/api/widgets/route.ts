// ============================================================
// VOIX — Widgets API — POST /api/widgets
// Create a new widget
// ============================================================

import { auth } from "@/lib/auth";
import { supabaseAdminUntyped } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    type,
    theme,
    accentColor,
    backgroundColor,
    textColor,
    borderRadius,
    spacing,
    maxItems,
    showRating,
    showSource,
    showAvatar,
    showDate,
    autoplay,
    autoplayInterval,
    fontFamily,
    cardStyle,
    animation,
  } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "Missing required fields: name, type" },
      { status: 400 },
    );
  }

  try {
    const { data: widget, error } = await supabaseAdminUntyped
      .from("widgets")
      .insert({
        profile_id: session.user.id,
        name,
        type,
        config: {
          theme,
          accentColor,
          backgroundColor,
          textColor,
          borderRadius,
          spacing,
          maxItems,
          showRating,
          showSource,
          showAvatar,
          showDate,
          autoplay,
          autoplayInterval,
          fontFamily,
          cardStyle,
          animation,
        },
        filters: {
          minRating: 0,
          sources: [],
          tags: [],
          status: "published",
        },
        embed_token: `voix-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabaseAdminUntyped.from("activities").insert({
      profile_id: session.user.id,
      type: "widget_created",
      description: `Widget "${name}" créé`,
      metadata: { widget_id: widget.id },
    });

    return NextResponse.json({ success: true, widget });
  } catch (error) {
    console.error("Widget creation error:", error);
    return NextResponse.json(
      { error: "Failed to create widget" },
      { status: 500 },
    );
  }
}
