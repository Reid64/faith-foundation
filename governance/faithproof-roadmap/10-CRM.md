# Phase 10 — CRM

## Objective
Full contact relationship management system built into FaithProof admin. Tracks donors, applicants, and volunteers with interaction history, pipeline stages, follow-up tasks, and email campaign tags.

## Admin Nav Addition
Add "CRM" to admin sidebar nav between Settings and Audit Log.
Icon: users icon.
Link: /admin/crm

## Database Schema
File: supabase/migrations/007_crm_schema.sql

### contacts table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
type contact_type NOT NULL — enum: donor, applicant, volunteer, board, partner
first_name TEXT NOT NULL
last_name TEXT NOT NULL
email TEXT
phone TEXT
address_line1 TEXT
address_line2 TEXT
city TEXT
state TEXT
zip TEXT
source TEXT — how they found FAITH Foundation
notes TEXT
pipeline_stage TEXT — current stage (varies by type)
assigned_to UUID REFERENCES profiles(id)
is_active BOOLEAN DEFAULT true
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
RLS: authenticated users with role in (admin, board, staff) can read/write

### interactions table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE
type interaction_type NOT NULL — enum: note, call, email, meeting, donation, application, volunteer_shift
subject TEXT
body TEXT
occurred_at TIMESTAMPTZ DEFAULT NOW()
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()
RLS: same as contacts

### tasks table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE
title TEXT NOT NULL
description TEXT
due_date DATE
priority task_priority NOT NULL DEFAULT medium — enum: low, medium, high, urgent
status task_status NOT NULL DEFAULT pending — enum: pending, in_progress, completed, cancelled
assigned_to UUID REFERENCES profiles(id)
completed_at TIMESTAMPTZ
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()
RLS: same as contacts

### campaign_tags table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE
campaign TEXT NOT NULL
tagged_at TIMESTAMPTZ DEFAULT NOW()
tagged_by UUID REFERENCES profiles(id)

### contact_transactions table (linking table)
contact_id UUID REFERENCES contacts(id)
transaction_id UUID REFERENCES transactions(id)
PRIMARY KEY (contact_id, transaction_id)

### contact_vouchers table (linking table)  
contact_id UUID REFERENCES contacts(id)
voucher_id UUID REFERENCES vouchers(id)
PRIMARY KEY (contact_id, voucher_id)

## Pipeline Stages by Contact Type
Donor: prospect → first_contact → active_donor → major_donor → lapsed
Applicant: inquiry → screened → approved → voucher_issued → housed → closed
Volunteer: interested → oriented → active → inactive
Board: nominee → elected → active → emeritus

## Pages to Build

### /admin/crm — CRM Dashboard
Four stat cards: Total Contacts / Active Donors / Open Applications / Active Volunteers
Three panels:
  Left: Tasks Due Today — query tasks WHERE due_date = TODAY() AND status = pending, show contact name + task title + priority badge
  Center: Recent Interactions — last 10 interactions across all contacts
  Right: Pipeline Summary — count of contacts at each stage per type
"Add Contact" button top right

### /admin/crm/contacts — Contact List
Filter bar: type dropdown, pipeline stage dropdown, assigned to dropdown, search by name/email
Table: name, type badge, pipeline stage badge, email, phone, last interaction date, assigned to, actions
Clickable rows → /admin/crm/contacts/[id]
Pagination 25 per page

### /admin/crm/contacts/new — Add Contact
Form: all contact fields, type selector changes which pipeline stages are available
Server action: insert contact, log to audit_log, redirect to /admin/crm/contacts/[id]

### /admin/crm/contacts/[id] — Contact Detail
Left column (1/3): contact card with all fields, edit button, pipeline stage selector (dropdown, saves immediately), assigned to selector
Right column (2/3): tabbed interface
  Tab 1 — Interactions: chronological list of all interactions, "Log Interaction" button opens inline form
  Tab 2 — Tasks: list of tasks with status, "Add Task" button
  Tab 3 — Donations: linked transactions from contact_transactions table
  Tab 4 — Documents: linked vouchers, any uploaded files
  Tab 5 — Campaigns: tags showing which email campaigns this contact has received

Log Interaction inline form: type selector, subject, body, occurred_at (defaults to now)
Add Task inline form: title, description, due_date, priority, assigned_to

### /admin/crm/tasks — Task Manager
All tasks across all contacts, filterable by status/priority/assigned_to/due date
Overdue tasks highlighted in red
"Complete" button on each row

### /admin/crm/campaigns — Campaign Manager
List of all unique campaign tags
For each campaign: count of tagged contacts, "View contacts" link
"Send Campaign" button — opens mail merge flow (Phase 11)

## Auto-linking
When Zeffy webhook creates a transaction:
  If donor_email matches existing contact: link via contact_transactions, log interaction type=donation
  If no match: create new contact type=donor with donor_name and donor_email, link transaction

When applicant submits apply form on public site:
  Create new contact type=applicant, log interaction type=application

## Build-time notes (added at spec creation, not part of the original brief)

1. **This table holds the most sensitive data in the system.** Contacts carry
   names, home addresses, phone numbers and — once Phase 13 lands — household
   income and housing status for families in crisis. The RLS above grants
   read/write to admin, board AND staff. Confirm that is intended before
   building; every other write path in FaithProof is admin-only.
2. **Write the RLS policies with the `current_user_role()` helper**, not with a
   subquery against `profiles`. Migration 002 exists because policies that read
   `profiles` directly caused infinite recursion and made all six tables
   unqueryable. See supabase/migrations/002_fix_rls_recursion.sql.
3. **Nav placement.** The brief says "between Settings and Audit Log", but the
   current sidebar order is Dashboard, Transactions, Vouchers, Promises, Proof
   Vault, Audit Log, Settings — Settings is last. Resolve at build time: most
   likely intent is CRM directly after Proof Vault, or immediately before
   Settings.
4. **Deleting a contact cascades interactions, tasks and campaign tags.** The
   linking tables have no ON DELETE rule, so a contact with linked transactions
   cannot be deleted at all. Prefer soft-delete via `is_active`.
5. **Pipeline stages are free TEXT.** Nothing constrains a donor row to donor
   stages. Either add a CHECK constraint per type or validate in the server
   action, or the pipeline summary will drift.
