# InvestAI

> **Advanced AI-Powered Financial Research & Multi-Agent Debate Platform**

InvestAI is a professional-grade financial research assistant that leverages an architecture of specialized AI agents to analyze publicly traded companies. By aggregating real-time financial data, historical trends, and news sentiment, InvestAI orchestrates a debate between 5 specialized agents (Bull, Bear, Risk, Valuation, News) and a synthesizing Judge agent to provide highly nuanced, risk-adjusted investment reports backed by a verifiable evidence trail.

## Features

* **AI Agent Swarm Architecture** — Analyzes stocks through distinct, specialized lenses (Bull, Bear, Risk, Valuation, News) to ensure comprehensive analysis, synthesized by a final Judge agent.
* **Quant-Driven Scoring Engine** — Combines hard financial metrics (P/E, Margins, Debt) with AI agent biases and user risk profiles to calculate a transparent 0-100 score.
* **Evidence & Audit Trail** — Every claim made by the AI agents is mapped back to normalized underlying data (financials, news, competitor metrics) for full transparency and hallucination prevention.
* **Scenario Analysis** — Autonomously models Bull, Base, and Bear scenarios based on current financials and macro assumptions.
* **Report Versioning & Diffing** — Tracks changes over time, alerting users to new risks, new positive drivers, and score changes since the last report.
* **Real-Time Streaming** — Uses Server-Sent Events (SSE) to stream the AI's execution steps and the final report in real-time.

## How it Works

1. **Data Aggregation:** The backend resolves the ticker and fetches live financial metrics, 3-year historical trends, and recent news.
2. **Competitor Benchmarking:** Identifies major competitors and ranks the target company against peers based on key metrics (P/E, margins, growth).
3. **Evidence Normalization:** All fetched data is converted into immutable `EvidenceItem` objects.
4. **Agent Swarm Execution:** 5 parallel AI agents analyze the evidence from their unique perspectives, returning structured JSON with confidence scores and evidence citations.
5. **Judge Synthesis:** A final Judge agent reviews the debate and determines a final verdict (Invest, Watchlist, Pass) with a confidence score.
6. **Quant Validation:** A deterministic scoring engine validates the AI's verdict against hard financial reality and the user's risk profile.
7. **Audit & Diff:** Claims are verified against the evidence store, and the report is compared against the most recent historical report in the database.

## Architecture

```mermaid
flowchart TD
    User -->|Ticker & Risk| API[/api/research]
    API --> DataEngine
    
    subgraph DataEngine [Data Aggregation Engines]
        Finance[Financials]
        Historical[3Y Trends]
        News[News Sentiment]
        Peers[Competitor Benchmarks]
    end
    
    DataEngine --> EvidenceLayer[Normalized Evidence Store]
    
    EvidenceLayer --> Swarm
    
    subgraph Swarm [AI Agent Swarm]
        Bull(Bull Agent)
        Bear(Bear Agent)
        Risk(Risk Agent)
        Val(Valuation Agent)
        NewsAgent(News Agent)
    end
    
    Swarm --> Judge(Judge Agent)
    
    Judge --> Verifier[Claim Verifier & Audit Trail]
    DataEngine --> ScoringEngine[Quant Scoring Engine]
    
    Verifier --> Report[Final Research Report]
    ScoringEngine --> Report
    
    Report --> DB[(MongoDB)]
    Report -->|SSE Stream| Frontend[Next.js Client]
```

## Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | Next.js 16 (App Router), React 19, TailwindCSS |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB, Mongoose |
| **Validation** | Zod (Strict Schema Enforcement) |
| **Data Providers** | `yahoo-finance2` |
| **AI / LLM** | Multi-Provider Fallback (Groq, Gemini, OpenAI) |

## Getting Started

### Prerequisites

* Node.js (v20+)
* MongoDB Instance (local or Atlas)
* At least one LLM API key (Groq recommended for speed)

### Installation & Setup

1. Clone and install:
```bash
git clone <repository-url>
cd invest
npm install
```

2. Create a `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/investai
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

3. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to start researching.

## Disclaimer

This tool is for educational and research purposes only and does not provide financial advice. Always do your own research or consult a qualified financial advisor before making investment decisions.
