"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHistoricalData = fetchHistoricalData;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const yahooFinance = new yahoo_finance2_1.default();
function calculateTrend(dataPoints, metric) {
    if (dataPoints.length < 2)
        return undefined;
    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];
    let direction = "unavailable";
    if (last > first * 1.05)
        direction = "improving";
    else if (last < first * 0.95)
        direction = "declining";
    else
        direction = "stable";
    const percentChange = ((last - first) / Math.abs(first)) * 100;
    const summary = `${metric} has changed by ${percentChange.toFixed(1)}% over the period.`;
    return {
        metric,
        direction,
        values: dataPoints,
        summary,
        evidenceIds: [],
    };
}
async function fetchHistoricalData(ticker) {
    const result = {};
    try {
        const queryOptions = { period1: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) }; // 3 years ago
        let history = [];
        try {
            const chartResult = await yahooFinance.chart(ticker, queryOptions);
            history = chartResult.quotes ?? [];
        }
        catch (err) {
            console.warn(`[Historical] chart fetch failed for ${ticker}:`, err);
            history = [];
        }
        if (history && history.length > 0) {
            const currentPrice = history[history.length - 1].close;
            const getPriceAgo = (days) => {
                const targetDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                let closest = history[0];
                let minDiff = Infinity;
                for (const pt of history) {
                    const diff = Math.abs(pt.date.getTime() - targetDate.getTime());
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = pt;
                    }
                }
                return closest.close;
            };
            if (history.length >= 20)
                result.price1M = currentPrice / getPriceAgo(30) - 1;
            if (history.length >= 120)
                result.price6M = currentPrice / getPriceAgo(180) - 1;
            if (history.length >= 250)
                result.price1Y = currentPrice / getPriceAgo(365) - 1;
            if (history.length >= 750)
                result.price3Y = currentPrice / getPriceAgo(1095) - 1;
            // Max drawdown & Volatility (simple approx)
            let maxDrawdown = 0;
            let peak = history[0].high;
            const returns = [];
            for (let i = 1; i < history.length; i++) {
                if (history[i].high > peak)
                    peak = history[i].high;
                const drawdown = (peak - history[i].low) / peak;
                if (drawdown > maxDrawdown)
                    maxDrawdown = drawdown;
                returns.push((history[i].close - history[i - 1].close) / history[i - 1].close);
            }
            result.maxDrawdown = maxDrawdown;
            if (returns.length > 0) {
                const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
                const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
                result.volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
            }
        }
        // Try to get income statement for trends
        let quoteSummary = null;
        try {
            quoteSummary = await yahooFinance.quoteSummary(ticker, {
                modules: ["incomeStatementHistory", "balanceSheetHistory", "cashflowStatementHistory"],
            });
        }
        catch {
            quoteSummary = null;
        }
        if (quoteSummary) {
            const incomeHistory = quoteSummary.incomeStatementHistory?.incomeStatementHistory;
            if (incomeHistory && incomeHistory.length > 0) {
                const revs = incomeHistory.map((i) => i.totalRevenue).reverse().filter(Boolean);
                const netIncs = incomeHistory.map((i) => i.netIncome).reverse().filter(Boolean);
                if (revs.length > 1)
                    result.revenueTrend = calculateTrend(revs, "Revenue");
                if (netIncs.length > 1)
                    result.netIncomeTrend = calculateTrend(netIncs, "Net Income");
            }
            const balanceHistory = quoteSummary.balanceSheetHistory?.balanceSheetStatements;
            if (balanceHistory && balanceHistory.length > 0) {
                const debts = balanceHistory.map((b) => (b.shortLongTermDebt ?? 0) + (b.longTermDebt ?? 0)).reverse().filter(Boolean);
                // Note: For debt, improving means it went down
                if (debts.length > 1) {
                    const trend = calculateTrend(debts, "Total Debt");
                    if (trend) {
                        if (trend.direction === "improving")
                            trend.direction = "declining";
                        else if (trend.direction === "declining")
                            trend.direction = "improving";
                        result.debtTrend = trend;
                    }
                }
            }
            const cashFlowHistory = quoteSummary.cashflowStatementHistory?.cashflowStatements;
            if (cashFlowHistory && cashFlowHistory.length > 0) {
                const ops = cashFlowHistory.map((c) => c.totalCashFromOperatingActivities ?? 0).reverse().filter(Boolean);
                if (ops.length > 1)
                    result.fcfTrend = calculateTrend(ops, "Operating Cash Flow");
            }
        }
    }
    catch (err) {
        console.warn(`[Historical] Error fetching for ${ticker}:`, err);
    }
    return result;
}
