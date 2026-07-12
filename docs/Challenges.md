# Challenges Faced

Building InvestAI presented several distinct engineering hurdles, primarily bridging the gap between non-deterministic AI and strict financial requirements.

## 1. LLM Data Hallucination
**Problem:** The agents would frequently invent financial metrics (e.g., claiming a P/E of 15 when the actual P/E was 45) to justify a strong "INVEST" or "PASS" narrative.
**Why it happened:** LLMs inherently try to please the user prompt. If the prompt demands a strong argument but the provided context is weak, the model will confabulate data to satisfy the prompt's condition.
**How it was solved:** Implemented an immutable Evidence Layer. Raw API data is flattened into `EvidenceItem` objects with unique IDs. The agents are constrained by Zod schemas to output an array of `evidenceIds` for every argument. The deterministic `claimVerifier` then audits these IDs, penalizing or stripping arguments that lack factual backing.
**What was learned:** You cannot trust an LLM to accurately hold and reference numerical data within its context window without strict, post-generation programmatic validation.

## 2. API Rate Limiting and Swarm Execution Time
**Problem:** Dispatching 5 agents concurrently against the Groq/Gemini APIs occasionally resulted in 429 Too Many Requests errors. Sequential execution, however, took over 25 seconds, leading to frontend timeouts.
**Why it happened:** Free/Tier 1 LLM APIs have strict concurrent connection and tokens-per-minute limits.
**How it was solved:** We implemented a hybrid approach. The agents run in parallel via `Promise.allSettled` in LangGraph, but we introduced a light, randomized jitter delay in `llm.ts` to stagger the initial API hits. We also abstracted the LLM provider, automatically falling back to Gemini if Groq rate-limits us.
**What was learned:** Architecting for multi-agent systems requires building in resilient retry logic and handling partial failures gracefully, rather than assuming 100% uptime from the LLM provider.

## 3. SSE Connection Drops
**Problem:** During local development, the SSE stream would occasionally drop, leaving the frontend UI stuck in a perpetual loading state.
**Why it happened:** The local proxy/Vite dev server would aggressively close idle HTTP connections if the LLM took too long to return the first chunk.
**How it was solved:** We modified the Express backend to explicitly send `\n\n` heartbeat pings during long processing steps (like waiting for the Judge agent) to keep the connection alive. We also added aggressive timeout handling on the frontend to reset the UI state on unexpected disconnects.
**What was learned:** When bypassing standard REST for streaming protocols, you inherit the responsibility of managing connection lifecycles and network anomalies.

## 4. Normalizing Inconsistent Financial Data
**Problem:** The `yahoo-finance2` API returns vastly different structures depending on the company. For example, banks don't have standard "Gross Margins," and newly IPO'd companies lack 3-year historical data.
**Why it happened:** Financial reporting standards vary by sector, and third-party APIs aggregate data loosely.
**How it was solved:** The `scoring.ts` logic was rewritten to be heavily defensive. Instead of assuming data exists, the math uses `??` nullish coalescing heavily and drops specific scoring categories (distributing the weight elsewhere) if the data is unavailable, preventing `NaN` exceptions from crashing the pipeline.
**What was learned:** Never trust third-party data structures implicitly. Always parse and validate at the boundary layer before passing data deep into the business logic.
