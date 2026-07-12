import { FinancialSnapshot, RiskProfile, ScoreBreakdown, QuantScore, AgentOutput, CompetitorBenchmark } from "../../utils/types/research";

export function calculateAdvancedScores(
  snapshot: FinancialSnapshot,
  riskProfile: RiskProfile,
  agentOutputs: Record<string, AgentOutput>,
  competitors: CompetitorBenchmark[]
): ScoreBreakdown {
  const categoryScores: QuantScore[] = [];

  const clamp = (val: number) => Math.min(100, Math.max(0, val));

  // 1. Valuation
  let valuationScore = 50;
  const valuationPositives: string[] = [];
  const valuationNegatives: string[] = [];
  
  if (snapshot.peRatio !== null) {
    if (snapshot.peRatio < 15) { valuationScore += 25; valuationPositives.push("Attractive P/E ratio."); }
    else if (snapshot.peRatio > 40) { valuationScore -= 20; valuationNegatives.push("High P/E ratio."); }
  }
  if (agentOutputs.valuation?.scoreBias) {
    valuationScore += agentOutputs.valuation.scoreBias * 0.5; // Agent bias influences score
    if (agentOutputs.valuation.scoreBias > 20) valuationPositives.push("Valuation agent sees upside.");
    if (agentOutputs.valuation.scoreBias < -20) valuationNegatives.push("Valuation agent warns of overvaluation.");
  }
  
  categoryScores.push({
    category: "Valuation",
    rawScore: clamp(valuationScore),
    weight: 0.20,
    weightedScore: clamp(valuationScore) * 0.20,
    explanation: "Based on absolute multiples and Valuation Agent bias.",
    positiveFactors: valuationPositives,
    negativeFactors: valuationNegatives,
    evidenceIds: []
  });

  // 2. Financial Health
  let healthScore = 50;
  const healthPositives: string[] = [];
  const healthNegatives: string[] = [];
  
  if ((snapshot.profitMargin ?? 0) > 0.1) { healthScore += 20; healthPositives.push("Strong net margin."); }
  if ((snapshot.debtToEquity ?? 0) > 1.5) { healthScore -= 20; healthNegatives.push("High debt burden (D/E > 1.5x)."); }
  if ((snapshot.currentRatio ?? 0) > 1.2) { healthScore += 10; healthPositives.push("Good short-term liquidity."); }

  categoryScores.push({
    category: "Financial Health",
    rawScore: clamp(healthScore),
    weight: 0.25,
    weightedScore: clamp(healthScore) * 0.25,
    explanation: "Based on profitability, debt levels, and liquidity ratios.",
    positiveFactors: healthPositives,
    negativeFactors: healthNegatives,
    evidenceIds: []
  });

  // 3. Growth Potential
  let growthScore = 50;
  const growthPositives: string[] = [];
  const growthNegatives: string[] = [];

  if ((snapshot.revenueGrowth ?? 0) > 0.1) { growthScore += 20; growthPositives.push("Double-digit revenue growth."); }
  if ((snapshot.revenueGrowth ?? 0) < 0) { growthScore -= 20; growthNegatives.push("Declining revenue."); }
  if (agentOutputs.bull?.scoreBias > 0) { growthScore += agentOutputs.bull.scoreBias * 0.3; }

  categoryScores.push({
    category: "Growth & Momentum",
    rawScore: clamp(growthScore),
    weight: 0.25,
    weightedScore: clamp(growthScore) * 0.25,
    explanation: "Based on revenue growth and Bull Agent catalysts.",
    positiveFactors: growthPositives,
    negativeFactors: growthNegatives,
    evidenceIds: []
  });

  // 4. Peer Comparison
  let peerScore = 50;
  const peerPositives: string[] = [];
  const peerNegatives: string[] = [];

  competitors.forEach(comp => {
    if (comp.percentile >= 75) { peerScore += 15; peerPositives.push(`Top quartile in ${comp.category}.`); }
    if (comp.percentile <= 25) { peerScore -= 15; peerNegatives.push(`Bottom quartile in ${comp.category}.`); }
  });

  categoryScores.push({
    category: "Peer Comparison",
    rawScore: clamp(peerScore),
    weight: 0.15,
    weightedScore: clamp(peerScore) * 0.15,
    explanation: "Based on percentile rankings against identified competitors.",
    positiveFactors: peerPositives,
    negativeFactors: peerNegatives,
    evidenceIds: []
  });

  // 5. News Sentiment
  let newsScore = 50;
  if (agentOutputs.news?.scoreBias) {
    newsScore += agentOutputs.news.scoreBias * 0.5;
  }
  categoryScores.push({
    category: "News Sentiment",
    rawScore: clamp(newsScore),
    weight: 0.15,
    weightedScore: clamp(newsScore) * 0.15,
    explanation: "Based on recent news events and sentiment analysis.",
    positiveFactors: newsScore > 60 ? ["Positive news momentum."] : [],
    negativeFactors: newsScore < 40 ? ["Negative news catalysts."] : [],
    evidenceIds: []
  });

  // Calculate Base Final Score
  let finalScore = categoryScores.reduce((acc, cat) => acc + cat.weightedScore, 0);

  // Risk Profile Adjustment
  let riskAdjustment = 0;
  let explanation = "Standard balanced evaluation.";
  let thresholdUsed = 60; // Base Invest threshold

  if (riskProfile === "conservative") {
    thresholdUsed = 75; // Harder to get INVEST
    if (healthScore < 40) riskAdjustment -= 15; // Severe penalty for weak health
    if (agentOutputs.risk?.scoreBias < -50) riskAdjustment -= 15; // Severe penalty for identified risks
    explanation = "Conservative profile applied: Strict penalties for debt and volatility. Higher threshold for INVEST.";
  } else if (riskProfile === "aggressive") {
    thresholdUsed = 50; // Easier to get INVEST
    if (growthScore > 75) riskAdjustment += 15; // Bonus for high growth
    explanation = "Aggressive profile applied: Bonus points for high growth, lower threshold for INVEST.";
  }

  finalScore = clamp(finalScore + riskAdjustment);
  finalScore = Math.round(finalScore);

  // Determine Verdict
  // If judge agent is present, let judge override the quant verdict if confidence is high,
  // but for the scoring engine itself, we return the quant verdict.
  let verdict: "INVEST" | "WATCHLIST" | "PASS" = "PASS";
  if (finalScore >= thresholdUsed) verdict = "INVEST";
  else if (finalScore >= thresholdUsed - 15) verdict = "WATCHLIST";

  return {
    finalScore,
    verdict,
    categoryScores,
    riskAdjustment,
    thresholdUsed,
    explanation,
    evidenceIds: []
  };
}
