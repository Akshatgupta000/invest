"use client";
import type { Scenario } from "../../lib/types/research";

interface Props {
  scenarios: Scenario[];
}

const SCENARIO_CONFIG = {
  Bull: { color: "#ccff00", icon: "🐂", bg: "rgba(204,255,0,0.06)", border: "rgba(204,255,0,0.2)" },
  Base: { color: "#06b6d4", icon: "⚖️", bg: "rgba(6,182,212,0.06)", border: "rgba(6,182,212,0.2)" },
  Bear: { color: "#ff3366", icon: "🐻", bg: "rgba(255,51,102,0.06)", border: "rgba(255,51,102,0.2)" },
};

function UpsideBar({ value, color }: { value: number; color: string }) {
  const isPositive = value >= 0;
  const barPct = Math.min(100, Math.abs(value * 100) * 2); // scale for display

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Left side (downside) */}
      <div className="flex-1 flex justify-end">
        {!isPositive && (
          <div
            className="h-3 rounded-l-full"
            style={{ width: `${barPct}%`, background: "#ff3366", opacity: 0.85 }}
          />
        )}
      </div>
      {/* Center line */}
      <div className="w-px h-5 bg-[#2a2a32] flex-shrink-0" />
      {/* Right side (upside) */}
      <div className="flex-1 flex justify-start">
        {isPositive && (
          <div
            className="h-3 rounded-r-full"
            style={{ width: `${barPct}%`, background: color, opacity: 0.85 }}
          />
        )}
      </div>
    </div>
  );
}

export function ScenarioUpsideBar({ scenarios }: Props) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center text-xs text-gray-500 gap-2 mb-2">
        <span>← Downside</span>
        <div className="flex-1 h-px bg-[#2a2a32]" />
        <span className="font-bold text-gray-400">0%</span>
        <div className="flex-1 h-px bg-[#2a2a32]" />
        <span>Upside →</span>
      </div>

      {scenarios.map((scenario) => {
        const config = SCENARIO_CONFIG[scenario.name] ?? SCENARIO_CONFIG.Base;
        const upside = scenario.estimatedUpsideDownside;
        const upsidePct = upside !== undefined ? (upside * 100) : null;

        return (
          <div
            key={scenario.name}
            className="rounded-2xl p-5 border"
            style={{ background: config.bg, borderColor: config.border }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <h4 className="font-bold text-white">{scenario.name} Case</h4>
              </div>
              {upsidePct !== null && (
                <span
                  className="text-xl font-black font-mono"
                  style={{ color: upsidePct >= 0 ? config.color : "#ff3366" }}
                >
                  {upsidePct >= 0 ? "+" : ""}{upsidePct.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Diverging bar */}
            {upsidePct !== null && (
              <div className="mb-4">
                <UpsideBar value={upside!} color={config.color} />
              </div>
            )}

            {/* Assumptions */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Rev Growth", value: `${(scenario.revenueGrowthAssumption * 100).toFixed(1)}%` },
                { label: "Net Margin", value: `${(scenario.marginAssumption * 100).toFixed(1)}%` },
                { label: "P/E Multiple", value: `${scenario.valuationMultipleAssumption.toFixed(1)}x` },
              ].map((a) => (
                <div key={a.label} className="bg-[#16161a]/60 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-500 mb-0.5">{a.label}</p>
                  <p className="text-sm font-bold font-mono text-white">{a.value}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">{scenario.reasoning}</p>

            {scenario.assumptions?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {scenario.assumptions.map((a, i) => (
                  <li key={i} className="text-xs text-gray-500 flex gap-2">
                    <span style={{ color: config.color }}>•</span>{a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
