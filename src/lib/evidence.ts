import { randomUUID } from "crypto";
import { EvidenceItem, FinancialSnapshot, HistoricalTrend, NewsItem, CompetitorBenchmark } from "./types/research";

function createId(): string {
  // Using a simple random string for evidence IDs
  return Math.random().toString(36).substring(2, 9);
}

export function createEvidenceItem(params: Omit<EvidenceItem, "id" | "retrievedAt">): EvidenceItem {
  return {
    ...params,
    id: `ev_${createId()}`,
    retrievedAt: Date.now(),
  };
}

export function buildFinancialEvidence(snapshot: FinancialSnapshot): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  const add = (
    title: string,
    value: string | number | null,
    metric: string,
    direction: "positive" | "negative" | "neutral",
    interpretation: string,
    unit?: string
  ) => {
    if (value !== null && value !== undefined) {
      evidence.push(
        createEvidenceItem({
          type: "financial",
          title,
          value,
          unit,
          source: "Yahoo Finance",
          relatedMetric: metric,
          importance: "high",
          direction,
          interpretation,
          confidence: "high",
        })
      );
    }
  };

  // Profitability
  add("Net Margin", snapshot.profitMargin, "profitMargin", (snapshot.profitMargin ?? 0) > 0.1 ? "positive" : (snapshot.profitMargin ?? 0) < 0 ? "negative" : "neutral", "Indicator of overall profitability.", "%");
  add("Operating Margin", snapshot.operatingMargin, "operatingMargin", (snapshot.operatingMargin ?? 0) > 0.1 ? "positive" : (snapshot.operatingMargin ?? 0) < 0 ? "negative" : "neutral", "Indicator of core business profitability.", "%");

  // Valuation
  add("P/E Ratio", snapshot.peRatio, "peRatio", (snapshot.peRatio ?? 0) < 15 ? "positive" : (snapshot.peRatio ?? 0) > 30 ? "negative" : "neutral", "Relative valuation multiple.");
  add("Forward P/E", snapshot.forwardPE, "forwardPE", (snapshot.forwardPE ?? 0) < 15 ? "positive" : (snapshot.forwardPE ?? 0) > 30 ? "negative" : "neutral", "Expected relative valuation multiple.");
  
  // Health
  add("Debt to Equity", snapshot.debtToEquity, "debtToEquity", (snapshot.debtToEquity ?? 0) > 2 ? "negative" : "positive", "Measure of financial leverage.");
  add("Current Ratio", snapshot.currentRatio, "currentRatio", (snapshot.currentRatio ?? 0) > 1 ? "positive" : "negative", "Short-term liquidity indicator.");

  return evidence;
}

export function buildHistoricalEvidence(trends: Record<string, HistoricalTrend | undefined>): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  for (const [key, trend] of Object.entries(trends)) {
    if (trend && trend.direction !== "unavailable") {
      evidence.push(
        createEvidenceItem({
          type: "historical",
          title: `${trend.metric} Trend`,
          value: trend.direction,
          source: "Yahoo Finance",
          relatedMetric: key,
          importance: "medium",
          direction: trend.direction === "improving" ? "positive" : trend.direction === "declining" ? "negative" : "neutral",
          interpretation: trend.summary,
          confidence: "medium",
        })
      );
    }
  }

  return evidence;
}

export function buildNewsEvidence(newsItems: NewsItem[], sentiment: "positive" | "negative" | "neutral"): EvidenceItem[] {
  return newsItems.map((news) =>
    createEvidenceItem({
      type: "news",
      title: `News: ${news.headline.substring(0, 50)}...`,
      value: sentiment,
      source: news.publisher || "News Source",
      sourceUrl: news.link,
      importance: "medium",
      direction: sentiment,
      interpretation: news.summary || "Recent news event.",
      confidence: "medium",
    })
  );
}

export function buildCompetitorEvidence(benchmarks: CompetitorBenchmark[]): EvidenceItem[] {
  return benchmarks.map((bm) =>
    createEvidenceItem({
      type: "competitor",
      title: `Peer Benchmark: ${bm.category}`,
      value: `Rank ${bm.targetRank} of ${bm.totalPeers}`,
      source: "Competitor Analysis",
      importance: "medium",
      direction: bm.percentile >= 50 ? "positive" : "negative",
      interpretation: bm.explanation,
      confidence: "high",
    })
  );
}

export function getEvidenceByMetric(evidence: EvidenceItem[], metric: string): EvidenceItem[] {
  return evidence.filter((e) => e.relatedMetric === metric);
}

export function getPositiveEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter((e) => e.direction === "positive");
}

export function getNegativeEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter((e) => e.direction === "negative");
}
