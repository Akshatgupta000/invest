import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { runBullAgent, runBearAgent, runRiskAgent, runValuationAgent, runNewsAgent } from "./agents/parallelAgents";
import { runJudgeAgent } from "./agents/judgeAgent";
export const GraphState = Annotation.Root({
    context: Annotation(),
    bull: Annotation(),
    bear: Annotation(),
    risk: Annotation(),
    valuation: Annotation(),
    news: Annotation(),
    judge: Annotation(),
});
async function bullNode(state) {
    const output = await runBullAgent(state.context);
    return { bull: output };
}
async function bearNode(state) {
    const output = await runBearAgent(state.context);
    return { bear: output };
}
async function riskNode(state) {
    const output = await runRiskAgent(state.context);
    return { risk: output };
}
async function valuationNode(state) {
    const output = await runValuationAgent(state.context);
    return { valuation: output };
}
async function newsNode(state) {
    const output = await runNewsAgent(state.context);
    return { news: output };
}
async function judgeNode(state) {
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
