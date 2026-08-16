# Phase 18 — Volunteer Management

## Objective
Track volunteer shifts, hours, skills, event assignments. Send automated thank-you emails. Generate volunteer impact reports.

## Database
File: supabase/migrations/013_volunteers.sql

### volunteer_events table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL
description TEXT
date DATE NOT NULL
start_time TIME
end_time TIME
location TEXT
max_volunteers INTEGER
status TEXT — scheduled, completed, cancelled
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

### volunteer_shifts table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
event_id UUID REFERENCES volunteer_events(id)
contact_id UUID REFERENCES contacts(id) — must be type=volunteer
hours_logged DECIMAL
checked_in_at TIMESTAMPTZ
checked_out_at TIMESTAMPTZ
notes TEXT
created_at TIMESTAMPTZ DEFAULT NOW()

### volunteer_skills table
contact_id UUID REFERENCES contacts(id)
skill TEXT
PRIMARY KEY (contact_id, skill)

## Pages

### /admin/volunteers — Volunteer Dashboard
Stat cards: Total Volunteers / Hours This Month / Upcoming Events / Skills Available
Upcoming events list
"Add Event" button

### /admin/volunteers/events — Events
List of all volunteer events with date, status, volunteer count
Click → event detail with attendee list, hours, check-in management

### /admin/volunteers/hours — Hours Report
Total hours by volunteer, by month, by event
Exportable as CSV

## Build-time notes (added at spec creation, not part of the original brief)

1. **"must be type=volunteer" is a comment, not a constraint.** A foreign key to
   `contacts(id)` accepts a donor or an applicant. Enforce it in the server
   action, or with a trigger, or accept that the hours report will eventually
   count the wrong people.
2. **`max_volunteers` is not enforced by anything.** Signing up past capacity
   will succeed unless the insert path counts existing shifts first — and that
   check races under concurrent signups.
3. **`hours_logged` duplicates check-in/check-out.** Decide which is
   authoritative: derive hours from the timestamps, or keep the manual field and
   treat the timestamps as informational. Two sources of truth for hours is how
   a volunteer-impact report ends up wrong.
4. **`DECIMAL` without precision** — specify `NUMERIC(5,2)` or similar, or
   Postgres allows arbitrary precision and rounding becomes inconsistent.
5. **Reuse the CSV escaper from Settings.** src/app/admin/settings/actions.ts
   already handles quoting and CSV-injection guarding (a field starting `=` `+`
   `-` `@` executes as a formula in Excel). Do not hand-roll a second one.
6. **Automated thank-you emails depend on Phase 11** (Zoho SMTP + email_sends).
   If Phase 18 ships first, log the intent and send manually rather than
   implying a mail path that does not exist.
