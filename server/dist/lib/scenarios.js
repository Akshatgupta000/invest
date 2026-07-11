"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenarios = generateScenarios;
const llm_1 = require("./llm");
const zod_1 = require("zod");
async function generateScenarios(ticker, snapshot, companyName) {
    const prompt = `
    You are an expert financial modeler. Generate 3 scenarios (Bull, Base, Bear) for ${companyName} (${ticker}).
    Current Financials:
    - Price: ${snapshot.price || 'N/A'}
    - Revenue Growth: ${snapshot.revenueGrowth ? (snapshot.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
    - Net Margin: ${snapshot.profitMargin ? (snapshot.profitMargin * 100).toFixed(2) + '%' : 'N/A'}
    
    Return a JSON array of 3 scenario objects with EXACTLY this structure for each:
    {
      "name": "Bull" | "Base" | "Bear",
      "assumptions": ["string"],
      "revenueGrowthAssumption": number (as a decimal, e.g. 0.15 for 15%),
      "marginAssumption": number (as a decimal, e.g. 0.20 for 20%),
      "valuationMultipleAssumption": number (e.g. 25 for 25x P/E),
      "riskAssumption": "string",
      "reasoning": "string"
    }
  `;
    const ScenariosSchema = zod_1.z.array(zod_1.z.object({
        name: zod_1.z.enum(["Bull", "Base", "Bear"]),
        assumptions: zod_1.z.array(zod_1.z.string()).optional(),
        revenueGrowthAssumption: zod_1.z.number().optional(),
        marginAssumption: zod_1.z.number().optional(),
        valuationMultipleAssumption: zod_1.z.number().optional(),
        riskAssumption: zod_1.z.string().optional(),
        reasoning: zod_1.z.string().optional()
    }));
    try {
        const parsed = await (0, llm_1.callLLMWithSchema)(prompt, ScenariosSchema, 0.3);
        if (Array.isArray(parsed) && parsed.length === 3) {
            return parsed.map((s) => {
                // Proper upside calculation:
                // 1. Estimate EPS 3 years from now using compounded growth
                // 2. Apply the scenario's target P/E multiple to get a target price
                // 3. Compare to current price for upside/downside %
                let estimatedUpsideDownside = 0;
                const currentEps = snapshot.trailingEps ?? (snapshot.price && snapshot.peRatio ? snapshot.price / snapshot.peRatio : null);
                const currentPrice = snapshot.price;
                if (currentEps && currentEps > 0 && currentPrice && currentPrice > 0 && s.valuationMultipleAssumption) {
                    const growthRate = s.revenueGrowthAssumption ?? 0.05;
                    // Adjust for margin assumption relative to current margin
                    const marginFactor = snapshot.profitMargin ? (s.marginAssumption / snapshot.profitMargin) : 1;
                    // Compound EPS over 3 years with growth + margin factor
                    const futureEps = currentEps * Math.pow(1 + growthRate, 3) * Math.max(0.5, Math.min(2, marginFactor));
                    const targetPrice = futureEps * s.valuationMultipleAssumption;
                    estimatedUpsideDownside = (targetPrice - currentPrice) / currentPrice;
                }
                else if (s.valuationMultipleAssumption && snapshot.peRatio && snapshot.price) {
                    // Fallback: simple multiple expansion/contraction only
                    const multipleChange = (s.valuationMultipleAssumption / snapshot.peRatio) - 1;
                    estimatedUpsideDownside = multipleChange + (s.revenueGrowthAssumption ?? 0);
                }
                return {
                    name: s.name,
                    assumptions: s.assumptions || [],
                    revenueGrowthAssumption: s.revenueGrowthAssumption || 0,
                    marginAssumption: s.marginAssumption || 0,
                    valuationMultipleAssumption: s.valuationMultipleAssumption || 15,
                    riskAssumption: s.riskAssumption || "",
                    estimatedUpsideDownside,
                    reasoning: s.reasoning || "",
                    evidenceIds: [],
                };
            });
        }
    }
    catch (err) {
        console.warn(`[Scenarios] LLM failed for ${ticker}:`, err);
    }
    // Fallback scenarios if LLM fails
    return [
        {
            name: "Bull",
            assumptions: ["Strong market adoption", "Margin expansion"],
            revenueGrowthAssumption: (snapshot.revenueGrowth || 0.05) + 0.1,
            marginAssumption: (snapshot.profitMargin || 0.1) + 0.05,
            valuationMultipleAssumption: (snapshot.peRatio || 15) * 1.2,
            riskAssumption: "Low macro resistance",
            estimatedUpsideDownside: 0.25,
            reasoning: "Assumes everything goes right.",
            evidenceIds: [],
        },
        {
            name: "Base",
            assumptions: ["Trend continuation", "Stable margins"],
            revenueGrowthAssumption: (snapshot.revenueGrowth || 0.05),
            marginAssumption: (snapshot.profitMargin || 0.1),
            valuationMultipleAssumption: (snapshot.peRatio || 15),
            riskAssumption: "Moderate macro resistance",
            estimatedUpsideDownside: 0.05,
            reasoning: "Assumes current trends continue linearly.",
            evidenceIds: [],
        },
        {
            name: "Bear",
            assumptions: ["Macro headwinds", "Margin compression"],
            revenueGrowthAssumption: Math.max(-0.1, (snapshot.revenueGrowth || 0.05) - 0.1),
            marginAssumption: Math.max(0.01, (snapshot.profitMargin || 0.1) - 0.05),
            valuationMultipleAssumption: Math.max(5, (snapshot.peRatio || 15) * 0.7),
            riskAssumption: "High macro resistance or competitive loss",
            estimatedUpsideDownside: -0.3,
            reasoning: "Assumes a recessionary environment or loss of market share.",
            evidenceIds: [],
        }
    ];
}
