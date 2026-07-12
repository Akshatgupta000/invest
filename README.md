# InvestAI

InvestAI is a professional-grade, multi-agent financial research platform designed to automate and synthesize complex equity analysis. It leverages a Swarm of AI Agents, strict quantitative validation, and a real-time streaming interface to deliver deep, evidence-backed investment insights.

---

## Overview

**What it does:** InvestAI automates the research process for publicly traded companies. Users input a ticker or company name, and the system fetches real-time financial data, historical trends, news sentiment, and competitor benchmarks. It then deploys a swarm of specialized AI agents to debate the stock's merits and outputs a comprehensive research report.

**Why it exists:** Financial analysis is time-consuming and prone to human bias. Retail investors often lack the time to dive deep into multiples, debt ratios, and competitor analysis, while single-prompt AI tools often hallucinate or provide superficial answers.

**Problem it solves:** It bridges the gap between raw financial data and actionable intelligence by strictly enforcing deterministic evidence and cross-validating AI narratives with quantitative scoring. 

**Who it is for:** Retail investors, financial analysts, and enthusiasts seeking robust, data-driven second opinions on equities.

**Main workflow:** 
User Request → Data Aggregation → Evidence Normalization → Parallel Agent Execution → Judge Synthesis & Quant Validation → Streaming Delivery of Results.

**Expected outcome:** A highly structured, interactive research report featuring a final verdict (INVEST, PASS, or WATCHLIST), quant scores, bull/bear debates, valuation metrics, scenario analysis, and a strict audit trail of all AI claims.

---

## Features

| Feature | Purpose | Benefits | How it works | Technologies used |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Agent Swarm** | Synthesize complex narratives from different perspectives. | Reduces bias by forcing dedicated Bull, Bear, Risk, Valuation, and News agents to defend their strict domains. | Uses LangGraph to orchestrate concurrent specialized agents with forced structured outputs. | LangChain, LangGraph, Groq, Google Gemini |
| **Real-time SSE Streaming** | Keep users engaged during long research tasks (10-20s). | Provides immediate visual feedback as the AI "thinks" and fetches data, preventing UX timeouts. | Server-Sent Events (SSE) pipe `AsyncGenerator` yield steps directly to the React frontend terminal. | Express, Node.js Streams, React State |
| **Immutable Evidence Layer** | Prevent AI hallucinations and enforce factual accuracy. | Ensures every argument made by the AI is backed by real, fetched data. | Raw API data is normalized into an `EvidenceStore`. Agents must cite `EvidenceItem.id` in their outputs. | Yahoo Finance API, Zod Validation |
| **Hybrid AI-Quant Scoring** | Combine deterministic math with qualitative AI insights. | Ensures a stock with terrible fundamentals cannot get an "INVEST" rating purely on AI hype. | Calculates base scores from financial ratios, applies AI bias points, and adjusts based on the user's risk profile. | TypeScript, Math logic |
| **Dynamic Competitor Benchmarking** | Understand a company's relative position in its sector. | Instantly reveals if a company is trading at a premium or discount compared to its peers. | AI identifies 3 peers, fetches their data, and calculates percentile rankings for key metrics (e.g., P/E, Margins). | LLM orchestration, Yahoo Finance |
| **Scenario Analysis Engine** | Project potential future outcomes based on current data. | Gives users a realistic view of upside and downside risks. | Generates deterministic Bull, Base, and Bear models for Revenue, Net Margins, and Valuation Multiples. | TypeScript modeling |
| **Report History & Versioning** | Track how a stock's thesis changes over time. | Highlights new risks, changing verdicts, and score shifts since the last analysis. | Saves reports to MongoDB and runs a "diff" against the previous report when a new one is generated. | MongoDB, Mongoose |
| **Audit Trail & Claim Verification** | Provide transparency into AI reasoning. | Builds trust by showing exactly which data points informed a specific AI argument. | A deterministic post-processor checks all AI claims against the `EvidenceStore` and flags missing citations. | Zod, TypeScript |
| **Risk Profiling** | Tailor the analysis to the user's risk tolerance. | Ensures conservative investors aren't recommended highly volatile or heavily indebted stocks. | Adjusts the final scoring thresholds and applies penalties based on the selected profile (Conservative, Balanced, Aggressive). | Frontend State, Backend Scoring Logic |

