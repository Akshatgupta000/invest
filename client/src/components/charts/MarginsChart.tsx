"use client";
import type { FinancialSnapshot } from "../../lib/types/research";

interface Props {
  snapshot: FinancialSnapshot;
}

interface MarginRow {
  label: string;
  value: number | null | undefined;
  description: string;
}

function getColor(value: number): { bar: string; text: string; bg: string } {
  if (value >= 0.2) return { bar: "#ccff00", text: "text-[#ccff00]", bg: "bg-[#ccff00]/10" };
  if (value >= 0.1) return { bar: "#f59e0b", text: "text-amber-400", bg: "bg-amber-400/10" };
  if (value >= 0) return { bar: "#06b6d4", text: "text-cyan-400", bg: "bg-cyan-400/10" };
  return { bar: "#ff3366", text: "text-[#ff3366]", bg: "bg-[#ff3366]/10" };
}

function MarginRow({ label, value, description }: MarginRow) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#2a2a32] last:border-0">
        <div>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
        <span className="text-gray-600 text-sm font-mono">N/A</span>
      </div>
    );
  }

  const pct = value * 100;
  const colors = getColor(value);
  const barWidth = Math.max(2, Math.min(100, Math.abs(pct)));

  return (
    <div className="py-3 border-b border-[#2a2a32] last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
        <span className={`text-base font-bold font-mono ${colors.text}`}>
          {pct >= 0 ? "" : "-"}{Math.abs(pct).toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-[#2a2a32] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${barWidth}%`, background: colors.bar }}
        />
      </div>
    </div>
  );
}

export function MarginsChart({ snapshot }: Props) {
  const rows: MarginRow[] = [
    { label: "Gross Margin", value: snapshot.grossMargin, description: "Revenue minus cost of goods sold" },
    { label: "Operating Margin", value: snapshot.operatingMargin, description: "After operating expenses" },
    { label: "Net Profit Margin", value: snapshot.profitMargin, description: "After all expenses & taxes" },
    { label: "Return on Equity", value: snapshot.returnOnEquity, description: "Net income / shareholders equity" },
    { label: "Return on Assets", value: snapshot.returnOnAssets, description: "Net income / total assets" },
  ];

  return (
    <div className="w-full">
      <div className="flex gap-3 mb-5 text-xs flex-wrap">
        {[
          { label: "≥ 20% Excellent", color: "#ccff00" },
          { label: "10–20% Good", color: "#f59e0b" },
          { label: "0–10% Weak", color: "#06b6d4" },
          { label: "< 0 Negative", color: "#ff3366" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <MarginRow key={r.label} {...r} />
      ))}
    </div>
  );
}
