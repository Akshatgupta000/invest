interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitData>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function checkRateLimit(ip: string): { success: boolean; error?: string } {
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