---

## Tech Stack

### Frontend
| Technology | Role |
| :--- | :--- |
| **React 19** | UI Library for building interactive, component-based interfaces. |
| **Vite** | Extremely fast build tool and development server. |
| **TypeScript** | Type-safe development across components and state. |
| **Tailwind CSS v4** | Utility-first styling for rapid, responsive design. |
| **Recharts** | Rendering interactive financial charts and visualizations. |
| **Lucide React** | Modern, clean SVG icon library. |
| **React Router** | Client-side routing (though primarily single-page structure). |

### Backend
| Technology | Role |
| :--- | :--- |
| **Node.js & Express** | Server runtime and web framework for the API layer. |
| **TypeScript** | End-to-end type safety, sharing interfaces with the frontend. |
| **Server-Sent Events (SSE)**| Unidirectional real-time data streaming to the client. |

### Database
| Technology | Role |
| :--- | :--- |
| **MongoDB** | NoSQL document database for storing complex, nested JSON reports. |
| **Mongoose** | ODM for schema validation, querying, and indexing data. |

### AI Models & Orchestration
| Technology | Role |
| :--- | :--- |
| **LangChain Core** | Abstraction layer for interacting with various LLMs. |
| **LangGraph** | Orchestrating parallel agent state and execution flow. |
| **Groq (Llama 3.3)** | Primary high-speed LLM for complex reasoning and extraction. |
| **Google Gemini (Flash)** | Fallback LLM for resilient API execution. |
| **Zod** | Enforcing strict JSON schema outputs from the LLMs. |

### APIs
| Technology | Role |
| :--- | :--- |
| **yahoo-finance2** | Fetching real-time market data, financials, historicals, and news. |

---

## Project Structure

```text
invest/
├── client/                     # Frontend React Application
│   ├── public/                 # Static assets
│   ├── src/                    # Frontend source code
│   │   ├── components/         # Reusable React components (AgentTerminal, ReportViewer, etc.)
│   │   │   └── charts/         # Recharts visualization components
│   │   ├── lib/                # Shared frontend types and utilities
│   │   ├── App.tsx             # Main application layout and state logic
│   │   ├── index.css           # Global Tailwind and custom CSS variables
│   │   └── main.tsx            # React DOM entry point
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind styling configuration
│   └── vite.config.ts          # Vite build configuration
│
├── server/                     # Backend Node/Express API
│   ├── src/                    # Backend source code
│   │   ├── config/             # Environment and global configurations
│   │   ├── controllers/        # Route logic handlers (if extracted)
│   │   ├── lib/                # Core business logic and AI pipeline
│   │   │   ├── agents/         # Individual LLM agent definitions
│   │   │   ├── types/          # Shared TypeScript interfaces
│   │   │   ├── validation/     # Zod schemas for input/output validation
│   │   │   ├── agent.ts        # Main orchestrator (AsyncGenerator)
│   │   │   ├── claimVerifier.ts# Audit trail logic
│   │   │   ├── competitors.ts  # Benchmarking logic
│   │   │   ├── db.ts           # MongoDB connection utility
│   │   │   ├── evidence.ts     # Evidence store normalization
│   │   │   ├── finance.ts      # Yahoo Finance integration wrappers
│   │   │   ├── graph.ts        # LangGraph swarm definition
│   │   │   ├── historical.ts   # Trend calculation logic
│   │   │   ├── llm.ts          # LLM provider initialization
│   │   │   ├── news.ts         # Sentiment analysis logic
│   │   │   ├── rateLimit.ts    # Basic IP-based rate limiting
│   │   │   ├── reportComparison.ts # Diff logic for historical reports
│   │   │   ├── scenarios.ts    # Financial modeling logic
│   │   │   ├── scoring.ts      # Hybrid quant scoring engine
│   │   │   └── valuation.ts    # Multiple analysis logic
│   │   ├── middleware/         # Express middlewares
│   │   ├── models/             # Mongoose schemas (Report.ts)
│   │   ├── routes/             # API route definitions (reports.ts, research.ts)
│   │   └── server.ts           # Express server initialization
│   ├── .env                    # Environment variables
│   └── package.json            # Backend dependencies
│
├── PROJECT_OVERVIEW.md         # High-level architecture documentation
└── README.md                   # This file
```

