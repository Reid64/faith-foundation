# FULL SYSTEM AUDIT — 2026-08-17

An unattended overnight pass over the whole application, public and admin.
Every route was loaded, every API route was called at three authentication
levels, and the client bundle was searched for secrets. What follows is what was
found, what was fixed, what needs a decision, and — the section that matters
most for an unattended run — what could **not** be tested without a second
human, real hardware, or a live third-party account.

**Scope of change.** Only unambiguously broken, low-risk things were fixed. No
business logic, RLS policy or data model was touched. Middleware was not
touched. Nothing was deployed. Nothing was pushed to `master`. The work is on
the branch `phase-23/mfa-and-system-audit`.

---

## Findings, critical first

### No critical findings

Nothing was found that exposes a secret, leaks data across roles, or can lock a
user out. The two highest findings below are unauthenticated write endpoints,
both of which land their writes in a state that cannot reach the public site.

---

### HIGH 1 — The Zeffy donation webhook accepts writes from anyone

**`src/app/api/webhooks/zeffy/route.ts`** — severity **high**, **not fixed,
needs an operator decision.**

The route has no authentication of any kind: no shared secret, no signature, no
allowlist, no rate limit. Anyone who knows the URL can POST JSON and cause rows
to be written to `transactions`, `contacts`, `interactions` and `audit_log`
through the **service-role** client, which bypasses RLS entirely.

Confirmed by test: `scripts/api-authorization.spec.ts` → _"webhooks are
reachable without credentials — recorded, not endorsed"_. The probe deliberately
sends a payload with no `amount`, so it is rejected before the first database
call and nothing is written.

**What limits the damage.** This was clearly thought about. Everything the
endpoint writes lands as `status: 'pending'` and `is_public: false`, and the
header comment says why: "an unauthenticated endpoint must never be able to
publish a figure on the transparency page". That holds. A forged donation cannot
appear on `/faithproof`.

**What is still real.** A forged donation *can* appear in the Command Center
queue looking exactly like a genuine pending gift, and a distracted admin
confirming it (`confirmTransaction`, `src/app/admin/transactions/[id]/actions.ts`)
posts it to the double-entry ledger. Unbounded POSTs can also fill the table.

**Why it was not fixed tonight.** Adding a required secret breaks the live
Zapier Zap the moment it deploys, and the Zap cannot be reconfigured while the
operator is asleep. That is an operations decision, not a code cleanup.

**Suggested remediation**, for the operator to schedule:

1. Add `ZEFFY_WEBHOOK_SECRET` to Vercel.
2. Require it in the route as a header, **failing closed** — refuse when the
   variable is missing, unlike the inbound-email route below.
3. Add the same header to the Zapier Zap, and only then deploy the route change.
   In that order, or donations stop arriving.

---

### HIGH 2 — The inbound email webhook fails open when unconfigured

**`src/app/api/webhooks/email-inbound/route.ts:55`** — severity **high**, **not
fixed, needs an operator decision.**

```ts
const SECRET = process.env.INBOUND_WEBHOOK_SECRET;
...
if (SECRET) {                       // ← the check only happens if it is set
  if (token !== SECRET) return 401
}
```

If `INBOUND_WEBHOOK_SECRET` is not set in the environment, the check is skipped
entirely and the endpoint accepts anonymous writes to `contacts`,
`interactions` and `audit_log` via the service-role client. Whether the site is
currently protected therefore depends on a variable this audit cannot read from
Vercel. **The operator should check that variable first** — if it is unset, this
endpoint is open right now.

Fail-open is the wrong default for an authentication check. The fix is three
lines — refuse when `SECRET` is missing — but it will take the endpoint offline
if Zoho forwarding is live and unconfigured, so it is the operator's call, and
it should be made together with the variable.

---

### MEDIUM 3 — The Zeffy IMAP donation poller does not exist

Severity **medium**. **Confirmed, as the operator suspected.**

- There is no `src/app/api/cron/` directory at all.
- `vercel.json` has no `crons` key.
- The string `poll-donations` appears **nowhere** in the repository — not in
  code, not in config, not in documentation.

A previous handoff claimed this was built. It was not. Nothing was built for it
tonight, as instructed.

