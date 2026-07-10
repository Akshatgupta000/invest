import { FinancialSnapshot } from "@/lib/types/research";

export function KeyFinancials({ snapshot }: { snapshot: FinancialSnapshot }) {
  if (!snapshot) return null;

  const formatCurrency = (val: number | null | undefined) => 
    val ? `$${(val / 1e9).toFixed(2)}B` : "N/A";
  
  const formatPercent = (val: number | null | undefined) => 
    val ? `${(val * 100).toFixed(1)}%` : "N/A";
    
  const formatNumber = (val: number | null | undefined) => 
    val ? val.toFixed(2) : "N/A";

  return (
    <div className="bg-[#1e1e24] border border-[#2a2a32] rounded-2xl p-6 my-6 relative overflow-hidden">
      <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
        📊 Key Financial Metrics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Market Cap" value={formatCurrency(snapshot.marketCap)} />
        <MetricCard label="P/E Ratio" value={formatNumber(snapshot.peRatio)} highlight={snapshot.peRatio && snapshot.peRatio > 25 ? "warning" : "good"} />
        <MetricCard label="Forward P/E" value={formatNumber(snapshot.forwardPE)} />
        <MetricCard label="Profit Margin" value={formatPercent(snapshot.profitMargin)} highlight={snapshot.profitMargin && snapshot.profitMargin > 0.15 ? "good" : "neutral"} />
        <MetricCard label="Rev Growth (YoY)" value={formatPercent(snapshot.revenueGrowth)} highlight={snapshot.revenueGrowth && snapshot.revenueGrowth > 0 ? "good" : "danger"} />
        <MetricCard label="Free Cash Flow" value={formatCurrency(snapshot.freeCashFlow)} highlight={snapshot.freeCashFlow && snapshot.freeCashFlow > 0 ? "good" : "danger"} />
        <MetricCard label="Debt to Equity" value={formatNumber(snapshot.debtToEquity)} highlight={snapshot.debtToEquity && snapshot.debtToEquity > 1.5 ? "warning" : "good"} />
        <MetricCard label="Current Ratio" value={formatNumber(snapshot.currentRatio)} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight = "neutral" }: { label: string, value: string, highlight?: "good" | "warning" | "danger" | "neutral" }) {
  const highlightColors = {
    good: "text-[#ccff00]",
    warning: "text-yellow-400",
    danger: "text-red-400",
    neutral: "text-white"
  };
  
  return (
    <div className="bg-[#2a2a32]/50 p-4 rounded-xl border border-gray-700/50">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <div className={`text-xl font-bold ${highlightColors[highlight]}`}>{value}</div>
    </div>
  );
}
