import { callLLM } from "../llm";
import { FinancialSnapshot, CompetitorBenchmark, HistoricalFinancials, NewsSentiment, EvidenceItem, RiskProfile, AgentRole, AgentOutput, JudgeOutput } from "../types/research";
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
    otherAgentOutputs: otherOutputs // Used only for judge
  }, null, 2);

  const prompt = `
    ${systemPrompt}
    
    Context Data:
    ${contextStr}
    
    IMPORTANT: You must return valid JSON matching the required schema.
    For evidenceIds, ONLY use IDs from the provided evidence array. DO NOT make up evidence IDs.
  `;

  try {
    const res = await callLLM({
      task: `Agent_${role}`,
      messages: [{ role: "user", content: prompt }],
      responseFormat: "json",
      temperature: 0.2,
    });

    if (res.success) {
      const match = res.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        // Validate
        const valid = schema.safeParse(parsed);
        if (valid.success) {
          return valid.data;
        } else {
          console.warn(`[Agent ${role}] Schema validation failed:`, valid.error.message);
        }
      }
    }
  } catch (err) {
    console.warn(`[Agent ${role}] Execution failed:`, err);
  }

  // Fallback
  return generateFallback(role) as unknown as T;
}

function generateFallback(role: AgentRole) {
  if (role === "judge") {
    return {
      role: "judge",
      summary: "Analysis incomplete due to internal error.",
      thesis: "Cannot form a reliable thesis.",
      arguments: [],
      concerns: ["Agent execution failure"],
      missingData: ["All perspectives"],
      scoreBias: 0,
      finalVerdict: "PASS",
      finalConfidence: 0,
    };
  }
  return {
    role,
    summary: "Analysis unavailable.",
    thesis: "N/A",
    arguments: [],
    concerns: ["Agent failure"],
    missingData: ["Analysis data"],
    scoreBias: 0,
  };
}
