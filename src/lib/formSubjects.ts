/**
 * The subject line of every public form submission, in one place.
 *
 * Both sides read this: the forms send `FORM_SUBJECTS.x`, and
 * /api/forms/submit accepts only values from this object. Writing the allowlist
 * out by hand in the route was the first version, and it was already wrong —
 * the application form sends "Housing Assistance Application", not "Housing
 * Voucher Application", which would have rejected every application with
 * "Unknown form." A shared constant removes that whole class of drift.
 *
 * These strings are the subject lines that arrive in the
 * info@faithfoundationsf.org mailbox, so changing one changes what the team
 * sees. They are not internal identifiers.
 *
 * Safe on both sides of the network boundary: nothing secret lives here.
 */

export const FORM_SUBJECTS = {
  contact: "FAITH Foundation — Contact Form Submission",
  volunteer: "FAITH Foundation — Volunteer Application",
  apply: "FAITH Foundation — Housing Assistance Application",
  newsletter: "FAITH Foundation — Newsletter Signup",
  impactReceipt: "Impact Receipt Request",
} as const;

export type FormSubject = (typeof FORM_SUBJECTS)[keyof typeof FORM_SUBJECTS];

export const ALLOWED_SUBJECTS: ReadonlySet<string> = new Set(
  Object.values(FORM_SUBJECTS)
);
