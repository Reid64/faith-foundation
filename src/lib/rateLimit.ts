/**
 * In-memory rate limiter for the public API.
 *
 * HONEST LIMITATION, read before relying on this: Vercel runs each request in
 * one of many serverless instances, and they do not share memory. This counter
 * is therefore PER INSTANCE. A client spread across ten warm instances gets
 * roughly ten times the nominal limit, and a cold start resets the window
 * entirely. It is a courtesy brake against a single runaway script, not a
 * defence against a determined caller.
 *
 * A real limit needs shared state — Vercel KV, Upstash, or a Postgres table
 * with an atomic upsert. That is the upgrade path if the endpoints ever need to
 * hold a hard ceiling. Per-IP limiting is also weak behind shared NATs, where
 * an entire office or carrier appears as one address.
 *
 * The endpoints serve data that is already published on the website, so the
 * downside of an over-permissive limit is load, not disclosure.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Sweep expired buckets so a long-lived instance does not accumulate one entry
 * per IP forever. Runs on write, which is the only time the map grows.
 */
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — the value for Retry-After. */
  retryAfter: number;
  limit: number;
};

export function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    sweep(now);
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
      limit,
    };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
    limit,
  };
}

/**
 * Best-effort client address.
 *
 * x-forwarded-for is client-controlled in general, but on Vercel the platform
 * rewrites it, so the FIRST entry is the real edge-observed address. Falling
 * back to a constant means an unknown caller shares one bucket with every other
 * unknown caller — deliberately stricter than handing out an unlimited pass.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