### Important Folders Explained
- **`client/src/components/`**: Contains the highly modular UI, separating the `AgentTerminal` (streaming UI) from the `ReportViewer` (final static output).
- **`server/src/lib/`**: The heart of the application. Contains all data fetching, evidence normalization, AI orchestration, and deterministic scoring math.
- **`server/src/models/`**: Defines the complex Mongoose schema required to persist the deeply nested `ResearchReport` object.

---

## System Architecture

```mermaid
graph TD
    Client[React Frontend] -->|POST /api/research| Server[Express Server]
    
    subgraph Data Aggregation Engine
        Server --> YF[Yahoo Finance API]
        YF --> F[Financials]
        YF --> H[Historical Data]
        YF --> N[News]
        YF --> C[Competitor Data]
    end
    
    subgraph Evidence Layer
        F & H & N & C --> EV[EvidenceStore Normalization]
    end

    subgraph Agent Swarm (LangGraph)
        EV --> BA[Bull Agent]
        EV --> BR[Bear Agent]
        EV --> RA[Risk Agent]
        EV --> VA[Valuation Agent]
        EV --> NA[News Agent]
        BA & BR & RA & VA & NA --> JA[Judge Agent]
    end

    subgraph Deterministic Engines
        EV --> QE[Quant Scoring Engine]
        EV --> SE[Scenario Engine]
        JA & QE --> CV[Claim Verifier & Audit]
    end
    
    CV & SE --> DB[(MongoDB Cache & Storage)]
    CV & SE -->|SSE Stream| Client
```

---

## Application Flow

1. **User Input:** The user enters a company name (e.g., "Apple") and selects a risk profile (Conservative, Balanced, Aggressive) in the React frontend.
2. **API Request:** A POST request is sent to `/api/research`.
3. **Validation & Rate Limiting:** The Express backend validates the input using Zod and checks IP-based rate limits.
4. **Cache Check:** The system queries MongoDB to see if a report for this ticker and risk profile was generated in the last 6 hours. If so, it streams the cached report immediately.
5. **Data Ingestion (Concurrent):**
   - Resolves the ticker symbol via Yahoo Finance.
   - Fetches current financial snapshots (market cap, P/E, margins).
   - Fetches 3-year historical trends (revenue, debt, net income).
   - Fetches recent news articles.
   - Identifies and fetches data for 3 key competitors.
6. **Evidence Normalization:** All raw data is flattened into `EvidenceItem` objects with unique IDs, creating a single source of truth (`EvidenceStore`).
7. **Swarm Execution:** LangGraph dispatches the Bull, Bear, Risk, Valuation, and News agents in parallel. Each agent receives the `EvidenceStore` and a strict Zod schema for its output.
8. **Judge Synthesis:** The Judge agent reviews the outputs from the swarm and provides a final qualitative verdict.
9. **Quant & Valuation Engines:** The deterministic scoring engine calculates a 0-100 score based on hard financial rules, adjusted by agent bias and the user's risk profile. Scenarios (Bull/Base/Bear) are generated.
10. **Audit Trail Verification:** The `claimVerifier.ts` module cross-references every citation made by the agents against the `EvidenceStore`, penalizing unsupported claims.
11. **Historical Comparison:** The system pulls the previous report for the ticker from MongoDB and calculates a "diff" (what changed).
12. **Streaming Delivery:** Throughout steps 5-11, the `agent.ts` AsyncGenerator yields progress updates, which are streamed via Server-Sent Events (SSE) to the frontend's `AgentTerminal`.
13. **Finalization:** The complete report is yielded, saved to MongoDB, and rendered beautifully in the `ReportViewer` on the frontend.

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB server)
- API Keys for Groq (or Google Gemini)

### Clone the Repository
```bash
git clone <repository_url>
cd invest
```

### Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### Environment Variables
In the `server` directory, create a `.env` file based on the provided table in the section below.

### Running Locally

**Development Mode:**
You will need two terminal windows.

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

**Production Mode:**
To run a production build locally:

Terminal 1 (Backend):
```bash
cd server
npm run build
npm start
```

Terminal 2 (Frontend):
```bash
cd client
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file in the `server` directory.

| Variable | Purpose | Required | Example value |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Connection string for MongoDB (used for caching and history). | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `GROQ_API_KEY` | Primary API key for the fast Llama 3.3 model. | Yes (or Gemini) | `gsk_abc123...` |
| `GEMINI_API_KEY` | Fallback API key for Google's Gemini models. | Yes (or Groq) | `AIzaSy...` |
| `MISTRAL_API_KEY` | Optional API key for Mistral models. | No | `abc123def...` |
| `COHERE_API_KEY` | Optional API key for Cohere models. | No | `xyz789...` |
| `PORT` | Port for the Express server. | No | `5000` |

*Note: Never commit your `.env` file to version control.*

---

## How to Run

Exact commands for a fresh setup:

```bash
# 1. Install root dependencies (if any) and navigate to server
cd server

# 2. Install server dependencies
npm install

# 3. Start the backend development server
npm run dev

# 4. In a new terminal, navigate to client
cd ../client

# 5. Install client dependencies
npm install

