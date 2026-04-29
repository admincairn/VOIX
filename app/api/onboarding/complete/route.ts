// ============================================================
// VOIX — Complete Onboarding API
// Marks user as onboarded + creates demo widget
// ============================================================

import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyName, websiteUrl, brandColor } = body;

  try {
    // 1. Marquer l'user comme onboarded
    await supabaseAdmin
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", session.user.id);

    // 2. Créer un widget demo avec les données onboarding
    const { data: widget, error: widgetError } = await supabaseAdmin
      .from("widgets")
      .insert({
        profile_id: session.user.id,
        name: `${companyName} — Widget principal`,
        config: {
          brandColor,
          companyName,
          websiteUrl,
          style: "modern",
          layout: "carousel",
        },
        embed_token: `voix-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      })
      .select()
      .single();

    if (widgetError) throw widgetError;

    // 3. Logger l'activité
    await supabaseAdmin.from("activities").insert({
      profile_id: session.user.id,
      type: "onboarding_completed",
      description: `Onboarding terminé — Widget "${companyName}" créé`,
      metadata: { widget_id: widget.id },
    });

    return NextResponse.json({ success: true, widget });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
