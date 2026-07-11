export type RiskProfile = "conservative" | "balanced" | "aggressive";
export type Verdict = "INVEST" | "WATCHLIST" | "PASS";

export interface CompanyIdentity {
  ticker: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

export interface FinancialSnapshot {
  price: number | null;
  currency?: string;
  marketCap: number | null;
  enterpriseValue?: number | null;
  // Trailing P/E (12-month actual earnings). forwardPE is separate.
  peRatio: number | null;
  forwardPE: number | null;
  pegRatio?: number | null;
  priceToSales?: number | null;
  priceToBook?: number | null;
  evToEbitda?: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  grossMargin: number | null;
  returnOnEquity?: number | null;
  returnOnAssets?: number | null;
  // Total annual revenue (absolute $)
  totalRevenue?: number | null;
  revenueGrowth?: number | null;
  earningsGrowth?: number | null;
  freeCashFlow: number | null;
  operatingCashFlow?: number | null;
  totalDebt?: number | null;
  totalCash?: number | null;
  // Stored as a ratio (e.g. 1.73), not Yahoo's raw integer (173)
  debtToEquity: number | null;
  currentRatio: number | null;
  beta?: number | null;
  dividendYield?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  analystTargetPrice?: number | null;
  recommendationKey?: string | null;
  // EPS metrics
  trailingEps?: number | null;
  forwardEps?: number | null;
}

export interface HistoricalTrend {
  metric: string;
  direction: "improving" | "declining" | "stable" | "unavailable";
  values: number[];
  summary: string;
  evidenceIds: string[];
}

export interface HistoricalFinancials {
  price1M?: number;
  price6M?: number;
  price1Y?: number;
  price3Y?: number;
  volatility?: number;
  maxDrawdown?: number;
  revenueTrend?: HistoricalTrend;
  netIncomeTrend?: HistoricalTrend;
  marginTrend?: HistoricalTrend;
  fcfTrend?: HistoricalTrend;
  debtTrend?: HistoricalTrend;
  epsTrend?: HistoricalTrend;
}

export interface NewsItem {
  id: string;
  headline: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
  summary?: string;
}

export interface NewsSentiment {
  topBullish: NewsItem[];
  topBearish: NewsItem[];
  neutral: NewsItem[];
  overallSentiment: "positive" | "negative" | "neutral";
  sentimentScore: number; // -100 to 100
  majorEvents: string[];
  evidenceIds: string[];
}

export interface CompetitorData {
  ticker: string;
  name: string;
  marketCap: number | null;
  peRatio: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
}

export interface CompetitorBenchmark {
  category: string;
  targetRank: number;
  totalPeers: number;
  percentile: number;
  explanation: string;
  evidenceIds: string[];
}

export interface EvidenceItem {
  id: string;
  type: "financial" | "historical" | "news" | "competitor";
  title: string;
  value: string | number | null;
  unit?: string;
  source: string;
  sourceUrl?: string;
  retrievedAt: number;
  relatedMetric?: string;
  importance: "low" | "medium" | "high";
  interpretation: string;
  direction: "positive" | "negative" | "neutral";
  confidence: "low" | "medium" | "high";
}

export type AgentRole = "bull" | "bear" | "risk" | "valuation" | "news" | "judge";

export interface AgentArgument {
  claim: string;
  reasoning: string;
  evidenceIds: string[];
  strength: number; // 1-10
  confidence: number; // 0-100
}

export interface AgentOutput {
  role: AgentRole;
  summary: string;
  thesis: string;
  arguments: AgentArgument[];
  concerns: string[];
  missingData: string[];
  scoreBias: number;
}

export interface JudgeOutput extends AgentOutput {
  finalVerdict: Verdict;
  finalConfidence: number;
}

export interface QuantScore {
  category: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  explanation: string;
  positiveFactors: string[];
  negativeFactors: string[];
  evidenceIds: string[];
}

export interface ScoreBreakdown {
  finalScore: number;
  verdict: Verdict;
  categoryScores: QuantScore[];
  riskAdjustment: number;
  thresholdUsed: number;
  explanation: string;
  evidenceIds: string[];
}

export interface ValuationResult {
  status: "undervalued" | "fairly_valued" | "overvalued" | "unclear";
  score: number; // 0-100
  peerComparison: any[]; // define later if needed
  keyDrivers: string[];
  warnings: string[];
  evidenceIds: string[];
}

export interface Scenario {
  name: "Bull" | "Base" | "Bear";
  assumptions: string[];
  revenueGrowthAssumption: number;
  marginAssumption: number;
  valuationMultipleAssumption: number;
  riskAssumption: string;
  estimatedUpsideDownside?: number;
  reasoning: string;
  evidenceIds: string[];
}

export interface ConfidenceScore {
  score: number; // 0-100
  level: "low" | "medium" | "high";
  reasons: string[];
  limitations: string[];
}

export interface AuditTrailItem {
  claim: string;
  supportingEvidence: string; // evidence title/value
  source: string;
  metric: string;
  confidence: "low" | "medium" | "high";
  agent: string;
}

export interface WhatChanged {
  hasPreviousReport: boolean;
  previousReportDate?: Date;
  scoreChange?: number;
  verdictChange?: string;
  priceChange?: number;
  newRisks: string[];
  removedRisks: string[];
  newPositiveDrivers: string[];
  summary: string;
}

export interface ResearchReport {
  company: string;
  ticker: string;
  riskProfile: RiskProfile;
  verdict: Verdict;
  finalScore: number;
  confidence: ConfidenceScore;
  snapshot: FinancialSnapshot;
  whatChanged?: WhatChanged;
  scoreBreakdown: ScoreBreakdown;
  agentDebate: {
    bull: AgentOutput;
    bear: AgentOutput;
    risk: AgentOutput;
    valuation: AgentOutput;
    news: AgentOutput;
    judge: JudgeOutput;
  };
  valuation: ValuationResult;
  historicalTrends: HistoricalFinancials;
  competitorBenchmarks: CompetitorBenchmark[];
  newsIntelligence: NewsSentiment;
  scenarios: Scenario[];
  evidence: EvidenceItem[];
  auditTrail: AuditTrailItem[];
  createdAt: Date;
}

export type AgentStep =
  | { type: "start"; message: string }
  | { type: "ticker_resolved"; ticker: string; message: string }
  | { type: "financial_data_loaded"; data: Partial<FinancialSnapshot>; message: string }
  | { type: "historical_data_loaded"; data: any; message: string }
  | { type: "news_loaded"; data: any; message: string }
  | { type: "competitors_loaded"; data: any; message: string }
  | { type: "evidence_built"; count: number; message: string }
  | { type: "agents_started"; message: string }
  | { type: "agent_completed"; role: string; message: string }
  | { type: "scoring_completed"; score: number; message: string }
  | { type: "valuation_completed"; status: string; message: string }
  | { type: "scenarios_completed"; message: string }
  | { type: "judge_completed"; verdict: string; message: string }
  | { type: "confidence_completed"; confidence: number; message: string }
  | { type: "audit_completed"; message: string }
  | { type: "comparison_completed"; message: string }
  | { type: "saved"; message: string }
  | { type: "complete"; report: ResearchReport; message: string }
  | { type: "log"; level: "info" | "warn" | "error" | "success"; message: string }
  | { type: "progress"; step: string; total: number; current: number }
  | { type: "error"; message: string };
