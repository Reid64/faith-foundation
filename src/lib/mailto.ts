/**
 * Shared mailto dispatch for the site's forms.
 *
 * WHY THIS EXISTS: the site is a static export (`output: "export"` in
 * next.config.mjs), so there is no server and no endpoint to POST a form to.
 * Every form on the site was originally written as `preventDefault()` followed
 * by a success message, which meant submissions were silently destroyed while
 * the visitor was told they had been received.
 *
 * Routing submissions through the visitor's own mail client is a deliberate
 * INTERIM measure. It is not a capture system: it depends on the visitor having
 * a mail client and on them pressing send. It is chosen because it is the only
 * option that reaches a human without a backend, and because it fails visibly
 * (an unsent draft) rather than invisibly (a discarded submission). Success
 * copy across the site is worded to match — it tells the visitor to press send
 * and offers the phone number as a fallback.
 *
 * The durable fix is a real intake endpoint (a form provider or a serverless
 * function). See governance/SITE_AUDIT_2026-08-14.md.
 */

export const CONTACT_EMAIL = "info@faithfoundationsf.org";

export type MailtoField = [label: string, value: string];

/**
 * Builds a mailto: URL. Blank fields are dropped so the message stays readable.
 */
export function buildMailto(
  subject: string,
  fields: MailtoField[],
  intro?: string
): string {
  const lines: string[] = [];
  if (intro) lines.push(intro, "");
  for (const [label, value] of fields) {
    const v = (value ?? "").trim();
    if (v) lines.push(`${label}: ${v}`);
  }
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${body}`;
}

/** Builds the message and hands it to the visitor's mail client. */
export function openMailto(
  subject: string,
  fields: MailtoField[],
  intro?: string
): void {
  if (typeof window === "undefined") return;
  window.location.href = buildMailto(subject, fields, intro);
}
