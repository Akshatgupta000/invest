# Suggested Commit History

This document outlines a realistic, chronological git commit history that reflects how InvestAI likely evolved from a basic prototype to a production-ready application.

```text
a1b2c3d - Initialize project structure (Vite React + Express)
b2c3d4e - Setup Tailwind CSS and basic UI shell
c3d4e5f - Add basic Yahoo Finance integration for stock lookup
d4e5f6g - Implement raw OpenAI prompt for basic stock summary
e5f6g7h - Add Mongoose schema and MongoDB connection
f6g7h8i - Refactor API to return structured JSON instead of plain text
g7h8i9j - Integrate Zod for strict LLM output validation
h8i9j0k - Feature: Implement parallel Bull/Bear AI debate
i9j0k1l - Fix: Handle missing financial data in scoring engine
j0k1l2m - Feature: Add Competitor Benchmarking logic
k1l2m3n - Architecture: Migrate from single prompt to LangGraph agent swarm
l2m3n4o - Perf: Implement Server-Sent Events (SSE) for streaming responses
m3n4o5p - UI: Build AgentTerminal component to parse SSE stream
n4o5p6q - Feature: Implement Immutable Evidence Store to prevent hallucinations
o5p6q7r - Fix: Add retry logic and fallback to Gemini API on Groq rate limits
p6q7r8s - UI: Enhance ReportViewer with Recharts visualizations
q7r8s9t - Feature: Add MongoDB caching for 6-hour query reuse
r8s9t0u - Refactor: Extract scoring math into standalone deterministic module
s9t0u1v - Feature: Implement historical report diffing (What Changed)
t0u1v2w - Docs: Write comprehensive architecture overview and README
```
