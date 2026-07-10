/**
 * Financial data fetching utilities using yahoo-finance2
 * Returns structured data for the AI agent to analyze.
 */

import YahooFinance from "yahoo-finance2";
import { FinancialSnapshot, CompanyIdentity } from "./types/research";

const yahooFinance = new YahooFinance();

export interface FinancialData extends FinancialSnapshot {
  ticker: string;
  company: string;
  change: number | null;
  changePercent: number | null;
  eps: number | null;
  averageVolume: number | null;
  sector: string | null;
  industry: string | null;
  description: string | null;
}

export interface NewsItem {
  headline: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
}

export async function findTicker(query: string): Promise<string | null> {
  try {
    const results = await yahooFinance.search(query);
    const quotes = results.quotes ?? [];
    const equity = quotes.find((q: any) => q.typeDisp === "Equity" && q.symbol);
    if (equity && "symbol" in equity) return equity.symbol as string;
    if (quotes.length > 0 && "symbol" in quotes[0]) return (quotes[0] as any).symbol as string;
    return null;
  } catch {
    return null;
  }
}

export async function fetchFinancialData(ticker: string): Promise<FinancialData> {
  const [quoteSummary, newsData] = await Promise.allSettled([
    yahooFinance.quoteSummary(ticker, {
      modules: [
        "price",
        "summaryProfile",
        "financialData",
        "defaultKeyStatistics",
        "incomeStatementHistory",
        "cashflowStatementHistory",
      ],
    }),
    yahooFinance.search(ticker, { newsCount: 8 }),
  ]);

  const summary = quoteSummary.status === "fulfilled" ? quoteSummary.value : null;
  const news: NewsItem[] =
    newsData.status === "fulfilled"
      ? (newsData.value.news ?? []).map((n: any) => ({
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

export function normalizeYahooFinancialData(raw: any): FinancialSnapshot {
  const price = raw?.price;
  const financials = raw?.financials;
  const keyStats = raw?.keyStats;

  return {
    price: price?.regularMarketPrice ?? null,
    currency: price?.currency ?? "USD",
    marketCap: price?.marketCap ?? null,
    enterpriseValue: keyStats?.enterpriseValue ?? null,
    peRatio: keyStats?.forwardPE ?? financials?.currentPrice ?? null, // using forwardPE if trailing not available
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
    revenueGrowth: financials?.revenueGrowth ?? null,
    earningsGrowth: financials?.earningsGrowth ?? null,
    freeCashFlow: financials?.freeCashflow ?? null,
    operatingCashFlow: financials?.operatingCashflow ?? null,
    totalDebt: financials?.totalDebt ?? null,
    totalCash: financials?.totalCash ?? null,
    debtToEquity: financials?.debtToEquity ?? null,
    currentRatio: financials?.currentRatio ?? null,
    beta: (keyStats?.beta as any) ?? null,
    dividendYield: (keyStats?.dividendYield as any) ?? null,
    fiftyTwoWeekHigh: (price as any)?.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: (price as any)?.fiftyTwoWeekLow ?? null,
    analystTargetPrice: financials?.targetMeanPrice ?? null,
    recommendationKey: financials?.recommendationKey ?? null,
  };
}

export function formatLargeNumber(num: number | null): string {
  if (num === null || num === undefined) return "N/A";
  const abs = Math.abs(num);
  if (abs >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

export function formatPercent(num: number | null): string {
  if (num === null || num === undefined) return "N/A";
  return `${(num * 100).toFixed(1)}%`;
}
