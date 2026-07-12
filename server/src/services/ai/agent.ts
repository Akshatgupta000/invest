import { findTicker, fetchFinancialData } from "../external/finance";
import { 
  AgentStep, 
  ResearchReport, 
  EvidenceItem,
  RiskProfile
} from "../../utils/types/research";
import { buildFinancialEvidence, buildHistoricalEvidence, buildNewsEvidence, buildCompetitorEvidence } from "../core/evidence";
import { fetchHistoricalData } from "../external/historical";
import { fetchCompanyNews, classifyNewsSentiment } from "../external/news";
import { identifyCompetitors, fetchCompetitorData, buildPeerComparison } from "../external/competitors";
import { runBullAgent, runBearAgent, runRiskAgent, runValuationAgent, runNewsAgent, runJudgeAgent, AgentContext } from "./agents";
import { calculateAdvancedScores } from "../core/scoring";
import { calculateValuation } from "../core/valuation";
import { generateScenarios } from "../core/scenarios";
import { calculateConfidence } from "../core/confidence";
import { verifyClaimsAndBuildAuditTrail } from "../core/claimVerifier";
import { compareWithPreviousReport } from "../core/reportComparison";

export async function* runResearchAgent(query: string, riskProfile: RiskProfile = "balanced"): AsyncGenerator<AgentStep> {
  yield { type: "start", message: `Starting advanced research for: "${query}" [Profile: ${riskProfile.toUpperCase()}]` };
  yield { type: "progress", step: "Resolving ticker symbol", total: 14, current: 1 };

  // Resolve the raw user query (e.g. "Apple") to a standard financial ticker (e.g. "AAPL")
  const ticker = await findTicker(query);
  if (!ticker) {
    yield { type: "error", message: `Could not resolve ticker for "${query}"` };
    return;
  }
  yield { type: "ticker_resolved", ticker, message: `Resolved ticker: ${ticker}` };

  // Retrieve current market snapshot (Market Cap, P/E, Margins)
  yield { type: "progress", step: "Fetching financial snapshot", total: 14, current: 2 };
  let financials;
  try {
    financials = await fetchFinancialData(ticker);
    yield { type: "financial_data_loaded", data: financials, message: `Loaded snapshot for ${financials.company}` };
  } catch (err) {
    yield { type: "error", message: "Financial snapshot fetch failed." };
    return;
  }

  // Calculate trailing 3-year performance trends for revenue and net income
  yield { type: "progress", step: "Analyzing historical trends", total: 14, current: 3 };
  const historical = await fetchHistoricalData(ticker);
  yield { type: "historical_data_loaded", data: historical, message: "Calculated historical trends." };

  // Ingest recent headlines and run them through the LLM for structured sentiment analysis
  yield { type: "progress", step: "Processing news sentiment", total: 14, current: 4 };
  const rawNews = await fetchCompanyNews(ticker);
  const newsIntelligence = await classifyNewsSentiment(rawNews, ticker);
  yield { type: "news_loaded", data: newsIntelligence, message: "Classified recent news events." };

  // Identify industry peers dynamically and fetch their data to calculate relative percentiles
  yield { type: "progress", step: "Benchmarking peers", total: 14, current: 5 };
  const competitorTickers = await identifyCompetitors(financials.company, ticker, financials.sector || "", financials.industry || "");
  const competitorsData = await fetchCompetitorData(competitorTickers);
  const targetCompetitorData = {
    ticker: financials.ticker,
    name: financials.company,
    marketCap: financials.marketCap ?? null,
    peRatio: financials.peRatio ?? null,
    profitMargin: financials.profitMargin ?? null,
    revenueGrowth: financials.revenueGrowth ?? null,
  };
  const competitorBenchmarks = buildPeerComparison(targetCompetitorData, competitorsData);
  yield { type: "competitors_loaded", data: competitorBenchmarks, message: `Benchmarked against ${competitorsData.length} peers.` };

  // Flatten all raw data into an immutable array of EvidenceItems to enforce LLM citations
  yield { type: "progress", step: "Building evidence layer", total: 14, current: 6 };
  const evidenceStore: EvidenceItem[] = [
    ...buildFinancialEvidence(financials),
    ...buildHistoricalEvidence({
      revenueTrend: historical.revenueTrend,
      netIncomeTrend: historical.netIncomeTrend,
      debtTrend: historical.debtTrend,
      fcfTrend: historical.fcfTrend,
    }),
    ...buildNewsEvidence(newsIntelligence.topBullish, "positive"),
    ...buildNewsEvidence(newsIntelligence.topBearish, "negative"),
    ...buildCompetitorEvidence(competitorBenchmarks),
  ];
  yield { type: "evidence_built", count: evidenceStore.length, message: `Generated ${evidenceStore.length} normalized evidence items.` };

  // Dispatch the specialized LangGraph agents concurrently
  yield { type: "progress", step: "Running AI agent swarm", total: 14, current: 7 };
  yield { type: "agents_started", message: "Dispatched Bull, Bear, Risk, Valuation, and News agents via LangGraph." };

  const context: AgentContext = {
    companyName: financials.company,
    ticker,
    snapshot: financials,
    historical,
    competitors: competitorBenchmarks,
    news: newsIntelligence,
    evidence: evidenceStore,
    riskProfile
  };

  const { buildAgentSwarmGraph } = await import("./graph");
  const graph = buildAgentSwarmGraph();

  // Execute the LangGraph StateGraph
  const finalState = await graph.invoke({ context });

  yield { type: "agent_completed", role: "all", message: "All specialized agents have finished their analysis." };

  const bull = finalState.bull;
  const bear = finalState.bear;
  const risk = finalState.risk;
  const valuationAgentOutput = finalState.valuation;
  const newsAgentOutput = finalState.news;
  const judge = finalState.judge;

  const agentOutputs = { bull, bear, risk, valuation: valuationAgentOutput, news: newsAgentOutput };

  // Run the deterministic scoring engine to calculate the 0-100 base score
  yield { type: "progress", step: "Calculating explainable scores", total: 14, current: 8 };
  const scoreBreakdown = calculateAdvancedScores(financials, riskProfile, agentOutputs, competitorBenchmarks);
  yield { type: "scoring_completed", score: scoreBreakdown.finalScore, message: `Quant score: ${scoreBreakdown.finalScore}/100` };

  // Execute relative multiple valuation based on peer data
  yield { type: "progress", step: "Running valuation engine", total: 14, current: 9 };
  const valuation = calculateValuation(financials, competitorsData);
  yield { type: "valuation_completed", status: valuation.status, message: `Valuation status: ${valuation.status}` };

  // Project Bull/Base/Bear financial scenarios based on current margins and growth rates
  yield { type: "progress", step: "Generating Scenarios", total: 14, current: 10 };
  const scenarios = await generateScenarios(ticker, financials, financials.company);
  yield { type: "scenarios_completed", message: "Bull, Base, Bear scenarios ready." };

  // The Judge agent already executed inside the LangGraph. We simply yield its verdict here.
  yield { type: "progress", step: "Final Judge synthesis", total: 14, current: 11 };
  yield { type: "judge_completed", verdict: judge.finalVerdict, message: `Judge ruled: ${judge.finalVerdict}` };

  // Calculate an overall confidence score based on data completeness and agent agreement
  yield { type: "progress", step: "Assessing confidence", total: 14, current: 12 };
  const confidence = calculateConfidence(financials, historical, competitorsData, rawNews, { ...agentOutputs, judge });
  // Ensure judge verdict matches quant threshold logic unless judge is extremely confident
  let finalVerdict = scoreBreakdown.verdict;
  if (judge.finalConfidence > 85 && judge.finalVerdict !== finalVerdict) {
     finalVerdict = judge.finalVerdict; // Judge overrides
  }
  yield { type: "confidence_completed", confidence: confidence.score, message: `Confidence: ${confidence.level} (${confidence.score}/100)` };

  // Cross-reference all LLM claims against the EvidenceStore to build the Audit Trail
  yield { type: "progress", step: "Verifying AI claims", total: 14, current: 13 };
  const auditTrail = verifyClaimsAndBuildAuditTrail({ ...agentOutputs, judge }, evidenceStore);
  yield { type: "audit_completed", message: `Verified ${auditTrail.length} evidence-backed claims.` };

  // Construct Report
  const report: ResearchReport = {
    company: financials.company,
    ticker,
    riskProfile,
    verdict: finalVerdict,
    finalScore: scoreBreakdown.finalScore,
    confidence,
    snapshot: financials,
    scoreBreakdown,
    agentDebate: { bull, bear, risk, valuation: valuationAgentOutput, news: newsAgentOutput, judge },
    valuation,
    historicalTrends: historical,
    competitorBenchmarks,
    newsIntelligence,
    scenarios,
    evidence: evidenceStore,
    auditTrail,
    createdAt: new Date(),
  };

  // Pull the previous report for this ticker from the DB and run a diff to see what changed
  yield { type: "progress", step: "Comparing previous report", total: 14, current: 14 };
  const whatChanged = await compareWithPreviousReport(report);
  report.whatChanged = whatChanged;
  yield { type: "comparison_completed", message: whatChanged.hasPreviousReport ? "Compared to past report." : "No previous report found." };

  yield { type: "complete", report, message: "Research Complete" };
}
