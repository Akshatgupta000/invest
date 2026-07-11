"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgent = runAgent;
const groq_1 = require("@langchain/groq");
const google_genai_1 = require("@langchain/google-genai");
const mistralai_1 = require("@langchain/mistralai");
const cohere_1 = require("@langchain/cohere");
const delay = (ms) => new Promise(res => setTimeout(res, ms));
/**
 * Builds the full model fallback chain in priority order.
 * Models are tried one-by-one if a previous one fails.
 * Priority: Groq (fast) → Gemini → Mistral → Cohere → Groq small (last resort)
 */
function getModelChain(temperature = 0.2) {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const mistralKey = process.env.MISTRAL_API_KEY;
    const cohereKey = process.env.COHERE_API_KEY;
    const models = [];
    // 1. Groq - fastest, free, great for structured output
    if (groqKey) {
        models.push(new groq_1.ChatGroq({
            apiKey: groqKey,
            model: "llama-3.3-70b-versatile",
            temperature,
            // @ts-ignore
            maxRetries: 1,
        }));
    }
    // 2. Gemini - generous token limits, great quality
    if (geminiKey) {
        models.push(new google_genai_1.ChatGoogleGenerativeAI({
            apiKey: geminiKey,
            model: "gemini-2.0-flash",
            temperature,
            // @ts-ignore
            maxRetries: 1,
        }));
    }
    // 3. Mistral - good structured output support
    if (mistralKey) {
        models.push(new mistralai_1.ChatMistralAI({
            apiKey: mistralKey,
            model: "mistral-small-latest",
            temperature,
            // @ts-ignore
            maxRetries: 1,
        }));
    }
    // 4. Cohere - reliable fallback
    if (cohereKey) {
        models.push(new cohere_1.ChatCohere({
            apiKey: cohereKey,
            model: "command-r",
            temperature,
            // @ts-ignore
            maxRetries: 1,
        }));
    }
    // 5. Last resort: Groq smaller model (less likely to hit TPM limits)
    if (groqKey) {
        models.push(new groq_1.ChatGroq({
            apiKey: groqKey,
            model: "llama-3.1-8b-instant",
            temperature,
            // @ts-ignore
            maxRetries: 2,
        }));
    }
    // 6. Gemini 1.5 flash as final fallback
    if (geminiKey) {
        models.push(new google_genai_1.ChatGoogleGenerativeAI({
            apiKey: geminiKey,
            model: "gemini-1.5-flash",
            temperature,
            // @ts-ignore
            maxRetries: 2,
        }));
    }
    return models;
}
/**
 * Calls LLM with structured output. Tries each model in turn if one fails.
 * Handles rate limits with exponential backoff between model attempts.
 */
async function callWithFallback(prompt, schema, temperature = 0.2) {
    const models = getModelChain(temperature);
    if (models.length === 0) {
        throw new Error("No LLM API keys found. Add at least one of GROQ_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, or COHERE_API_KEY to your .env.local file.");
    }
    let lastError;
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const modelName = model.constructor.name;
        try {
            const structuredLlm = model.withStructuredOutput(schema, { name: "AgentOutput" });
            const result = await structuredLlm.invoke(prompt);
            console.log(`[LLM] ✓ Success with ${modelName} (attempt ${i + 1}/${models.length})`);
            return result;
        }
        catch (err) {
            lastError = err;
            const isRateLimit = err?.status === 429 ||
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
async function runAgent(role, context, systemPrompt, schema, otherOutputs) {
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
        const result = await callWithFallback(prompt, schema, 0.2);
        return result;
    }
    catch (err) {
        console.error(`[Agent ${role}] ALL models failed:`, err);
        return generateFallback(role);
    }
}
function generateFallback(role) {
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
