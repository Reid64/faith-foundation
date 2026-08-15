/**
 * Formsubmit.co submission for the site's forms.
 *
 * The site is a static export (`output: "export"`), so there is no server to
 * POST to. Formsubmit is a hosted endpoint that forwards submissions straight
 * to a mailbox — here, info@faithfoundationsf.org — which is why it works from
 * a fully static build.
 *
 * No account, no API key, no environment variable. The destination mailbox is
 * part of the URL, so there is nothing to configure in Vercel and nothing that
 * has to be inlined at build time.
 *
 * One caveat worth knowing: Formsubmit sends a one-time activation email to
 * info@faithfoundationsf.org the first time a form is submitted. Until someone
 * clicks the link in that email, Formsubmit answers with `success: "false"` and
 * an activation message — which this module reports as a failure, so the form
 * shows the message and the email fallback rather than a false success.
 *
 * Verify with: npx playwright test scripts/site-audit.spec.ts
 */

export const FORMSUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/info@faithfoundationsf.org";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * POSTs a submission and reports whether it was actually accepted.
 *
 * Delivery is only reported on a 200 AND a truthy `success` in the body.
 * Formsubmit can answer 200 with `success: "false"` (an unactivated form, for
 * one), so trusting the status code alone would show a success state for a
 * message that was never delivered — the exact failure mode this site has
 * already shipped three times. Note that Formsubmit returns `success` as the
 * STRING "true", not a boolean, so both are accepted here.
 */
export async function submitForm(
  subject: string,
  fields: Record<string, string>
): Promise<SubmitResult> {
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
        _captcha: "false",
        from_name: "FAITH Foundation Website",
        ...fields,
      }),
    });

    let payload: { success?: boolean | string; message?: string } = {};
    try {
      payload = await response.json();
    } catch {
      // Non-JSON body — fall through to the status check below.
    }

    const accepted = payload.success === true || payload.success === "true";
    if (response.ok && accepted) return { ok: true };

    return {
      ok: false,
      error:
        payload.message ||
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
