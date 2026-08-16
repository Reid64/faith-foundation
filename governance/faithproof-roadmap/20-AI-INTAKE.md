# Phase 20 — AI Intake Assistant

## Objective
Chat widget on the /apply page that pre-screens applicants, answers eligibility questions, collects intake information, and creates a draft application record in the CRM automatically.

## Implementation
Widget: floating chat button on /apply page
Backend: POST /api/ai/intake — calls Anthropic Claude API
System prompt: explains FAITH Foundation mission, programs, eligibility criteria, collects name/email/household size/income/program interest
On conversation completion: extract structured data, create contact (type=applicant) and draft application in DB
Hand-off: "A FAITH Foundation team member will review your information and contact you within 2 business days."

## Environment Variables
ANTHROPIC_API_KEY — already available in Claude environment

## Pages
Widget appears on /apply and /programs pages
No new admin pages needed — applications created by AI appear in /admin/crm/contacts as applicant type

## Build-time notes (added at spec creation, not part of the original brief)

1. **`ANTHROPIC_API_KEY` is NOT "already available".** It is not in `.env.local`
   and not in the Vercel project (which currently holds only the three Supabase
   vars plus `NEXT_PUBLIC_WEB3FORMS_KEY`). It must be obtained and added to both
   before this phase can run. The key is server-only — it must never carry a
   `NEXT_PUBLIC_` prefix or it ships to the browser.
2. **The assistant must not state or imply an eligibility decision.** It
   pre-screens and collects; approval is a human decision recorded through the
   application workflow. Eligibility language on the public site is already
   carefully worded (see /programs and VettingStandards) — the system prompt
   must match it and must not promise assistance.
3. **The endpoint is unauthenticated and costs money per call.** It needs rate
   limiting per IP and a hard cap on conversation length, or it is both a bill
   and a denial-of-service surface.
4. **This collects household income and housing status from families in crisis.**
   Those fields are why the applicant tables are sensitive; the same care
   applies to whatever the chat persists. Do not log full transcripts anywhere
   world-readable.
5. **Never report intake as complete unless the row committed.** Same invariant
   as every other form in this codebase.
6. **Model choice:** use a current Claude model id at build time, and set it in
   one place so it can be updated without touching the prompt.
