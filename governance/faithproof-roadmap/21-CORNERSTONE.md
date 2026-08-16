# Phase 21 — Cornerstone Communities Project Tracker

## Objective
Dedicated module tracking the four-phase Cornerstone Communities development roadmap with public progress updates on the website.

## Phases
1. Land Acquisition — donated/discounted land from Texas land banks and developers
2. Site Development — infrastructure, permits, utilities
3. First Home Placement — first Bright Box home placed on site
4. Replication — scaling to additional sites

## Database
File: supabase/migrations/014_cornerstone.sql

### cornerstone_projects table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name TEXT NOT NULL
location TEXT
phase INTEGER — 1, 2, 3, or 4
phase_status TEXT — not_started, in_progress, complete
land_acquired BOOLEAN DEFAULT false
land_source TEXT
site_address TEXT
target_homes INTEGER
homes_placed INTEGER DEFAULT 0
public_notes TEXT — shown on public site
internal_notes TEXT — admin only
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()

### cornerstone_milestones table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id UUID REFERENCES cornerstone_projects(id)
title TEXT NOT NULL
description TEXT
target_date DATE
completed_date DATE
is_public BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()

## Pages

### /admin/cornerstone — Project Dashboard
All projects with phase badges
Progress bars showing phase completion
"Add Project" button

### /admin/cornerstone/[id] — Project Detail
Phase progress tracker (4 steps visual)
Milestones list with completion status
Internal and public notes
Status update buttons

### Public: /cornerstone — Public Progress Page
Shows all public projects with phase progress
Interactive timeline of milestones
Links to land bank partnership info

## Build-time notes (added at spec creation, not part of the original brief)

1. **"Bright Box home" must not appear on the public page.** The named
   homebuilder was deliberately removed from every public location on
   2026-08-14 to reduce private-benefit / self-dealing exposure ahead of the
   Google for Nonprofits application and under IRS scrutiny. The public
   Cornerstone page says "a corporate construction partner". Keep the name out
   of `public_notes` and out of any public copy; it is fine internally.
2. **`internal_notes` must never reach the client.** Same rule as
   `applications.notes_internal` — select explicit columns on the public query
   rather than `select("*")`, or it ships in the RSC payload.
3. **The existing /programs/cornerstone-communities page already carries a
   roadmap** with four status-badged phase cards, and it states plainly that
   FAITH Foundation is **not yet operating a Cornerstone Community**. A new
   /cornerstone page must not contradict it. Decide whether the new page
   replaces that section, or feeds it — two roadmaps that disagree is exactly
   the failure the 2026-08-15 News/Events/Impact reconciliation fixed.
4. **Do not let the tracker imply progress that has not happened.** `homes_placed`
   defaults to 0 and should stay 0 until a home is actually placed; the public
   page must read honestly at zero, not as "coming soon" spin.
5. **Add `/cornerstone` to next-sitemap** and confirm it is not caught by an
   exclude rule — the /faithproof pages were silently missing from the sitemap
   for exactly that reason.
6. **`phase INTEGER` + `phase_status TEXT` are unconstrained.** Add a CHECK on
   phase BETWEEN 1 AND 4 and an enum for status.
