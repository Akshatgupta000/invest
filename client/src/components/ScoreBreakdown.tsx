export function ScoreBreakdown({ scores, scoreWeights, overallScore, verdict, riskProfile, scoreBreakdown }: any) {
  const isNewFormat = !!scoreBreakdown;
  if (!scores && !isNewFormat) return null;

  const cats = isNewFormat ? scoreBreakdown.categoryScores : [
    { category: "Financial Health", rawScore: scores.financialHealth, weight: scoreWeights.financialHealth },
    { category: "Growth Potential", rawScore: scores.growthPotential, weight: scoreWeights.growthPotential },
    { category: "Valuation", rawScore: scores.valuation, weight: scoreWeights.valuation },
    { category: "News Sentiment", rawScore: scores.newsSentiment, weight: scoreWeights.newsSentiment },
    { category: "Risk", rawScore: scores.risk, weight: scoreWeights.risk },
  ];

  const finalScore = isNewFormat ? scoreBreakdown.finalScore : overallScore;

  return (
    <div className="flex flex-col gap-4 my-6">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          Score Breakdown
        </h3>
        <span className="text-sm text-gray-400 bg-[#232329] px-3 py-1 rounded-full border border-gray-700">
          Profile: <span className="uppercase text-white font-bold">{riskProfile}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Evaluation Card */}
        <div className="bg-[#1e1e24] border border-[#2a2a32] rounded-2xl p-6 flex flex-col justify-center items-center">
          <p className="text-gray-400 text-sm mb-2">Overall Score</p>
          <div className="text-5xl font-black text-white flex flex-col items-center gap-2">
            {finalScore} / 100
            <span className={`text-sm px-3 py-1 rounded font-bold uppercase tracking-widest mt-2 ${verdict === "INVEST" ? "bg-[#ccff00] text-black" : verdict === "WATCHLIST" ? "bg-yellow-500 text-black" : "bg-red-500 text-white"}`}>
              {verdict}
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3">
          {cats.map((cat: any, i: number) => (
            <div key={i} className="bg-[#1e1e24] border border-[#2a2a32] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">{cat.category}</p>
                <p className="text-gray-500 text-[10px]">Weight: {(cat.weight * 100).toFixed(0)}%</p>
              </div>
              <div className={`text-2xl font-bold ${cat.rawScore >= 80 ? 'text-green-400' : cat.rawScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {cat.rawScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