# 6. Start the frontend development server
npm run dev
```

---

## How It Works

### Frontend Architecture
Built with React 19 and Vite, the frontend uses a highly modular component structure. State management is handled primarily through React hooks (`useState`, `useEffect`, `useCallback`) within `App.tsx`. The UI is styled with Tailwind CSS v4, providing a sleek, dark-mode, glassmorphic aesthetic. The core components are split between the active `AgentTerminal` (which handles real-time SSE parsing) and the static `ReportViewer` (which renders the finalized JSON into charts and tables).

### Backend Architecture
The backend is an Express server written in TypeScript. It serves as a robust API gateway and orchestration layer. It handles routing (`/api/research`, `/api/reports`), schema validation via Zod, and rate limiting. The core logic resides in the `lib` directory, entirely separated from the Express routing layer, allowing for easy testing and potential migration to serverless environments.

### API Communication & Streaming
Communication relies heavily on Server-Sent Events (SSE). When the frontend POSTs a query, the backend responds with `Transfer-Encoding: chunked` and `Content-Type: text/event-stream`. The `runResearchAgent` function in `agent.ts` is an `AsyncGenerator` that `yields` JSON strings representing different stages of the pipeline. The frontend reads this stream using the native Fetch API `ReadableStream`, parsing the chunks and updating the UI instantly.

### LLM Orchestration & Prompt Engineering
We utilize LangChain and LangGraph to manage the AI workflow. Instead of one massive prompt, we use targeted prompts for specific roles (Bull, Bear, Risk, Valuation). We leverage `withStructuredOutput` combined with strict Zod schemas to ensure the LLM returns perfectly formatted JSON arrays, complete with specific required fields like `scoreBias`, `confidence`, and `evidenceIds`. 

### Database Operations & Caching
MongoDB is used via Mongoose. The `Report` schema is designed to handle deeply nested and flexible objects using `Schema.Types.Mixed` where appropriate, allowing the AI output structures to evolve without breaking the database. A caching mechanism in `research.ts` checks MongoDB for identical queries (ticker + risk profile) within the last 6 hours, immediately returning a cached stream if found to save API costs and time.

---

## Architecture Decisions

- **Why React (Vite):** React provides the necessary component lifecycle management for our complex streaming UI. Vite was chosen over Create React App or Webpack for its near-instant HMR (Hot Module Replacement) and optimized build times.
- **Why Node + Express:** The JavaScript ecosystem allows seamless sharing of TypeScript interfaces between the client and server. Express is lightweight and perfect for handling raw HTTP streams (SSE).
- **Why MongoDB:** The structure of a research report—containing nested arrays of agent outputs, complex evidence items, and dynamic charts—maps perfectly to a NoSQL document database. A relational DB would require excessive joining and complex migrations as the AI pipeline evolves.
- **Why LangGraph:** Managing 5 parallel LLM agents and synthesizing their outputs requires state management. LangGraph provides a robust framework for defining cyclical or parallel agent workflows, handling inputs/outputs, and managing context dynamically.
- **Why SSE over WebSockets:** WebSockets are bidirectional and complex to scale. Our use case (client requests once, server streams data back over 20 seconds) is unidirectional, making Server-Sent Events much lighter, easier to implement, and natively supported over standard HTTP.
- **Why Zod:** AI is notoriously bad at returning consistent JSON. Zod allows us to define strict schemas that LangChain can pass to the LLM (via function calling or JSON mode), guaranteeing the structure of our application state.

---

## Key Decisions & Trade-offs

| Decision | Alternative | Why chosen | Trade-off |
| :--- | :--- | :--- | :--- |
| **Multi-Agent Swarm** | Single massive LLM prompt | Reduces bias, forces deep domain analysis, produces structured outputs. | Higher latency (waiting for all agents to finish) and higher token cost. |
| **Server-Sent Events (SSE)**| WebSockets or Polling | Simpler to implement over standard HTTP, perfectly fits the unidirectional stream requirement. | No native bidirectional communication; relies on standard HTTP POSTs for new inputs. |
| **MongoDB (NoSQL)** | PostgreSQL (SQL) | Handles highly nested, evolving AI JSON outputs without rigid schema migrations. | Harder to run complex relational queries (e.g., "Find all companies where Bull agent cited high margins"). |
| **yahoo-finance2** | AlphaVantage or IEX Cloud | Free, highly reliable, no API key required for basic market data scraping. | Subject to unannounced HTML changes by Yahoo; potential rate limiting if abused. |
| **Groq (Llama 3.3)** | OpenAI GPT-4o | Groq is blazingly fast (800+ tokens/sec), significantly reducing the 5-agent swarm execution time. | Slightly less capable reasoning compared to GPT-4o on extremely nuanced edge cases. |

---

## Challenges Faced

**Challenge 1: AI Hallucinations in Financial Data**
- **Problem:** Early iterations of the agents would invent financial metrics (e.g., saying P/E was 15 when it was 45) to justify their narratives.
- **Root Cause:** LLMs inherently try to please the user and will confabulate data if the prompt requires a strong argument but the real data is weak.
- **Solution:** Implementation of the **Immutable Evidence Layer**. All real data is flattened into an array of `EvidenceItem` objects with IDs. Agents are forced to output an array of `evidenceIds` for every argument. The `claimVerifier` then strips or penalizes arguments with invalid IDs.
- **Learning:** Never trust an LLM to hold financial data in context; force it to act purely as a reasoning engine over an immutable external data store.

**Challenge 2: Long Execution Times (UX Degradation)**
- **Problem:** Running 5 agents plus a Judge agent took up to 25 seconds, causing users to abandon the page.
- **Root Cause:** Sequential execution of LLM API calls and data fetching.
- **Solution:** Implemented `Promise.all` for data fetching, moved the swarm to parallel execution via LangGraph, and built the SSE streaming interface (`AgentTerminal`) to show intermediate steps.
- **Learning:** In AI applications, perceived latency is often more important than actual latency. Streaming intermediate "thoughts" keeps users engaged.

---

## Security Considerations

- **Environment Variables:** All sensitive API keys (Groq, Gemini, MongoDB) are strictly managed via `dotenv` on the server and are never exposed to the Vite frontend bundle.
- **Rate Limiting:** A basic IP-based rate limiter is implemented in `rateLimit.ts` to prevent abuse of the expensive LLM endpoints.
- **Input Sanitization:** The Express layer uses Zod to validate `req.body`, ensuring malicious payloads or massive strings are rejected before hitting the LLM.
- **Error Exposure:** In production, detailed stack traces from failed LLM calls or database queries are logged internally but masked behind generic "Failed to fetch report" messages to the client.

---

## Example Runs

### Example 1: Apple Inc. (AAPL)
- **Input:** Query: "Apple", Risk Profile: "Balanced"
- **Processing Summary:** Fetched $3T+ market cap snapshot, verified steady 5% revenue growth, benchmarked against MSFT and GOOGL. Bull agent highlighted service revenue; Bear agent cited iPhone stagnation.
- **Output Summary:** Quant score of 78/100. Strong financials offset by a premium valuation (P/E ~30).
- **Final Recommendation:** **INVEST**
- **Important Insights:** The AI highlighted that while hardware growth is slowing, the high-margin Services segment justifies the premium valuation relative to peers.

### Example 2: Tesla, Inc. (TSLA)
- **Input:** Query: "Tesla", Risk Profile: "Conservative"
- **Processing Summary:** Identified high beta and declining automotive gross margins. Benchmarked against TM (Toyota) and F (Ford). Risk agent heavily penalized the score due to the "Conservative" user profile and high valuation multiples (P/E > 40).
- **Output Summary:** Quant score of 52/100 (Adjusted down for risk profile).
- **Final Recommendation:** **WATCHLIST**
- **Important Insights:** The scoring engine correctly downgraded the stock due to the conservative profile mismatching with Tesla's high volatility and premium multiples, despite the Bull agent liking the energy storage growth.

### Example 3: NVIDIA Corp (NVDA)
- **Input:** Query: "NVIDIA", Risk Profile: "Aggressive"
- **Processing Summary:** Fetched massive >100% YoY revenue growth metrics. Benchmarked against AMD and INTC. Valuation agent warned of stretched multiples, but the Aggressive profile rewarded the high growth.
- **Output Summary:** Quant score of 85/100.
- **Final Recommendation:** **INVEST**
- **Important Insights:** The scenario analysis engine projected a massive variance between the Bull case (AI spending continues) and Bear case (hyperscaler capex drops), emphasizing that the stock is a high-risk, high-reward play perfectly suited for the selected profile.

---

## Limitations

- **Data Delay:** `yahoo-finance2` provides slightly delayed quotes (15 mins) and free-tier historical data, which may not be suitable for day-trading.
- **Context Window Limits:** While we normalize data, passing deep 10-K filings or massive historical datasets into the context window risks truncation or increased API costs.
- **LLM Reasoning Ceilings:** The AI excels at qualitative synthesis but cannot reliably perform complex DCF (Discounted Cash Flow) mathematical modeling internally; hence why the math is handled deterministically in TypeScript.

---

## Future Improvements

### Short-term Improvements
- Implement Redis caching to replace the MongoDB 6-hour cache for faster retrieval of hot queries.
- Add user authentication (Clerk/Auth0) to allow users to save private portfolios and custom risk profiles.
- Enhance the UI with export functionality (PDF/CSV) for the final research reports.

### Long-term Improvements
- Integrate SEC EDGAR API fetching to pull raw 10-Q/10-K text and feed it into a RAG (Retrieval-Augmented Generation) pipeline for the agents.
- Implement a fully deterministic DCF modeling engine in the backend that the Valuation agent can parameterize rather than just reacting to multiples.
- Create automated portfolio monitoring that re-runs the swarm weekly and sends email alerts on verdict changes.

---

## Performance Considerations

- **Network:** SSE keeps the connection open. On slow networks, the UI remains responsive, but final rendering of the `ReportViewer` may stutter if the JSON payload exceeds 500kb.
- **Caching:** The 6-hour MongoDB cache drastically reduces latency for popular tickers (from 20s to <1s) and saves significant LLM API costs.
- **Streaming:** The chunked streaming approach prevents Vercel/Render serverless function timeouts (which typically kill idle requests after 10s).
- **Optimization Opportunities:** `yahoo-finance2` calls could be further parallelized, and competitor identification could be cached persistently rather than relying on the LLM every time.

---

## Testing

**Manual Verification:**
1. Run the local servers.
2. Search for a well-known ticker (e.g., "MSFT").
3. Verify the terminal updates progressively.
4. Verify the final report renders without errors.
5. Search the same ticker again to verify the cache hits (should load instantly).
6. Test an invalid ticker (e.g., "INVALID_TICKER_123") to ensure the error boundary catches it and displays a clean message.

**Expected Outputs:** A fully populated report.
**Edge Cases:** Companies with missing financial data (e.g., newly IPO'd SPACs). The backend handles null values gracefully in `scoring.ts`.
**Failure Scenarios:** LLM provider rate limits. The `llm.ts` module includes basic retry logic, but severe rate limits will yield an error step to the client.

---

## Dependencies

**Frontend:**
- `react`, `react-dom`, `react-router-dom`: Core UI
- `tailwindcss`, `@tailwindcss/vite`: Styling
- `recharts`: Data visualization
- `lucide-react`: Iconography
- `vite`: Build tooling

**Backend:**
- `express`: Server framework
- `mongoose`: Database ODM
- `yahoo-finance2`: Financial data source
- `@langchain/core`, `@langchain/langgraph`, `@langchain/groq`: AI orchestration
- `zod`: Schema validation
- `cors`, `dotenv`: Server utilities
- `tsx`: TypeScript execution

---

## AI Development Process (BONUS SECTION)

**How AI was used:**
AI coding assistants were utilized heavily during the prototyping phase, particularly for generating the boilerplate Express/Vite setup and writing the complex Recharts visualization components. 

**How prompts evolved:**
The prompts used in the `agents.ts` file evolved significantly. Initially, a single prompt asked the LLM to "analyze the stock." The output was generic. It evolved into the Swarm model, where prompts were strictly confined: "You are the Bear agent. Your ONLY job is to find reasons this stock will fail. Do not mention positives."

**How debugging was performed:**
AI was used to parse complex TypeScript errors, specifically when dealing with the strict typing required by LangGraph state management and Zod schema inference.

**How architecture decisions were validated:**
The decision to separate the Quant Scoring Engine from the LLM output was validated through iterative testing; early versions allowed the LLM to assign the final score (0-100), which proved wildly inconsistent.

**Verification & Manual Improvements:**
*All generated code was manually reviewed, integrated, tested, and refined before inclusion.* The deterministic `scoring.ts` logic and the `claimVerifier.ts` audit trail were entirely hand-tuned to ensure mathematical accuracy and logical soundness.

---

## LLM Chat Transcript Appendix (BONUS)

| Date | Prompt Objective | LLM Used | Outcome | Lessons Learned |
| :--- | :--- | :--- | :--- | :--- |
| [Placeholder] | *Design the Agent Swarm Architecture* | Gemini 2.0 Pro / GPT-4o | Generated base LangGraph state definitions. | LangGraph state requires careful typing in TS to merge parallel outputs correctly. |
| [Placeholder] | *Create the Recharts Financial Components* | Claude 3.5 Sonnet | Generated responsive, styled charts for revenue/net income. | Recharts requires specific data shaping; AI helped map the Yahoo Finance data arrays accurately. |
| [Placeholder] | *Write the Zod Validation Schemas* | Groq Llama 3.3 | Created strict schemas for Agent Outputs. | Forcing `withStructuredOutput` is vastly superior to asking for raw JSON text. |

*(Replace placeholders with actual conversational logs as needed)*

---

## What I Would Improve With More Time

- **Architecture:** Move from a single Express server to a Serverless architecture (e.g., AWS Lambda / Next.js API Routes) with edge caching for maximum scalability.
- **Testing:** Implement a full Jest suite for the `scoring.ts` and `evidence.ts` math to ensure edge-case ratios (e.g., negative P/E) never crash the pipeline. Add Cypress for E2E testing of the SSE stream.
- **CI/CD:** Setup GitHub Actions to automatically lint, test, and deploy to Vercel (Frontend) and Render (Backend).
- **Monitoring:** Integrate Sentry for error tracking and PostHog for user analytics to see which risk profiles are most commonly used.
- **Observability:** Use LangSmith to trace the LangGraph execution steps in production, allowing for continuous tuning of agent prompts.

---

## Conclusion

InvestAI represents a paradigm shift in how retail investors can leverage AI. By moving away from simple chat interfaces and building a rigid, multi-agent architecture bound by deterministic math and immutable evidence, the platform delivers professional-grade, trustworthy, and explainable financial research. It successfully demonstrates advanced full-stack engineering, real-time data streaming, and cutting-edge LLM orchestration.
