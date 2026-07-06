export function ScoreBreakdown({ scores, scoreWeights, overallScore, verdict, riskProfile, scoreBreakdown }: any) {
  // Use new scoreBreakdown format if available, fallback to old
  const isNewFormat = !!scoreBreakdown;

  if (!scores && !isNewFormat) return null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 my-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            📊 Score Breakdown
          </h3>
          <p className="text-sm text-gray-400 mt-1">Profile: <span className="uppercase text-cyan-400">{riskProfile}</span></p>
          {isNewFormat && scoreBreakdown.explanation && (
            <p className="text-xs text-gray-500 mt-2 max-w-lg">{scoreBreakdown.explanation}</p>
          )}
        </div>
        <div className="text-center">
          <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            {isNewFormat ? scoreBreakdown.finalScore : overallScore}
          </div>
          <div className={`text-sm font-bold uppercase mt-1 ${
            verdict === "INVEST" ? "text-green-400" : verdict === "WATCHLIST" ? "text-yellow-400" : "text-red-400"
          }`}>
            {verdict}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isNewFormat ? (
          scoreBreakdown.categoryScores.map((cat: any, i: number) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium">
                  {cat.category} <span className="text-gray-500 text-xs">({(cat.weight * 100).toFixed(0)}%)</span>
                </span>
                <span className="text-gray-200 font-medium">{cat.rawScore}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${cat.rawScore}%` }} 
                />
              </div>
              
              {/* Positive / Negative Factors */}
              {(cat.positiveFactors?.length > 0 || cat.negativeFactors?.length > 0) && (
                <div className="flex gap-4 mt-1 text-xs">
                  {cat.positiveFactors?.map((p: string, j: number) => (
                    <span key={`p-${j}`} className="text-green-400">+{p}</span>
                  ))}
                  {cat.negativeFactors?.map((n: string, j: number) => (
                    <span key={`n-${j}`} className="text-red-400">-{n}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          [
            { label: "Financial Health", score: scores.financialHealth, weight: scoreWeights.financialHealth },
            { label: "Growth Potential", score: scores.growthPotential, weight: scoreWeights.growthPotential },
            { label: "Valuation", score: scores.valuation, weight: scoreWeights.valuation },
            { label: "News Sentiment", score: scores.newsSentiment, weight: scoreWeights.newsSentiment },
            { label: "Risk Profile", score: scores.risk, weight: scoreWeights.risk },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{item.label} <span className="text-gray-500 text-xs">({item.weight}%)</span></span>
                <span className="text-gray-200 font-medium">{item.score}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${item.score}%` }} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
