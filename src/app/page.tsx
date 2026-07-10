"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentStep, ResearchReport } from "@/lib/types/research";
import AgentTerminal from "@/components/AgentTerminal";
import ReportViewer from "@/components/ReportViewer";

interface HistoryItem {
  _id: string;
  company: string;
  ticker: string;
  verdict: "INVEST" | "PASS";
  confidence: number;
  createdAt: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [riskProfile, setRiskProfile] = useState<"conservative" | "balanced" | "aggressive">("balanced");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reports ?? []);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q || isRunning) return;

    setQuery(q);
    setIsRunning(true);
    setSteps([]);
    setReport(null);
    setError(null);
    setShowHistory(false); // Hide history when searching

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, riskProfile }),
      });

      if (!res.ok) {
        let msg = `Server error: ${res.status}`;
        try {
          const json = await res.json();
          if (json.error) msg = json.error;
        } catch {}
        throw new Error(msg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const dataPart = line.replace(/^data: /, "").trim();
          if (!dataPart) continue;
          try {
            const event = JSON.parse(dataPart) as AgentStep;
            setSteps((prev) => [...prev, event]);
            if (event.type === "complete") {
              setReport(event.report);
              fetchHistory();
            }
            if (event.type === "error") {
              setError(event.message);
            }
          } catch {
            // Skip
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch {
      // Ignore
    }
  };

  const showTerminal = steps.length > 0;
  const showEmpty = !showTerminal && !report;

  return (
    <div className="lix-layout">
      {/* ─── Sidebar (Narrow Icons Only) ─── */}
      <aside className="lix-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">IN</div>
        </div>
        <div className="sidebar-nav">
          <button 
            className={`nav-icon ${showEmpty && !showHistory ? "active" : ""}`} 
            onClick={() => { setSteps([]); setReport(null); setShowHistory(false); setQuery(""); }}
            title="Home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          <button 
            className={`nav-icon ${showHistory ? "active" : ""}`} 
            onClick={() => setShowHistory(!showHistory)}
            title="History"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-icon" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <div className="nav-avatar"></div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="lix-main">
        {showHistory ? (
          <div className="history-panel animate-fade-in">
            <h2>Research History</h2>
            <div className="history-list">
              {history.length === 0 ? <p>No history found.</p> : history.map(item => (
                <div key={item._id} className="history-card" onClick={() => handleSearch(item.company)}>
                  <div className={`history-icon ${item.verdict.toLowerCase()}`}>{item.verdict === "INVEST" ? "✅" : "⛔"}</div>
                  <div className="history-info">
                    <h4>{item.company}</h4>
                    <span>{item.ticker}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        ) : showEmpty ? (
          <div className="lix-center-container animate-fade-in">
            <h1 className="lix-greeting" style={{ color: "var(--accent-purple)", fontWeight: 700 }}>Hi, Investor</h1>
            <h2 className="lix-question" style={{ fontSize: "52px" }}>How can I help today?</h2>
            <p className="lix-subtitle">I'm here to help — from financial data to smart recommendations.</p>
            
            <div className="lix-search-container">
              <div className="lix-pro-banner" style={{ background: "var(--accent-purple)", color: "white", border: "none", fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Unlock deeper insights with InvestAI Pro
              </div>
              <div className="lix-search-box">
                <input 
                  type="text" 
                  placeholder="Ask me to analyze any company..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  disabled={isRunning}
                />
                <button className="lix-submit-btn" onClick={() => handleSearch()} disabled={isRunning || !query.trim()}>
                  {isRunning ? <div className="spinner-small" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <span className="text-gray-400 font-medium">Risk Profile:</span>
                <div className="flex bg-[#232329] p-1 rounded-md border border-[#ffffff1a]">
                  {(["conservative", "balanced", "aggressive"] as const).map(profile => (
                    <button
                      key={profile}
                      onClick={() => setRiskProfile(profile)}
                      className={`px-4 py-1.5 rounded uppercase font-bold tracking-wide text-xs transition-colors ${
                        riskProfile === profile 
                          ? "bg-[#ccff00] text-black" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center mt-3 max-w-lg mx-auto opacity-70">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  This tool is for educational research only and does not provide financial advice. Always do your own research or consult a qualified financial advisor before investing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[800px]">
              <div 
                className="relative overflow-hidden bg-[#7c5cfc] rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform min-h-[140px] flex flex-col justify-end"
                onClick={() => handleSearch("Apple")}
              >
                <div className="absolute -top-4 -left-2 text-[100px] font-black text-black/20 leading-none pointer-events-none">01</div>
                <div className="relative z-10 text-white">
                  <h4 className="font-bold text-lg mb-1">Tech Giants</h4>
                  <p className="text-white/80 text-sm font-medium">Analyze Apple's latest earnings</p>
                </div>
              </div>
              <div 
                className="relative overflow-hidden bg-[#232329] rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform min-h-[140px] flex flex-col justify-end border border-white/10"
                onClick={() => handleSearch("Tesla")}
              >
                <div className="absolute -top-4 -left-2 text-[100px] font-black text-white/5 leading-none pointer-events-none">02</div>
                <div className="relative z-10 text-white">
                  <h4 className="font-bold text-lg mb-1">EV Market</h4>
                  <p className="text-gray-400 text-sm font-medium">Is Tesla a buy right now?</p>
                </div>
              </div>
              <div 
                className="relative overflow-hidden bg-[#ccff00] rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-transform min-h-[140px] flex flex-col justify-end"
                onClick={() => handleSearch("NVIDIA")}
              >
                <div className="absolute -top-4 -left-2 text-[100px] font-black text-black/10 leading-none pointer-events-none">03</div>
                <div className="relative z-10 text-black">
                  <h4 className="font-bold text-lg mb-1">AI Boom</h4>
                  <p className="text-black/70 text-sm font-medium">Check NVIDIA's financials</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lix-results-container">
            {/* Error banner */}
            {error && (
              <div className="error-banner animate-fade-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="lix-results-top-bar">
               <div className="lix-small-search">
                  <input 
                    type="text" 
                    placeholder="Analyze another company..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    disabled={isRunning}
                  />
                  <select 
                    value={riskProfile} 
                    onChange={e => setRiskProfile(e.target.value as any)}
                    disabled={isRunning}
                    className="bg-gray-800 border-none outline-none text-gray-300 text-sm px-2 rounded"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                  <button onClick={() => handleSearch()} disabled={isRunning || !query.trim()}>Search</button>
               </div>
            </div>

            {/* Agent Terminal */}
            {showTerminal && (
              <div className="lix-terminal-wrapper">
                <AgentTerminal steps={steps} isRunning={isRunning} />
              </div>
            )}

            {/* Report */}
            {report && (
              <div className="lix-report-wrapper">
                <ReportViewer report={report} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
