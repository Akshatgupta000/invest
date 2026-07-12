# Tradeoffs

Engineering is about choosing the right compromise. Here are the key tradeoffs made in the InvestAI architecture.

## 1. Multi-Agent Swarm vs. Single Prompt
**Decision:** Execute 5 specialized agents (Bull, Bear, Risk, Valuation, News) in parallel and synthesize with a Judge, rather than using one massive prompt.
**Tradeoff:** 
- *Pros:* Drastically reduces confirmation bias and hallucinated "middle ground" answers. Produces much richer, structured analysis.
- *Cons:* Increases LLM API costs by ~5x per query. Increases latency (must wait for the slowest agent to finish) and increases the complexity of error handling.

## 2. Server-Sent Events (SSE) vs. WebSockets
**Decision:** Stream the agent execution steps to the client using SSE.
**Tradeoff:**
- *Pros:* Operates over standard HTTP. Easier to debug. Doesn't require managing persistent bidirectional connection state on the server.
- *Cons:* Unidirectional only (server to client). If the client needs to abort the request, it relies on closing the HTTP connection, which doesn't always cleanly abort the backend processing immediately.

## 3. MongoDB (NoSQL) vs. PostgreSQL (SQL)
**Decision:** Store the finalized `ResearchReport` documents in MongoDB.
**Tradeoff:**
- *Pros:* Schema flexibility. The AI outputs deeply nested arrays of arguments, agent debates, and evidence items. This structure evolves frequently. MongoDB handles this natively without complex schema migrations.
- *Cons:* Relational queries are difficult. If we wanted to run a query like "Find all companies where the Bull agent cited 'strong margins'", it would be extremely slow and require heavy indexing compared to a structured SQL database.

## 4. Groq (Llama 3.3) vs. OpenAI (GPT-4o)
**Decision:** Default to Groq's Llama 3.3 endpoint for the agent swarm.
**Tradeoff:**
- *Pros:* Blazing fast inference speeds (often >800 tokens/sec), which is critical for masking latency in a multi-agent setup.
- *Cons:* Llama 3.3 occasionally struggles with following highly complex, nested Zod schemas compared to GPT-4o, requiring more aggressive retry logic on the backend when JSON parsing fails.

## 5. Deterministic Scoring vs. LLM-Driven Verdicts
**Decision:** The final 0-100 score is calculated mathematically in `scoring.ts` based on financial metrics, rather than asking the LLM to rate the stock out of 100.
**Tradeoff:**
- *Pros:* Guarantees consistency. A stock with a P/E of 100 and massive debt will always receive a low score, regardless of how aggressively optimistic the Bull agent is.
- *Cons:* Requires maintaining hardcoded thresholds in the codebase. It can sometimes feel rigid if the market dynamics shift (e.g., tech companies structurally commanding higher P/Es), requiring manual tweaks to the math.
