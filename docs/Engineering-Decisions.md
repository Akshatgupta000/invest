# Engineering Decisions

This document outlines the core architectural and technical decisions made during the development of InvestAI, focusing on why specific tools and patterns were chosen.

## Why React and Vite?
Initially, the dashboard was just a plain HTML/JS page hitting an API. As the requirement for a real-time terminal UI (to mask the 15-20s agent execution time) emerged, state management became overly complex. React was chosen for its component lifecycle, allowing the terminal to update linearly while the backend processed data. Vite was selected over Create React App purely for development velocity—Hot Module Replacement (HMR) is near instantaneous.

## Why Node.js and Express?
A full-stack JavaScript environment was chosen to easily share TypeScript interfaces (like `ResearchReport` and `AgentStep`) between the frontend and the backend. Express was kept intentionally lightweight. While frameworks like NestJS offer more structure, Express provided the raw control over the HTTP response stream necessary to implement Server-Sent Events (SSE) without framework abstractions getting in the way.

## Why MongoDB?
The AI output structures evolved rapidly. Initially, a report was just a summary string. Later, it became a nested object with confidence scores, array of evidence IDs, and individual agent debates. Using a relational database like PostgreSQL would have required constant schema migrations and complex JSONB querying. MongoDB handles deeply nested, unstructured document data natively, which maps perfectly to our evolving `ResearchReport` model.

## Why LangGraph?
Early versions of the AI pipeline attempted to use a single large prompt (e.g., "Analyze this stock from a bull and bear perspective"). This led to the LLM heavily indexing on the middle ground, effectively generating useless "hold" recommendations. We introduced a multi-agent swarm to force specialization. LangGraph was chosen because it allows us to define the state flow explicitly, running the Bull, Bear, Risk, Valuation, and News agents in parallel before synthesizing the final output with a Judge agent.

## Why Server-Sent Events (SSE) over WebSockets?
WebSockets provide bidirectional communication, which is overkill for this application. The workflow here is strictly unidirectional after the initial request: the client asks for a report, and the server spends 20 seconds streaming updates back. SSE operates over standard HTTP, making it simpler to deploy, easier to debug via browser dev tools, and less prone to firewall/proxy issues compared to persistent WebSocket connections.

## Why Zod?
LLMs are notoriously unreliable at returning perfectly formatted JSON, even when explicitly asked. Zod was introduced alongside LangChain's `withStructuredOutput` to enforce strict validation schemas on the agent outputs. If an agent fails to return the required `scoreBias` or `evidenceIds` array, it forces a localized failure or retry rather than crashing the entire pipeline.
