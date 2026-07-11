"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { HistoricalFinancials } from "../../lib/types/research";

interface Props {
  historicalTrends: HistoricalFinancials;
}

const formatBillion = (v: number) => {
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1e1e24] border border-[#2a2a32] rounded-xl p-3 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">Year {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-bold">
            {p.name}: {formatBillion(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueEarningsChart({ historicalTrends }: Props) {
  const revValues = historicalTrends?.revenueTrend?.values ?? [];
  const niValues = historicalTrends?.netIncomeTrend?.values ?? [];

  if (revValues.length === 0 && niValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        Historical trend data not available
      </div>
    );
  }

  const len = Math.max(revValues.length, niValues.length);
  const data = Array.from({ length: len }, (_, i) => ({
    label: `Y${i + 1}`,
    Revenue: revValues[i] ?? null,
    "Net Income": niValues[i] ?? null,
  }));

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#7c5cfc" }} />
          Revenue
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#ccff00" }} />
          Net Income
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatBillion} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
          <Bar dataKey="Revenue" fill="#7c5cfc" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Net Income" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d, i) => (
              <Cell key={i} fill={(d["Net Income"] ?? 0) >= 0 ? "#ccff00" : "#ff3366"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {historicalTrends?.revenueTrend && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Revenue trend: <span className={`font-semibold ${historicalTrends.revenueTrend.direction === "improving" ? "text-[#ccff00]" : historicalTrends.revenueTrend.direction === "declining" ? "text-[#ff3366]" : "text-gray-400"}`}>
            {historicalTrends.revenueTrend.direction}
          </span> — {historicalTrends.revenueTrend.summary}
        </p>
      )}
    </div>
  );
}
