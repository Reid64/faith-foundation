# Phase 12 — Donor Portal

## Objective
Public-facing authenticated portal where donors log in to see their giving history, download impact receipts, update contact info, and see how their gifts were used.

## URL Structure
/portal — landing/login page
/portal/dashboard — donor dashboard after login
/portal/giving — full giving history
/portal/receipts — downloadable impact receipts
/portal/profile — update contact info

## Auth
Separate from admin auth. Donors register with email + password.
Supabase handles auth — same project, different role.
New role: 'donor' in user_role enum.

## Database
New table: donor_portal_users
Links auth.users to contacts table via email match.

## Public Site Design
Uses public site navy/gold/cream design system with SiteHeader and SiteFooter.
NOT the admin dark design.

## Pages

### /portal
Hero: "Your generosity. Your proof."
Email + password login form
"Create account" link → /portal/register
"Forgot password" link

### /portal/dashboard
Welcome: "Welcome back, [first_name]"
Three stat cards: Total Given / Last Gift / Gifts This Year
Recent gifts table: date, fund, amount, status
"View all giving" link
Impact section: shows which vouchers their designated fund supported
"Download impact receipt" button

### /portal/giving
Full paginated table of all their confirmed donations
Filter by year, fund
Total by year display

### /portal/receipts
List of quarterly impact receipts
Each receipt: quarter, total given, funds designated, impact summary, PDF download button
PDF generated via server action using @react-pdf/renderer

### /portal/profile
Edit: first name, last name, phone, address
Change password via Supabase auth

## Build-time notes (added at spec creation, not part of the original brief)

1. **This is the highest-risk RLS work in the roadmap.** A donor must see their
   own giving and nobody else's. Self-service registration means an attacker can
   create an account at will, so a mistake here leaks other donors' names and
   amounts. Every donor-facing policy must key off `auth.uid()`, never off an
   email string supplied by the client.
2. **Email-match linking is the weak point.** `donor_portal_users` links
   auth.users to contacts "via email match". Anyone can register with any email,
   so matching on an unverified address hands over that donor's history.
   Require Supabase email confirmation before linking, and re-verify at link
   time — do not link on signup alone.
3. **Adding `donor` to the `user_role` enum affects existing policies.** Several
   policies test `role IN ('admin','board','staff')`; a new label is excluded by
   those, which is correct, but `handle_new_user()` currently assigns every new
   signup `role = 'staff'`. A donor registering through the portal would become
   staff and gain internal read access. **That trigger must be changed before
   this portal ships.** See supabase/migrations/003.
4. **Middleware currently gates `/admin` and `/faithproof/admin` only.** `/portal`
   sub-routes need their own gate, and `isInternalRoute()` in src/lib/chrome.ts
   must NOT include `/portal` — these pages keep the public header and footer.
5. **`@react-pdf/renderer` is not yet a dependency** — shared with Phase 16.
