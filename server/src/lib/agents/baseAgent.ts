import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { FinancialSnapshot, CompetitorBenchmark, HistoricalFinancials, NewsSentiment, EvidenceItem, RiskProfile, AgentRole } from "../types/research";
import { z } from "zod";

export interface AgentContext {
  companyName: string;
  ticker: string;
  snapshot: FinancialSnapshot;
  historical: HistoricalFinancials;
  competitors: CompetitorBenchmark[];
  news: NewsSentiment;
  evidence: EvidenceItem[];
  riskProfile: RiskProfile;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Builds the full model fallback chain in priority order.
 * Models are tried one-by-one if a previous one fails.
 * Priority: Groq (fast) → Gemini → Mistral → Cohere → Groq small (last resort)
 */
function getModelChain(temperature = 0.2): BaseChatModel[] {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const cohereKey = process.env.COHERE_API_KEY;

  const models: BaseChatModel[] = [];

  // 1. Groq - fastest, free, great for structured output
  if (groqKey) {
    models.push(new ChatGroq({
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
      temperature,
      // @ts-ignore
      maxRetries: 1,
    }) as unknown as BaseChatModel);
  }

  // 2. Gemini - generous token limits, great quality
  if (geminiKey) {
    models.push(new ChatGoogleGenerativeAI({
      apiKey: geminiKey,
      model: "gemini-2.0-flash",
      temperature,
      // @ts-ignore
      maxRetries: 1,
    }) as unknown as BaseChatModel);
  }

  // 3. Mistral - good structured output support
  if (mistralKey) {
    models.push(new ChatMistralAI({
      apiKey: mistralKey,
      model: "mistral-small-latest",
      temperature,
      // @ts-ignore
      maxRetries: 1,
    }) as unknown as BaseChatModel);
  }

  // 4. Cohere - reliable fallback
  if (cohereKey) {
    models.push(new ChatCohere({
      apiKey: cohereKey,
      model: "command-r",
      temperature,
      // @ts-ignore
      maxRetries: 1,
    }) as unknown as BaseChatModel);
  }

  // 5. Last resort: Groq smaller model (less likely to hit TPM limits)
  if (groqKey) {
    models.push(new ChatGroq({
      apiKey: groqKey,
      model: "llama-3.1-8b-instant",
      temperature,
      // @ts-ignore
      maxRetries: 2,
    }) as unknown as BaseChatModel);
  }

  // 6. Gemini 1.5 flash as final fallback
  if (geminiKey) {
    models.push(new ChatGoogleGenerativeAI({
      apiKey: geminiKey,
      model: "gemini-1.5-flash",
      temperature,
      // @ts-ignore
      maxRetries: 2,
    }) as unknown as BaseChatModel);
  }

  return models;
}

/**
 * Calls LLM with structured output. Tries each model in turn if one fails.
 * Handles rate limits with exponential backoff between model attempts.
 */
async function callWithFallback<T>(
  prompt: string,
  schema: z.ZodType<T>,
  temperature = 0.2
): Promise<T> {
  const models = getModelChain(temperature);
  if (models.length === 0) {
    throw new Error(
      "No LLM API keys found. Add at least one of GROQ_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, or COHERE_API_KEY to your .env.local file."
    );
  }

  let lastError: any;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const modelName = model.constructor.name;
    try {
      const structuredLlm = model.withStructuredOutput(schema, { name: "AgentOutput" });
      const result = await structuredLlm.invoke(prompt);
      console.log(`[LLM] ✓ Success with ${modelName} (attempt ${i + 1}/${models.length})`);
      return result as T;
    } catch (err: any) {
      lastError = err;
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.toLowerCase().includes("rate limit") ||
        err?.message?.toLowerCase().includes("quota") ||
        err?.message?.toLowerCase().includes("too many");

      console.warn(`[LLM] ✗ ${modelName} failed (attempt ${i + 1}/${models.length}): ${err?.message?.slice(0, 120)}`);

      if (i < models.length - 1) {
        const waitMs = isRateLimit ? (i + 1) * 4000 : 500;
        if (isRateLimit) {
          console.warn(`[LLM] Rate limited. Waiting ${waitMs / 1000}s before trying next model...`);
        }
        await delay(waitMs);
      }
    }
  }

  throw lastError;
}

export async function runAgent<T>(
  role: AgentRole,
  context: AgentContext,
  systemPrompt: string,
  schema: z.ZodType<T>,
  otherOutputs?: any
): Promise<T> {
  const contextStr = JSON.stringify({
    company: context.companyName,
    ticker: context.ticker,
    riskProfile: context.riskProfile,
    financials: context.snapshot,
    historical: context.historical,
    competitors: context.competitors,
    news: { overallSentiment: context.news.overallSentiment, score: context.news.sentimentScore },
    evidence: context.evidence.map(e => ({ id: e.id, title: e.title, value: e.value, direction: e.direction })),
    otherAgentOutputs: otherOutputs
  }, null, 2);

  const prompt = `
    ${systemPrompt}
    
    Context Data:
    ${contextStr}
    
    IMPORTANT: 
    - Return valid data matching the required schema exactly.
    - For evidenceIds, ONLY use IDs from the provided evidence array. DO NOT fabricate IDs.
    - Keep responses precise and analytical.
  `;

  // Stagger each agent to spread API load across time (0–6s random delay)
  const staggerMs = Math.random() * 6000;
  await delay(staggerMs);

  try {
    const result = await callWithFallback<T>(prompt, schema, 0.2);
    return result;
  } catch (err) {
    console.error(`[Agent ${role}] ALL models failed:`, err);
    return generateFallback(role) as unknown as T;
  }
}

function generateFallback(role: AgentRole) {
  if (role === "judge") {
    return {
      role: "judge",
      summary: "Analysis incomplete — all AI models failed or are rate limited. Please try again in 30 seconds.",
      thesis: "Cannot form a reliable thesis without complete agent analysis.",
      arguments: [],
      concerns: ["All LLM providers rate limited or errored"],
      missingData: ["All agent perspectives"],
      scoreBias: 0,
      finalVerdict: "PASS",
      finalConfidence: 0,
    };
  }
  return {
    role,
    summary: "Analysis unavailable — API rate limit or model error. Try again in 30 seconds.",
    thesis: "N/A",
    arguments: [],
    concerns: ["Rate limit or model timeout on all providers"],
    missingData: ["Full financial analysis"],
    scoreBias: 0,
  };
}
