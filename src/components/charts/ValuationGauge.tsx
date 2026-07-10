"use client";
import type { FinancialSnapshot } from "@/lib/types/research";

interface Props {
  snapshot: FinancialSnapshot;
}

interface GaugeMetric {
  label: string;
  value: number | null | undefined;
  unit: string;
  cheapBelow: number;
  fairBelow: number;
  expensiveAbove: number;
  analystNote?: string;
}

function ValuationGaugeRow({ label, value, unit, cheapBelow, fairBelow, expensiveAbove, analystNote }: GaugeMetric) {
  if (value === null || value === undefined) {
    return (
      <div className="py-4 border-b border-[#2a2a32] last:border-0">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm text-gray-600 font-mono">N/A</span>
        </div>
        <div className="h-2 bg-[#2a2a32] rounded-full" />
      </div>
    );
  }

  const max = expensiveAbove * 1.5;
  const clampedVal = Math.min(value, max);
  const pct = Math.max(2, (clampedVal / max) * 100);

  let zone: "cheap" | "fair" | "expensive" = "expensive";
  let zoneColor = "#ff3366";
  let zoneLabel = "Expensive";
  if (value <= cheapBelow) { zone = "cheap"; zoneColor = "#ccff00"; zoneLabel = "Undervalued"; }
  else if (value <= fairBelow) { zone = "fair"; zoneColor = "#f59e0b"; zoneLabel = "Fair Value"; }

  // Tick marks
  const cheapPct = (cheapBelow / max) * 100;
  const fairPct = (fairBelow / max) * 100;

  return (
    <div className="py-4 border-b border-[#2a2a32] last:border-0">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {analystNote && <span className="text-xs text-gray-600 ml-2">({analystNote})</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold font-mono text-white">{value.toFixed(1)}{unit}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: zoneColor + "20", color: zoneColor }}>
            {zoneLabel}
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #ccff00 0%, #f59e0b 40%, #ff3366 100%)" }}>
        {/* Filled mask from right — makes it look like a pointer position */}
        <div className="absolute inset-0 bg-[#16161a] rounded-full" style={{ left: `${pct}%` }} />
        {/* Current value dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#16161a] shadow-lg z-10"
          style={{ left: `calc(${pct}% - 6px)`, background: zoneColor }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-600">
        <span>Cheap (&lt;{cheapBelow}{unit})</span>
        <span>Fair ({cheapBelow}–{fairBelow}{unit})</span>
        <span>Expensive (&gt;{expensiveAbove}{unit})</span>
      </div>
    </div>
  );
}

function AnalystTargetCard({ snapshot }: { snapshot: FinancialSnapshot }) {
  const current = snapshot.price;
  const target = snapshot.analystTargetPrice;
  const rec = snapshot.recommendationKey;

  if (!current || !target) return null;

  const upside = ((target - current) / current) * 100;
  const isUpside = upside >= 0;

  const recColors: Record<string, string> = {
    "strong_buy": "#ccff00", "buy": "#86efac", "hold": "#f59e0b",
    "underperform": "#fb923c", "sell": "#ff3366",
  };
  const recColor = rec ? (recColors[rec] ?? "#9ca3af") : "#9ca3af";

  return (
    <div className="mt-5 p-4 bg-[#1e1e24] border border-[#2a2a32] rounded-xl flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Analyst Consensus</p>
        <p className="text-2xl font-black text-white font-mono">${target.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-0.5">vs current ${current.toFixed(2)}</p>
      </div>
      <div className="text-right">
        <p className={`text-2xl font-black font-mono ${isUpside ? "text-[#ccff00]" : "text-[#ff3366]"}`}>
          {isUpside ? "+" : ""}{upside.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500 mt-0.5">implied upside</p>
      </div>
      {rec && (
        <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: recColor + "40", background: recColor + "10" }}>
          <p className="text-xs text-gray-500 mb-0.5">Rating</p>
          <p className="text-sm font-bold uppercase" style={{ color: recColor }}>{rec.replace("_", " ")}</p>
        </div>
      )}
    </div>
  );
}

export function ValuationGauge({ snapshot }: Props) {
  const metrics: GaugeMetric[] = [
    { label: "P/E Ratio", value: snapshot.peRatio, unit: "x", cheapBelow: 15, fairBelow: 25, expensiveAbove: 40, analystNote: "trailing" },
    { label: "Forward P/E", value: snapshot.forwardPE, unit: "x", cheapBelow: 12, fairBelow: 22, expensiveAbove: 35 },
    { label: "EV / EBITDA", value: snapshot.evToEbitda, unit: "x", cheapBelow: 8, fairBelow: 15, expensiveAbove: 25 },
    { label: "Price / Sales", value: snapshot.priceToSales, unit: "x", cheapBelow: 2, fairBelow: 5, expensiveAbove: 10 },
    { label: "Price / Book", value: snapshot.priceToBook, unit: "x", cheapBelow: 1.5, fairBelow: 3, expensiveAbove: 6 },
    { label: "PEG Ratio", value: snapshot.pegRatio, unit: "", cheapBelow: 1, fairBelow: 2, expensiveAbove: 3, analystNote: "<1 undervalued" },
  ];

  return (
    <div className="w-full">
      {metrics.map((m) => (
        <ValuationGaugeRow key={m.label} {...m} />
      ))}
      <AnalystTargetCard snapshot={snapshot} />
    </div>
  );
}
