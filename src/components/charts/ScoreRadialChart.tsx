"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { QuantScore } from "@/lib/types/research";

const COLORS: Record<string, string> = {
  "Valuation": "#7c5cfc",
  "Financial Health": "#ccff00",
  "Growth & Momentum": "#06b6d4",
  "Peer Comparison": "#f59e0b",
  "News Sentiment": "#f472b6",
};
const DEFAULT_COLORS = ["#7c5cfc", "#ccff00", "#06b6d4", "#f59e0b", "#f472b6"];

interface Props {
  categoryScores: QuantScore[];
  finalScore: number;
  verdict: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#1e1e24] border border-[#2a2a32] rounded-xl p-3 text-sm shadow-xl">
        <p className="text-white font-bold mb-1">{d.category}</p>
        <p className="text-gray-400">Score: <span className="text-white font-mono">{d.rawScore}/100</span></p>
        <p className="text-gray-400">Weight: <span className="text-white">{(d.weight * 100).toFixed(0)}%</span></p>
      </div>
    );
  }
  return null;
};

export function ScoreRadialChart({ categoryScores, finalScore, verdict }: Props) {
  const data = categoryScores.map((cat, i) => ({
    ...cat,
    fill: COLORS[cat.category] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const verdictColor = verdict === "INVEST" ? "#ccff00" : verdict === "WATCHLIST" ? "#f59e0b" : "#ff3366";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="90%"
            data={data}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              dataKey="rawScore"
              cornerRadius={6}
              background={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl font-black" style={{ color: verdictColor }}>{finalScore}</span>
          <span className="text-gray-400 text-xs uppercase tracking-widest mt-1">/ 100</span>
          <span
            className="mt-2 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{
              background: verdictColor + "20",
              color: verdictColor,
              border: `1px solid ${verdictColor}50`,
            }}
          >
            {verdict}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {data.map((cat) => (
          <div key={cat.category} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
            <span>{cat.category}</span>
            <span className="text-white font-bold font-mono ml-1">{cat.rawScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
