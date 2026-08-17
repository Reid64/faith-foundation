# SCOPE RECONCILIATION — 2026-08-18

Seventeen scoped features, checked against the code rather than against the
documentation that describes it.

**Why it was done this way.** Governance in this repository has previously
described work as complete that did not exist. The Zeffy IMAP poller was
recorded as built and had no route, no cron entry, and no mention anywhere in
the source tree. So nothing here is taken from a governance document. Every
status below rests on one of: a file at a stated path, a route in the App Router
tree, a `CREATE TABLE` in an applied migration, a column in the live Supabase
schema, or a `vercel env ls` reading. Where a document and the code disagree,
the disagreement is recorded.

**This is a read-only report.** Nothing was built, fixed, configured or
deployed to produce it.

---

## Summary

| # | Feature | Status |
| --- | --- | --- |
| 1 | CRM | **BUILT AND FUNCTIONAL** |
| 2 | Mail merge | **BUILT AND FUNCTIONAL** (narrow merge fields) |
| 3 | Mail parsing | **BUILT** — delivery path unverifiable from here |
| 4 | Donor portal | **NOT BUILT** |
| 5 | Applicant portal | **NOT BUILT** |
| 6 | Volunteer management | **PARTIALLY BUILT** |
| 7 | Board portal | **BUILT AND FUNCTIONAL** (AI drafting non-functional) |
| 8 | Grant tracking | **BUILT AND FUNCTIONAL** |
| 9 | Document generation | **PARTIALLY BUILT** — minutes only |
| 10 | Fund accounting | **BUILT AND FUNCTIONAL** |
| 11 | SMS notifications | **NOT BUILT** |
| 12 | AI intake assistant | **BUILT BUT NON-FUNCTIONAL** |
| 13 | Automated impact receipt engine | **NOT BUILT** |
| 14 | Cornerstone Communities tracker | **BUILT AND FUNCTIONAL** |
| 15 | Public API | **BUILT AND FUNCTIONAL** |
| 16 | Board financial dashboard | **PARTIALLY BUILT** |
| 17 | Zeffy donation ingestion | **PARTIALLY BUILT** — webhook yes, email parser no |

Seven fully functional, four partial, two built-but-blocked, four not built.

### The three findings that matter most

1. **There is no non-staff authentication of any kind, and the default role for a
   new account is `staff`.** Items 4 and 5 are not "partly there" — the
   foundation they need does not exist, and the piece that does exist points the
   wrong way. Detail in §4.
2. **Middleware performs no role check whatsoever.** It tests only that a user
   exists. Every authorisation decision in this application is made by RLS at
   the database. Detail in §4.
3. **Nothing in the system sends a donor anything automatically.** Items 11, 13
   and the automated half of 6 are all absent, and they are the features a donor
   or applicant would actually experience.

---

## Environment readings

From `vercel env ls production` on 2026-08-18. Values are stored encrypted and
cannot be read back, but presence and creation time can.

