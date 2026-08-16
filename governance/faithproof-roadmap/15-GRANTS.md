# Phase 15 — Grant Tracking

## Objective
Full grant lifecycle management: prospect, applied, awarded, reporting due, closed. Linked to fund designations. Automated reporting deadline alerts in Command Center.

## Database
File: supabase/migrations/011_grants.sql

### grants table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL — grant name
funder TEXT NOT NULL — foundation/government agency name
amount_cents INTEGER — awarded amount (null if not yet awarded)
status grant_status — enum: prospect, researching, applied, awarded, reporting, closed, declined
program TEXT — which FAITH Foundation program this supports
fund fund_designation — links to fund accounting
application_deadline DATE
award_date DATE
reporting_deadline DATE
reporting_period TEXT
application_notes TEXT
award_notes TEXT
reporting_notes TEXT
contact_name TEXT — program officer name at funder
contact_email TEXT
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

## Pages

### /admin/grants — Grant Dashboard
Stat cards: Total Awarded / Active Grants / Reporting Due Soon / Prospects
Kanban-style columns: Prospect | Applied | Awarded | Reporting | Closed
Each grant card shows: name, funder, amount, deadline
"Add Grant" button

### /admin/grants/[id] — Grant Detail
All fields displayed
Status transition buttons: Move to next stage
Deadline alerts: if reporting_deadline within 30 days, show warning banner
Notes sections for each stage
"Add to transactions" button — creates a transaction record for awarded amount

## Command Center Integration
Add to "Requires Attention" panel:
  Grants with reporting_deadline within 30 days — amber badge
  Grants with application_deadline within 7 days — red badge

## Build-time notes (added at spec creation, not part of the original brief)

1. **Reuse `applyTransition` for the status moves.** src/lib/faithproof/transitions.ts
   already handles session check → RLS-scoped update → audit entry written only
   after success → revalidate. Grants get the same guarantees for free, and the
   audit verbs stay consistent (`grant.applied`, `grant.awarded`, …).
2. **`amount_cents INTEGER` caps at ~$21.4M.** Fine for current grant sizes;
   note it in case a larger award ever lands. The same cap already exists on
   transactions and vouchers.
3. **"Add to transactions" must be idempotent.** Clicking it twice would record
   the same award as revenue twice. Either store the created `transaction_id` on
   the grant row and disable the button once set, or guard on a unique
   reference.
4. **The Command Center currently runs 9 queries in one `Promise.all`.** Adding
   two grant-deadline counts makes 11. That is still fine, but the "Requires
   Attention" panel is becoming the page's cost centre — watch it.
5. **The status enum has 7 values but the Kanban shows 5 columns.** `researching`
   and `declined` need a home, or they will silently disappear from the board.
