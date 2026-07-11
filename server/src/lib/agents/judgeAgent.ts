import { AgentContext, runAgent } from "./baseAgent";
import { JudgeOutputSchema } from "../validation/agentSchemas";
import { AgentOutput } from "../types/research";

export async function runJudgeAgent(
  context: AgentContext,
  agentOutputs: {
    bull: AgentOutput;
    bear: AgentOutput;
    risk: AgentOutput;
    valuation: AgentOutput;
    news: AgentOutput;
  }
) {
  const prompt = `
    You are the Judge Agent, the final decision-maker.
    You must synthesize the arguments from the Bull, Bear, Risk, Valuation, and News agents.
    
    Consider the user's risk profile: ${context.riskProfile}.
    A conservative profile demands strong valuation and low risk.
    An aggressive profile accepts high risk and high valuation for massive growth.
    
    Your task:
    1. Weigh the pros (bull, news) vs cons (bear, risk).
    2. Incorporate the valuation reality.
    3. Determine the final verdict: INVEST, WATCHLIST, or PASS.
    4. Provide a confidence score (0-100) on your verdict.
    
    If data is missing or agents disagree wildly, lower your confidence.
  `;
  
  return runAgent("judge", context, prompt, JudgeOutputSchema, agentOutputs);
}
