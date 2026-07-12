import { z } from "zod";
export const AgentArgumentSchema = z.object({
    claim: z.string(),
    reasoning: z.string(),
    evidenceIds: z.array(z.string()),
    strength: z.number().min(1).max(10),
    confidence: z.number().min(0).max(100),
});
export const AgentOutputSchema = z.object({
    role: z.enum(["bull", "bear", "risk", "valuation", "news", "judge"]),
    summary: z.string(),
    thesis: z.string(),
    arguments: z.array(AgentArgumentSchema),
    concerns: z.array(z.string()),
    missingData: z.array(z.string()),
    scoreBias: z.number(),
});
export const JudgeOutputSchema = z.object({
    role: z.literal("judge"),
    summary: z.string(),
    thesis: z.string(),
    arguments: z.array(AgentArgumentSchema),
    concerns: z.array(z.string()),
    missingData: z.array(z.string()),
    scoreBias: z.number(),
    finalVerdict: z.enum(["INVEST", "WATCHLIST", "PASS"]),
    finalConfidence: z.number().min(0).max(100),
});
export const NewsClassificationSchema = z.object({
    sentiment: z.enum(["bullish", "bearish", "neutral"]),
    eventType: z.enum(["earnings", "product", "regulation", "lawsuit", "macro", "analyst_rating", "acquisition", "leadership", "general"]),
    relevanceScore: z.number().min(0).max(100),
    sentimentScore: z.number().min(-100).max(100),
    summary: z.string().optional(),
});
export const ScenarioOutputSchema = z.object({
    name: z.enum(["Bull", "Base", "Bear"]),
    assumptions: z.array(z.string()),
    revenueGrowthAssumption: z.number(),
    marginAssumption: z.number(),
    valuationMultipleAssumption: z.number(),
    riskAssumption: z.string(),
    estimatedUpsideDownside: z.number().optional(),
    reasoning: z.string(),
    evidenceIds: z.array(z.string()),
});
