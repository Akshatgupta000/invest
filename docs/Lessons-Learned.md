# Lessons Learned

Building InvestAI provided significant insights into orchestrating LLMs for structured data processing and managing complex UI state in React.

## 1. Prompting for Structured JSON is Hard
Initially, we relied on string matching and basic regex to parse the AI output. This was fragile and broke constantly when the LLM decided to add conversational filler (e.g., "Here is the data you requested:"). 
**Lesson:** Never rely on regex for LLM parsing. Always use function calling or forced JSON mode combined with a strict validation layer (like Zod). If the schema fails to parse, throw immediately and trigger a retry loop rather than passing malformed data down the pipeline.

## 2. The Illusion of Speed is Essential
Waiting 20 seconds for a blank screen to load feels like an eternity. Waiting 20 seconds while a terminal interface prints "Fetching financials...", "Benchmarking competitors...", and "Synthesizing Bull case..." feels like the system is working hard for you.
**Lesson:** In AI applications where high latency is unavoidable, intermediate state updates are a requirement, not a nice-to-have. Streaming intermediate thoughts radically improves perceived performance.

## 3. Caching at the Edge
Early on, we hit the API for every single request, even if two users searched for "AAPL" five minutes apart. This was a massive waste of API credits and time.
**Lesson:** Aggressive caching is mandatory for LLM applications. Storing the deterministic output (the final `ResearchReport` JSON) in MongoDB and serving that on repeat queries dramatically improved system scalability. 

## 4. Normalization Boundaries
The `yahoo-finance2` package is fantastic, but its raw output is heavily nested and inconsistent. We initially passed this raw object directly to the LLM. The LLM wasted context window space trying to decipher it.
**Lesson:** Establish strict data normalization boundaries. The `evidence.ts` file converts the messy Yahoo object into flat, consistent `EvidenceItem` objects. Feeding the LLM normalized data significantly improved its reasoning accuracy and lowered token usage.

## 5. React Component Unmounting and Promises
During the streaming phase, if a user clicked "Back" or searched a new ticker, the React component would unmount, but the backend SSE stream (and local state updates) would keep firing, causing memory leaks and React state warnings.
**Lesson:** Always clean up stream readers and abort fetch requests in a `useEffect` cleanup function when dealing with long-polling or SSE.
