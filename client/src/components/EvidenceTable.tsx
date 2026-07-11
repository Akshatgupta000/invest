export function EvidenceTable({ evidence }: any) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 my-6 backdrop-blur-sm overflow-hidden">
      <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
        🔎 Source-Backed Evidence
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-700/50 text-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Claim</th>
              <th className="px-4 py-3 font-semibold">Metric</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {evidence.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-4">{item.claim}</td>
                <td className="px-4 py-4 font-mono text-cyan-400">{item.metric}</td>
                <td className="px-4 py-4 font-bold">{item.value}</td>
                <td className="px-4 py-4">
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {item.source}
                  </a>
                </td>
                <td className="px-4 py-4 italic text-gray-400">{item.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
