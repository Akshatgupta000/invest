"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioOutputSchema = exports.NewsClassificationSchema = exports.JudgeOutputSchema = exports.AgentOutputSchema = exports.AgentArgumentSchema = void 0;
const zod_1 = require("zod");
exports.AgentArgumentSchema = zod_1.z.object({
    claim: zod_1.z.string(),
    reasoning: zod_1.z.string(),
    evidenceIds: zod_1.z.array(zod_1.z.string()),
    strength: zod_1.z.number().min(1).max(10),
    confidence: zod_1.z.number().min(0).max(100),
});
exports.AgentOutputSchema = zod_1.z.object({
    role: zod_1.z.enum(["bull", "bear", "risk", "valuation", "news", "judge"]),
    summary: zod_1.z.string(),
    thesis: zod_1.z.string(),
    arguments: zod_1.z.array(exports.AgentArgumentSchema),
    concerns: zod_1.z.array(zod_1.z.string()),
    missingData: zod_1.z.array(zod_1.z.string()),
    scoreBias: zod_1.z.number(),
});
exports.JudgeOutputSchema = zod_1.z.object({
    role: zod_1.z.literal("judge"),
    summary: zod_1.z.string(),
    thesis: zod_1.z.string(),
    arguments: zod_1.z.array(exports.AgentArgumentSchema),
    concerns: zod_1.z.array(zod_1.z.string()),
    missingData: zod_1.z.array(zod_1.z.string()),
    scoreBias: zod_1.z.number(),
    finalVerdict: zod_1.z.enum(["INVEST", "WATCHLIST", "PASS"]),
    finalConfidence: zod_1.z.number().min(0).max(100),
});
exports.NewsClassificationSchema = zod_1.z.object({
    sentiment: zod_1.z.enum(["bullish", "bearish", "neutral"]),
    eventType: zod_1.z.enum(["earnings", "product", "regulation", "lawsuit", "macro", "analyst_rating", "acquisition", "leadership", "general"]),
    relevanceScore: zod_1.z.number().min(0).max(100),
    sentimentScore: zod_1.z.number().min(-100).max(100),
    summary: zod_1.z.string().optional(),
});
exports.ScenarioOutputSchema = zod_1.z.object({
    name: zod_1.z.enum(["Bull", "Base", "Bear"]),
    assumptions: zod_1.z.array(zod_1.z.string()),
    revenueGrowthAssumption: zod_1.z.number(),
    marginAssumption: zod_1.z.number(),
    valuationMultipleAssumption: zod_1.z.number(),
    riskAssumption: zod_1.z.string(),
    estimatedUpsideDownside: zod_1.z.number().optional(),
    reasoning: zod_1.z.string(),
    evidenceIds: zod_1.z.array(zod_1.z.string()),
});
