"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agent_1 = require("../lib/agent");
const db_1 = __importDefault(require("../lib/db"));
const Report_1 = __importDefault(require("../models/Report"));
const rateLimit_1 = require("../lib/rateLimit");
const validation_1 = require("../lib/validation");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    // 1. Rate Limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = (0, rateLimit_1.checkRateLimit)(ip);
    if (!rateLimit.success) {
        return res.status(429).json({ error: rateLimit.error });
    }
    // 2. Input Validation
    const parsed = validation_1.ResearchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { query, riskProfile } = parsed.data;
    // 3. MongoDB Caching (Check for recent reports within 6 hours)
    try {
        await (0, db_1.default)();
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const cachedReport = await Report_1.default.findOne({
            $or: [
                { ticker: { $regex: new RegExp(`^${query}$`, 'i') } },
                { company: { $regex: new RegExp(`^${query}$`, 'i') } }
            ],
            riskProfile: riskProfile,
            createdAt: { $gte: sixHoursAgo }
        }).sort({ createdAt: -1 });
        if (cachedReport) {
            // Send the cached report directly as an SSE stream
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
            send({ type: "log", level: "info", message: "Found cached report. Loading..." });
            send({ type: "progress", step: "Loading Cache", total: 1, current: 1 });
            send({ type: "complete", report: { ...cachedReport.toObject(), cached: true }, message: "Loaded from cache" });
            res.end();
            return;
        }
    }
    catch (err) {
        console.warn("MongoDB Cache check failed, proceeding with fresh fetch:", err);
    }
    // 4. Run Agent Stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    try {
        for await (const step of (0, agent_1.runResearchAgent)(query, riskProfile)) {
            send(step);
            if (step.type === "complete") {
                try {
                    await (0, db_1.default)();
                    await Report_1.default.create(step.report);
                }
                catch (dbErr) {
                    console.error("Failed to save report:", dbErr);
                }
            }
        }
    }
    catch (err) {
        send({
            type: "error",
            message: err instanceof Error ? err.message : "Unknown error occurred",
        });
    }
    finally {
        res.end();
    }
});
exports.default = router;
