import { ConfidenceScore, FinancialSnapshot, HistoricalFinancials, CompetitorData, NewsItem, AgentOutput } from "./types/research";

export function calculateConfidence(
  snapshot: FinancialSnapshot,
  historical: HistoricalFinancials,
  competitors: CompetitorData[],
  news: NewsItem[],
  agentOutputs: Record<string, AgentOutput>
): ConfidenceScore {
  let score = 100;
  const reasons: string[] = [];
  const limitations: string[] = [];

  // 1. Completeness of financial data
  if (snapshot.peRatio === null) {
    score -= 10;
    limitations.push("Missing P/E Ratio limits valuation confidence.");
  }
  if (snapshot.freeCashFlow === null) {
    score -= 10;
    limitations.push("Missing Free Cash Flow limits health analysis.");
  }
  if (snapshot.revenueGrowth === null) {
    score -= 10;
    limitations.push("Missing Revenue Growth limits momentum analysis.");
  }

  // 2. Availability of historical data
  if (Object.keys(historical).length === 0) {
    score -= 20;
    limitations.push("No historical data available. Trend analysis is severely limited.");
  } else if (historical.price3Y === undefined) {
    score -= 5;
    limitations.push("Limited long-term price history.");
  }

  // 3. Competitors
  if (competitors.length === 0) {
    score -= 15;
    limitations.push("No competitors identified. Cannot benchmark valuation or margins.");
  } else if (competitors.length < 3) {
    score -= 5;
    limitations.push("Limited competitor set for benchmarking.");
  }

  // 4. News
  if (news.length === 0) {
    score -= 5;
    limitations.push("No recent news found. Sentiment may be stale.");
  }

  // 5. Agent Agreement and Failures
  let failedAgents = 0;
  const biases = [];
  for (const [name, agent] of Object.entries(agentOutputs)) {
    if (agent.summary.includes("unavailable") || agent.summary.includes("failed")) {
      failedAgents++;
      limitations.push(`${name} agent failed to generate insights.`);
    } else {
      if (agent.scoreBias) biases.push(agent.scoreBias);
    }
  }

  if (failedAgents > 0) {
    score -= failedAgents * 10;
  }

  // Check for wild disagreement
  if (biases.length > 1) {
    const min = Math.min(...biases);
    const max = Math.max(...biases);
    if (max - min > 150) { // e.g. Bull is +80, Bear is -80
      score -= 10;
      limitations.push("High disagreement among expert agents lowers overall confidence.");
    } else if (max - min < 50 && failedAgents === 0) {
      reasons.push("Strong consensus among AI agents increases confidence.");
    }
  }

  // Cap score
  score = Math.max(0, Math.min(100, score));

  let level: "low" | "medium" | "high" = "medium";
  if (score >= 80) level = "high";
  else if (score < 50) level = "low";

  if (score >= 80) reasons.push("Data is comprehensive and historical trends are clear.");

  return {
    score,
    level,
    reasons,
    limitations
  };
}
