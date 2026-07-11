# InvestAI: Architectural Deep Dive

**InvestAI** is a professional-grade, multi-agent financial research platform designed to automate and synthesize complex equity analysis. This document provides an expert-level technical overview of the system's architecture, design patterns, and the engineering rationale behind key decisions. 

It is intended for technical reviewers, engineering managers, and developers looking to understand the system's complexity and real-world value.

---

## 1. System Architecture

The application is built on a modern React (Vite) + Express stack, utilizing a server-side orchestrator to coordinate data ingestion, AI agent execution, and real-time streaming to the client.

### 1.1 High-Level Flow
1. **User Request:** The client initiates a request with a company name/ticker and a desired risk profile (Conservative, Balanced, Aggressive).
2. **Data Aggregation Engine:** The server concurrently fetches and normalizes live financial data, historical trends (3-year), news sentiment, and competitor benchmarks.
3. **Evidence Layer Normalization:** Raw data is converted into a structured, immutable `EvidenceStore`.
4. **Agent Swarm Execution:** 5 specialized AI agents (Bull, Bear, Risk, Valuation, News) are dispatched concurrently. They analyze the evidence using strict Zod schemas to guarantee structured output.
5. **Judge Synthesis:** A final Judge agent reviews the swarm's outputs and makes a holistic decision.
6. **Quant Validation & Audit:** A deterministic scoring engine cross-validates the AI's verdict. A claim verifier ensures every AI argument is backed by a valid ID in the `EvidenceStore`.
7. **Streaming Response:** The entire pipeline yields state updates to the client via Server-Sent Events (SSE), masking execution latency and providing a dynamic UX.

---

## 2. Core Engineering Innovations

### 2.1 Multi-Agent Swarm with Zod Validation
Instead of relying on a single, massive LLM prompt (which often leads to confirmation bias or hallucinated "middle-of-the-road" answers), InvestAI utilizes an **Agent Swarm**.
- **Specialized Contexts:** Each agent (Bull, Bear, Risk, Valuation, News) is given a highly restrictive prompt to focus *only* on its domain. The Bear agent must find flaws; the Valuation agent must focus purely on multiples.
- **Strict Output Enforcement:** We use `zod` and OpenAI's structured JSON output mode to guarantee that agents return data in exact formats (e.g., arrays of arguments with confidence scores and evidence citations).
- **Parallel Execution:** Agents are dispatched via `Promise.allSettled`, drastically reducing the total time-to-insight compared to sequential processing.

### 2.2 The Immutable Evidence Layer
A common flaw in AI-driven analysis is hallucination. InvestAI mitigates this through a deterministic Evidence Layer.
- **Normalization:** Data from `yahoo-finance2` is normalized into flat `EvidenceItem` objects containing a value, a source, and a unique ID.
- **Citation Requirement:** When agents construct arguments, they are prompted to cite the specific `EvidenceItem.id`. 
- **Audit Trail:** The `claimVerifier.ts` module runs a post-processing check. If an agent makes a claim without a valid evidence ID, the claim's confidence score is heavily penalized, and it is flagged in the final UI audit trail.

### 2.3 Hybrid AI-Quant Scoring Engine
AI is excellent at synthesizing narrative, but deterministic math is better for hard thresholds. InvestAI merges both:
1. **Quant Scoring (`scoring.ts`):** Calculates a base score out of 100 using strict financial thresholds (e.g., P/E < 15 adds 25 points, Debt-to-Equity > 1.5 subtracts 20 points).
2. **AI Bias Integration:** The specialized agents output a `scoreBias` based on their analysis (e.g., the Bull agent might find a strong qualitative catalyst, adding +10 to the growth score).
3. **Risk Profile Adjustment:** The final score is adjusted based on the user's risk tolerance. A Conservative profile heavily penalizes volatility and high debt, raising the threshold required for an "INVEST" verdict.

### 2.4 Real-Time Streaming via Server-Sent Events (SSE)
Complex financial research takes time (often 10-20 seconds for full execution). To provide a responsive, professional UX:
- The orchestrator (`agent.ts`) is written as an `AsyncGenerator<AgentStep>`.
- The Next.js API route consumes this generator and pipes discrete JSON events to the client using a `ReadableStream`.
- The frontend `AgentTerminal.tsx` renders these steps in a real-time command-line-style interface, keeping the user engaged while the heavy lifting happens in the background.

---

## 3. Advanced Features & Modules

### Competitor Benchmarking
The system dynamically queries the LLM to identify 3 major competitors based on the target company's sector and industry. It then fetches financial data for these peers and calculates percentiles, instantly showing if the target company is trading at a premium or discount to its peers.

### Scenario Analysis Engine
A dedicated module generates deterministic Bull, Base, and Bear financial scenarios, modeling projected Revenue Growth, Net Margins, and Valuation Multiples, complete with estimated upside/downside percentages based on current prices.

### Report Diffing & Versioning
When a new report is generated, it is automatically compared against the most recent historical report in MongoDB for that ticker. The system highlights score changes, verdict shifts, new risks that have emerged, and new positive drivers, functioning like a "git diff" for financial research.

### Multi-Provider LLM Fallback
To ensure high availability, the `llm.ts` core abstracts the AI provider. It attempts to route requests through Groq (for maximum speed), falling back to Google Gemini or OpenAI automatically if rate limits or errors occur.

---

## 4. Summary

InvestAI demonstrates a deep understanding of modern full-stack development, AI agent orchestration, and robust system design. By enforcing strict data typing, deterministic validation of AI outputs, and providing a highly responsive streaming interface, the project elevates LLM usage from a "chat interface" into a reliable, enterprise-grade analytical tool.
