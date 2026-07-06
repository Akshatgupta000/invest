import Report, { IReport } from "../models/Report";
import { ResearchReport, WhatChanged } from "./types/research";

export async function compareWithPreviousReport(
  newReport: ResearchReport
): Promise<WhatChanged> {
  const defaultWhatChanged: WhatChanged = {
    hasPreviousReport: false,
    newRisks: [],
    removedRisks: [],
    newPositiveDrivers: [],
    summary: "No previous report found for comparison.",
  };

  try {
    // Find the most recent report for the same ticker and risk profile
    const previousReport = await Report.findOne({
      ticker: newReport.ticker,
      riskProfile: newReport.riskProfile,
    }).sort({ createdAt: -1 }) as IReport;

    if (!previousReport) {
      return defaultWhatChanged;
    }

    const prevScore = previousReport.finalScore ?? previousReport.scores?.overallScore ?? null;
    const scoreChange = prevScore !== null ? newReport.finalScore - prevScore : undefined;
    const verdictChange = previousReport.verdict !== newReport.verdict 
      ? `${previousReport.verdict} → ${newReport.verdict}` 
      : undefined;

    let priceChange: number | undefined;
    if (previousReport.financialSnapshot?.price && newReport.historicalTrends?.price1M) {
        // Just rough estimate from snapshot diff if available
        priceChange = (newReport.historicalTrends.price1M);
    }

    // Determine new risks vs removed risks based on concerns from Risk/Bear agents
    const prevRisks = new Set<string>();
    if (previousReport.agentOutputs?.risk?.concerns) {
        previousReport.agentOutputs.risk.concerns.forEach((c: string) => prevRisks.add(c));
    } else if (previousReport.agentDebate?.riskAgent?.redFlags) {
        previousReport.agentDebate.riskAgent.redFlags.forEach((c: string) => prevRisks.add(c));
    }

    const currentRisks = new Set(newReport.agentDebate.risk.concerns);
    const newRisks = Array.from(currentRisks).filter(x => !prevRisks.has(x));
    const removedRisks = Array.from(prevRisks).filter(x => !currentRisks.has(x));

    // Determine new positive drivers
    const prevDrivers = new Set<string>();
    if (previousReport.agentOutputs?.bull?.arguments) {
        previousReport.agentOutputs.bull.arguments.forEach((a: any) => prevDrivers.add(a.claim));
    } else if (previousReport.agentDebate?.bullAgent?.arguments) {
        previousReport.agentDebate.bullAgent.arguments.forEach((a: string) => prevDrivers.add(a));
    }

    const currentDrivers = new Set(newReport.agentDebate.bull.arguments.map(a => a.claim));
    const newPositiveDrivers = Array.from(currentDrivers).filter(x => !prevDrivers.has(x));

    return {
      hasPreviousReport: true,
      previousReportDate: previousReport.createdAt,
      scoreChange,
      verdictChange,
      priceChange,
      newRisks,
      removedRisks,
      newPositiveDrivers,
      summary: `Compared to the previous report from ${previousReport.createdAt.toLocaleDateString()}, ${
        scoreChange ? (scoreChange > 0 ? 'the score improved.' : 'the score declined.') : 'the verdict was evaluated.'
      }`
    };

  } catch (err) {
    console.warn(`[ReportComparison] Failed to compare for ${newReport.ticker}:`, err);
    return defaultWhatChanged;
  }
}
