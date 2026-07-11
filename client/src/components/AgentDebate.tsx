export function AgentDebate({ debate }: any) {
  if (!debate) return null;

  // Handle both old and new formats for backward compatibility
  const bull = debate.bull || debate.bullAgent;
  const bear = debate.bear || debate.bearAgent;
  const risk = debate.risk || debate.riskAgent;
  const valuation = debate.valuation;
  const news = debate.news;
  const judge = debate.judge || debate.judgeAgent;

  const renderAgentArguments = (args: any[]) => {
    if (!args || args.length === 0) return null;
    return (
      <ul className="space-y-2 text-sm text-gray-400">
        {args.map((arg: any, i: number) => {
          const text = typeof arg === "string" ? arg : arg.claim;
          return <li key={i} className="flex gap-2"><span className="text-gray-500">•</span> {text}</li>;
        })}
      </ul>
    );
  };

  const renderAgentConcerns = (concerns: string[]) => {
    if (!concerns || concerns.length === 0) return null;
    return (
      <ul className="space-y-2 text-sm text-red-400/80 mt-2">
        {concerns.map((c: string, i: number) => (
          <li key={i} className="flex gap-2"><span>⚠️</span> {c}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 my-6">
      <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
        🤖 AI Agent Swarm
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bull Agent */}
        {bull && (
          <div className="bg-gray-800/40 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐂</span>
              <h4 className="text-lg font-bold text-green-400">Bull Agent</h4>
              <span className="ml-auto text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                {bull.stance || (bull.scoreBias > 0 ? "BULLISH" : "NEUTRAL")}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{bull.summary}</p>
            {renderAgentArguments(bull.arguments)}
          </div>
        )}

        {/* Bear Agent */}
        {bear && (
          <div className="bg-gray-800/40 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐻</span>
              <h4 className="text-lg font-bold text-red-400">Bear Agent</h4>
              <span className="ml-auto text-xs font-semibold px-2 py-1 bg-red-500/20 text-red-300 rounded-full">
                {bear.stance || (bear.scoreBias < 0 ? "BEARISH" : "NEUTRAL")}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{bear.summary}</p>
            {renderAgentArguments(bear.arguments)}
            {renderAgentConcerns(bear.concerns)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Agent */}
        {risk && (
          <div className="bg-gray-800/40 border border-yellow-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚠️</span>
              <h4 className="text-lg font-bold text-yellow-400">Risk Agent</h4>
            </div>
            <p className="text-sm text-gray-300 mb-4">{risk.summary}</p>
            {renderAgentConcerns(risk.redFlags || risk.concerns)}
          </div>
        )}

        {/* Valuation Agent */}
        {valuation && (
          <div className="bg-gray-800/40 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💰</span>
              <h4 className="text-lg font-bold text-blue-400">Valuation Agent</h4>
            </div>
            <p className="text-sm text-gray-300 mb-4">{valuation.summary}</p>
            {renderAgentArguments(valuation.arguments)}
            {renderAgentConcerns(valuation.concerns)}
          </div>
        )}

        {/* News Agent */}
        {news && (
          <div className="bg-gray-800/40 border border-indigo-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📰</span>
              <h4 className="text-lg font-bold text-indigo-400">News Agent</h4>
            </div>
            <p className="text-sm text-gray-300 mb-4">{news.summary}</p>
            {renderAgentArguments(news.arguments)}
          </div>
        )}
      </div>

      {/* Judge Agent */}
      {judge && (
        <div className="bg-gray-800/40 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚖️</span>
            <h4 className="text-lg font-bold text-purple-400">Judge Agent Synthesis</h4>
            <span className="ml-auto text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
              {judge.finalVerdict || judge.finalDecision} ({judge.finalConfidence || judge.confidence}% Conf)
            </span>
          </div>
          <p className="text-sm text-gray-300 italic mb-4">"{judge.reasoning || judge.thesis}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Key Synthesized Arguments</h5>
              {renderAgentArguments(judge.arguments)}
            </div>
            <div>
               <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Primary Concerns</h5>
               {renderAgentConcerns(judge.concerns)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
