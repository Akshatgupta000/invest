import { ResearchReport } from "../lib/types/research";
import { useState } from "react";

export default function AuditTrail({ auditTrail }: { auditTrail: ResearchReport["auditTrail"] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!auditTrail || auditTrail.length === 0) return null;

  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: "none", 
          border: "none", 
          color: "var(--text-primary)", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          padding: 0,
          fontFamily: "inherit",
          fontSize: "14px"
        }}
      >
        <span>{isOpen ? "▼" : "▶"}</span> View Evidence Audit Trail
      </button>

      {isOpen && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {auditTrail.map((item, idx) => (
            <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
              <div style={{ color: "var(--text-primary)", fontWeight: "bold", marginBottom: "4px" }}>
                Claim (Agent: {item.agent})
              </div>
              <div style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
                "{item.claim}"
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "var(--text-muted)", fontSize: "12px" }}>
                <div><strong>Evidence:</strong> {item.supportingEvidence}</div>
                <div><strong>Source:</strong> {item.source}</div>
                <div>
                  <strong>Confidence:</strong>{" "}
                  <span style={{ 
                    color: item.confidence === "high" ? "var(--accent-green)" : 
                           item.confidence === "medium" ? "var(--accent-yellow)" : "var(--accent-red)" 
                  }}>
                    {item.confidence.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
