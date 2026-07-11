"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphState = void 0;
exports.buildAgentSwarmGraph = buildAgentSwarmGraph;
const langgraph_1 = require("@langchain/langgraph");
const parallelAgents_1 = require("./agents/parallelAgents");
const judgeAgent_1 = require("./agents/judgeAgent");
exports.GraphState = langgraph_1.Annotation.Root({
    context: (0, langgraph_1.Annotation)(),
    bull: (0, langgraph_1.Annotation)(),
    bear: (0, langgraph_1.Annotation)(),
    risk: (0, langgraph_1.Annotation)(),
    valuation: (0, langgraph_1.Annotation)(),
    news: (0, langgraph_1.Annotation)(),
    judge: (0, langgraph_1.Annotation)(),
});
async function bullNode(state) {
    const output = await (0, parallelAgents_1.runBullAgent)(state.context);
    return { bull: output };
}
async function bearNode(state) {
    const output = await (0, parallelAgents_1.runBearAgent)(state.context);
    return { bear: output };
}
async function riskNode(state) {
    const output = await (0, parallelAgents_1.runRiskAgent)(state.context);
    return { risk: output };
}
async function valuationNode(state) {
    const output = await (0, parallelAgents_1.runValuationAgent)(state.context);
    return { valuation: output };
}
async function newsNode(state) {
    const output = await (0, parallelAgents_1.runNewsAgent)(state.context);
    return { news: output };
}
async function judgeNode(state) {
    const output = await (0, judgeAgent_1.runJudgeAgent)(state.context, {
        bull: state.bull,
        bear: state.bear,
        risk: state.risk,
        valuation: state.valuation,
        news: state.news,
    });
    return { judge: output };
}
function buildAgentSwarmGraph() {
    const builder = new langgraph_1.StateGraph(exports.GraphState)
        .addNode("bullAgent", bullNode)
        .addNode("bearAgent", bearNode)
        .addNode("riskAgent", riskNode)
        .addNode("valuationAgent", valuationNode)
        .addNode("newsAgent", newsNode)
        .addNode("judgeAgent", judgeNode)
        // Fan out to parallel agents
        .addEdge(langgraph_1.START, "bullAgent")
        .addEdge(langgraph_1.START, "bearAgent")
        .addEdge(langgraph_1.START, "riskAgent")
        .addEdge(langgraph_1.START, "valuationAgent")
        .addEdge(langgraph_1.START, "newsAgent")
        // Fan in to judge
        .addEdge("bullAgent", "judgeAgent")
        .addEdge("bearAgent", "judgeAgent")
        .addEdge("riskAgent", "judgeAgent")
        .addEdge("valuationAgent", "judgeAgent")
        .addEdge("newsAgent", "judgeAgent")
        .addEdge("judgeAgent", langgraph_1.END);
    return builder.compile();
}
