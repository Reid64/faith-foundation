# Phase 11 — Mail Merge + Mail Parsing

## Mail Merge Objective
Generate personalized emails to groups of CRM contacts using templates with live data substitution. Send via Zoho Mail SMTP.

## Environment Variables
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=587
ZOHO_SMTP_USER=info@faithfoundationsf.org
ZOHO_SMTP_PASS — Zoho app-specific password (user must generate in Zoho settings)

## Database
File: supabase/migrations/008_mail_schema.sql

### email_templates table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL
subject TEXT NOT NULL
body_html TEXT NOT NULL — supports {{first_name}} {{last_name}} {{email}} {{donation_total}} {{voucher_number}} {{assigned_to}} {{org_name}} {{date}} merge tags
type template_type — enum: donor_receipt, impact_report, volunteer_welcome, application_update, board_report, custom
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

### email_sends table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
template_id UUID REFERENCES email_templates(id)
contact_id UUID REFERENCES contacts(id)
subject TEXT
body_html TEXT — rendered version with merge tags filled
status email_status — enum: pending, sent, failed, bounced
sent_at TIMESTAMPTZ
error_text TEXT
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

## Pages to Build

### /admin/crm/templates — Template Library
List of all email templates with type badge, name, last used date
"New Template" button → /admin/crm/templates/new
Click row → /admin/crm/templates/[id] (preview + edit)

### /admin/crm/templates/new — Template Editor
Fields: name, type, subject, body (rich textarea with merge tag helper buttons)
Merge tag buttons insert {{first_name}} etc at cursor position
Preview button shows rendered example
Save server action

### /admin/crm/campaigns/[campaign]/send — Mail Merge Send
Shows: template selector, list of contacts in campaign with checkboxes
Preview rendered email for first contact
"Send to X contacts" button
Server action: for each selected contact, render template with contact data, send via Zoho SMTP, log to email_sends, log interaction on contact record

## Mail Parsing Objective
Parse inbound emails to info@faithfoundationsf.org and auto-create CRM interactions or contacts.

## Implementation
Use Zoho Mail webhook/forwarding to POST inbound emails to:
POST /api/webhooks/email-inbound

Route: src/app/api/webhooks/email-inbound/route.ts
Parse: sender email, subject, body text
Logic:
  If sender email matches CRM contact: log interaction type=email, subject=email subject, body=email body excerpt
  If sender email not in CRM: create new contact, log first interaction
  If subject contains "Application" or "Apply": set contact type=applicant
  If subject contains "Volunteer": set contact type=volunteer
  Log to audit_log

## Build-time notes (added at spec creation, not part of the original brief)

1. **Merge-tag rendering must escape HTML.** `body_html` is injected with
   contact-supplied values (names, notes). Interpolating raw text into HTML is
   an injection path into every recipient's inbox — escape on render, and never
   `dangerouslySetInnerHTML` a template preview without sanitising.
2. **The inbound webhook is unauthenticated by default.** Anyone who finds the
   URL can create CRM contacts and interactions at will. It needs a shared
   secret or signature check, exactly like the Zeffy webhook, plus rate
   limiting — otherwise the CRM becomes spammable.
3. **Sender addresses are trivially forged.** Deriving contact type from an
   unverified `From` header and a subject-line keyword means anyone can create
   an "applicant". Treat parsed contacts as unverified until a human reviews
   them.
4. **Send failures must be recorded, not swallowed.** `email_sends.status` and
   `error_text` exist for that; a merge that reports success for a bounced or
   rejected message repeats the defect class this codebase has already shipped
   three times (see the 2026-08-14 forms audit).
5. **Bulk send needs throttling and a resumable design.** Zoho enforces sending
   limits; a loop over hundreds of contacts inside one server action will hit
   both the provider limit and the serverless timeout. Batch it, and make
   re-running safe.
6. **`nodemailer` is not currently a dependency** — it will need adding.
