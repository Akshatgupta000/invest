export function CompetitorComparison({ competitors }: any) {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 my-6 backdrop-blur-sm overflow-hidden">
      <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
        🥊 Competitor Benchmarking
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-700/50 text-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Category</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Percentile</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Comparison</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {competitors.map((item: any, i: number) => {
              // Backward compatibility check
              if (item.marketCap !== undefined) {
                 return (
                   <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                     <td className="px-4 py-4 font-bold">{item.name}</td>
                     <td className="px-4 py-4 font-mono text-cyan-400">{item.ticker}</td>
                     <td className="px-4 py-4">{item.peRatio}</td>
                     <td className="px-4 py-4 italic text-gray-400">{item.verdict}</td>
                   </tr>
                 );
              }

              // New format (CompetitorBenchmark)
              return (
                <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-4 font-bold capitalize">{item.category}</td>
                  <td className="px-4 py-4 font-mono text-cyan-400">
                    {typeof item.metricValue === 'number' ? item.metricValue.toFixed(2) : item.metricValue}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8">{Math.round(item.percentile)}%</span>
                      <div className="w-24 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-cyan-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.max(5, Math.min(100, item.percentile))}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-4 font-bold ${item.betterThanPeers ? 'text-green-400' : 'text-red-400'}`}>
                    {item.betterThanPeers ? 'Better' : 'Worse'} than Peers
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
