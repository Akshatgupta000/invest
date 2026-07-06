import { FinancialSnapshot, Scenario } from "./types/research";
import { callLLM } from "./llm";

export async function generateScenarios(ticker: string, snapshot: FinancialSnapshot, companyName: string): Promise<Scenario[]> {
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

  try {
    const res = await callLLM({
      task: "Scenario Generation",
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json",
      temperature: 0.3,
    });

    if (res.success) {
      const match = res.content.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed.map((s: any) => {
            
            // Calculate a very rough estimated upside/downside based on PE and Earnings Growth if available
            // This is deterministic quant logic applying the LLM's assumptions
            let estimatedUpsideDownside = 0;
            if (snapshot.peRatio && snapshot.peRatio > 0 && s.valuationMultipleAssumption) {
                // Simplified: Multiple expansion/contraction + growth
                const multipleChange = (s.valuationMultipleAssumption / snapshot.peRatio) - 1;
                const growthImpact = s.revenueGrowthAssumption || 0;
                estimatedUpsideDownside = multipleChange + growthImpact; 
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
            } as Scenario;
          });
        }
      }
    }
  } catch (err) {
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
