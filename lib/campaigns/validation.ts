// ============================================================
// VOIX — Campaign Validation Schemas
// Zod type-safe validation for campaigns
// ============================================================

import { z } from "zod";

export const CampaignTypeEnum = z.enum(["email", "link", "import"]);
export const CampaignStatusEnum = z.enum(["draft", "active", "paused", "completed"]);

export const CampaignConfigSchema = z.object({
  subject: z.string().min(1, "Le sujet est requis").max(200, "200 caractères max"),
  body: z.string().min(10, "Le corps doit faire au moins 10 caractères").max(10000, "10000 caractères max"),
  from_name: z.string().min(1, "L'expéditeur est requis").max(100),
  from_email: z.string().email("Email invalide").optional(),
  reply_to: z.string().email("Email invalide").optional(),
  trigger: z.enum(["manual", "post_purchase", "post_onboarding"]).default("manual"),
  delay_days: z.number().int().min(0).max(365).optional(),
  recipients: z.array(z.string().email("Email invalide dans la liste")).max(10000, "10000 destinataires max"),
  variables: z.record(z.string()).optional(),
});

export const CampaignCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  type: CampaignTypeEnum,
  config: CampaignConfigSchema,
});

export const CampaignUpdateSchema = CampaignCreateSchema.partial();

export const SendCampaignSchema = z.object({
  campaign_id: z.string().uuid(),
  test_mode: z.boolean().default(false),
  test_email: z.string().email().optional(),
});

export type CampaignCreateInput = z.infer<typeof CampaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof CampaignUpdateSchema>;
export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;
