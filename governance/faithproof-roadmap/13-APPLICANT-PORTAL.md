# Phase 13 — Applicant Portal

## Objective
Families applying for FAITH Foundation assistance can apply online, track their application status in real time, upload documents, and receive notifications.

## URL Structure
/apply-portal — landing
/apply-portal/apply — multi-step application form
/apply-portal/status — application status tracker
/apply-portal/documents — document upload
/apply-portal/messages — messages from FAITH Foundation staff

## Database
File: supabase/migrations/009_applicant_portal.sql

### applications table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id UUID REFERENCES contacts(id)
program TEXT NOT NULL — which program they applied for
status application_status — enum: submitted, under_review, approved, denied, waitlisted, withdrawn
household_size INTEGER
annual_income_cents INTEGER
employment_status TEXT
housing_situation TEXT
assistance_requested TEXT
notes_internal TEXT — staff only, never shown to applicant
submitted_at TIMESTAMPTZ DEFAULT NOW()
reviewed_by UUID REFERENCES profiles(id)
reviewed_at TIMESTAMPTZ
decision_notes TEXT — shown to applicant on approval/denial

### application_documents table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
application_id UUID REFERENCES applications(id)
name TEXT
storage_path TEXT — Supabase Storage path
type TEXT
uploaded_at TIMESTAMPTZ DEFAULT NOW()

## Multi-step Application Form (public, no auth required for submission)
Step 1: Personal info (name, email, phone, address)
Step 2: Household info (size, income, employment, housing situation)
Step 3: Program selection and assistance description
Step 4: Document upload (optional at submission, can add later)
Step 5: Review and submit
On submit: create contact (type=applicant), create application record, send confirmation email via Zoho SMTP, log to audit_log

## Status Tracker
Applicant enters email + application ID to check status
Shows pipeline stage with visual progress indicator
Shows any messages from staff
Shows document upload status

## Build-time notes (added at spec creation, not part of the original brief)

1. **`notes_internal` must never reach the client.** It is marked "staff only,
   never shown to applicant", but a server component that does `select("*")` and
   renders the row will ship it in the RSC payload whether or not it is
   displayed. Select explicit columns on every applicant-facing query.
2. **"Email + application ID" is not authentication.** Application IDs are UUIDs,
   so they are not guessable, but the pairing is a bearer token sent in plain
   text and forwarded in email. It exposes household income, employment and
   housing status for families in crisis. Consider a signed, expiring magic link
   instead — and at minimum rate-limit the lookup.
3. **Uploaded documents are identity documents.** Supabase Storage buckets are
   public by default. The bucket must be private with RLS-scoped signed URLs;
   a public bucket here would expose pay stubs and IDs to anyone with the path.
4. **The public form is unauthenticated, so it needs abuse protection** —
   rate limiting and a honeypot at least. The existing site forms use a honeypot
   (see src/app/contact/ContactForm.tsx) — reuse that pattern.
5. **This duplicates the existing `/apply` page.** The current apply form emails
   via Formsubmit and stores nothing. Decide at build time whether `/apply`
   redirects here or the two coexist; two intake paths that write to different
   places is how records go missing.
6. **Never report a submission as received unless the row committed.** The
   2026-08-14 audit found the old Apply form telling families in crisis a
   caseworker would call while discarding everything they entered.
