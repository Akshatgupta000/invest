/**
 * Financial data fetching utilities using yahoo-finance2
 * Returns structured data for the AI agent to analyze.
 */
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
export async function findTicker(query) {
    try {
        const results = await yahooFinance.search(query);
        const quotes = results.quotes ?? [];
        const equity = quotes.find((q) => q.typeDisp === "Equity" && q.symbol);
        if (equity && "symbol" in equity)
            return equity.symbol;
        if (quotes.length > 0 && "symbol" in quotes[0])
            return quotes[0].symbol;
        return null;
    }
    catch {
        return null;
    }
}
export async function fetchFinancialData(ticker) {
    const [quoteSummary, newsData] = await Promise.allSettled([
        yahooFinance.quoteSummary(ticker, {
            modules: [
                "price",
                "summaryProfile",
                "financialData",
                "defaultKeyStatistics",
                "incomeStatementHistory",
                "cashflowStatementHistory",
                "earningsTrend",
            ],
        }),
        yahooFinance.search(ticker, { newsCount: 8 }),
    ]);
    const summary = quoteSummary.status === "fulfilled" ? quoteSummary.value : null;
    const news = newsData.status === "fulfilled"
        ? (newsData.value.news ?? []).map((n) => ({
            headline: n.title ?? "",
            publisher: n.publisher,
            link: n.link,
            providerPublishTime: n.providerPublishTime instanceof Date ? n.providerPublishTime.getTime() : n.providerPublishTime,
        }))
        : [];
    const price = summary?.price;
    const profile = summary?.summaryProfile;
    const financials = summary?.financialData;
    const keyStats = summary?.defaultKeyStatistics;
    const rawData = { price, profile, financials, keyStats };
    const snapshot = normalizeYahooFinancialData(rawData);
    return {
        ...snapshot,
        ticker,
        company: price?.longName ?? price?.shortName ?? ticker,
        change: price?.regularMarketChange ?? null,
        changePercent: price?.regularMarketChangePercent ?? null,
        eps: keyStats?.trailingEps ?? null,
        averageVolume: price?.averageDailyVolume3Month ?? null,
        sector: profile?.sector ?? null,
        industry: profile?.industry ?? null,
        description: profile?.longBusinessSummary ?? null,
    };
}
export function normalizeYahooFinancialData(raw) {
    const price = raw?.price;
    const financials = raw?.financials;
    const keyStats = raw?.keyStats;
    // Yahoo Finance returns D/E as an integer scaled by 100 (e.g. 173 = 1.73x)
    // We normalise to the actual ratio here once, so all downstream code is correct.
    const rawDE = financials?.debtToEquity;
    const normalizedDE = rawDE != null ? rawDE / 100 : null;
    return {
        price: price?.regularMarketPrice ?? null,
        currency: price?.currency ?? "USD",
        marketCap: price?.marketCap ?? null,
        enterpriseValue: keyStats?.enterpriseValue ?? null,
        // Use trailing P/E (actual past earnings). Fall back to forward P/E only if missing.
        peRatio: keyStats?.trailingPE ?? keyStats?.forwardPE ?? null,
        forwardPE: keyStats?.forwardPE ?? null,
        pegRatio: keyStats?.pegRatio ?? null,
        priceToSales: keyStats?.priceToSalesTrailing12Months ?? null,
        priceToBook: keyStats?.priceToBook ?? null,
        evToEbitda: keyStats?.enterpriseToEbitda ?? null,
        profitMargin: financials?.profitMargins ?? null,
        operatingMargin: financials?.operatingMargins ?? null,
        grossMargin: financials?.grossMargins ?? null,
        returnOnEquity: financials?.returnOnEquity ?? null,
        returnOnAssets: financials?.returnOnAssets ?? null,
        totalRevenue: financials?.totalRevenue ?? null,
        revenueGrowth: financials?.revenueGrowth ?? null,
        earningsGrowth: financials?.earningsGrowth ?? null,
        freeCashFlow: financials?.freeCashflow ?? null,
        operatingCashFlow: financials?.operatingCashflow ?? null,
        totalDebt: financials?.totalDebt ?? null,
        totalCash: financials?.totalCash ?? null,
        debtToEquity: normalizedDE,
        currentRatio: financials?.currentRatio ?? null,
        beta: keyStats?.beta ?? null,
        dividendYield: keyStats?.dividendYield ?? null,
        fiftyTwoWeekHigh: price?.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: price?.fiftyTwoWeekLow ?? null,
        analystTargetPrice: financials?.targetMeanPrice ?? null,
        recommendationKey: financials?.recommendationKey ?? null,
        trailingEps: keyStats?.trailingEps ?? null,
        forwardEps: keyStats?.forwardEps ?? null,
    };
}
export function formatLargeNumber(num) {
    if (num === null || num === undefined)
        return "N/A";
    const abs = Math.abs(num);
    if (abs >= 1e12)
        return `$${(num / 1e12).toFixed(2)}T`;
    if (abs >= 1e9)
        return `$${(num / 1e9).toFixed(2)}B`;
    if (abs >= 1e6)
        return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
}
export function formatPercent(num) {
    if (num === null || num === undefined)
        return "N/A";
    return `${(num * 100).toFixed(1)}%`;
}
