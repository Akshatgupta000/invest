"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReportSchema = new mongoose_1.Schema({
    company: { type: String, required: true, index: true },
    ticker: { type: String, required: true, index: true },
    riskProfile: { type: String, index: true },
    verdict: { type: String, enum: ["INVEST", "PASS", "WATCHLIST"], required: true },
    confidence: { type: mongoose_1.Schema.Types.Mixed },
    finalScore: { type: Number, min: 0, max: 100 },
    // Legacy
    summary: { type: String },
    reasoning: { type: String },
    pros: [{ type: String }],
    cons: [{ type: String }],
    metrics: [{ type: mongoose_1.Schema.Types.Mixed }],
    news: [{ type: mongoose_1.Schema.Types.Mixed }],
    evidence: [{ type: mongoose_1.Schema.Types.Mixed }],
    competitors: [{ type: mongoose_1.Schema.Types.Mixed }],
    agentDebate: { type: mongoose_1.Schema.Types.Mixed },
    scores: { type: mongoose_1.Schema.Types.Mixed },
    riskProfileSummary: { type: String },
    // New
    financialSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    historicalTrends: { type: mongoose_1.Schema.Types.Mixed },
    newsIntelligence: { type: mongoose_1.Schema.Types.Mixed },
    competitorBenchmarks: [{ type: mongoose_1.Schema.Types.Mixed }],
    agentOutputs: { type: mongoose_1.Schema.Types.Mixed },
    scoreBreakdown: { type: mongoose_1.Schema.Types.Mixed },
    valuation: { type: mongoose_1.Schema.Types.Mixed },
    scenarios: [{ type: mongoose_1.Schema.Types.Mixed }],
    confidenceScore: { type: mongoose_1.Schema.Types.Mixed },
    auditTrail: [{ type: mongoose_1.Schema.Types.Mixed }],
    whatChanged: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
// Indexes
ReportSchema.index({ ticker: 1, riskProfile: 1, createdAt: -1 });
const Report = mongoose_1.models.Report || (0, mongoose_1.model)("Report", ReportSchema);
exports.default = Report;
