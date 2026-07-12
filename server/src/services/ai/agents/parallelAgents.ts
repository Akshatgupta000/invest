import { AgentContext, runAgent } from "./baseAgent";
import { AgentOutputSchema } from "../../../utils/validation/agentSchemas";

export async function runBullAgent(context: AgentContext) {
  const prompt = `
    You are the Bull Agent. Your role is to build the strongest possible positive case for investing in ${context.companyName}.
    Focus heavily on:
    - Growth drivers (revenue, earnings)
    - Profitability strength
    - Competitive advantages
    - Positive momentum in historical trends
    - Valuation upside
    - Bullish news catalysts

    Provide a positive scoreBias (0 to 100, where 100 is extremely bullish).
  `;
  return runAgent("bull", context, prompt, AgentOutputSchema);
}

export async function runBearAgent(context: AgentContext) {
  const prompt = `
    You are the Bear Agent. Your role is to build the strongest possible negative case against investing in ${context.companyName}.
    Focus heavily on:
    - Overvaluation risks
    - Declining historical trends
    - Weak growth or shrinking margins
    - Debt pressure
    - Competitive threats
    - Bearish news catalysts

    Provide a negative scoreBias (0 to -100, where -100 is extremely bearish).
  `;
  return runAgent("bear", context, prompt, AgentOutputSchema);
}

export async function runRiskAgent(context: AgentContext) {
  const prompt = `
    You are the Risk Agent. Your role is to assess the downside risks and volatility of ${context.companyName}.
    Consider the user's risk profile: ${context.riskProfile}.
    Focus heavily on:
    - Volatility and max drawdowns
    - Debt levels and liquidity (current ratio)
    - Concentration risk
    - Macro sensitivity
    - Suitability for the risk profile

    Provide a negative scoreBias (0 to -100) representing the penalty for risk.
  `;
  return runAgent("risk", context, prompt, AgentOutputSchema);
}

export async function runValuationAgent(context: AgentContext) {
  const prompt = `
    You are the Valuation Agent. Your role is to strictly assess the valuation of ${context.companyName}.
    Focus heavily on:
    - Absolute valuation multiples (P/E, Forward P/E, P/S, EV/EBITDA)
    - Relative valuation compared to peers
    - PEG ratio (growth-adjusted valuation)

    Provide a scoreBias (-100 to 100) based purely on whether the stock is undervalued (positive bias) or overvalued (negative bias).
  `;
  return runAgent("valuation", context, prompt, AgentOutputSchema);
}

export async function runNewsAgent(context: AgentContext) {
  const prompt = `
    You are the News & Sentiment Agent. Your role is to synthesize recent events for ${context.companyName}.
    Focus heavily on:
    - Recent catalysts (earnings, products, lawsuits)
    - Overall sentiment score provided in context
    - How news impacts the near-term outlook

    Provide a scoreBias (-100 to 100) based on news momentum.
  `;
  return runAgent("news", context, prompt, AgentOutputSchema);
}
