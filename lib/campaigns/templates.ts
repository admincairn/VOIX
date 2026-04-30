// ============================================================
// VOIX — Email Templates Library
// Professionally crafted templates with variable substitution
// ============================================================

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "onboarding" | "post_purchase" | "nps" | "relationship" | "custom";
  config: {
    subject: string;
    body: string;
    from_name: string;
    variables: string[];
  };
}

export const EMAIL_VARIABLES = {
  customer_name: "Nom du client",
  company_name: "Nom de votre entreprise",
  company_logo: "Logo de votre entreprise (URL)",
  product_name: "Nom du produit/service",
  collect_url: "Lien vers le formulaire de collecte",
  rating_link: "Lien direct de notation (1-5 étoiles)",
  sender_name: "Votre nom",
} as const;

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "post-purchase-classic",
    name: "Post-achat classique",
    description: "Demande un témoignage après un achat, ton chaleureux et personnel",
    category: "post_purchase",
    config: {
      subject: "{{customer_name}}, votre avis compte énormément pour {{company_name}}",
      body: `<p>Bonjour {{customer_name}},</p>

<p>Merci d'avoir choisi <strong>{{company_name}}</strong> ! Votre confiance nous touche.</p>

<p>Pour nous aider à grandir et à accompagner d'autres clients comme vous, auriez-vous 2 minutes pour partager votre expérience ?</p>

<div style="text-align: center; margin: 32px 0;">
  <a href="{{collect_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
    ✨ Partager mon témoignage
  </a>
</div>

<p>Cela prend moins de 2 minutes et votre retour nous aide énormément.</p>

<p>Merci d'avance,<br>{{sender_name}}<br><strong>{{company_name}}</strong></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #9ca3af;">Vous recevez cet email car vous êtes client de {{company_name}}. <a href="#" style="color: #9ca3af;">Se désinscrire</a></p>`,
      from_name: "{{company_name}}",
      variables: ["customer_name", "company_name", "collect_url", "sender_name"],
    },
  },
  {
    id: "post-onboarding",
    name: "Post-onboarding",
    description: "Demande un témoignage après l'intégration d'un nouveau client",
    category: "onboarding",
    config: {
      subject: "Comment se passe votre démarrage avec {{company_name}} ?",
      body: `<p>Bonjour {{customer_name}},</p>

<p>Vous avez récemment rejoint <strong>{{company_name}}</strong> et nous espérons que votre démarrage se passe bien !</p>

<p>Nous serions ravis de connaître votre ressenti après ces premiers jours. Votre feedback nous aide à améliorer l'expérience pour les futurs clients.</p>

<div style="text-align: center; margin: 32px 0;">
  <a href="{{collect_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
    🚀 Donner mon avis
  </a>
</div>

<p>À très bientôt,<br>{{sender_name}}<br><strong>{{company_name}}</strong></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #9ca3af;">Email envoyé par {{company_name}} via Voix</p>`,
      from_name: "{{company_name}} — Onboarding",
      variables: ["customer_name", "company_name", "collect_url", "sender_name"],
    },
  },
  {
    id: "nps-survey",
    name: "NPS Survey",
    description: "Mesure la satisfaction client avec une échelle 0-10",
    category: "nps",
    config: {
      subject: "{{customer_name}}, sur une échelle de 0 à 10, recommanderiez-vous {{company_name}} ?",
      body: `<p>Bonjour {{customer_name}},</p>

<p>Chez <strong>{{company_name}}</strong>, votre satisfaction est notre priorité.</p>

<p>Sur une échelle de 0 à 10, dans quelle mesure recommanderiez-vous nos services à un proche ?</p>

<div style="text-align: center; margin: 32px 0;">
  <div style="display: inline-flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
    ${Array.from({ length: 11 }, (_, i) => `<a href="{{rating_link}}?score=${i}" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: ${i <= 6 ? '#ef4444' : i <= 8 ? '#f59e0b' : '#10b981'}; color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">${i}</a>`).join('')}
  </div>
  <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #9ca3af; max-width: 480px; margin-left: auto; margin-right: auto;">
    <span>Peu probable</span>
    <span>Très probable</span>
  </div>
</div>

<p>Merci pour votre temps,<br>{{sender_name}}<br><strong>{{company_name}}</strong></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #9ca3af;">Powered by Voix — <a href="#" style="color: #9ca3af;">Se désinscrire</a></p>`,
      from_name: "{{company_name}}",
      variables: ["customer_name", "company_name", "rating_link", "sender_name"],
    },
  },
  {
    id: "relationship-followup",
    name: "Suivi relationnel",
    description: "Demande un témoignage à un client fidèle, ton informel",
    category: "relationship",
    config: {
      subject: "Un petit service à nous demander, {{customer_name}} ?",
      body: `<p>Salut {{customer_name}},</p>

<p>On se connaît maintenant, et on adore travailler avec toi !</p>

<p>On cherche à montrer au monde ce qu'on fait de mieux — et ton témoignage serait parfait. Tu aurais 2 minutes pour nous laisser un avis ?</p>

<div style="text-align: center; margin: 32px 0;">
  <a href="{{collect_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
    🔥 Je donne mon avis
  </a>
</div>

<p>Gros merci d'avance,<br>{{sender_name}}</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
<p style="font-size: 12px; color: #9ca3af;">Envoyé avec ❤️ par {{company_name}} via Voix</p>`,
      from_name: "{{sender_name}} — {{company_name}}",
      variables: ["customer_name", "company_name", "collect_url", "sender_name"],
    },
  },
  {
    id: "minimal-clean",
    name: "Minimal & Clean",
    description: "Design épuré, texte concis, CTA unique",
    category: "custom",
    config: {
      subject: "Votre avis en 2 minutes — {{company_name}}",
      body: `<p>Bonjour {{customer_name}},</p>

<p>Votre expérience avec <strong>{{company_name}}</strong> nous intéresse.</p>

<p style="margin: 24px 0;"><a href="{{collect_url}}" style="color: #6366f1; text-decoration: underline; font-weight: 600;">Partager mon témoignage →</a></p>

<p>Merci,<br>{{company_name}}</p>`,
      from_name: "{{company_name}}",
      variables: ["customer_name", "company_name", "collect_url"],
    },
  },
];

/**
 * Substitute variables in template string
 * {{variable}} → value
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Generate collect URL for a specific invite token
 */
export function generateCollectUrl(token: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXTAUTH_URL || "https://voix.app";
  return `${url}/collect/${token}`;
}