The consequence is worth stating plainly: the **only** automated path by which a
Zeffy donation reaches the ledger is the Zapier webhook in HIGH 1. If that Zap
is off, donations are entered by hand or not at all.

---

### MEDIUM 4 — AI features are non-functional in production

Severity **medium**. **Confirmed. No code change needed.**

`ANTHROPIC_API_KEY` is referenced by exactly two routes and is not set:

| Route | Behaviour without the key |
| --- | --- |
| `src/app/api/ai/intake/route.ts:166` | 503, "The intake assistant is not connected yet. Please use the application form and we will be in touch." |
| `src/app/api/board/generate-minutes/route.ts:121` | 503, "AI minutes generation not configured — add ANTHROPIC_API_KEY to environment" |

Both degrade honestly rather than hanging or pretending. Verified by test
(`api-authorization.spec.ts` → _"the AI intake endpoint says plainly that it is
not connected"_). The AI intake assistant and AI-drafted board minutes simply do
not work until the key is added. Everything else on those pages does.

---

### MEDIUM 5 — A plaintext database password sits in the project folder

Severity **medium**. **Not fixed — it is the operator's file.**

`notepad supabase password.txt` in the repository root contains the Supabase
database password in plain text. It **is** listed in `.gitignore` (verified —
lines 58–59), so it has not been committed and cannot be committed by accident.

It is still a plaintext credential in a folder that gets backed up, synced and
screen-shared. Recommend moving it to a password manager and deleting the file.

---

### MEDIUM 6 — `/financial-transparency` never links to the live ledger

Severity **medium**, **not fixed — a content decision.**

The page titled "Financial Transparency" contains no link to `/faithproof`,
which is where the live accountability figures actually are. Its four headline
figures are policy commitments (100% of designated gifts used as designated,
0 donor records ever sold) rather than measurements, which is honest, but a
visitor who arrives looking for numbers is not sent to them.

Neither page is orphaned — `SiteHeader` links `/faithproof` as "Transparency"
and `SiteFooter` links `/financial-transparency` — so this is a routing-of-
attention problem, not a broken link. Adding a prominent link from the
commitments page to the ledger is a five-minute change once someone decides on
the wording.

---

### MEDIUM 7 — The orphaned-page guard could report false orphans — **FIXED**

`scripts/admin-navigation.spec.ts` — severity **medium**, in the test harness
rather than the product, but it protects against the defect class that caused
three live incidents, so a hole in it matters.

Two faults, both found by running it under load rather than by reading it:

1. **It truncated silently.** The crawl stopped after 80 pages. A single fixture
   row per table used 61 of those, so nobody noticed; the moment the database
   held a few more rows the crawl ran out of budget before reaching
   `/admin/crm/contacts/[id]/edit` and `/admin/board/meetings/[id]/minutes`, and
   reported both as **orphaned pages** when their links were right there,
   unconditional, in the source. A guard that cries wolf when a list gets longer
   gets ignored, and then it protects nothing. Budget raised to 200 and, more
   importantly, **exceeding it is now a hard error** rather than a quiet stop.

2. **A `/new` page could vouch for a detail page.** `matchesPattern` treats
   `[id]` as matching any segment, so `/admin/crm/contacts/new` matched the
   pattern `/admin/crm/contacts/[id]`, and visiting the "new" form marked the
   *detail* route as reached. A genuinely orphaned detail page would have
   passed. The crawl now resolves each URL to its **most specific** pattern —
   fewest placeholders wins — so a literal segment beats a wildcard.

A third change was tried and reverted, which is worth recording because it looks
like an optimisation: visiting only one row per dynamic route. It makes the
crawl fast and deterministic, and it is wrong — some links are conditional on
the row (a transaction is editable only while pending, a campaign is sendable
only while it has recipients), so the single row the crawl happened to land on
decided the verdict. Every row is walked again.

---

### LOW 8 — Test accounts collided under parallel workers — **FIXED**

Three specs built a throwaway account's email from `Date.now()` alone. Under
`fullyParallel`, two workers starting in the same millisecond produced the same
address and Supabase answered "A user with this email address has already been
registered", failing a whole file for a reason unrelated to what it tests. Seen
intermittently in this run's suite, and previously written off as flakiness.

Emails now carry a random suffix, and `meeting-room.spec.ts` — where Playwright
can re-run `beforeAll` against an unchanged module on retry — reuses the
existing account instead of failing.

---

### LOW 9 — Contact detail page had no `h1` at all — **FIXED**

`src/app/admin/crm/contacts/[id]/page.tsx`. The contact's name — the subject of
the page — was marked up as an `h2`, and no `h1` existed anywhere on the page,
so assistive technology had no title for the record being read out. It was the
only admin route in 56 with this problem.

Changed to `h1`. Styling is inline, so it is pixel-identical on screen.

---

### LOW 10 — Two unlabelled controls in the minutes editor — **FIXED**

`src/app/admin/board/meetings/[id]/minutes/MinutesClient.tsx`. The minutes
textarea (the main editing surface of the page) and the transcript file input
had no label, no `aria-label` and no placeholder between them. Added
`aria-label="Meeting minutes"` and `aria-label="Load a transcript from a .txt
file"`.

---

### LOW 11 — Three retired program routes are unreachable dead code

`src/app/programs/emergency/`, `financial-literacy/`, `single-parents/` still
contain `page.tsx` files, but `vercel.json` and `next.config` both issue a
permanent redirect to `/programs` first — verified live, HTTP **308**. The pages
can never render. Harmless, but they will confuse the next person who greps for
a program page. Not deleted: removing routes is a judgement call about whether
the redirects are permanent.

---

### LOW 12 — `/login` has no site header or footer

Deliberate: a focused sign-in page. Recorded so the next sweep does not treat it
as a finding.

---

### LOW 13 — `board_meetings.jitsi_room_name` is written but never read

Already recorded in `SCHEMA_REGISTRY.md`. Left in place; dropping a populated
column is a migration, and none was in scope.

---

## What was checked and found clean

| Check | Result |
| --- | --- |
| Secrets in the client bundle | **Clean.** 115 files under `.next/static` searched for the NAME and the VALUE of 10 server-only variables. Zero hits of either. |
| Secrets in client components | **Clean.** Every `process.env.<secret>` reference lives in a server file; no `"use client"` file imports `supabase/service`. |
| Unauthenticated access to session routes | **Clean.** All 5 session-guarded API routes answer 401 to an anonymous caller. |
| Cross-role leakage | **Clean.** A board member gets 403 from the admin-only route and is served the board ones; an admin is refused nothing. |
| Public API field leakage | **Clean.** All 6 `/api/v1/public/*` endpoints answer 200 anonymously and contain no `internal_notes`, `donor_email`, or service-role material. |
| Orphaned admin routes | **Clean.** The DOM crawl reached 61 pages as admin and 59 as board. No route is unreachable by clicking. |
| Admin routes that render | **Clean.** 56 routes × 2 roles: no 5xx, no dead links, no console errors, and no `undefined` / `NaN` / `[object Object]` / `Invalid Date` anywhere on screen. |
| Public pages | **Clean.** 30 routes: all 200, every internal link resolves, header and footer present (except `/login`), and no placeholder copy — no lorem ipsum, no TODO, no `example.com`, no "coming soon". |
| Mock or placeholder data in source | **Clean.** No `MOCK`/`sampleData`/`dummyData`/`TODO`/`FIXME` identifiers anywhere in `src/`. |
| Six Laws DATA — hardcoded where live data belongs | **Clean, with care.** `/faithproof` is fully live from the database. `/impact` and `/financial-transparency` do carry hardcoded figures, but they are labelled in the source as _"Operating standards and Year One goals. NOT results"_ and the stories as _"Illustrative"_. The one checkable claim, "6 programs built and open to applicants", matches the 6 live program routes exactly. |
| The corporate donor partner named in public copy | **Clean.** No page mentions it. Now enforced by `public-surface.spec.ts`. |
| CSV export | **Works.** Downloads a real `.csv` with a header row and reports the row count, including "no rows yet, headers only". |
| List search, edit-form save, status transition | **Work, and persist.** Verified against the database, not against the on-screen message. |
| Empty states | **Present.** An empty list explains itself in words. |

---

## What could NOT be tested automatically

This is the honest limit of an unattended run. None of the following is a
finding — each is an untested area.

1. **Live video peer connections.** WebRTC media between two real machines
   cannot be verified from one browser. The operator verified this by a live
   two-machine call after the `Permissions-Policy` fix; that remains the only
   evidence, and it is evidence about the deployment as it was then.
2. **TURN relay credentials.** `/api/webrtc/turn-credentials` returns **503**
   locally because `CLOUDFLARE_TURN_KEY_ID` / `CLOUDFLARE_TURN_API_TOKEN` exist
   only in Vercel. The route's authorization was tested; its success path was
   not.
3. **Real email delivery.** No test submits a public form for real, because that
   sends an actual email to the foundation. Form submissions were verified up to
   the point of the relay and no further — the wiring is proven, the delivery is
   not.
4. **Turnstile against real Cloudflare.** The local build uses Cloudflare's
   published always-pass test keys. The fail-closed logic is tested; the
   behaviour against the real service with the real site key is not.
5. **Zeffy and Zoho integrations end to end.** Both webhooks were probed only
   with payloads that fail validation before the first database write, because
   the alternative is fabricating a donation or a contact in production. Their
   happy paths are untested here.
6. **Ledger-firing transitions.** Confirming a transaction and disbursing a
   voucher post to the double-entry ledger. They were deliberately not
   exercised: a half-cleaned ledger is worse than an untested button. (The
   ledger's correctness itself was verified against the live database in an
   earlier phase — balanced entries enforced, no double-post on re-confirm, void
   reverses to zero.)
7. **MFA enforcement.** Deliberately not built. Enrolment is fully tested; the
   runbook for switching enforcement on is `OPERATOR_ACTIONS.md` §11.
8. **Anything needing a second human.** Board approval of minutes by a second
   director, a real signature, a genuine two-person meeting.
9. **Production environment variables.** This audit can prove that no secret
   *name* or *value* it holds locally reaches the client bundle. It cannot read
   Vercel's environment, so `INBOUND_WEBHOOK_SECRET` (HIGH 2) has to be checked
   by the operator.
10. **Every button pressed on every page.** This is the biggest gap and it is
    worth being precise about, because the brief asked for it. Every interactive
    element on all 56 admin routes was **enumerated and inspected** — counted,
    checked for an accessible name, checked that its link resolves — and the
    counts are in `test-results/admin-surface.json`. But they were not all
    *pressed*. Pressing every button on a live database means firing every
    status transition, every delete and every send on real records.
    What was pressed, end to end, with the result checked **against the
    database** rather than against the on-screen message: a CSV export, a list
    search, an edit-form save, and a status transition. What was deliberately
    not pressed: anything that posts to the ledger, sends an email, or deletes a
    row it did not create. Closing this gap properly needs a disposable copy of
    the database, which is the right next investment if this level of assurance
    is wanted routinely.

---

## Verification

```
pnpm tsc --noEmit     0 errors
pnpm run build        clean — 72/72 static pages generated
npx playwright test   258 passed · 3 skipped · 0 failed · 0 flaky   (261 total)
```

The full suite was run with **no arguments**, against a local production build
on `http://localhost:3300`. Naming specific spec files is how
`web3forms-wiring.spec.ts` stayed red for two phases without anyone noticing.

**Zero failures, but not always zero flakes.** The suite was run four times end
to end. One run was completely clean as above. The others each showed one or two
tests that failed on the first attempt and passed on retry, always the same two
kinds and never an assertion about behaviour:

- `FORMS › newsletter form works: /<page>/` — a different page each time. The
  form posts through `/api/forms/submit`, which calls Cloudflare's siteverify
  over the network before answering.
- `BUTTONS › Zeffy donation embed loads on /donate` — timed out once waiting for
  an iframe served by `zeffy.com`. Re-run on its own immediately afterwards it
  passed in **955 ms**, and `curl https://www.zeffy.com/` answered 200 in 0.35 s.
  The same run's build had retried a Google Fonts download, so the machine's
  network was stalling at that moment.

Both depend on a third party answering while four workers share one server.
They are recorded rather than suppressed: a retry that hides a real failure is
worse than a flake, so if either starts failing *in isolation*, that is a
genuine signal.

### Accounting for every test

| Spec file | Tests | New this run |
| --- | --- | --- |
| `site-audit.spec.ts` | 140 | |
| `ad-grants-readiness.spec.ts` | 64 | |
| `meeting-room.spec.ts` | 16 | |
| `turnstile.spec.ts` | 10 | |
| `api-authorization.spec.ts` | 7 | **new** |
| `web3forms-wiring.spec.ts` | 6 | |
| `admin-actions.spec.ts` | 6 | **new** |
| `mfa.spec.ts` | 5 | **new** |
| `admin-navigation.spec.ts` | 3 | |
| `public-surface.spec.ts` | 2 | **new** |
| `admin-surface.spec.ts` | 2 | **new** |
| **Total** | **261** | **22 new** |

The three skips are pre-existing and unchanged.

**On the stated 224 passed / 3 skipped baseline.** 261 − 22 new = 239
pre-existing tests, which is 12 more than the 227 that baseline implies. That
gap is **not** from this run: the only pre-existing files changed here were
`admin-navigation.spec.ts` and `meeting-room.spec.ts`, and neither gained a
test — the changes were the crawl fixes and the email-collision fix above.
`site-audit.spec.ts` and `ad-grants-readiness.spec.ts` hold 204 of the 261 and
are parameterised over hardcoded route lists; neither has been touched since
before this session. The most likely explanation is that the 224/3 figure
predates a route-list change in one of them. It is recorded as unreconciled
rather than explained away.

### Two tests were quarantined to `serial` mode

`mfa.spec.ts` and `admin-surface.spec.ts` now declare
`test.describe.configure({ mode: "serial" })`. Both are single stories on shared
state — the MFA suite enrols a factor in one test and uses it in the next — and
`fullyParallel` was splitting them across workers, each of which re-imports the
module and gets its own account. This was the cause of the MFA failures seen
mid-run, not a defect in the feature.

---

## Test data created during this audit

Every row was written through the service-role client, tagged, and deleted in
the same run. Reported here in full, as required.

| What | Naming | Removed |
| --- | --- | --- |
| Throwaway auth users | `mfa-*`, `apiauth-*`, `sweep-*`, `nav-*` — all `@faithproof.invalid` | Yes, in `afterAll`. If deletion is refused because the user wrote to `audit_log` (an intentional FK with no cascade), the profile is demoted to role `public` instead. |
| One row per entity | `contacts`, `tasks`, `campaign_tags`, `email_templates`, `transactions`, `vouchers`, `promises`, `proof_documents`, `grants`, `volunteer_events`, `cornerstone_projects`, `board_meetings` — each titled `AUDIT SWEEP - delete me` | Yes, in reverse creation order. |
| States chosen to be inert | `transactions` and `vouchers` stay `pending` so accounting triggers never fire; `promises` and `proof_documents` are `is_public: false` so nothing could surface publicly | — |

Two writes were made to seeded rows to prove persistence: the fixture contact's
pipeline stage, and the fixture promise's title. Both rows were deleted
afterwards.

**Nothing else in the production database was created, updated or deleted.**

To confirm nothing was left behind:

```sql
select 'contacts' t, count(*) from contacts where last_name = 'Sweep'
union all select 'promises', count(*) from promises where title like 'AUDIT SWEEP%'
union all select 'profiles', count(*) from profiles
  where email like '%@faithproof.invalid';
```

A non-zero count in the last row means a user could not be deleted because it
had written to the audit log; those profiles are demoted to `public` and are
harmless, but they can be removed by hand.

---

## Governance documents regenerated

`BLUEPRINT.md` and `SCHEMA_REGISTRY.md` both claimed **0 tables** against 14
applied migrations. Both were regenerated from the live database by read-only
introspection:

- **27 tables, 3 views** (`account_balances`, `cornerstone_projects_public`,
  `cornerstone_milestones_public`), **16 enum types**, **7 RPC functions**
- **52 RLS policies** and **22 indexes**, parsed from the migrations
- **86 pages** (56 admin), **15 API routes**, **15 components**

The new registry states the provenance of every section — which parts are live
introspection and which are read from the migration files — rather than
implying more authority than it has. Indexes and RLS policies are not exposed
over PostgREST, so they come from `supabase/migrations/*.sql` and the document
says so.
