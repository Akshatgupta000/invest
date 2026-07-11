"use client";

import { useState } from "react";
import type { ResearchReport } from "../lib/types/research";
import { AgentDebate } from "./AgentDebate";
import AuditTrail from "./AuditTrail";
import WhatChangedView from "./WhatChangedView";
import { downloadMarkdown } from "../lib/exportMarkdown";

// Charts
import { ScoreRadialChart } from "./charts/ScoreRadialChart";
import { PricePerformanceChart } from "./charts/PricePerformanceChart";
import { RevenueEarningsChart } from "./charts/RevenueEarningsChart";
import { MarginsChart } from "./charts/MarginsChart";
import { ValuationGauge } from "./charts/ValuationGauge";
import { FiftyTwoWeekBar } from "./charts/FiftyTwoWeekBar";
import { SentimentBar } from "./charts/SentimentBar";
import { ScenarioUpsideBar } from "./charts/ScenarioUpsideBar";

// ─── Types ────────────────────────────────────────────────────────
interface ReportViewerProps {
  report: ResearchReport & { cached?: boolean };
}

const TABS = [
  { id: "overview",    label: "Overview",    icon: "📊" },
  { id: "financials",  label: "Financials",  icon: "💰" },
  { id: "charts",      label: "Charts",      icon: "📈" },
  { id: "valuation",   label: "Valuation",   icon: "🔢" },
  { id: "scenarios",   label: "Scenarios",   icon: "🔭" },
  { id: "agents",      label: "AI Agents",   icon: "🤖" },
  { id: "news",        label: "News",        icon: "📰" },
  { id: "audit",       label: "Audit",       icon: "🔍" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Helpers ──────────────────────────────────────────────────────
const fmt = {
  currency: (v: number | null | undefined, decimals = 2) =>
    v == null ? "N/A" : v >= 1e12 ? `$${(v / 1e12).toFixed(decimals)}T`
             : v >= 1e9  ? `$${(v / 1e9).toFixed(decimals)}B`
             : v >= 1e6  ? `$${(v / 1e6).toFixed(decimals)}M`
             : `$${v.toFixed(decimals)}`,
  pct: (v: number | null | undefined) => v == null ? "N/A" : `${(v * 100).toFixed(1)}%`,
  num: (v: number | null | undefined, d = 2) => v == null ? "N/A" : v.toFixed(d),
};

// ─── Sub-components ───────────────────────────────────────────────
function StatChip({ label, value, highlight }: { label: string; value: string; highlight?: "good" | "warn" | "bad" | "neutral" }) {
  const colors = {
    good: "text-[#ccff00] border-[#ccff00]/20 bg-[#ccff00]/5",
    warn: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    bad: "text-[#ff3366] border-[#ff3366]/20 bg-[#ff3366]/5",
    neutral: "text-gray-300 border-white/10 bg-white/5",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[highlight ?? "neutral"]}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-lg font-bold font-mono">{value}</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e1e24] border border-[#2a2a32] rounded-2xl p-6">
      <h3 className="text-base font-bold text-gray-200 mb-5">{title}</h3>
      {children}
    </div>
  );
}

function NewsCard({ item, type }: { item: any; type: "bullish" | "bearish" | "neutral" }) {
  const colors = {
    bullish: { dot: "bg-[#ccff00]", border: "border-[#ccff00]/15", badge: "text-[#ccff00] bg-[#ccff00]/10" },
    bearish: { dot: "bg-[#ff3366]", border: "border-[#ff3366]/15", badge: "text-[#ff3366] bg-[#ff3366]/10" },
    neutral: { dot: "bg-gray-500", border: "border-white/10", badge: "text-gray-400 bg-white/5" },
  };
  const c = colors[type];
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex gap-3 p-4 rounded-xl border ${c.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors group`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">{item.headline}</p>
        <p className="text-xs text-gray-600 mt-1">{item.publisher || item.source}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 h-fit mt-1 ${c.badge}`}>{type}</span>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function ReportViewer({ report }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const snap = report.snapshot;
  const isInvest = report.verdict === "INVEST";
  const isWatch = report.verdict === "WATCHLIST";
  const verdictColor = isInvest ? "#ccff00" : isWatch ? "#f59e0b" : "#ff3366";
  const verdictIcon = isInvest ? "✅" : isWatch ? "⚠️" : "⛔";

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">

      {/* ── Sticky Dashboard Header ── */}
      <div className="sticky top-0 z-20 bg-[#16161a]/95 backdrop-blur-md border-b border-[#2a2a32] mb-0">
        {/* Company bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#a855f7] flex items-center justify-center font-black text-white text-sm flex-shrink-0">
              {report.ticker?.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white truncate leading-none">{report.company}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-mono text-[#7c5cfc] bg-[#7c5cfc]/10 border border-[#7c5cfc]/20 px-2 py-0.5 rounded">{report.ticker}</span>
                <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                {report.cached && <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#2a2a32] text-gray-400 rounded-full border border-[#3a3a44]">⚡ Cached</span>}
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded-full border border-indigo-700/30">{report.riskProfile}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Price */}
            {snap.price && (
              <div className="hidden md:block text-right">
                <p className="text-xl font-black font-mono text-white">${snap.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{snap.currency ?? "USD"}</p>
              </div>
            )}
            {/* Verdict */}
            <div
              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border"
              style={{ color: verdictColor, borderColor: verdictColor + "40", background: verdictColor + "12" }}
            >
              {verdictIcon} {report.verdict}
            </div>
            {/* Score */}
            <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 rounded-xl border" style={{ borderColor: verdictColor + "30", background: verdictColor + "0a" }}>
              <span className="text-xl font-black" style={{ color: verdictColor }}>{report.finalScore}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wide">/100</span>
            </div>
            {/* Export */}
            <button
              onClick={() => downloadMarkdown(report as any)}
              title="Export to Markdown"
              className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#ccff00] transition-colors px-3 py-2 rounded-lg border border-[#2a2a32] hover:border-[#ccff00]/30"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto gap-0.5 px-4 pb-0 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#7c5cfc] text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-[#2a2a32]"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Panels ── */}
      <div className="p-6 space-y-6 animate-fade-in" key={activeTab}>

        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            <WhatChangedView whatChanged={report.whatChanged} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Radial */}
              <SectionCard title="Investment Score Breakdown">
                {report.scoreBreakdown && (
                  <ScoreRadialChart
                    categoryScores={report.scoreBreakdown.categoryScores}
                    finalScore={report.finalScore}
                    verdict={report.verdict}
                  />
                )}
                {report.scoreBreakdown?.explanation && (
                  <p className="text-xs text-gray-500 text-center mt-4 border-t border-[#2a2a32] pt-3">{report.scoreBreakdown.explanation}</p>
                )}
              </SectionCard>

              {/* Judge Thesis + Confidence */}
              <div className="space-y-4">
                <SectionCard title="⚖️ Judge Agent Thesis">
                  <p className="text-sm text-gray-300 leading-relaxed">{report.agentDebate?.judge?.thesis || "No thesis provided."}</p>
                </SectionCard>
                <SectionCard title="🎯 AI Confidence">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Confidence Level</span>
                    <span className={`font-bold text-lg font-mono ${report.confidence?.level === "high" ? "text-[#ccff00]" : report.confidence?.level === "medium" ? "text-amber-400" : "text-[#ff3366]"}`}>
                      {report.confidence?.score}/100
                      <span className="text-xs ml-1 font-normal text-gray-500">({report.confidence?.level})</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a2a32] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${report.confidence?.score ?? 0}%`,
                        background: report.confidence?.level === "high" ? "#ccff00" : report.confidence?.level === "medium" ? "#f59e0b" : "#ff3366"
                      }}
                    />
                  </div>
                  {report.confidence?.limitations?.map((l, i) => (
                    <p key={i} className="text-xs text-gray-500 flex gap-1.5 mt-1"><span className="text-amber-500/60">⚠</span>{l}</p>
                  ))}
                </SectionCard>
              </div>
            </div>

            {/* Score category detail */}
            {report.scoreBreakdown?.categoryScores && (
              <SectionCard title="Category Breakdown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.scoreBreakdown.categoryScores.map((cat) => {
                    const color = cat.rawScore >= 70 ? "#ccff00" : cat.rawScore >= 45 ? "#f59e0b" : "#ff3366";
                    return (
                      <div key={cat.category} className="bg-[#16161a] rounded-xl p-4 border border-[#2a2a32]">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-300">{cat.category}</p>
                          <span className="text-lg font-black font-mono" style={{ color }}>{cat.rawScore}</span>
                        </div>
                        <div className="h-1.5 bg-[#2a2a32] rounded-full overflow-hidden mb-3">
                          <div className="h-full rounded-full" style={{ width: `${cat.rawScore}%`, background: color }} />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{cat.explanation}</p>
                        {cat.positiveFactors.map((f, i) => <p key={i} className="text-xs text-[#ccff00]/70 flex gap-1"><span>✓</span>{f}</p>)}
                        {cat.negativeFactors.map((f, i) => <p key={i} className="text-xs text-[#ff3366]/70 flex gap-1"><span>✗</span>{f}</p>)}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* ══ FINANCIALS ════════════════════════════════════════ */}
        {activeTab === "financials" && (
          <>
            {/* KPI Grid */}
            <SectionCard title="Key Financial Metrics">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <StatChip label="Market Cap" value={fmt.currency(snap.marketCap)} />
                <StatChip label="Enterprise Value" value={fmt.currency(snap.enterpriseValue)} />
                <StatChip label="Revenue" value={snap.freeCashFlow != null ? fmt.currency(snap.freeCashFlow) : "N/A"} />
                <StatChip label="Free Cash Flow" value={fmt.currency(snap.freeCashFlow)} highlight={snap.freeCashFlow != null ? (snap.freeCashFlow > 0 ? "good" : "bad") : "neutral"} />
                <StatChip label="P/E Ratio" value={fmt.num(snap.peRatio) + "x"} highlight={snap.peRatio != null ? (snap.peRatio < 15 ? "good" : snap.peRatio > 35 ? "bad" : "warn") : "neutral"} />
                <StatChip label="Forward P/E" value={fmt.num(snap.forwardPE) + "x"} />
                <StatChip label="Profit Margin" value={fmt.pct(snap.profitMargin)} highlight={snap.profitMargin != null ? (snap.profitMargin > 0.15 ? "good" : snap.profitMargin > 0 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Revenue Growth" value={fmt.pct(snap.revenueGrowth)} highlight={snap.revenueGrowth != null ? (snap.revenueGrowth > 0.1 ? "good" : snap.revenueGrowth > 0 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Gross Margin" value={fmt.pct(snap.grossMargin)} highlight={snap.grossMargin != null ? (snap.grossMargin > 0.4 ? "good" : snap.grossMargin > 0.2 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Operating Margin" value={fmt.pct(snap.operatingMargin)} />
                <StatChip label="Return on Equity" value={fmt.pct(snap.returnOnEquity)} highlight={snap.returnOnEquity != null ? (snap.returnOnEquity > 0.15 ? "good" : snap.returnOnEquity > 0 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Return on Assets" value={fmt.pct(snap.returnOnAssets)} />
                <StatChip label="Debt / Equity" value={fmt.num(snap.debtToEquity) + "x"} highlight={snap.debtToEquity != null ? (snap.debtToEquity < 0.5 ? "good" : snap.debtToEquity < 1.5 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Current Ratio" value={fmt.num(snap.currentRatio) + "x"} highlight={snap.currentRatio != null ? (snap.currentRatio > 1.5 ? "good" : snap.currentRatio > 1 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Beta" value={fmt.num(snap.beta)} highlight={snap.beta != null ? (snap.beta < 1 ? "good" : snap.beta < 1.5 ? "warn" : "bad") : "neutral"} />
                <StatChip label="Dividend Yield" value={snap.dividendYield ? fmt.pct(snap.dividendYield) : "None"} highlight={snap.dividendYield ? "good" : "neutral"} />
                <StatChip label="Total Debt" value={fmt.currency(snap.totalDebt)} highlight={snap.totalDebt != null ? (snap.totalDebt < 1e9 ? "good" : "warn") : "neutral"} />
                <StatChip label="Total Cash" value={fmt.currency(snap.totalCash)} highlight={snap.totalCash != null ? "good" : "neutral"} />
              </div>
            </SectionCard>

            {/* 52W Range */}
            <FiftyTwoWeekBar snapshot={snap} />

            {/* Margins breakdown */}
            <SectionCard title="Profitability & Returns">
              <MarginsChart snapshot={snap} />
            </SectionCard>
          </>
        )}

        {/* ══ CHARTS ════════════════════════════════════════════ */}
        {activeTab === "charts" && (
          <>
            <SectionCard title="Price Performance">
              <PricePerformanceChart historicalTrends={report.historicalTrends} />
            </SectionCard>
            <SectionCard title="Revenue & Earnings Trends">
              <RevenueEarningsChart historicalTrends={report.historicalTrends} />
            </SectionCard>

            {/* Trend summaries */}
            {report.historicalTrends && (
              <SectionCard title="Trend Analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { trend: report.historicalTrends.revenueTrend, label: "Revenue" },
                    { trend: report.historicalTrends.netIncomeTrend, label: "Net Income" },
                    { trend: report.historicalTrends.fcfTrend, label: "Free Cash Flow" },
                    { trend: report.historicalTrends.debtTrend, label: "Debt" },
                  ].filter(t => t.trend).map(({ trend, label }) => {
                    const dir = trend!.direction;
                    const dirColor = dir === "improving" ? "#ccff00" : dir === "declining" ? "#ff3366" : "#f59e0b";
                    const dirIcon = dir === "improving" ? "↑" : dir === "declining" ? "↓" : "→";
                    return (
                      <div key={label} className="bg-[#16161a] rounded-xl p-4 border border-[#2a2a32] flex items-start gap-3">
                        <span className="text-2xl font-black font-mono mt-0.5" style={{ color: dirColor }}>{dirIcon}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{label} Trend</p>
                          <p className="text-xs text-gray-400 mt-1">{trend!.summary}</p>
                          <span className="text-xs font-bold capitalize mt-1 inline-block" style={{ color: dirColor }}>{dir}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* ══ VALUATION ═════════════════════════════════════════ */}
        {activeTab === "valuation" && (
          <>
            <SectionCard title="Valuation Multiples">
              <ValuationGauge snapshot={snap} />
            </SectionCard>

            {/* Competitor benchmarks */}
            {report.competitorBenchmarks?.length > 0 && (
              <SectionCard title="Peer Comparison Percentiles">
                <div className="space-y-4">
                  {report.competitorBenchmarks.map((item: any, i: number) => {
                    const pct = Math.round(item.percentile);
                    const color = pct >= 75 ? "#ccff00" : pct >= 50 ? "#f59e0b" : "#ff3366";
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-300 capitalize">{item.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold" style={{ color }}>
                              {pct >= 75 ? "Top Quartile" : pct >= 50 ? "Above Median" : pct >= 25 ? "Below Median" : "Bottom Quartile"}
                            </span>
                            <span className="text-sm font-bold font-mono text-white">{pct}th</span>
                          </div>
                        </div>
                        <div className="h-2 bg-[#2a2a32] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(2, pct)}%`, background: color }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Valuation Agent summary */}
            {report.agentDebate?.valuation && (
              <SectionCard title="💰 Valuation Agent Analysis">
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{report.agentDebate.valuation.thesis}</p>
                <div className="space-y-2">
                  {report.agentDebate.valuation.arguments?.map((arg: any, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-400">
                      <span className="text-[#7c5cfc]">•</span>
                      {typeof arg === "string" ? arg : arg.claim}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* ══ SCENARIOS ═════════════════════════════════════════ */}
        {activeTab === "scenarios" && (
          <SectionCard title="Scenario Analysis — Projected Upside / Downside">
            <ScenarioUpsideBar scenarios={report.scenarios} />
          </SectionCard>
        )}

        {/* ══ AI AGENTS ════════════════════════════════════════ */}
        {activeTab === "agents" && (
          <AgentDebate debate={report.agentDebate as any} />
        )}

        {/* ══ NEWS ══════════════════════════════════════════════ */}
        {activeTab === "news" && (
          <>
            {report.newsIntelligence && (
              <SectionCard title="Market Sentiment">
                <SentimentBar newsIntelligence={report.newsIntelligence} />
              </SectionCard>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.newsIntelligence?.topBullish?.length > 0 && (
                <SectionCard title="🟢 Bullish News">
                  <div className="space-y-2">
                    {report.newsIntelligence.topBullish.map((n: any, i: number) => (
                      <NewsCard key={i} item={n} type="bullish" />
                    ))}
                  </div>
                </SectionCard>
              )}
              {report.newsIntelligence?.topBearish?.length > 0 && (
                <SectionCard title="🔴 Bearish News">
                  <div className="space-y-2">
                    {report.newsIntelligence.topBearish.map((n: any, i: number) => (
                      <NewsCard key={i} item={n} type="bearish" />
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
            {report.newsIntelligence?.neutral?.length > 0 && (
              <SectionCard title="⚪ Neutral Coverage">
                <div className="space-y-2">
                  {report.newsIntelligence.neutral.map((n: any, i: number) => (
                    <NewsCard key={i} item={n} type="neutral" />
                  ))}
                </div>
              </SectionCard>
            )}
          </>
        )}

        {/* ══ AUDIT ═════════════════════════════════════════════ */}
        {activeTab === "audit" && (
          <SectionCard title="📚 Sources & Evidence Trail">
            <p className="text-sm text-gray-500 mb-5">Transparent audit of all claims made by the agent swarm.</p>
            <AuditTrail auditTrail={report.auditTrail} />
          </SectionCard>
        )}

        {/* ── Disclaimer ── */}
        <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider pt-4 border-t border-[#2a2a32]">
          For educational research only. Not financial advice. Always consult a qualified advisor before investing.
        </p>
      </div>
    </div>
  );
}
