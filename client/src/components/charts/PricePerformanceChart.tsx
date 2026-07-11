"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { HistoricalFinancials } from "../../lib/types/research";

interface Props {
  historicalTrends: HistoricalFinancials;
}

const periods = [
  { key: "price1M", label: "1M" },
  { key: "price6M", label: "6M" },
  { key: "price1Y", label: "1Y" },
  { key: "price3Y", label: "3Y" },
] as const;

export function PricePerformanceChart({ historicalTrends }: Props) {
  // Build the available data points
  const dataPoints = periods
    .map((p) => {
      const val = historicalTrends?.[p.key as keyof HistoricalFinancials];
      return { label: p.label, value: typeof val === "number" ? parseFloat((val * 100).toFixed(2)) : null };
    })
    .filter((d) => d.value !== null) as { label: string; value: number }[];

  const allPositive = dataPoints.every((d) => d.value >= 0);
  const allNegative = dataPoints.every((d) => d.value < 0);
  const strokeColor = allNegative ? "#ff3366" : "#ccff00";
  const fillId = allNegative ? "negGrad" : "posGrad";

  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        Price performance data not available
      </div>
    );
  }

  // Normalize to show % gain/loss from first point
  const baseline = 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 mb-5">
        {dataPoints.map((d) => (
          <div key={d.label} className="bg-[#1e1e24] rounded-xl p-3 text-center border border-[#2a2a32]">
            <p className="text-gray-500 text-xs mb-1">{d.label}</p>
            <p className={`text-lg font-bold font-mono ${d.value >= 0 ? "text-[#ccff00]" : "text-[#ff3366]"}`}>
              {d.value >= 0 ? "+" : ""}{d.value}%
            </p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={dataPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3366" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(val: any) => [`${val >= 0 ? "+" : ""}${val}%`, "Return"]}
            contentStyle={{ background: "#1e1e24", border: "1px solid #2a2a32", borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: strokeColor }}
            cursor={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={{ fill: strokeColor, strokeWidth: 0, r: 4 }}
            activeDot={{ fill: strokeColor, r: 6, stroke: "#16161a", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {historicalTrends?.volatility && (
        <div className="mt-3 flex gap-6 text-xs text-gray-500">
          <span>Annualized Volatility: <span className="text-gray-300 font-mono">{(historicalTrends.volatility * 100).toFixed(1)}%</span></span>
          {historicalTrends.maxDrawdown && (
            <span>Max Drawdown: <span className="text-[#ff3366] font-mono">-{(historicalTrends.maxDrawdown * 100).toFixed(1)}%</span></span>
          )}
        </div>
      )}
    </div>
  );
}