**Set (19):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `ZOHO_IMAP_HOST/PORT/USER/PASS`, `ZOHO_SMTP_PASS`,
`INBOUND_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `PUSHER_APP_ID/KEY/SECRET/CLUSTER`,
`NEXT_PUBLIC_PUSHER_KEY/CLUSTER`, `CLOUDFLARE_TURN_KEY_ID/API_TOKEN`.

**Not set, and each blocks something below:** `ANTHROPIC_API_KEY` (12, and AI
minutes drafting in 7), `CRON_SECRET` (17, 13), any SMS provider credential
(11), `ZEFFY_WEBHOOK_SECRET` (17 — the open-webhook finding in AUDIT_REPORT).

**Also absent from production, noted in passing:** `NEXT_PUBLIC_WEB3FORMS_KEY`
exists in `.env.local` but not in Vercel. Public form delivery is outside these
17 features and was not investigated further, but it is worth a look.

---

## 1. CRM — BUILT AND FUNCTIONAL

**Evidence.** Routes `/admin/crm`, `/admin/crm/contacts`,
`/admin/crm/contacts/new`, `/admin/crm/contacts/[id]`,
`/admin/crm/contacts/[id]/edit`, `/admin/crm/tasks`, `/admin/crm/campaigns`,
`/admin/crm/templates`. Schema from `supabase/migrations/007_crm_schema.sql`:
`contacts`, `interactions`, `tasks`, `campaign_tags`, `contact_transactions`,
`contact_vouchers` — all six confirmed present in the live database.

All five named sub-capabilities are real:

- **Donors, applicants, volunteers** — `contact_type` enum is
  `('donor','applicant','volunteer','board','partner')`.
- **Contact records** — full CRUD.
- **Interaction history** — `interactions`, written by hand and automatically by
  `/api/webhooks/zeffy` and `/api/ai/intake`.
- **Pipeline stages** — `contacts.pipeline_stage`, set inline by `StageSelector`
  in `src/app/admin/crm/contacts/[id]/InlineForms.tsx`.
- **Email campaign tagging** — `campaign_tags`, feeding
  `/admin/crm/campaigns/[campaign]/send`.

**Gap.** None against the stated scope.

**Effort.** —

---

## 2. Mail merge — BUILT AND FUNCTIONAL, with narrow merge fields

**Evidence.** `/admin/crm/templates`, `/admin/crm/templates/new`,
`/admin/crm/templates/[id]/edit`, `/admin/crm/campaigns/[campaign]/send`.
Schema from `008_mail_schema.sql`: `email_templates`, `email_sends`,
`template_type` enum
`('donor_receipt','impact_report','volunteer_welcome','application_update','board_report','custom')`.
Sending is `src/lib/email.ts` (nodemailer over Zoho SMTP); merging is
`src/lib/mergeTemplates.ts`.

`ZOHO_SMTP_PASS` **is** set in production, so this works there. It does not work
locally, and `src/lib/email.ts` is explicit about refusing to report success it
did not achieve — it throws rather than resolving when the password is missing,
and the outcome is recorded in `email_sends`.

**Gap.** The ten merge tokens are contact fields only: `{{first_name}}`,
`{{last_name}}`, `{{email}}`, `{{phone}}`, `{{city}}`, `{{state}}`, `{{date}}`,
`{{org_name}}`, `{{ein}}`, `{{assigned_to}}`. **There is no giving-history
token** — no amount, no date of last gift, no fund. So "personalized donor
letters" personalises the salutation but not the substance, and the
`donor_receipt` and `impact_report` template types have no financial data to
merge. That is the gap between this and item 13.

**Blockers.** None; `ZOHO_SMTP_PASS` is set.

**Effort.** Small to add giving-history merge fields.

---

## 3. Mail parsing — BUILT; delivery path cannot be verified from here

**Evidence.** `src/app/api/webhooks/email-inbound/route.ts`. On a POST it looks
up or creates a `contacts` row by sender address, writes an `interactions` row,
and writes to `audit_log`, all through `supabaseAdmin`. `INBOUND_WEBHOOK_SECRET`
is set in production (created 2026-08-17), so the token check is live.

**Note on the mechanism, because the scope wording invites confusion.** This is
a **webhook** — Zoho must push to it. It is not IMAP polling and shares no code
with item 17.

**Gap.** None in the code path.

**Blockers.** Whether Zoho is actually configured to forward mail to this
endpoint is external state that cannot be read from the repository, the
database, or Vercel. **Unverified, and it is the difference between this feature
working and not.** The check is a single test message.

One code-level caveat carried over from `AUDIT_REPORT.md` HIGH 2: the token
check is `if (SECRET) { ... }`, so removing the variable silently reopens the
endpoint rather than failing closed.

**Effort.** Small — verification, not construction.

---

## 4. Donor portal — NOT BUILT

**Searched and did not find.** `find src -ipath "*donor*" -o -ipath "*portal*"`
returns only `src/app/governance/donor-privacy/` — a public policy page. No
route, no layout, no component. `grep` for `signUp`, `signInWithOtp`, `magic`,
`register` across `src/` returns nothing but prose in the privacy policy. There
is no giving-history view, no receipt download, and no designated-gift tracking
for a donor.

**The authentication picture, since this and item 5 both depend on it.**

**No donor-facing or applicant-facing authentication exists.** There is exactly
one sign-in surface, `src/app/login/page.tsx`, whose own metadata reads
_"Internal staff and board access only."_ It offers email and password. There is
no account creation, no password-less link, no self-service anything.

**The roles the `profiles` table actually supports** — read from the live
database, `user_role` enum: **`admin`, `board`, `staff`, `public`**. There is no
`donor` role and no `applicant` role. Of 70 profile rows, the roles in use are
`admin`, `board` and `public`.

**What middleware does with a role it does not recognise: nothing, because it
never looks at roles.** `src/middleware.ts` in full does one authorisation
thing:

```ts
const { data: { user } } = await supabase.auth.getUser()
const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
if (isProtected && !user) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

