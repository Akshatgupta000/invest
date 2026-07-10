"use client";
import type { NewsSentiment } from "@/lib/types/research";

interface Props {
  newsIntelligence: NewsSentiment;
}

export function SentimentBar({ newsIntelligence }: Props) {
  if (!newsIntelligence) return null;

  const { sentimentScore, topBullish, topBearish, neutral, overallSentiment } = newsIntelligence;

  const total = (topBullish?.length ?? 0) + (topBearish?.length ?? 0) + (neutral?.length ?? 0);
  const bullPct = total > 0 ? Math.round(((topBullish?.length ?? 0) / total) * 100) : 33;
  const bearPct = total > 0 ? Math.round(((topBearish?.length ?? 0) / total) * 100) : 33;
  const neutralPct = 100 - bullPct - bearPct;

  // Sentiment score: -100 to 100 → map to 0-100 for the needle
  const needlePct = Math.max(2, Math.min(98, ((sentimentScore + 100) / 200) * 100));

  const sentimentColor = overallSentiment === "positive" ? "#ccff00" : overallSentiment === "negative" ? "#ff3366" : "#f59e0b";

  return (
    <div className="w-full space-y-5">
      {/* Overall badge */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Overall Sentiment</p>
          <p className="text-2xl font-black capitalize" style={{ color: sentimentColor }}>{overallSentiment}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Sentiment Score</p>
          <p className="text-3xl font-black font-mono" style={{ color: sentimentColor }}>
            {sentimentScore >= 0 ? "+" : ""}{sentimentScore}
          </p>
          <p className="text-xs text-gray-600">(-100 bearish → +100 bullish)</p>
        </div>
      </div>

      {/* Gradient bar with needle */}
      <div>
        <div className="relative h-4 rounded-full mb-2" style={{ background: "linear-gradient(to right, #ff3366, #f59e0b, #ccff00)" }}>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#16161a] shadow-xl"
            style={{ left: `calc(${needlePct}% - 10px)`, background: sentimentColor, boxShadow: `0 0 14px ${sentimentColor}80` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>Bearish (-100)</span>
          <span>Neutral (0)</span>
          <span>Bullish (+100)</span>
        </div>
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">News Distribution ({total} articles)</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            {bullPct > 0 && <div style={{ width: `${bullPct}%`, background: "#ccff00" }} title={`Bullish ${bullPct}%`} />}
            {neutralPct > 0 && <div style={{ width: `${neutralPct}%`, background: "#6b7280" }} title={`Neutral ${neutralPct}%`} />}
            {bearPct > 0 && <div style={{ width: `${bearPct}%`, background: "#ff3366" }} title={`Bearish ${bearPct}%`} />}
          </div>
          <div className="flex gap-5 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ccff00]" />{bullPct}% Bullish</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500" />{neutralPct}% Neutral</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff3366]" />{bearPct}% Bearish</span>
          </div>
        </div>
      )}

      {/* Major events */}
      {newsIntelligence.majorEvents?.length > 0 && (
        <div className="pt-4 border-t border-[#2a2a32]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Events Detected</p>
          <ul className="space-y-2">
            {newsIntelligence.majorEvents.map((ev, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-[#7c5cfc] flex-shrink-0">◆</span>
                {ev}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
