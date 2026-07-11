"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
const rateLimits = new Map();
const MAX_REQUESTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
function checkRateLimit(ip) {
    const now = Date.now();
    const limitData = rateLimits.get(ip);
    if (!limitData) {
        rateLimits.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return { success: true };
    }
    if (now > limitData.resetTime) {
        limitData.count = 1;
        limitData.resetTime = now + WINDOW_MS;
        return { success: true };
    }
    if (limitData.count >= MAX_REQUESTS) {
        return {
            success: false,
            error: "Too many research requests. Please try again in a few minutes.",
        };
    }
    limitData.count++;
    return { success: true };
}
