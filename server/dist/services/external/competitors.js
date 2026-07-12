import { fetchFinancialData } from "./finance";
import { callLLMWithSchema } from "../ai/llm";
import { z } from "zod";
export async function identifyCompetitors(company, ticker, sector, industry) {
    const prompt = `
    You are a financial analyst. Given the company ${company} (${ticker}) in the ${sector || 'unknown'} sector and ${industry || 'unknown'} industry,
    identify 3 to 5 major publicly traded competitors. 
    Return ONLY a JSON array of their ticker symbols (e.g. ["MSFT", "GOOGL"]). Return nothing else.
  `;
    try {
        const parsed = await callLLMWithSchema(prompt, z.array(z.string()), 0.1);
        if (Array.isArray(parsed) && parsed.length > 0)
            return parsed.slice(0, 5);
    }
    catch (err) {
        console.warn(`[Competitors] LLM failed for ${ticker}:`, err);
    }
    return []; // Fallback to empty
}
export async function fetchCompetitorData(tickers) {
    const competitors = [];
    for (const ct of tickers) {
        try {
            const cdata = await fetchFinancialData(ct);
            competitors.push({
                ticker: cdata.ticker,
                name: cdata.company,
                marketCap: cdata.marketCap,
                peRatio: cdata.peRatio,
                profitMargin: cdata.profitMargin ?? null,
                revenueGrowth: cdata.revenueGrowth ?? null,
            });
        }
        catch {
            console.warn(`[Competitors] Could not fetch data for peer ${ct}`);
        }
    }
    return competitors;
}
export function buildPeerComparison(target, peers) {
    const benchmarks = [];
    const all = [target, ...peers];
    const rankMetric = (category, metricAccessor, higherIsBetter, explanationBuilder) => {
        const valid = all.filter((c) => metricAccessor(c) !== null && metricAccessor(c) !== undefined);
        if (valid.length < 2)
            return; // Not enough peers for comparison
        valid.sort((a, b) => {
            const valA = metricAccessor(a);
            const valB = metricAccessor(b);
            return higherIsBetter ? valB - valA : valA - valB;
        });
        const targetIndex = valid.findIndex((c) => c.ticker === target.ticker);
        if (targetIndex === -1)
            return;
        const rank = targetIndex + 1;
        const total = valid.length;
        const percentile = ((total - rank) / (total - 1)) * 100;
        const isGood = rank <= Math.ceil(total / 2);
        benchmarks.push({
            category,
            targetRank: rank,
            totalPeers: total,
            percentile,
            explanation: explanationBuilder(rank, total, isGood),
            evidenceIds: [],
        });
    };
    rankMetric("Valuation (P/E)", (c) => c.peRatio, false, // lower PE is better for value
    (rank, total, isGood) => isGood ? `Attractive valuation compared to peers (Rank ${rank}/${total}).` : `Relatively expensive valuation vs peers (Rank ${rank}/${total}).`);
    rankMetric("Profitability (Net Margin)", (c) => c.profitMargin, true, // higher margin is better
    (rank, total, isGood) => isGood ? `Strong profitability compared to peers (Rank ${rank}/${total}).` : `Below average profitability vs peers (Rank ${rank}/${total}).`);
    rankMetric("Growth (Revenue)", (c) => c.revenueGrowth, true, // higher growth is better
    (rank, total, isGood) => isGood ? `Leading revenue growth among peers (Rank ${rank}/${total}).` : `Lugging behind peers in revenue growth (Rank ${rank}/${total}).`);
    return benchmarks;
}
