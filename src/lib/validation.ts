import { z } from "zod";

export const riskProfiles = ["conservative", "balanced", "aggressive"] as const;
export type RiskProfile = typeof riskProfiles[number];

export const ResearchRequestSchema = z.object({
  query: z
    .string()
    .min(2, "Query must be at least 2 characters")
    .max(80, "Query must not exceed 80 characters")
    .trim(),
  riskProfile: z
    .enum(riskProfiles)
    .default("balanced"),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
