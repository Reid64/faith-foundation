import { NextResponse } from "next/server";
import { clientIpFrom, verifyTurnstile } from "@/lib/turnstile";
import { ALLOWED_SUBJECTS } from "@/lib/formSubjects";

/**
 * POST /api/forms/submit — the single gate every public form goes through.
 *
 * WHY THIS ROUTE HAD TO EXIST.
 *
 * Until now all five public forms POSTed from the browser STRAIGHT to
 * formsubmit.co. That was correct when the site was a static export with no
 * server; it stopped being true in Phase 1, and it makes a CAPTCHA pointless —
 * a widget on a page a bot never loads stops nothing. So the browser now posts
 * here, this route verifies the Turnstile token, and only then does the server
 * forward the submission on. No token, no forward, nothing sent.
 *
 * HONEST LIMIT, worth stating plainly: the Formsubmit address is an email
 * address in a URL, and it has been in the public bundle for months. Moving it
 * server-side stops advertising it, but a bot that already harvested it can
 * keep POSTing to formsubmit.co directly, and nothing in this codebase can
 * prevent that. Closing it fully needs a Formsubmit-side control or a different
 * destination. Recorded in governance rather than left implied.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/info@faithfoundationsf.org";

const MAX_FIELD_CHARS = 5000;
const MAX_FIELDS = 40;

export async function POST(request: Request) {
  let body: {
    subject?: string;
    fields?: Record<string, unknown>;
    turnstileToken?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "That submission could not be read." },
      { status: 400 }
    );
  }

  const subject = String(body.subject ?? "").trim();
  const rawFields = body.fields ?? {};

  if (!ALLOWED_SUBJECTS.has(subject)) {
    return NextResponse.json(
      { ok: false, error: "Unknown form." },
      { status: 400 }
    );
  }

  // ── The gate. Before anything is forwarded, written or emailed. ──
  const verdict = await verifyTurnstile(
    body.turnstileToken,
    clientIpFrom(request.headers)
  );

  if (!verdict.ok) {
    console.warn(
      `[forms] rejected "${subject}" — turnstile ${verdict.errorCodes?.join(",") ?? "failed"}`
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "The spam check did not pass. Refresh the page and try again, or email us directly.",
      },
      { status: 400 }
    );
  }

  const entries = Object.entries(rawFields).slice(0, MAX_FIELDS);
  const fields: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (typeof key !== "string") continue;
    fields[key.slice(0, 100)] = String(value ?? "").slice(0, MAX_FIELD_CHARS);
  }

  try {
    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        // Formsubmit's own captcha page cannot be completed in an AJAX flow —
        // it would return an HTML interstitial that this route would read as a
        // failure. Turnstile above is the check that actually runs.
        _captcha: "false",
        from_name: "FAITH Foundation Website",
        ...fields,
      }),
      cache: "no-store",
    });

    let payload: { success?: boolean | string; message?: string } = {};
    try {
      payload = await response.json();
    } catch {
      // Non-JSON body — the status check below decides.
    }

    // Formsubmit answers 200 with success:"false" for an unactivated form, and
    // returns the string "true" rather than a boolean on success. Reporting a
    // delivery that did not happen is the failure mode this site has shipped
    // three times; both forms of the flag are checked.
    const accepted = payload.success === true || payload.success === "true";

    if (response.ok && accepted) {
      return NextResponse.json({ ok: true, skipped: verdict.skipped ?? false });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          payload.message ||
          `The form service responded with an error (${response.status}).`,
      },
      { status: 502 }
    );
  } catch (cause) {
    console.error("[forms] formsubmit unreachable:", cause);
    return NextResponse.json(
      { ok: false, error: "Could not reach the form service." },
      { status: 502 }
    );
  }
}
