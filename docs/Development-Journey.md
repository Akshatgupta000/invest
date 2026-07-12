# Development Journey

The evolution of InvestAI followed a pragmatic path, starting as a simple script and growing into a full-scale multi-agent platform.

## Version 1: The CLI Scraper
The project started as a simple Node.js CLI tool. It used `yahoo-finance2` to pull the latest P/E ratio, market cap, and revenue for a given ticker and printed it to the console. The goal was simply to save time looking up basic metrics.

## Version 2: Basic AI Integration
We hooked up the OpenAI API (later migrated to Groq for speed) to read the scraped financial data and output a paragraph summarizing whether the stock was a good buy. This version suffered heavily from hallucination—the AI would often invent metrics to justify its narrative if the actual data was borderline.

## Version 3: The Evidence Layer and Zod
To combat hallucinations, we introduced the `EvidenceStore`. All raw data from Yahoo Finance was flattened into specific items with IDs. The AI was then forced, via Zod schemas, to cite the IDs of the data it used. We also built the `claimVerifier` to audit the output, penalizing the AI's confidence score if it fabricated data.

## Version 4: Multi-Agent Swarm
A single LLM prompt consistently generated "middle-of-the-road" advice. We refactored the pipeline using LangGraph to instantiate five distinct agents: Bull, Bear, Risk, Valuation, and News. By forcing these agents to adopt extreme, specialized personas, we extracted much deeper insights. A Judge agent was added to synthesize the final verdict.

## Version 5: Streaming UX and Caching
Running 5 LLMs sequentially (and later in parallel) meant API responses took up to 20 seconds. This led to frontend timeouts and a terrible user experience. We migrated the API to use Server-Sent Events (SSE) and built the React `AgentTerminal` to stream the backend's intermediate steps. Concurrently, we added a MongoDB caching layer to store reports for 6 hours, dropping subsequent load times for popular tickers to under 1 second.
