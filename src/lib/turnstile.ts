/**
 * Cloudflare Turnstile — server-side verification.
 *
 * SERVER ONLY. `TURNSTILE_SECRET_KEY` carries no NEXT_PUBLIC_ prefix, so Next
 * refuses to inline it into a client bundle; importing this module from a
 * "use client" file would fail at build rather than leak the key. Nothing here
 * is ever imported by a component.
 *
 * Every public form's route calls verifyTurnstile() BEFORE it forwards, writes
 * or sends anything. A token is single use and short lived (~5 minutes), so the
 * widget is reset after each attempt on the client side.
 */

const SITEVERIFY =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";

/** True when the secret is present, i.e. verification can actually happen. */
export const TURNSTILE_CONFIGURED = SECRET.length > 0;

export type VerifyResult = {
  ok: boolean;
  /** Cloudflare's machine-readable reasons, for the server log. */
  errorCodes?: string[];
  /** Set when the check was skipped rather than passed. */
  skipped?: boolean;
};

/**
 * Verify a Turnstile token against Cloudflare.
 *
 * FAILS CLOSED. A missing token, a rejected token, a network error, or an
 * unparseable response all return `ok: false` — the caller then writes nothing.
 * A spam gate that opens when the checker is unreachable is not a gate.
 *
 * The ONE exception is a non-production runtime with no secret configured:
 * local `pnpm dev` would otherwise be unable to submit any form at all. It logs
 * loudly and reports `skipped: true` so the caller can say so rather than
 * implying a check that did not happen. In production a missing secret is a
 * misconfiguration and is refused like any other failure.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<VerifyResult> {
  if (!TURNSTILE_CONFIGURED) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[turnstile] TURNSTILE_SECRET_KEY is not set in production — refusing every submission."
      );
      return { ok: false, errorCodes: ["missing-secret-key"] };
    }
    console.warn(
      "[turnstile] No TURNSTILE_SECRET_KEY outside production — the spam check is being SKIPPED."
    );
    return { ok: true, skipped: true };
  }

  if (!token) return { ok: false, errorCodes: ["missing-input-response"] };

  try {
    const body = new URLSearchParams();
    body.set("secret", SECRET);
    body.set("response", token);
    // Optional, and only ever the address Cloudflare already sees.
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[turnstile] siteverify HTTP", response.status);
      return { ok: false, errorCodes: [`http-${response.status}`] };
    }

    const payload = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (payload.success === true) return { ok: true };

    return { ok: false, errorCodes: payload["error-codes"] ?? ["unknown"] };
  } catch (cause) {
    console.error("[turnstile] siteverify unreachable:", cause);
    return { ok: false, errorCodes: ["network-error"] };
  }
}

/** Best-effort client address, for the optional `remoteip` field. */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || null;
}
