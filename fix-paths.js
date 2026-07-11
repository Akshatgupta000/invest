const fs = require('fs');
const path = require('path');

// Fix README
let readme = fs.readFileSync('README.md', 'utf8');
readme = readme.replace(/\[!\[Next\.js\].*?\)/, '[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)\n[![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)](https://expressjs.com/)\n[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)');
readme = readme.replace(/UI\[Next\.js Frontend<br\/>page\.tsx \+ Components\]/, 'UI[React Frontend<br/>App.tsx + Components]');
readme = readme.replace(/API\["Next\.js API Routes"\]/, 'API["Express API Server"]');
readme = readme.replace(/Frontend \| Next\.js 16 \(App Router\), React 19, TypeScript/, 'Frontend | React 19, Vite, TypeScript');
readme = readme.replace(/Backend \| Next\.js API Routes \(Node\.js runtime\)/, 'Backend | Node.js + Express');
readme = readme.replace(/Streaming \| Server-Sent Events via `ReadableStream`/, 'Streaming | Server-Sent Events via Express `res.write()`');

const oldTree = `invest/
├── public/                          # Static assets (SVG icons)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── research/route.ts    # POST — SSE research pipeline
│   │   │   └── reports/route.ts     # GET list / DELETE by id
│   │   ├── globals.css              # Dark glassmorphic design system
│   │   ├── layout.tsx               # Root layout and metadata
│   │   └── page.tsx                 # Main search, terminal, and report UI
│   ├── components/
│   │   ├── AgentDebate.tsx          # Multi-agent argument display
│   │   ├── AgentTerminal.tsx        # Live SSE progress console
│   │   ├── AuditTrail.tsx           # Evidence-backed claim audit
│   │   ├── CompetitorComparison.tsx # Peer percentile benchmarks
│   │   ├── EvidenceTable.tsx        # Evidence store table
│   │   ├── KeyFinancials.tsx        # Financial metrics tear sheet
│   │   ├── ReportViewer.tsx         # Structured report layout
│   │   ├── ScenarioAnalysis.tsx     # Bull / Base / Bear scenarios
│   │   ├── ScoreBreakdown.tsx       # Quant score by category
│   │   └── WhatChangedView.tsx      # Delta vs. previous report
│   ├── lib/
│   │   ├── agent.ts                 # Research orchestrator (AsyncGenerator)
│   │   ├── graph.ts                 # LangGraph StateGraph definition
│   │   ├── agents/
│   │   │   ├── baseAgent.ts         # LLM fallback chain + runAgent()
│   │   │   ├── parallelAgents.ts    # Bull, Bear, Risk, Valuation, News prompts
│   │   │   └── judgeAgent.ts        # Judge synthesis prompt
│   │   ├── finance.ts               # Yahoo Finance data fetching
│   │   ├── news.ts                  # News fetch + sentiment classification
│   │   ├── historical.ts            # 3-year trend analysis
│   │   ├── competitors.ts           # Peer identification + benchmarking
│   │   ├── evidence.ts              # Evidence store builder
│   │   ├── scoring.ts               # Deterministic quant scoring
│   │   ├── valuation.ts             # Rule-based valuation engine
│   │   ├── scenarios.ts             # LLM scenario generator
│   │   ├── confidence.ts            # Confidence score calculator
│   │   ├── claimVerifier.ts         # Evidence citation verification
│   │   ├── reportComparison.ts      # What-changed delta logic
│   │   ├── exportMarkdown.ts        # Report markdown export
│   │   ├── llm.ts                   # Shared LLM helper (Groq/Gemini)
│   │   ├── rateLimit.ts             # In-memory IP rate limiting
│   │   ├── db.ts                    # Mongoose connection cache
│   │   ├── validation.ts            # API request Zod schemas
│   │   ├── validation/agentSchemas.ts # Agent output Zod schemas
│   │   └── types/research.ts        # Shared TypeScript types
│   └── models/
│       └── Report.ts                # Mongoose report schema
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── PROJECT_OVERVIEW.md              # Extended architectural deep dive
└── AI_USAGE_LOGS.md                 # AI development session logs`;

const newTree = `invest/
├── client/                          # React + Vite Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # UI Components (AgentTerminal, ReportViewer)
│   │   ├── lib/                     # Client-side helpers and types
│   │   ├── App.tsx                  # Main layout and search logic
│   │   ├── main.tsx                 # React DOM entry
│   │   └── index.css                # Tailwind glassmorphic tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── lib/                     # Agent logic, LangGraph orchestrator, Yahoo Finance
│   │   ├── models/                  # Mongoose Report schema
│   │   ├── routes/                  # Express endpoints (research SSE, reports GET/DELETE)
│   │   └── server.ts                # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json                     # Monorepo root package (concurrently)
├── PROJECT_OVERVIEW.md
└── README.md`;

readme = readme.replace(oldTree, newTree);
fs.writeFileSync('README.md', readme, 'utf8');

// Fix PROJECT_OVERVIEW
let po = fs.readFileSync('PROJECT_OVERVIEW.md', 'utf8');
po = po.replace(/Next\.js \(App Router\)/g, 'React (Vite) + Express');
po = po.replace(/Next\.js API route consumes this generator and pipes discrete JSON events to the client \nusing a `ReadableStream`/g, 'Express API route consumes this generator and pipes discrete JSON events to the client using `res.write()`');
fs.writeFileSync('PROJECT_OVERVIEW.md', po, 'utf8');

// Copy properly
function copyAndReplace(srcPath, destPath, replacer) {
  let content = fs.readFileSync(srcPath, 'utf8');
  content = replacer(content);
  fs.writeFileSync(destPath, content, 'utf8');
}

function processDir(srcDir, destDir, depth) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    if (fs.statSync(srcFile).isDirectory()) {
      if (!fs.existsSync(destFile)) fs.mkdirSync(destFile);
      processDir(srcFile, destFile, depth + 1);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      copyAndReplace(srcFile, destFile, (c) => {
        const libPath = depth === 1 ? '../lib/' : '../../lib/';
        return c.replace(/@\/lib\//g, libPath);
      });
    }
  }
}

// Copy components
processDir('src/components', 'client/src/components', 1);

// Copy App.tsx
copyAndReplace('src/app/page.tsx', 'client/src/App.tsx', (c) => {
  let modified = c.replace(/"use client";?\n/g, '');
  modified = modified.replace(/export default function Search/g, 'export default function App');
  modified = modified.replace(/@\/lib\//g, '../lib/');
  modified = modified.replace(/@\/components\//g, './components/');
  return modified;
});

// Remove src
fs.rmSync('src', { recursive: true, force: true });
console.log('Fixed paths and removed src');
