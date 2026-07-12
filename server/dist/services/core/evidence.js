function createId() {
    // Using a simple random string for evidence IDs
    return Math.random().toString(36).substring(2, 9);
}
export function createEvidenceItem(params) {
    return {
        ...params,
        id: `ev_${createId()}`,
        retrievedAt: Date.now(),
    };
}
export function buildFinancialEvidence(snapshot) {
    const evidence = [];
    const add = (title, value, metric, direction, interpretation, unit) => {
        if (value !== null && value !== undefined) {
            evidence.push(createEvidenceItem({
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
            }));
        }
    };
    // Profitability
    add("Net Margin", snapshot.profitMargin, "profitMargin", (snapshot.profitMargin ?? 0) > 0.1 ? "positive" : (snapshot.profitMargin ?? 0) < 0 ? "negative" : "neutral", "Indicator of overall profitability.", "%");
    add("Operating Margin", snapshot.operatingMargin, "operatingMargin", (snapshot.operatingMargin ?? 0) > 0.1 ? "positive" : (snapshot.operatingMargin ?? 0) < 0 ? "negative" : "neutral", "Indicator of core business profitability.", "%");
    add("Gross Margin", snapshot.grossMargin, "grossMargin", (snapshot.grossMargin ?? 0) > 0.4 ? "positive" : (snapshot.grossMargin ?? 0) < 0.2 ? "negative" : "neutral", "Revenue remaining after cost of goods sold.", "%");
    add("Return on Equity", snapshot.returnOnEquity, "returnOnEquity", (snapshot.returnOnEquity ?? 0) > 0.15 ? "positive" : (snapshot.returnOnEquity ?? 0) < 0 ? "negative" : "neutral", "Efficiency of shareholder equity usage.", "%");
    add("Return on Assets", snapshot.returnOnAssets, "returnOnAssets", (snapshot.returnOnAssets ?? 0) > 0.05 ? "positive" : (snapshot.returnOnAssets ?? 0) < 0 ? "negative" : "neutral", "Efficiency of asset usage.", "%");
    // Revenue & Earnings
    add("Total Revenue (Annual)", snapshot.totalRevenue, "totalRevenue", "neutral", "Trailing twelve months total revenue.", "USD");
    add("Revenue Growth (YoY)", snapshot.revenueGrowth, "revenueGrowth", (snapshot.revenueGrowth ?? 0) > 0.1 ? "positive" : (snapshot.revenueGrowth ?? 0) < 0 ? "negative" : "neutral", "Year-over-year revenue growth rate.", "%");
    add("Earnings Growth (YoY)", snapshot.earningsGrowth, "earningsGrowth", (snapshot.earningsGrowth ?? 0) > 0.1 ? "positive" : (snapshot.earningsGrowth ?? 0) < 0 ? "negative" : "neutral", "Year-over-year earnings growth rate.", "%");
    add("Trailing EPS", snapshot.trailingEps, "trailingEps", (snapshot.trailingEps ?? 0) > 0 ? "positive" : "negative", "Earnings per share (trailing 12 months).", "USD");
    add("Forward EPS", snapshot.forwardEps, "forwardEps", (snapshot.forwardEps ?? 0) > (snapshot.trailingEps ?? 0) ? "positive" : "neutral", "Estimated earnings per share (next 12 months).", "USD");
    // Valuation
    add("P/E Ratio (Trailing)", snapshot.peRatio, "peRatio", (snapshot.peRatio ?? 0) < 15 ? "positive" : (snapshot.peRatio ?? 0) > 30 ? "negative" : "neutral", "Trailing 12-month price-to-earnings multiple.");
    add("Forward P/E", snapshot.forwardPE, "forwardPE", (snapshot.forwardPE ?? 0) < 15 ? "positive" : (snapshot.forwardPE ?? 0) > 30 ? "negative" : "neutral", "Expected price-to-earnings multiple.");
    add("Free Cash Flow", snapshot.freeCashFlow, "freeCashFlow", (snapshot.freeCashFlow ?? 0) > 0 ? "positive" : "negative", "Cash generated after capital expenditures.", "USD");
    // Health
    // D/E is now stored as a real ratio (1.73), not Yahoo's raw integer (173)
    add("Debt to Equity", snapshot.debtToEquity, "debtToEquity", (snapshot.debtToEquity ?? 0) > 1.5 ? "negative" : (snapshot.debtToEquity ?? 0) < 0.5 ? "positive" : "neutral", "Measure of financial leverage (ratio).");
    add("Current Ratio", snapshot.currentRatio, "currentRatio", (snapshot.currentRatio ?? 0) > 1.5 ? "positive" : (snapshot.currentRatio ?? 0) < 1 ? "negative" : "neutral", "Short-term liquidity: current assets / current liabilities.");
    add("Total Debt", snapshot.totalDebt, "totalDebt", (snapshot.totalDebt ?? 0) > 5e9 ? "negative" : "neutral", "Total outstanding debt.", "USD");
    add("Total Cash", snapshot.totalCash, "totalCash", (snapshot.totalCash ?? 0) > 1e9 ? "positive" : "neutral", "Total cash and equivalents.", "USD");
    return evidence;
}
export function buildHistoricalEvidence(trends) {
    const evidence = [];
    for (const [key, trend] of Object.entries(trends)) {
        if (trend && trend.direction !== "unavailable") {
            evidence.push(createEvidenceItem({
                type: "historical",
                title: `${trend.metric} Trend`,
                value: trend.direction,
                source: "Yahoo Finance",
                relatedMetric: key,
                importance: "medium",
                direction: trend.direction === "improving" ? "positive" : trend.direction === "declining" ? "negative" : "neutral",
                interpretation: trend.summary,
                confidence: "medium",
            }));
        }
    }
    return evidence;
}
export function buildNewsEvidence(newsItems, sentiment) {
    return newsItems.map((news) => createEvidenceItem({
        type: "news",
        title: `News: ${news.headline.substring(0, 50)}...`,
        value: sentiment,
        source: news.publisher || "News Source",
        sourceUrl: news.link,
        importance: "medium",
        direction: sentiment,
        interpretation: news.summary || "Recent news event.",
        confidence: "medium",
    }));
}
export function buildCompetitorEvidence(benchmarks) {
    return benchmarks.map((bm) => createEvidenceItem({
        type: "competitor",
        title: `Peer Benchmark: ${bm.category}`,
        value: `Rank ${bm.targetRank} of ${bm.totalPeers}`,
        source: "Competitor Analysis",
        importance: "medium",
        direction: bm.percentile >= 50 ? "positive" : "negative",
        interpretation: bm.explanation,
        confidence: "high",
    }));
}
export function getEvidenceByMetric(evidence, metric) {
    return evidence.filter((e) => e.relatedMetric === metric);
}
export function getPositiveEvidence(evidence) {
    return evidence.filter((e) => e.direction === "positive");
}
export function getNegativeEvidence(evidence) {
    return evidence.filter((e) => e.direction === "negative");
}
