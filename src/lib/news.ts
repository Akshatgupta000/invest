import YahooFinance from "yahoo-finance2";
import { NewsItem, NewsSentiment } from "./types/research";
import { callLLMWithSchema } from "./llm";
import { z } from "zod";

const yahooFinance = new YahooFinance();

export async function fetchCompanyNews(ticker: string): Promise<NewsItem[]> {
  try {
    const results = await yahooFinance.search(ticker, { newsCount: 15 });
    return (results.news ?? []).map((n: any) => ({
      id: `news_${Math.random().toString(36).substring(2, 9)}`,
      headline: n.title ?? "",
      publisher: n.publisher,
      link: n.link,
      providerPublishTime: n.providerPublishTime instanceof Date ? n.providerPublishTime.getTime() : (n.providerPublishTime as number) * 1000,
    }));
  } catch (err) {
    console.warn(`[News] Error fetching for ${ticker}:`, err);
    return [];
  }
}

export async function classifyNewsSentiment(news: NewsItem[], ticker: string): Promise<NewsSentiment> {
  const result: NewsSentiment = {
    topBullish: [],
    topBearish: [],
    neutral: [],
    overallSentiment: "neutral",
    sentimentScore: 0,
    majorEvents: [],
    evidenceIds: [],
  };

  if (news.length === 0) return result;

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

  const NewsClassificationSchema = z.object({
    topBullish: z.array(z.string()).optional(),
    topBearish: z.array(z.string()).optional(),
    neutral: z.array(z.string()).optional(),
    sentimentScore: z.number().optional(),
    majorEvents: z.array(z.string()).optional(),
  });

  try {
    const parsed = await callLLMWithSchema(prompt, NewsClassificationSchema, 0.1);
      
    const getItems = (ids: string[]) => ids.map((id) => news.find((n) => n.id === id)).filter(Boolean) as NewsItem[];
    
    result.topBullish = getItems(parsed.topBullish || []);
    result.topBearish = getItems(parsed.topBearish || []);
    result.neutral = getItems(parsed.neutral || []);
    result.sentimentScore = parsed.sentimentScore || 0;
    result.majorEvents = parsed.majorEvents || [];
    result.overallSentiment = result.sentimentScore > 20 ? "positive" : result.sentimentScore < -20 ? "negative" : "neutral";
  } catch (err) {
    console.warn("[News] LLM classification failed, using fallback.", err);
    fallbackClassification(news, result);
  }

  return result;
}

function fallbackClassification(news: NewsItem[], result: NewsSentiment) {
    let score = 0;
    for (const n of news) {
        const lower = n.headline.toLowerCase();
        if (lower.includes("surge") || lower.includes("beat") || lower.includes("up") || lower.includes("buy")) {
            if (result.topBullish.length < 3) result.topBullish.push(n);
            score += 15;
        } else if (lower.includes("down") || lower.includes("miss") || lower.includes("lawsuit") || lower.includes("sell")) {
            if (result.topBearish.length < 3) result.topBearish.push(n);
            score -= 15;
        } else {
            result.neutral.push(n);
        }
    }
    result.sentimentScore = Math.max(-100, Math.min(100, score));
    result.overallSentiment = result.sentimentScore > 20 ? "positive" : result.sentimentScore < -20 ? "negative" : "neutral";
}
