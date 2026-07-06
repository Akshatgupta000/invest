import { ResearchReport } from "@/lib/types/research";

export default function ScenarioAnalysis({ scenarios }: { scenarios: ResearchReport["scenarios"] }) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "18px", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
        Scenario Analysis
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {scenarios.map((scenario, idx) => {
          const isBull = scenario.name === "Bull";
          const isBear = scenario.name === "Bear";
          
          let borderColor = "var(--border)";
          let titleColor = "var(--text-primary)";
          
          if (isBull) { borderColor = "var(--accent-green)"; titleColor = "var(--accent-green)"; }
          if (isBear) { borderColor = "var(--accent-red)"; titleColor = "var(--accent-red)"; }

          return (
            <div key={idx} style={{ 
              background: "var(--surface)", 
              border: `1px solid ${borderColor}`, 
              borderRadius: "12px", 
              padding: "16px" 
            }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: titleColor }}>
                {scenario.name} Case
              </h3>
              
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {scenario.reasoning}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Rev Growth</span>
                  <span>{(scenario.revenueGrowthAssumption * 100).toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Net Margin</span>
                  <span>{(scenario.marginAssumption * 100).toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>P/E Multiple</span>
                  <span>{scenario.valuationMultipleAssumption.toFixed(1)}x</span>
                </div>
                {scenario.estimatedUpsideDownside !== undefined && (
                   <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontWeight: "bold" }}>Est. Upside</span>
                    <span style={{ 
                      fontWeight: "bold",
                      color: scenario.estimatedUpsideDownside > 0 ? "var(--accent-green)" : "var(--accent-red)"
                    }}>
                      {(scenario.estimatedUpsideDownside * 100).toFixed(1)}%
                    </span>
                 </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
