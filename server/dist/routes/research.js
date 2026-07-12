import express from 'express';
import { runResearchAgent } from '../services/ai/agent';
import dbConnect from '../config/db';
import Report from '../models/Report';
import { checkRateLimit } from '../middleware/rateLimit';
import { ResearchRequestSchema } from '../utils/validation';
const router = express.Router();
router.post('/', async (req, res) => {
    // Enforce IP-based rate limiting to prevent abuse of the expensive LLM endpoints.
    // In a production environment with heavy load, this should be migrated to Redis.
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
        console.warn(`[RateLimit] Request rejected for IP: ${ip}`);
        return res.status(429).json({ error: rateLimit.error });
    }
    // Ensure payload conforms to the expected ResearchRequest format.
    // Zod provides robust type safety before we pass data into the async orchestration pipeline.
    const parsed = ResearchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        console.warn(`[Validation] Invalid request body: ${parsed.error.message}`);
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { query, riskProfile } = parsed.data;
    // Aggressive caching layer: Query MongoDB for an identical report generated within the last 6 hours.
    // This drastically reduces LLM API costs and drops latency from ~20s to <1s for hot tickers.
    try {
        await dbConnect();
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const cachedReport = await Report.findOne({
            $or: [
                { ticker: { $regex: new RegExp(`^${query}$`, 'i') } },
                { company: { $regex: new RegExp(`^${query}$`, 'i') } }
            ],
            riskProfile: riskProfile,
            createdAt: { $gte: sixHoursAgo }
        }).sort({ createdAt: -1 });
        if (cachedReport) {
            // Re-hydrate the cached document and stream it immediately to the client
            // using the exact same SSE format to maintain UI consistency.
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
            send({ type: "log", level: "info", message: "Cache hit: Loading recent analysis..." });
            send({ type: "progress", step: "Loading Cache", total: 1, current: 1 });
            send({ type: "complete", report: { ...cachedReport.toObject(), cached: true }, message: "Loaded from cache" });
            res.end();
            return;
        }
    }
    catch (err) {
        console.warn("[Cache] MongoDB check failed, falling back to fresh LLM fetch. Error:", err);
    }
    // Initialize the Server-Sent Events (SSE) stream.
    // This allows us to pipe intermediate steps from the LangGraph agents directly to the UI,
    // masking the 15-20s execution latency of the swarm.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    try {
        for await (const step of runResearchAgent(query, riskProfile)) {
            send(step);
            if (step.type === "complete") {
                try {
                    await dbConnect();
                    await Report.create(step.report);
                }
                catch (dbErr) {
                    console.error("[Database] Critical failure saving report to MongoDB:", dbErr);
                    // Note: We don't fail the request here since the client already received the completed report stream.
                }
            }
        }
    }
    catch (err) {
        console.error("[AgentStream] Unhandled exception during agent execution:", err);
        send({
            type: "error",
            message: err instanceof Error ? err.message : "A critical orchestration error occurred. Please try again.",
        });
    }
    finally {
        res.end();
    }
});
export default router;
