"use client";

import type { ResearchReport } from "@/lib/types/research";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { AgentDebate } from "./AgentDebate";
import { EvidenceTable } from "./EvidenceTable";
import { CompetitorComparison } from "./CompetitorComparison";
import WhatChangedView from "./WhatChangedView";
import ScenarioAnalysis from "./ScenarioAnalysis";
import AuditTrail from "./AuditTrail";
import { downloadMarkdown } from "@/lib/exportMarkdown";

interface ReportViewerProps {
  report: ResearchReport & { cached?: boolean };
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const isInvest = report.verdict === "INVEST";
  const isWatchlist = report.verdict === "WATCHLIST";

  return (
    <div className="report-card animate-fade-in p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 max-w-4xl mx-auto w-full">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-700/50 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-100">{report.company}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
              {report.ticker}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            {report.cached && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full border border-gray-600">
                ⚡ Cached
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded-full border border-indigo-700/50">
              {report.riskProfile.toUpperCase()} PROFILE
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end mt-4 md:mt-0 gap-2">
          <div className={`px-4 py-2 rounded-xl text-lg font-bold flex items-center gap-2 border ${
            isInvest ? "bg-green-950/50 text-green-400 border-green-800/50" : 
            isWatchlist ? "bg-yellow-950/50 text-yellow-400 border-yellow-800/50" :
            "bg-red-950/50 text-red-400 border-red-800/50"
          }`}>
            <span>{isInvest ? "✅" : isWatchlist ? "⚠️" : "⛔"}</span>
            {report.verdict}
          </div>
          <button 
            onClick={() => downloadMarkdown(report as any)}
            className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export to Markdown
          </button>
        </div>
      </div>

      {/* What Changed since last report */}
      <WhatChangedView whatChanged={report.whatChanged} />

      {/* Investment Thesis / Judge Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-300 mb-3">Judge Agent's Thesis</h3>
        <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/50 text-gray-300 leading-relaxed text-sm">
          {report.agentDebate?.judge?.thesis || "No thesis provided."}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-8 p-4 rounded-xl border border-gray-700/50 bg-gray-900/30">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-gray-300 font-bold">AI Confidence Score</h4>
          <span className={`font-bold ${
            report.confidence?.level === "high" ? "text-green-400" :
            report.confidence?.level === "medium" ? "text-yellow-400" : "text-red-400"
          }`}>
            {report.confidence?.score}/100 ({report.confidence?.level})
          </span>
        </div>
        <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
          {report.confidence?.limitations.map((lim, i) => <li key={i}>{lim}</li>)}
        </ul>
      </div>

      {/* 3. Score Breakdown */}
      {/* Ensure backward compatibility or update ScoreBreakdown component separately if needed */}
      <ScoreBreakdown 
        scores={{}} 
        scoreWeights={{}} 
        overallScore={report.finalScore} 
        verdict={report.verdict}
        riskProfile={report.riskProfile}
        scoreBreakdown={report.scoreBreakdown}
      />

      {/* 4. Scenario Analysis */}
      <ScenarioAnalysis scenarios={report.scenarios} />

      {/* 5. Agent Debate */}
      {/* Wait, the existing AgentDebate component might expect the old format. We pass it the new agentDebate structure. */}
      {/* Assuming AgentDebate handles the agent keys gracefully, but we might need to adjust it if it breaks. */}
      <AgentDebate debate={report.agentDebate as any} />

      {/* 6. Evidence Table */}
      <EvidenceTable evidence={report.evidence as any} />

      {/* 7. Competitor Comparison */}
      <CompetitorComparison competitors={report.competitorBenchmarks || [] as any} />

      {/* 8. Audit Trail */}
      <AuditTrail auditTrail={report.auditTrail} />

      {/* 9. Sources & News */}
      {report.newsIntelligence?.topBullish && report.newsIntelligence.topBullish.length > 0 && (
        <div className="mt-8 border-t border-gray-700/50 pt-6">
          <h3 className="text-lg font-bold text-gray-300 mb-4">📰 Top Bullish News</h3>
          <div className="space-y-3">
            {report.newsIntelligence.topBullish.map((n: any, i: number) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block bg-gray-800/20 hover:bg-gray-800/50 border border-green-700/30 rounded-lg p-3 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🟢</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">{n.headline}</h4>
                    <span className="text-xs text-gray-500">{n.publisher || n.source}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 10. Disclaimer */}
      <div className="mt-12 text-center border-t border-gray-800 pt-6">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
          This tool is for educational research only and does not provide financial advice.<br/>
          Always do your own research or consult a qualified financial advisor before investing.
        </p>
      </div>
    </div>
  );
}
