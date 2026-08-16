import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "./rateLimit";

/**
 * Shared plumbing for /api/v1/public/*.
 *
 * The envelope is a CONTRACT once a partner depends on it: `{ data, meta }`,
 * amounts in cents with a formatted companion, errors as `{ error }`. Changing
 * the shape means /v2, not a quiet edit.
 *
 * CORS is `*` on purpose. Every one of these endpoints serves data already
 * published on faithfoundationsf.org, and the intended callers are partner
 * organisations and HUD counsellors calling from a browser. An allowlist would
 * add friction without protecting anything.
 */

export const RATE_LIMIT = 100;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
) {
  return NextResponse.json(body as Record<string, unknown>, {
    status: init.status ?? 200,
    headers: {
      ...CORS,
      // Public data, but live: a minute of edge caching absorbs a burst
      // without letting the ledger look stale.
      "Cache-Control": "public, max-age=60, s-maxage=60",
      ...init.headers,
    },
  });
}

/** Preflight, shared by every route in this namespace. */
export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * Apply the rate limit. Returns a 429 response to return immediately, or the
 * headers to attach to a successful response.
 */
export function guard(request: Request):
  | { limited: NextResponse }
  | { headers: Record<string, string> } {
  const ip = clientIp(request.headers);
  const result = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);

  const headers = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };

  if (!result.allowed) {
    return {
      limited: NextResponse.json(
        {
          error: "Rate limit exceeded.",
          detail: `This endpoint allows ${RATE_LIMIT} requests per hour per IP address. Try again in ${result.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            ...CORS,
            ...headers,
            "Retry-After": String(result.retryAfter),
            "Cache-Control": "no-store",
          },
        }
      ),
    };
  }

  return { headers };
}

export function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}

/** Clamp per_page so one request cannot pull the entire ledger. */
export function readPaging(url: URL): { page: number; perPage: number } {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const requested = Number(url.searchParams.get("per_page") ?? 20) || 20;
  const perPage = Math.min(100, Math.max(1, Math.floor(requested)));
  return { page, perPage };
}

/** YYYY-MM-DD or nothing. Anything else is ignored rather than passed through. */
export function readDate(url: URL, key: string): string | undefined {
  const value = url.searchParams.get(key);
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
