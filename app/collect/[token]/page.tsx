// ============================================================
// VOIX — Collect Form Page
// Dynamic branded testimonial collection form
// ============================================================

import { notFound } from "next/navigation";
import { supabaseAdminUntyped } from "@/lib/supabase";
import { CollectForm } from "./components/CollectForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CollectPage({ params }: Props) {
  const { token } = await params;

  // Récupérer le widget par embed_token
  const { data: widget, error } = await supabaseAdminUntyped
    .from("widgets")
    .select("*, profile:profiles(company_name, logo_url, website_url)")
    .eq("embed_token", token)
    .single();

  if (error || !widget) {
    notFound();
  }

  const config = widget.config || {};
  const profile = widget.profile || {};

  // Construire le thème dynamique
  const theme = {
    accentColor: config.accentColor || "#6366f1",
    backgroundColor: config.backgroundColor || "#ffffff",
    textColor: config.textColor || "#0f172a",
    borderRadius: config.borderRadius || 12,
    fontFamily: config.fontFamily || "system-ui",
    cardStyle: config.cardStyle || "elevated",
  };

  return (
    <CollectForm
      widgetId={widget.id}
      token={token}
      theme={theme}
      profile={profile}
    />
  );
}
