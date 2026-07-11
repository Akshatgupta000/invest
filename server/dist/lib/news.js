"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCompanyNews = fetchCompanyNews;
exports.classifyNewsSentiment = classifyNewsSentiment;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const llm_1 = require("./llm");
const zod_1 = require("zod");
const yahooFinance = new yahoo_finance2_1.default();
async function fetchCompanyNews(ticker) {
    try {
        const results = await yahooFinance.search(ticker, { newsCount: 30 });
        return (results.news ?? []).map((n) => ({
            id: `news_${Math.random().toString(36).substring(2, 9)}`,
            headline: n.title ?? "",
            publisher: n.publisher,
            link: n.link,
            providerPublishTime: n.providerPublishTime instanceof Date ? n.providerPublishTime.getTime() : n.providerPublishTime * 1000,
        }));
    }
    catch (err) {
        console.warn(`[News] Error fetching for ${ticker}:`, err);
        return [];
    }
}
async function classifyNewsSentiment(news, ticker) {
    const result = {
        topBullish: [],
        topBearish: [],
        neutral: [],
        overallSentiment: "neutral",
        sentimentScore: 0,
        majorEvents: [],
        evidenceIds: [],
    };
    if (news.length === 0)
        return result;
    // We will batch classify using LLM
    const prompt = `
    Analyze the following recent news headlines for ${ticker}.
    Determine the sentiment (bullish, bearish, neutral) and relevance.
    Provide a JSON object with:
    - topBullish: array of ids of up to 3 most bullish headlines
    - topBearish: array of ids of up to 3 most bearish headlines
    - neutral: array of ids of remaining relevant headlines
    - sentimentScore: number from -100 to 100 indicating overall sentiment
    - majorEvents: array of strings summarizing key events (max 3)

    Headlines:
    ${news.map((n) => `ID: ${n.id} | ${n.headline}`).join("\n")}
  `;
    const NewsClassificationSchema = zod_1.z.object({
        topBullish: zod_1.z.array(zod_1.z.string()).optional(),
        topBearish: zod_1.z.array(zod_1.z.string()).optional(),
        neutral: zod_1.z.array(zod_1.z.string()).optional(),
        sentimentScore: zod_1.z.number().optional(),
        majorEvents: zod_1.z.array(zod_1.z.string()).optional(),
    });
    try {
        const parsed = await (0, llm_1.callLLMWithSchema)(prompt, NewsClassificationSchema, 0.1);
        const getItems = (ids) => ids.map((id) => news.find((n) => n.id === id)).filter(Boolean);
        result.topBullish = getItems(parsed.topBullish || []);
        result.topBearish = getItems(parsed.topBearish || []);
        result.neutral = getItems(parsed.neutral || []);
        result.sentimentScore = parsed.sentimentScore || 0;
        result.majorEvents = parsed.majorEvents || [];
        result.overallSentiment = result.sentimentScore > 20 ? "positive" : result.sentimentScore < -20 ? "negative" : "neutral";
    }
    catch (err) {
        console.warn("[News] LLM classification failed, using fallback.", err);
        fallbackClassification(news, result);
    }
    return result;
}
function fallbackClassification(news, result) {
    let score = 0;
    for (const n of news) {
        const lower = n.headline.toLowerCase();
        if (lower.includes("surge") || lower.includes("beat") || lower.includes("up") || lower.includes("buy")) {
            if (result.topBullish.length < 3)
                result.topBullish.push(n);
            score += 15;
        }
        else if (lower.includes("down") || lower.includes("miss") || lower.includes("lawsuit") || lower.includes("sell")) {
            if (result.topBearish.length < 3)
                result.topBearish.push(n);
            score -= 15;
        }
        else {
            result.neutral.push(n);
        }
    }
    result.sentimentScore = Math.max(-100, Math.min(100, score));
    result.overallSentiment = result.sentimentScore > 20 ? "positive" : result.sentimentScore < -20 ? "negative" : "neutral";
}
