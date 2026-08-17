/**
 * Public form submission.
 *
 * HISTORY, because the name and the mechanism have both changed and the file
 * path is load-bearing across five forms:
 *   - Web3Forms (never delivered — the access key was never obtained)
 *   - Formsubmit.co, POSTed straight from the browser
 *   - now: POSTed to our own /api/forms/submit, which verifies a Cloudflare
 *     Turnstile token and only then forwards to Formsubmit server-side.
 *
 * The earlier direct-to-Formsubmit design was correct while the site was a
 * static export with no server. That stopped being true in Phase 1, and a
 * browser that posts directly to a third party cannot be protected by a
 * CAPTCHA at all — there is no server in the path to check the token. Hence the
 * route.
 *
 * The destination address no longer appears in the client bundle.
 *
 * Verify with: npx playwright test scripts/turnstile.spec.ts
 */

/** Our own gate. The Formsubmit endpoint now lives only on the server. */
export const FORM_ENDPOINT = "/api/forms/submit";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * POSTs a submission and reports whether it was actually accepted.
 *
 * Delivery is only reported on a 200 AND `ok: true` in the body. The route
 * returns 400 when the Turnstile check fails and 502 when Formsubmit refuses,
 * and in both cases the message is written for the person reading it.
 */
export async function submitForm(
  subject: string,
  fields: Record<string, string>,
  turnstileToken?: string | null
): Promise<SubmitResult> {
  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ subject, fields, turnstileToken }),
    });

    let payload: { ok?: boolean; error?: string } = {};
    try {
      payload = await response.json();
    } catch {
      // Non-JSON body — fall through to the status check below.
    }

    if (response.ok && payload.ok === true) return { ok: true };

    return {
      ok: false,
      error:
        payload.error ||
        `The form service responded with an error (${response.status}).`,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Could not reach the form service (${err.message}).`
          : "Could not reach the form service.",
    };
  }
}
