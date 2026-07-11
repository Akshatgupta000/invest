import { ResearchReport } from "../lib/types/research";

export default function WhatChangedView({ whatChanged }: { whatChanged: ResearchReport["whatChanged"] }) {
  if (!whatChanged || !whatChanged.hasPreviousReport) return null;

  const isPositiveScore = (whatChanged.scoreChange ?? 0) > 0;
  const scoreColor = (whatChanged.scoreChange ?? 0) === 0 ? "var(--text-muted)" : isPositiveScore ? "var(--accent-green)" : "var(--accent-red)";

  return (
    <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", marginBottom: "24px" }}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🔄</span> What Changed
      </h3>
      <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--text-muted)" }}>
        {whatChanged.summary}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        
        {whatChanged.scoreChange !== undefined && (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Score Change</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: scoreColor }}>
              {whatChanged.scoreChange > 0 ? "+" : ""}{whatChanged.scoreChange} pts
            </div>
          </div>
        )}

        {whatChanged.verdictChange && (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Verdict</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)" }}>
              {whatChanged.verdictChange}
            </div>
          </div>
        )}

        {whatChanged.newPositiveDrivers.length > 0 && (
          <div style={{ background: "rgba(0,255,0,0.05)", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>New Drivers</div>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px" }}>
              {whatChanged.newPositiveDrivers.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}

        {whatChanged.newRisks.length > 0 && (
          <div style={{ background: "rgba(255,0,0,0.05)", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>New Risks</div>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px" }}>
              {whatChanged.newRisks.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
