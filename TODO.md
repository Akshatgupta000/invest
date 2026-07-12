# Future Work / Technical Debt

- [ ] **Redis Caching:** Replace the MongoDB 6-hour cache query with a Redis layer for sub-millisecond retrieval of hot tickers.
- [ ] **E2E Testing:** Add Cypress tests specifically for verifying the SSE stream parser in the `AgentTerminal` component.
- [ ] **Exponential Backoff:** The current LLM fallback logic is naive. Implement a proper exponential backoff queue for handling 429 Too Many Requests.
- [ ] **CI/CD Pipeline:** Set up GitHub Actions to run TypeScript type-checking and ESLint before allowing merges to main.
- [ ] **Dockerization:** Containerize the Express server and Vite frontend for easier deployment consistency across environments.
- [ ] **Rate Limiting:** Upgrade the basic IP-based rate limiter to use Redis to prevent memory leaks in the Express process over time.
- [ ] **Observability:** Integrate Sentry for frontend crash reporting and LangSmith to trace the LangGraph execution steps in production.
- [ ] **RAG Integration:** Explore pulling raw 10-Q text from the SEC EDGAR API and feeding it into a local vector store to give agents deeper, unstructured context.
- [ ] **User Auth:** Add Clerk or Auth0 so users can save portfolios and customize their baseline risk profiles persistently.
