"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runResearchAgent = runResearchAgent;
const finance_1 = require("./finance");
const evidence_1 = require("./evidence");
const historical_1 = require("./historical");
const news_1 = require("./news");
const competitors_1 = require("./competitors");
const scoring_1 = require("./scoring");
const valuation_1 = require("./valuation");
const scenarios_1 = require("./scenarios");
const confidence_1 = require("./confidence");
const claimVerifier_1 = require("./claimVerifier");
const reportComparison_1 = require("./reportComparison");
async function* runResearchAgent(query, riskProfile = "balanced") {
    yield { type: "start", message: `Starting advanced research for: "${query}" [Profile: ${riskProfile.toUpperCase()}]` };
    yield { type: "progress", step: "Resolving ticker symbol", total: 14, current: 1 };
    // Step 1: Find ticker
    const ticker = await (0, finance_1.findTicker)(query);
    if (!ticker) {
        yield { type: "error", message: `Could not resolve ticker for "${query}"` };
        return;
    }
    yield { type: "ticker_resolved", ticker, message: `Resolved ticker: ${ticker}` };
    // Step 2: Fetch Financial Snapshot
    yield { type: "progress", step: "Fetching financial snapshot", total: 14, current: 2 };
    let financials;
    try {
        financials = await (0, finance_1.fetchFinancialData)(ticker);
        yield { type: "financial_data_loaded", data: financials, message: `Loaded snapshot for ${financials.company}` };
    }
    catch (err) {
        yield { type: "error", message: "Financial snapshot fetch failed." };
        return;
    }
    // Step 3: Fetch Historical Trends
    yield { type: "progress", step: "Analyzing historical trends", total: 14, current: 3 };
    const historical = await (0, historical_1.fetchHistoricalData)(ticker);
    yield { type: "historical_data_loaded", data: historical, message: "Calculated historical trends." };
    // Step 4: News Intelligence
    yield { type: "progress", step: "Processing news sentiment", total: 14, current: 4 };
    const rawNews = await (0, news_1.fetchCompanyNews)(ticker);
    const newsIntelligence = await (0, news_1.classifyNewsSentiment)(rawNews, ticker);
    yield { type: "news_loaded", data: newsIntelligence, message: "Classified recent news events." };
    // Step 5: Competitor Benchmarking
    yield { type: "progress", step: "Benchmarking peers", total: 14, current: 5 };
    const competitorTickers = await (0, competitors_1.identifyCompetitors)(financials.company, ticker, financials.sector || "", financials.industry || "");
    const competitorsData = await (0, competitors_1.fetchCompetitorData)(competitorTickers);
    const targetCompetitorData = {
        ticker: financials.ticker,
        name: financials.company,
        marketCap: financials.marketCap ?? null,
        peRatio: financials.peRatio ?? null,
        profitMargin: financials.profitMargin ?? null,
        revenueGrowth: financials.revenueGrowth ?? null,
    };
    const competitorBenchmarks = (0, competitors_1.buildPeerComparison)(targetCompetitorData, competitorsData);
    yield { type: "competitors_loaded", data: competitorBenchmarks, message: `Benchmarked against ${competitorsData.length} peers.` };
    // Step 6: Evidence Layer
    yield { type: "progress", step: "Building evidence layer", total: 14, current: 6 };
    const evidenceStore = [
        ...(0, evidence_1.buildFinancialEvidence)(financials),
        ...(0, evidence_1.buildHistoricalEvidence)({
            revenueTrend: historical.revenueTrend,
            netIncomeTrend: historical.netIncomeTrend,
            debtTrend: historical.debtTrend,
            fcfTrend: historical.fcfTrend,
        }),
        ...(0, evidence_1.buildNewsEvidence)(newsIntelligence.topBullish, "positive"),
        ...(0, evidence_1.buildNewsEvidence)(newsIntelligence.topBearish, "negative"),
        ...(0, evidence_1.buildCompetitorEvidence)(competitorBenchmarks),
    ];
    yield { type: "evidence_built", count: evidenceStore.length, message: `Generated ${evidenceStore.length} normalized evidence items.` };
    // Step 7: Parallel Agents (LangGraph)
    yield { type: "progress", step: "Running AI agent swarm", total: 14, current: 7 };
    yield { type: "agents_started", message: "Dispatched Bull, Bear, Risk, Valuation, and News agents via LangGraph." };
    const context = {
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
    // Step 8: Quant Scoring Engine
    yield { type: "progress", step: "Calculating explainable scores", total: 14, current: 8 };
    const scoreBreakdown = (0, scoring_1.calculateAdvancedScores)(financials, riskProfile, agentOutputs, competitorBenchmarks);
    yield { type: "scoring_completed", score: scoreBreakdown.finalScore, message: `Quant score: ${scoreBreakdown.finalScore}/100` };
    // Step 9: Valuation Engine
    yield { type: "progress", step: "Running valuation engine", total: 14, current: 9 };
    const valuation = (0, valuation_1.calculateValuation)(financials, competitorsData);
    yield { type: "valuation_completed", status: valuation.status, message: `Valuation status: ${valuation.status}` };
    // Step 10: Scenario Analysis
    yield { type: "progress", step: "Generating Scenarios", total: 14, current: 10 };
    const scenarios = await (0, scenarios_1.generateScenarios)(ticker, financials, financials.company);
    yield { type: "scenarios_completed", message: "Bull, Base, Bear scenarios ready." };
    // Step 11: Judge Agent (already run in graph)
    yield { type: "progress", step: "Final Judge synthesis", total: 14, current: 11 };
    yield { type: "judge_completed", verdict: judge.finalVerdict, message: `Judge ruled: ${judge.finalVerdict}` };
    // Step 12: Confidence Score
    yield { type: "progress", step: "Assessing confidence", total: 14, current: 12 };
    const confidence = (0, confidence_1.calculateConfidence)(financials, historical, competitorsData, rawNews, { ...agentOutputs, judge });
    // Ensure judge verdict matches quant threshold logic unless judge is extremely confident
    let finalVerdict = scoreBreakdown.verdict;
    if (judge.finalConfidence > 85 && judge.finalVerdict !== finalVerdict) {
        finalVerdict = judge.finalVerdict; // Judge overrides
    }
    yield { type: "confidence_completed", confidence: confidence.score, message: `Confidence: ${confidence.level} (${confidence.score}/100)` };
    // Step 13: Claim Verification
    yield { type: "progress", step: "Verifying AI claims", total: 14, current: 13 };
    const auditTrail = (0, claimVerifier_1.verifyClaimsAndBuildAuditTrail)({ ...agentOutputs, judge }, evidenceStore);
    yield { type: "audit_completed", message: `Verified ${auditTrail.length} evidence-backed claims.` };
    // Construct Report
    const report = {
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
    // Step 14: What Changed
    yield { type: "progress", step: "Comparing previous report", total: 14, current: 14 };
    const whatChanged = await (0, reportComparison_1.compareWithPreviousReport)(report);
    report.whatChanged = whatChanged;
    yield { type: "comparison_completed", message: whatChanged.hasPreviousReport ? "Compared to past report." : "No previous report found." };
    yield { type: "complete", report, message: "Research Complete" };
}
