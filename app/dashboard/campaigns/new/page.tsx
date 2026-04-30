// ============================================================
// VOIX — New Campaign Wizard
// 3-step creation: template → editor → recipients → send
// ============================================================

import { Metadata } from "next";
import { CampaignWizard } from "../components/CampaignWizard";

export const metadata: Metadata = {
  title: "Nouvelle campagne — VOIX",
  description: "Créez une campagne de collecte de témoignages",
};

export default function NewCampaignPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Nouvelle campagne
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Configurez et envoyez votre demande de témoignages en 3 étapes
        </p>
      </div>

      <CampaignWizard />
    </div>
  );
}
