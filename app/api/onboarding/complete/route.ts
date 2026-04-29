// ============================================================
// VOIX — Complete Onboarding API
// Marks user as onboarded + creates demo widget
// ============================================================

import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Client service role pour les opérations serveur (non-typé)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: {
    companyName?: string;
    websiteUrl?: string;
    brandColor?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { companyName, brandColor } = body;
  const websiteUrl = body.websiteUrl || null;

  if (!companyName || !brandColor) {
    return NextResponse.json(
      { error: "Missing required fields: companyName, brandColor" },
      { status: 400 },
    );
  }

  try {
    // 1. Marquer l'user comme onboarded
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 2. Créer un widget demo avec les données onboarding
    const { data: widget, error: widgetError } = await supabaseAdmin
      .from("widgets")
      .insert({
        profile_id: userId,
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
    const { error: activityError } = await supabaseAdmin
      .from("activities")
      .insert({
        profile_id: userId,
        type: "onboarding_completed",
        description: `Onboarding terminé — Widget "${companyName}" créé`,
        metadata: { widget_id: widget?.id },
      });

    if (activityError) throw activityError;

    return NextResponse.json({ success: true, widgetId: widget?.id });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
