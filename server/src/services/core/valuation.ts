import { FinancialSnapshot, ValuationResult, CompetitorData } from "../../utils/types/research";

export function calculateValuation(snapshot: FinancialSnapshot, peers: CompetitorData[]): ValuationResult {
  const result: ValuationResult = {
    status: "unclear",
    score: 50,
    peerComparison: [],
    keyDrivers: [],
    warnings: [],
    evidenceIds: [],
  };

  let score = 50; // Base score out of 100

  // Absolute Valuation (P/E)
  if (snapshot.peRatio !== null) {
    if (snapshot.peRatio < 10) {
      score += 25;
      result.keyDrivers.push("Extremely low absolute P/E ratio suggests deep value.");
    } else if (snapshot.peRatio < 15) {
      score += 15;
      result.keyDrivers.push("Low absolute P/E ratio indicates value.");
    } else if (snapshot.peRatio > 40) {
      score -= 20;
      result.warnings.push("High absolute P/E ratio indicates premium valuation.");
    } else if (snapshot.peRatio > 80) {
      score -= 35;
      result.warnings.push("Extremely high P/E ratio indicates significant valuation risk.");
    }
  } else {
    result.warnings.push("Missing P/E ratio makes valuation difficult.");
  }

  // PEG Ratio (Price/Earnings-to-Growth)
  if (snapshot.pegRatio !== null && snapshot.pegRatio !== undefined) {
    if (snapshot.pegRatio < 1.0) {
      score += 20;
      result.keyDrivers.push("PEG ratio below 1 suggests undervaluation relative to growth.");
    } else if (snapshot.pegRatio > 2.0) {
      score -= 15;
      result.warnings.push("PEG ratio above 2 indicates it may be overvalued relative to growth expectations.");
    }
  }

  // Peer Relative Valuation
  const validPeers = peers.filter(p => p.peRatio !== null && p.peRatio > 0);
  if (snapshot.peRatio !== null && validPeers.length > 0) {
    const peerMedianPE = validPeers.map(p => p.peRatio!).sort((a, b) => a - b)[Math.floor(validPeers.length / 2)];
    const relativePE = snapshot.peRatio / peerMedianPE;
    
    result.peerComparison.push({ metric: "P/E", target: snapshot.peRatio, peerMedian: peerMedianPE });

    if (relativePE < 0.8) {
      score += 15;
      result.keyDrivers.push("Trading at a significant P/E discount to peer median.");
    } else if (relativePE > 1.2) {
      score -= 15;
      result.warnings.push("Trading at a premium P/E compared to peer median.");
    }
  }

  // Final status mapping
  score = Math.max(0, Math.min(100, score));
  result.score = score;

  if (score >= 70) result.status = "undervalued";
  else if (score <= 30) result.status = "overvalued";
  else if (score >= 40 && score <= 60 && snapshot.peRatio !== null) result.status = "fairly_valued";
  else result.status = "unclear";

  return result;
}
