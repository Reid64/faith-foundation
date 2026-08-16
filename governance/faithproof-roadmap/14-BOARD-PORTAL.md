# Phase 14 — Board Portal

## Objective
Private board-only section within the admin where directors access meeting minutes, financial summaries, voting records, and governance documents. Accessible to role=board and role=admin only.

## URL Structure
/admin/board — board portal landing
/admin/board/meetings — meeting minutes
/admin/board/financials — board financial reports
/admin/board/votes — voting records
/admin/board/documents — governance documents

## Database
File: supabase/migrations/010_board_portal.sql

### board_meetings table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
meeting_date DATE NOT NULL
type TEXT — regular, special, annual
agenda TEXT
minutes TEXT
attendees TEXT[]
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

### board_votes table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
meeting_id UUID REFERENCES board_meetings(id)
motion TEXT NOT NULL
result TEXT — passed, failed, tabled, withdrawn
votes_for INTEGER
votes_against INTEGER
votes_abstain INTEGER
notes TEXT
created_at TIMESTAMPTZ DEFAULT NOW()

## Pages

### /admin/board
Welcome panel showing upcoming meetings, recent votes, financial snapshot
Quick links to all sections
Access: role=board or role=admin only — middleware enforces this

### /admin/board/meetings
List of all meetings, newest first
"Add Meeting" button (admin only)
Click row → detail with full minutes and votes

### /admin/board/financials
Monthly financial summary cards
Fund balances by designation
Year-to-date income vs expense
Pulls live from transactions table — no separate data entry needed

### /admin/board/votes
All voting records across all meetings
Filter by meeting, result
Visual: passed=green, failed=red, tabled=amber

## Sidebar
Add "Board" nav item to admin sidebar, visible only to role=board and role=admin

## Build-time notes (added at spec creation, not part of the original brief)

1. **Middleware cannot enforce role.** `src/middleware.ts` only checks that a
   session cookie resolves to a user; it does not read `profiles`, and adding a
   database round-trip to middleware would run on every matched request. Enforce
   role in the `/admin/board/layout.tsx` server component (redirect if not
   admin/board) **and** in RLS on both tables. Middleware stays the coarse gate.
2. **RLS is the real boundary, not the hidden nav item.** Omitting "Board" from
   the sidebar for staff hides the link, not the route or the data. Both tables
   need policies restricting SELECT to `current_user_role() IN ('admin','board')`
   — mirroring the existing audit_log policy.
3. **Board members currently cannot write anything.** Every existing table
   grants INSERT/UPDATE to `role = 'admin'` only. Minutes and votes will need
   their own policies if board members are meant to author them; otherwise only
   the admin account can, which may be the intent.
4. **Minutes and votes are the legal record of a 501(c)(3).** Treat edits as
   consequential: audit every change, and consider making votes immutable once
   recorded rather than freely editable.
5. **`/admin/board/documents` has no table defined.** Decide whether it reuses
   `proof_documents` (filtered to board/governance types) or needs its own.
