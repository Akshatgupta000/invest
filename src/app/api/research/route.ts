import { NextRequest } from "next/server";
import { runResearchAgent } from "@/lib/agent";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import { checkRateLimit } from "@/lib/rateLimit";
import { ResearchRequestSchema, RiskProfile } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.success) {
    return new Response(JSON.stringify({ error: rateLimit.error }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Input Validation
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const parsed = ResearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { query, riskProfile } = parsed.data;

  // 3. MongoDB Caching (Check for recent reports within 6 hours)
  try {
    await dbConnect();
    // Assuming we can resolve ticker here, but we only have `query` (e.g. "Apple").
    // We can do a basic text search or just skip cache if we strictly need `ticker`.
    // Let's do a basic check on `company` or `ticker` regex.
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
      // Send the cached report directly as an SSE stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          send({ type: "log", level: "info", message: "Found cached report. Loading..." });
          send({ type: "progress", step: "Loading Cache", total: 1, current: 1 });
          send({ type: "complete", report: { ...cachedReport.toObject(), cached: true }, message: "Loaded from cache" });
          controller.close();
        }
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }
      });
    }
  } catch (err) {
    console.warn("MongoDB Cache check failed, proceeding with fresh fetch:", err);
  }

  // 4. Run Agent Stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        for await (const step of runResearchAgent(query, riskProfile)) {
          send(step);
          if (step.type === "complete") {
            try {
              await dbConnect();
              await Report.create(step.report);
            } catch (dbErr) {
              console.error("Failed to save report:", dbErr);
            }
          }
        }
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error occurred",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
