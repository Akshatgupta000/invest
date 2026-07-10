"use client";
import type { FinancialSnapshot } from "@/lib/types/research";

interface Props {
  snapshot: FinancialSnapshot;
}

export function FiftyTwoWeekBar({ snapshot }: Props) {
  const { price, fiftyTwoWeekHigh, fiftyTwoWeekLow } = snapshot;

  if (!price || !fiftyTwoWeekHigh || !fiftyTwoWeekLow) {
    return (
      <div className="p-4 bg-[#1e1e24] border border-[#2a2a32] rounded-xl text-gray-600 text-sm text-center">
        52-Week range data not available
      </div>
    );
  }

  const range = fiftyTwoWeekHigh - fiftyTwoWeekLow;
  const pctFromLow = range > 0 ? ((price - fiftyTwoWeekLow) / range) * 100 : 50;
  const clampedPct = Math.max(2, Math.min(98, pctFromLow));
  const pctFromHigh = ((fiftyTwoWeekHigh - price) / fiftyTwoWeekHigh) * 100;
  const pctAboveLow = ((price - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 100;

  // Color: green when near high, red when near low
  const dotColor = pctFromLow >= 66 ? "#ccff00" : pctFromLow >= 33 ? "#f59e0b" : "#ff3366";
  const zone = pctFromLow >= 66 ? "Near 52W High" : pctFromLow >= 33 ? "Mid Range" : "Near 52W Low";

  return (
    <div className="p-5 bg-[#1e1e24] border border-[#2a2a32] rounded-xl">
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-sm font-semibold text-gray-300">52-Week Price Range</h4>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: dotColor + "20", color: dotColor }}>
          {zone}
        </span>
      </div>

      {/* Current price big display */}
      <div className="text-center mb-5">
        <p className="text-3xl font-black text-white font-mono">${price.toFixed(2)}</p>
        <p className="text-xs text-gray-500 mt-1">Current Price</p>
      </div>

      {/* Range bar */}
      <div className="relative mb-3">
        <div className="h-3 rounded-full" style={{ background: "linear-gradient(to right, #ff3366, #f59e0b, #ccff00)" }} />
        {/* Dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#16161a] shadow-xl"
          style={{ left: `calc(${clampedPct}% - 10px)`, background: dotColor, boxShadow: `0 0 12px ${dotColor}80` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs mt-1 mb-5">
        <div className="text-left">
          <p className="text-[#ff3366] font-bold font-mono">${fiftyTwoWeekLow.toFixed(2)}</p>
          <p className="text-gray-600">52W Low</p>
        </div>
        <div className="text-right">
          <p className="text-[#ccff00] font-bold font-mono">${fiftyTwoWeekHigh.toFixed(2)}</p>
          <p className="text-gray-600">52W High</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2a2a32]">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">From Low</p>
          <p className="text-sm font-bold text-[#ccff00] font-mono">+{pctAboveLow.toFixed(1)}%</p>
        </div>
        <div className="text-center border-x border-[#2a2a32]">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Position</p>
          <p className="text-sm font-bold text-white font-mono">{pctFromLow.toFixed(0)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">From High</p>
          <p className="text-sm font-bold text-[#ff3366] font-mono">-{pctFromHigh.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
