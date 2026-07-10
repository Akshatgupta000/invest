# AI Usage Logs

This file documents the process and key interactions with the AI assistant during the development of this industry-level investment research product. 
The AI was heavily utilized as a coding, architecture, and documentation assistant, but all final architectural decisions, scoring weights, and design integrations were understood, reviewed, and finalized manually.

### 1. Architecture Prompt
*Prompt Context:* "Upgrade my existing InvestAI project into an industry-level AI investment research product. Implement a multi-agent debate architecture (Bull, Bear, Risk, Judge) instead of a single LLM output. Also, introduce caching and rate limiting."
*Action:* The AI proposed an implementation plan involving a pipeline that fetches data, runs a pre-LLM call for competitors, and then runs the complex debate prompt. 

### 2. UI Prompt
*Prompt Context:* "Create new components for Score Breakdown, Evidence Table, Agent Debate, and Competitor Comparison in the existing LIX design system."
*Action:* The AI generated `ScoreBreakdown.tsx`, `AgentDebate.tsx`, `EvidenceTable.tsx`, and `CompetitorComparison.tsx` integrating them nicely into `ReportViewer.tsx`.

### 3. Agent Pipeline Prompt
*Prompt Context:* "Rewrite `agent.ts` to execute the multi-agent debate and include the JSON structures for Evidence and Agents."
*Action:* The AI rewrote the main orchestration function and the prompt itself to strictly enforce JSON schemas for the Bull, Bear, Risk, and Judge agents.

### 4. Scoring Prompt
*Prompt Context:* "Implement a scoring engine based on Financial Health (30%), Growth Potential (25%), Valuation (20%), News Sentiment (15%), and Risk (10%). Factor in a risk profile (Conservative, Balanced, Aggressive)."
*Action:* The AI authored `scoring.ts`, which parses the financial metrics and news arrays to compute a weighted score out of 100 and map it to an INVEST, WATCHLIST, or PASS verdict.

### 5. Debugging Prompt
*Prompt Context:* "The project fails to build due to type errors from the `yahoo-finance2` package after upgrading to v3."
*Action:* The AI debugged the type-safety checks in `finance.ts`, resolving `searchQuote` mismatching and casting issues with `beta` and `dividendYield`.

### 6. Take-Home Assignment Alignment (Refactoring & LangGraph Migration)
*Prompt Context:* "in this project i have shown multiple set of data and could you please check what are useless and what else i should implement in place of that... this was the assignment given to me check according to this and then tell"
*Action:* The AI evaluated the codebase against the prompt requirements and discovered that `LangChain.js / LangGraph.js` was missing despite being a mandatory tech stack requirement. The AI drafted an Implementation Plan to refactor the project.

### 7. LangGraph Orchestration Migration
*Prompt Context:* "yes continue"
*Action:* The AI installed `@langchain/core`, `@langchain/langgraph`, and the relevant providers (`@langchain/groq`, `@langchain/google-genai`). It rewrote `llm.ts` to construct LangChain `BaseChatModel` instances based on `.env.local` keys. It then built a proper `StateGraph` in `graph.ts` for the parallel Agent Swarm (Bull, Bear, Risk, Valuation, News) fanning into a `Judge` node, and integrated it cleanly into `agent.ts`.

### 8. UI Data Integrity Refactoring
*Prompt Context:* System instruction executing the agreed-upon Implementation Plan.
*Action:* The AI removed the "fake" SVG charts from `ScoreBreakdown.tsx` and created a `KeyFinancials.tsx` component to surface the real fundamental numbers (P/E ratio, Market Cap, Free Cash flow) fetched during the data gathering step, thereby significantly boosting the app's professional credibility. It then rewrote this `README.md` to precisely match the assignment grading rubric.
