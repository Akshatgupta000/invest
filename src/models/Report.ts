import mongoose, { Schema, Document, models, model } from "mongoose";

// We use Mixed for complex nested structures to maintain backward compatibility
// and allow flexibility as the advanced pipeline evolves.

export interface IReport extends Document {
  company: string;
  ticker: string;
  riskProfile?: string; // New: Risk Profile string
  verdict: "INVEST" | "PASS" | "WATCHLIST";
  confidence?: number; // Kept optional for older reports
  finalScore?: number; // New explicit score
  
  // Legacy fields (kept for backward compatibility)
  summary?: string;
  reasoning?: string;
  pros?: string[];
  cons?: string[];
  metrics?: any[];
  news?: any[];
  evidence?: any[];
  competitors?: any[];
  agentDebate?: any;
  scores?: any;
  riskProfileSummary?: string;

  // New Advanced Pipeline Fields
  financialSnapshot?: any;
  historicalTrends?: any;
  newsIntelligence?: any;
  competitorBenchmarks?: any[];
  agentOutputs?: any; // e.g. { bull, bear, risk, valuation, news, judge }
  scoreBreakdown?: any;
  valuation?: any;
  scenarios?: any[];
  confidenceScore?: any; // The new detailed object
  auditTrail?: any[];
  whatChanged?: any;

  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    company: { type: String, required: true, index: true },
    ticker: { type: String, required: true, index: true },
    riskProfile: { type: String, index: true },
    verdict: { type: String, enum: ["INVEST", "PASS", "WATCHLIST"], required: true },
    confidence: { type: Schema.Types.Mixed },
    finalScore: { type: Number, min: 0, max: 100 },

    // Legacy
    summary: { type: String },
    reasoning: { type: String },
    pros: [{ type: String }],
    cons: [{ type: String }],
    metrics: [{ type: Schema.Types.Mixed }],
    news: [{ type: Schema.Types.Mixed }],
    evidence: [{ type: Schema.Types.Mixed }],
    competitors: [{ type: Schema.Types.Mixed }],
    agentDebate: { type: Schema.Types.Mixed },
    scores: { type: Schema.Types.Mixed },
    riskProfileSummary: { type: String },

    // New
    financialSnapshot: { type: Schema.Types.Mixed },
    historicalTrends: { type: Schema.Types.Mixed },
    newsIntelligence: { type: Schema.Types.Mixed },
    competitorBenchmarks: [{ type: Schema.Types.Mixed }],
    agentOutputs: { type: Schema.Types.Mixed },
    scoreBreakdown: { type: Schema.Types.Mixed },
    valuation: { type: Schema.Types.Mixed },
    scenarios: [{ type: Schema.Types.Mixed }],
    confidenceScore: { type: Schema.Types.Mixed },
    auditTrail: [{ type: Schema.Types.Mixed }],
    whatChanged: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes
ReportSchema.index({ ticker: 1, riskProfile: 1, createdAt: -1 });

const Report = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
