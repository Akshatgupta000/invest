import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { AgentContext, runAgent } from "./agents/baseAgent";
import { runBullAgent, runBearAgent, runRiskAgent, runValuationAgent, runNewsAgent } from "./agents/parallelAgents";
import { runJudgeAgent } from "./agents/judgeAgent";
import { AgentOutput, JudgeOutput } from "./types/research";

export const GraphState = Annotation.Root({
  context: Annotation<AgentContext>(),
  bull: Annotation<AgentOutput>(),
  bear: Annotation<AgentOutput>(),
  risk: Annotation<AgentOutput>(),
  valuation: Annotation<AgentOutput>(),
  news: Annotation<AgentOutput>(),
  judge: Annotation<JudgeOutput>(),
});

async function bullNode(state: typeof GraphState.State) {
  const output = await runBullAgent(state.context);
  return { bull: output };
}

async function bearNode(state: typeof GraphState.State) {
  const output = await runBearAgent(state.context);
  return { bear: output };
}

async function riskNode(state: typeof GraphState.State) {
  const output = await runRiskAgent(state.context);
  return { risk: output };
}

async function valuationNode(state: typeof GraphState.State) {
  const output = await runValuationAgent(state.context);
  return { valuation: output };
}

async function newsNode(state: typeof GraphState.State) {
  const output = await runNewsAgent(state.context);
  return { news: output };
}

async function judgeNode(state: typeof GraphState.State) {
  const output = await runJudgeAgent(state.context, {
    bull: state.bull,
    bear: state.bear,
    risk: state.risk,
    valuation: state.valuation,
    news: state.news,
  });
  return { judge: output };
}

export function buildAgentSwarmGraph() {
  const builder = new StateGraph(GraphState)
    .addNode("bullAgent", bullNode)
    .addNode("bearAgent", bearNode)
    .addNode("riskAgent", riskNode)
    .addNode("valuationAgent", valuationNode)
    .addNode("newsAgent", newsNode)
    .addNode("judgeAgent", judgeNode)
    
    // Fan out to parallel agents
    .addEdge(START, "bullAgent")
    .addEdge(START, "bearAgent")
    .addEdge(START, "riskAgent")
    .addEdge(START, "valuationAgent")
    .addEdge(START, "newsAgent")
    
    // Fan in to judge
    .addEdge("bullAgent", "judgeAgent")
    .addEdge("bearAgent", "judgeAgent")
    .addEdge("riskAgent", "judgeAgent")
    .addEdge("valuationAgent", "judgeAgent")
    .addEdge("newsAgent", "judgeAgent")
    
    .addEdge("judgeAgent", END);

  return builder.compile();
}
