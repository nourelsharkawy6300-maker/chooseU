import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { NextResponse } from "next/server";

// ============================================================================
// HIGH-PERFORMANCE IN-MEMORY FALLBACK (SLIDING WINDOW)
// Active when Upstash Redis environment variables are not configured
// ============================================================================

interface MemoryBucket {
  timestamps: number[];
}

class SlidingWindowMemoryRateLimiter {
  private store = new Map<string, MemoryBucket>();

  public async limit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.store.set(key, bucket);
    }

    // Purge timestamps outside the sliding window
    bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

    if (bucket.timestamps.length >= limit) {
      const oldest = bucket.timestamps[0] || now;
      const reset = oldest + windowMs;
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }

    bucket.timestamps.push(now);
    const reset = now + windowMs;

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - bucket.timestamps.length),
      reset,
    };
  }
}

const memoryLimiter = new SlidingWindowMemoryRateLimiter();

// ============================================================================
// UPSTASH REDIS CONFIGURATION & CLIENT INITIALIZATION
// ============================================================================

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isUpstashConfigured = Boolean(upstashUrl && upstashToken);

let redis: Redis | null = null;
let strictRatelimit: Ratelimit | null = null;
let globalRatelimit: Ratelimit | null = null;

if (isUpstashConfigured) {
  try {
    redis = new Redis({
      url: upstashUrl!,
      token: upstashToken!,
    });

    // Tier 1: strictLimit - 5 requests per 1 minute (for auth, otp, orders, admin)
    strictRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "chooseu_strict_rl",
      analytics: false,
    });

    // Tier 2: globalLimit - 50 requests per 10 seconds (for general endpoints)
    globalRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "10 s"),
      prefix: "chooseu_global_rl",
      analytics: false,
    });
  } catch {
    // Graceful fallback to memory limiter
    redis = null;
    strictRatelimit = null;
    globalRatelimit = null;
  }
}

// ============================================================================
// RATE LIMITING PUBLIC INTERFACE
// ============================================================================

/**
 * Strict Rate Limiter: 5 requests / 60 seconds
 * Applies to sensitive endpoints (/api/admin/*, /api/orders)
 */
export async function checkStrictLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (strictRatelimit) {
    return strictRatelimit.limit(identifier);
  }
  return memoryLimiter.limit(`strict_${identifier}`, 5, 60_000);
}

/**
 * Global Rate Limiter: 50 requests / 10 seconds
 * Applies to standard API endpoints
 */
export async function checkGlobalLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (globalRatelimit) {
    return globalRatelimit.limit(identifier);
  }
  return memoryLimiter.limit(`global_${identifier}`, 50, 10_000);
}

/**
 * Generates an aggressive HTTP 429 Too Many Requests response
 * with zero internal stack trace or sensitive system leakage.
 */
export function rateLimitExceededResponse(reset: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  return new NextResponse(
    JSON.stringify({
      success: false,
      error: "Too Many Requests",
      message: "تم إرسال عدد كبير من الطلبات. يرجى الانتظار بضع ثوانٍ ثم المحاولة مرة أخرى.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    }
  );
}