It tests **presence of a user**, not role. `src/app/admin/layout.tsx` then
redirects only `if (!session)` — also no role check; it reads the role solely to
print a badge in the sidebar. So **any authenticated user, whatever their role,
reaches `/admin` and sees the full navigation.** What stops them seeing data is
RLS: every policy gates on `current_user_role() IN ('admin','board','staff')`,
so a `public`-role user gets a complete but empty admin shell. The layout even
has a comment acknowledging this is the real boundary — _"never rely on
middleware alone for authorisation"_ — which is correct, and also means there is
no routing layer to extend for a new audience.

**A specific hazard for whoever builds this.** `handle_new_user` in
`001_faithproof_foundation.sql:257` inserts every newly created auth user with
role **`'staff'`**, not `'public'`:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'staff');
```

37 RLS policies grant access to `staff`. **If donor self-registration were
switched on today, every donor who signed up would receive staff-level read
access to contacts, transactions, vouchers, promises and the audit log.** That
trigger must change before any public sign-up path exists.

**Blockers.** No `donor` role; no role-aware routing; the `handle_new_user`
default; no receipt artefact to download (see item 9); and no donation data to
show a donor until item 17 lands.

**Effort.** Large.

---

## 5. Applicant portal — NOT BUILT

**Searched and did not find.** No route, component or table. There is **no
`applications` table** in the live schema — the full table list is 27 tables and
none of them holds an application. `grep -rn "applications\|applicant"
supabase/migrations/*.sql` returns exactly one hit: the string `'applicant'` as
a member of the `contact_type` enum in `007_crm_schema.sql`. That is a CRM
record *type*, not a login role and not an application record.

**What exists instead.** `/apply` is a four-step wizard
(`src/app/apply/ApplicationForm.tsx`) that calls `submitForm(FORM_SUBJECTS.apply,
…)` and **emails** the result. It writes nothing to the database. So an
application is not a record with a status; it is a message in a mailbox. There
is nothing for a family to log in to, nothing to track, no upload, and no
notification.

Of the four named sub-capabilities — apply online, track status, upload
documents, receive notifications — **none exists**. A storage bucket does exist
(`/api/setup/storage`, used for certified minutes PDFs), so uploads have a place
to go once there is something to attach them to.

**Blockers.** Everything in item 4's authentication paragraph, plus: no
applications schema, no status model, no notification channel for applicants
(email works; SMS does not — item 11).

**Effort.** Large.

---

## 6. Volunteer management — PARTIALLY BUILT

**Evidence.** Routes `/admin/volunteers`, `/admin/volunteers/events`,
`/admin/volunteers/events/new`, `/admin/volunteers/events/[id]`,
`/admin/volunteers/hours`. Schema from `011_volunteers.sql`:
`volunteer_events`, `volunteer_shifts`, `volunteer_skills`.

| Sub-capability | Status |
| --- | --- |
| Shift scheduling | **Built** — `volunteer_shifts`, unique per (event, contact) |
| Hours tracking | **Built** — `hours_logged`, `checked_in_at`, `checked_out_at`, plus `/admin/volunteers/hours` and a CSV export |
| Skill matching | **Partial** — skills are stored and counted, not matched |
| Automated thank-you emails | **Not built** |

**Gap.** *Skill matching*: `volunteer_skills` records `(contact_id, skill)` and
`/admin/volunteers/page.tsx` counts distinct skills for a stat card. Nothing
matches a volunteer to an event by skill — there is no query, no UI, and
`volunteer_events` has no required-skill column. *Thank-you emails*:
`grep -rn "sendEmail" src/app/admin/volunteers/` returns nothing. Across the
whole codebase `sendEmail` is called from exactly three places — campaign send,
minutes actions, and the minutes API route. No volunteer path sends anything.

**Blockers.** None. Email works in production.

**Effort.** Medium — small for thank-yous, medium for real skill matching
(needs a required-skills column and a matching view).

---

## 7. Board portal — BUILT AND FUNCTIONAL

**Evidence.** Routes `/admin/board`, `/admin/board/financials`,
`/admin/board/meetings`, `/admin/board/meetings/new`,
`/admin/board/meetings/[id]`, `/admin/board/meetings/[id]/minutes`,
`/admin/board/meetings/[id]/room`, `/admin/board/votes`. Schema from
`009_board_portal.sql` and `014_board_meeting_room.sql`: `board_meetings`,
`board_votes`, `meeting_approvals`.

| Sub-capability | Status |
| --- | --- |
| Meeting minutes | **Built** — draft, edit, certify; `MinutesClient.tsx` |
| Financial summaries | **Built** — `/admin/board/financials` (see item 16 for its limits) |
| Voting records | **Built** — `board_votes`, `/admin/board/votes` |
| Integrated video conferencing | **Built** — WebRTC mesh, Pusher signalling, Cloudflare TURN; all six env vars set |
| Real-time document signing | **Built** — canvas signature capture, `meeting_approvals`, certified PDF |

**Gap.** AI-drafted minutes (`/api/board/generate-minutes`) returns 503 because
`ANTHROPIC_API_KEY` is unset. This is a convenience on top of a working manual
path — minutes can be typed or pasted and certified without it — so the feature
is functional and the AI assist is not.

**Blockers.** `ANTHROPIC_API_KEY` for AI drafting only.

**Effort.** — (small to enable AI drafting: set one variable)

---

## 8. Grant tracking — BUILT AND FUNCTIONAL

**Evidence.** Routes `/admin/grants`, `/admin/grants/new`, `/admin/grants/[id]`.
Table `grants` from `010_grants.sql`, including **`fund fund_designation`** at
line 36 — so the scope's "linked to fund designations" is satisfied at the
schema level and in the UI: `src/app/admin/grants/GrantForm.tsx:48` renders a
Fund select, and `[id]/page.tsx:155` displays it.

Prospect-through-reporting is modelled: status, `application_deadline`,
`award_date`, `reporting_deadline`, `reporting_period`. The detail page can
record an award as a pending grant transaction, which is what ties a grant to
the ledger.

**Gap.** None against the stated scope.

**Effort.** —

---

## 9. Document generation — PARTIALLY BUILT

**Evidence of what exists.** `src/lib/faithproof/generateMinutesPDF.tsx` —
`@react-pdf/renderer`, branded, rendered to a buffer, saved to Supabase storage,
and registered as a proof document. Invoked from
`src/app/admin/board/meetings/[id]/minutes/actions.ts`.

**Searched and did not find.** `grep -rln -i "voucher letter\|award
letter\|resolution" src/` returns nothing. Of the three artefacts named in the
scope — voucher letters, award letters, board resolutions — **none exists**. One
document type is generated, and it is not one of the three.

**Gap.** Three of three named documents. The infrastructure is proven, so this
is templating work rather than new capability: a PDF renderer, a storage bucket
and a registration path all exist and are in use.

**Blockers.** None.

**Effort.** Medium.

---

## 10. Fund accounting — BUILT AND FUNCTIONAL

**Evidence.** Routes `/admin/accounting`, `/admin/accounting/accounts`,
`/admin/accounting/accounts/new`, `/admin/accounting/journal`,
`/admin/accounting/journal/new`, `/admin/accounting/reports`. Schema from
`012_fund_accounting.sql` and `015_fund_designation_through_ledger.sql`:
`accounts`, `journal_entries`, `journal_lines`, and the `account_balances`
view.

| Sub-capability | Status |
| --- | --- |
| Chart of accounts | **Built** — 10 revenue accounts, per-fund cash (1000–1060) and program expense (5000–5290) |
| Restricted fund tracking | **Built** — `accounts.is_restricted`, and as of migration 015 every journal line carries its own `fund` |
| Financial statements | **Built** — Statement of Financial Position, Statement of Activities, Fund Balance Report, Cash Flow Summary |
| Board-ready P&L | **Built** — Statement of Activities is the nonprofit P&L, now with a per-fund breakout naming the restriction class |

Entries balance by deferred constraint trigger, auto-posting is idempotent on a
unique reference, and voiding reverses rather than deletes.

**Gap.** None against the stated scope. Note the ledger currently holds **zero
entries** — correct, since only one confirmed transaction exists and it predates
the ledger. The machinery is proven; it has nothing to show yet.

**Effort.** —

---

## 11. SMS notifications — NOT BUILT

**Searched and did not find.** `grep -rn -iE "twilio|\bSMS\b|send_sms|messagingServiceSid" src/`
returns four hits and **not one of them sends a message**: two are the TCPA
consent checkbox and its hint on the contact form, one is the consent field on
the contact detail page, and one is a comment in `MfaSection.tsx` noting that
Supabase's SMS factor is a paid add-on. There is no provider SDK in
`package.json`, no API route, and no credential in Vercel.

What does exist is the **consent groundwork**: `contacts` carries SMS consent
with a recorded date, gathered under TCPA wording. That is the part that is
legally awkward to retrofit, and it is done.

**Blockers.** No provider chosen, no account, no credentials. All three of the
named uses (application updates, volunteer reminders, donation confirmations)
also depend on features that do not exist or are not yet fed with data — items
5, 6 and 17 respectively.

**Effort.** Medium.

---

## 12. AI intake assistant — BUILT BUT NON-FUNCTIONAL

**Evidence.** `src/components/IntakeChat.tsx`, rendered globally from
`src/app/layout.tsx:217` and self-gating to public routes — so it is present on
`/apply` and every other public page. `src/app/api/ai/intake/route.ts` is
rate-limited, Turnstile-independent, and on a completed conversation writes a
`contacts` row, an `interactions` row and a `tasks` row through `supabaseAdmin`
— which is precisely the "creates draft CRM records" requirement.

**Why it is non-functional.** `ANTHROPIC_API_KEY` is **not set in production**.
The route checks for it and returns 503 with an honest message — _"The intake
assistant is not connected yet. Please use the application form and we will be
in touch."_ — rather than hanging or pretending. So the widget appears and
politely declines.

**Gap.** None in code. It is one environment variable away from working.

**Blockers.** `ANTHROPIC_API_KEY`.

**Effort.** Small — set the variable, then verify the CRM writes against a real
conversation, which has never been done.

---

## 13. Automated impact receipt engine — NOT BUILT

**What the scope asks for:** quarterly PDF generation, sent to every donor,
automatically.

**What exists:** `src/app/faithproof/ImpactReceiptForm.tsx` — a form on
`/faithproof` where a donor **requests** a receipt by entering an email address.
It submits through the same Formsubmit relay as every other public form. It
generates nothing, produces no PDF, and sends nothing to anyone but the
foundation's own inbox.

**Searched and did not find.** No scheduler, no cron entry (`vercel.json` has no
`crons` key), no quarterly logic, no donor-receipt PDF template, no batch send.
The `donor_receipt` and `impact_report` values in `template_type` are enum
members with no generation path behind them.

**Gap.** All four elements: generation, PDF, scheduling, distribution.

**Blockers.** Needs `CRON_SECRET` (not set) and a cron entry; needs donation
data worth reporting, which needs item 17; needs a PDF template, which is item
9; and needs giving-history merge data, which is the gap in item 2. **Fund
designation is no longer a blocker** — migration 015 landed it, and a receipt
can now honestly say which fund a gift went to.

**Effort.** Large.

---

## 14. Cornerstone Communities tracker — BUILT AND FUNCTIONAL

**Evidence.** Admin routes `/admin/cornerstone`, `/admin/cornerstone/new`,
`/admin/cornerstone/[id]`, `/admin/cornerstone/[id]/edit`. Public route
`/cornerstone`. Schema from `013_cornerstone.sql`: `cornerstone_projects`,
`cornerstone_milestones`, plus the `cornerstone_projects_public` and
`cornerstone_milestones_public` views, which is how the public page reads
without exposing internal columns.

Land-acquisition-through-home-placement is modelled by `phase` plus a
constrained `cornerstone_phase_status` enum
`('not_started','in_progress','complete')`, with `homes_placed` as the terminal
count. The public view is deliberately filtered to
`phase_status <> 'not_started' OR homes_placed > 0`, so an empty pipeline does
not publish a row of zeroes.

**Gap.** None against the stated scope.

**Effort.** —

---

## 15. Public API — BUILT AND FUNCTIONAL

**Evidence.** Six routes plus documentation: `/api/v1/public/stats`,
`/api/v1/public/promises`, `/api/v1/public/transactions`, `/api/v1/public/funds`,
`/api/v1/public/documents`, `/api/v1/public/docs`.

All six answer 200 to an anonymous caller and were checked in the 2026-08-17
audit for field-level leakage — no `internal_notes`, no `donor_email`, nothing
service-role. `/api/v1/public/docs` is a self-describing endpoint listing
parameters and an example response, which is what makes this usable by a partner
without a conversation.

**Gap.** No API key, no rate limiting and no usage record, so "partner
organizations query" is anonymous and unattributable. That is a defensible
design for open transparency data and is not a defect against the stated scope,
but it does mean there is no way to tell who is consuming it.

**Effort.** —

---

## 16. Board financial dashboard — PARTIALLY BUILT

**Evidence.** `/admin/board/financials` renders eight stat cards: total
received, donations, grants, total spent, voucher disbursements, operational,
overhead rate, net position.

| Sub-capability | Status |
| --- | --- |
| Real-time P&L | **Built** — figures are read live, `force-dynamic` |
| Fund balances | **Partial** — the board page does not break down by fund; the Fund Balance Report at `/admin/accounting/reports?report=funds` does, but that is an accounting route, not the board's |
| Burn rate | **Not built** |
| Year-end projections | **Not built** |

**Searched and did not find.** `grep -rn -i "burn rate\|burn_rate\|projection\|projected\|runway" src/`
returns exactly one hit, and it is prose on `/impact` saying _"We could fill
this space with projections. We would rather leave…"_ — the opposite of an
implementation.

**Gap.** Burn rate and year-end projection, plus surfacing per-fund balances on
the board's own page.

**Blockers.** Both missing figures are time-series derivations. With **zero
journal entries** in the ledger today there is no history to derive them from, so
building them now would produce a confident-looking number computed from
nothing. This needs item 17 first, then a few months of real posting.

**Effort.** Medium — but gated on data, not on code.

---

## 17. Zeffy donation ingestion — PARTIALLY BUILT

**What exists.** `src/app/api/webhooks/zeffy/route.ts`, fed by a Zapier Zap.
It maps campaign text to a fund via `src/lib/faithproof/funds.ts`, inserts a
`transactions` row as `status: 'pending'` and `is_public: false`, flags an
inferred fund with `fund_backfilled`, writes an audit entry, and links the donor
into the CRM. Idempotency is enforced by a **UNIQUE constraint** on
`transactions.zeffy_transaction_id`, not by hopeful code, and a 23505 is
answered 200 so Zapier stops retrying.

**What does not exist.** The email parser. `/api/cron/poll-donations` has **no
route file, no `src/app/api/cron/` directory, and no `crons` key in
`vercel.json`.** This was verified again for this report. A governance document
once recorded it as built; it never was, and that contradiction is the reason
this whole reconciliation exists.

**Gap.** Reading Zeffy notification emails over IMAP, parsing them, and marking
messages processed.

**Blockers.** One, and it is not technical difficulty: the `ZOHO_IMAP_*` values
are stored **encrypted** in Vercel and `vercel env pull` returns them as empty
strings, so no real Zeffy email has ever been read and the format is unknown.
Verified this is a CLI limitation and not empty variables —
`NEXT_PUBLIC_SUPABASE_URL` pulls empty too and is certainly populated. A parser
written against a guessed format fails silently, and the donations it drops are
real. `scripts/zeffy-inspect.mjs` exists to unblock this in one command; see
`OPERATOR_ACTIONS.md` §12. `CRON_SECRET` is also unset and is needed before any
cron route ships.

**Effort.** Small once unblocked — every column the parser needs already exists
on `transactions`, and the fund mapper is written and tested.

---

## Contradictions between governance and code

Recorded as required. These are the places where a document says or implies
more than the tree supports.

| Where | Claim | What the code shows |
| --- | --- | --- |
| Historic handoff (already corrected in `AUDIT_REPORT.md` MEDIUM 3, restated here because it is the reason for this exercise) | The Zeffy IMAP poller was built | No route, no directory, no cron entry, no mention. Still true on 2026-08-18. |
| `queue.yaml`, roadmap files `12-DONOR-PORTAL.md` and `13-APPLICANT-PORTAL.md` | Phases 12 and 13 named as portal work | Those numbers were used for **fund accounting** and **cornerstone** migrations instead. `012_fund_accounting.sql` and `013_cornerstone.sql`. No portal code exists at any phase number. The roadmap files are specifications that were never implemented, and nothing in the repo says so. |
| `template_type` enum includes `donor_receipt` and `impact_report` | Implies receipt and impact-report generation | Enum members only. No generation path, no PDF template, no scheduler. |
| `STATE_OF_THE_BUILD.md` describes the board portal as complete | Accurate for minutes, votes, video and signing | AI minutes drafting returns 503 in production; the document does mention `ANTHROPIC_API_KEY` is unset elsewhere, but the two statements are far apart and read as contradictory. |

No other governance claim examined in this pass was contradicted by the code.

---

## Recommended build order

Ordered by dependencies actually found in the tree, not by scope order.

**A note the brief asked for specifically.** Anything depending on fund
designation is **no longer blocked** — `transactions.fund` has existed since
migration 001, and migration 015 carried the designation into the ledger and the
reports on 2026-08-18. What those features are blocked on now is *donation data*,
which is item 17.

### Step 0 — unblock, before any building (minutes)

Run `node scripts/zeffy-inspect.mjs` with the IMAP credentials from the Vercel
dashboard. It is read-only and needs no install. This is the only thing standing
between item 17 and a small implementation, and item 17 gates four other items.

At the same time: set `CRON_SECRET`, and send one test message through the Zoho
forward to confirm item 3 actually delivers.

### Step 1 — Zeffy email parser (item 17) — small

Everything else about donations is already built. Until this lands the ledger
stays empty, and an empty ledger blocks items 13 and 16 from being meaningful
and item 4 from having anything to display.

### Step 2 — AI intake (item 12) — small

Set `ANTHROPIC_API_KEY`, then verify the CRM writes against a real conversation.
This also enables AI minutes drafting in item 7. Two features, one variable, no
new code.

### Step 3 — authentication foundation — medium, and a prerequisite

Before either portal: add the roles, fix `handle_new_user` so a new account is
**not** `staff`, and introduce role-aware routing — which does not exist today in
any form, because middleware never reads a role. Doing this once serves items 4
and 5. Doing it inside item 4 and again inside item 5 would be the expensive
mistake.

### Step 4 — applicant portal (item 5) — large

Ahead of the donor portal because an application is currently an email in a
mailbox, which is the larger operational risk, and because it needs an
`applications` table that nothing else provides. The storage bucket already
exists for uploads.

### Step 5 — document generation (item 9) — medium

Voucher letters, award letters, board resolutions, on the proven
`@react-pdf/renderer` path. Sequenced here because item 13 needs a receipt
template and item 4 needs downloadable receipts, and all of it is the same work.

### Step 6 — donor portal (item 4) — large

Needs step 3 for auth, step 1 for data, step 5 for receipts. Attempting it
earlier means building a portal with nothing to show.

### Step 7 — impact receipt engine (item 13) — large

Needs step 1 (data), step 5 (PDF template), a cron entry with `CRON_SECRET`, and
the giving-history merge fields missing from item 2. Genuinely last among the
donor-facing features.

### Step 8 — volunteer completion (item 6) — small to medium

Thank-you emails are small and unblocked today — email works in production. Skill
matching needs a required-skills column on `volunteer_events`.

### Step 9 — board dashboard completion (item 16) — medium, data-gated

Burn rate and year-end projection need ledger history. Do not build them before
step 1 has produced a few months of real postings; a projection computed from an
empty ledger is worse than no projection.

### Step 10 — SMS (item 11) — medium

Last deliberately. Its three named uses depend on items 5, 6 and 17, the TCPA
consent groundwork is already in place, and it is the only item needing a new
vendor relationship.

---

## What this report does not establish

- **Whether Zoho forwards inbound mail to the webhook** (item 3). External
  configuration; not visible from the repository, the database or Vercel.
- **Whether the Zapier Zap feeding the Zeffy webhook is switched on** (item 17).
  Same reason. If it is off, no donation reaches the system by any route.
- **Whether any built feature behaves correctly under real load or real data.**
  This is a scope reconciliation, not a functional test. The 270-test Playwright
  suite covers a good deal of it; where it does not is recorded in
  `AUDIT_REPORT.md`, particularly that not every admin button has been pressed.
- **Anything about `NEXT_PUBLIC_WEB3FORMS_KEY` being absent from production.**
  Noticed while reading the environment, outside these 17 features, not
  investigated.
