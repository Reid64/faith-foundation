# faith-foundation — SESSION STATE

> Tracks the live execution session. LATEST: **PHASE 21 — MEETING ROOM REBUILT ON NATIVE WEBRTC,
> JITSI REMOVED** (2026-08-16). Built, tested locally, **NOT DEPLOYED**.
>
> **The point of the rebuild.** The Jitsi iFrame API never exposed individual media streams, so
> Phase 19 shipped with a documented deviation: no per-participant tile grid. That is now ours —
> mesh WebRTC, one `<video>` per peer in a CSS grid, active-speaker border drawn on the tile.
> Signalling on a Pusher **private** channel; Cloudflare mints TURN credentials per session.
>
> **Security shape.** `NEXT_PUBLIC_PUSHER_KEY` is in the bundle by design and is only enough to
> open a socket. `/api/pusher/auth` is the whole boundary: session → role (admin/board) → the
> meeting itself read through RLS → and a closed meeting is refused. Signalling is relayed through
> `/api/pusher/signal` rather than Pusher client events, for two reasons: client events are a
> dashboard toggle a build should not silently depend on, and relaying lets the SERVER stamp the
> sender's identity, so a browser cannot label itself as another director.
>
> **Verification (local, server on :3200):**
> - `tsc` **0 errors**; `pnpm run build` clean.
> - **Route security 12/12** — 401 anonymous and 403 for `staff` on all three routes; a board member
>   refused a non-meeting channel, a nonexistent meeting and an ENDED meeting, and authorised with a
>   signature for their own open meeting.
> - **`scripts/meeting-room.spec.ts` 6/6** — pre-join with preview and both device pickers, grid +
>   control bar after joining, mic/camera state, leave returns to the record, no Jitsi in the DOM,
>   non-board user cannot reach the room.
> - **Bundle grep from one build with real-shaped values:** PUSHER_SECRET 0 files,
>   CLOUDFLARE_TURN_API_TOKEN 0, CLOUDFLARE_TURN_KEY_ID 0, NEXT_PUBLIC_PUSHER_KEY 1 (expected).
> - **No regression in the existing suites.** Combined run: **206 passed, 5 failed, 3 skipped** —
>   every failure a `turnstile` widget test on a server started without the Turnstile site key, so
>   the widget was legitimately absent. Re-run with both key sets present: **15 passed, 1 skipped,
>   0 failed**. `site-audit` and `ad-grants-readiness` failed nothing, matching baseline.
>
> **A real defect found by testing, and it predates this phase.** The room overlay renders inside
> the admin layout's `relative z-10` wrapper, which is a stacking context — so its `z-50` lost to
> the admin sidebar's `z-40` and the sidebar covered the left 240px of the room, swallowing clicks
> on Leave. Playwright reported it precisely. Fixed with a portal to `document.body`; a bigger
> z-index could not have helped because the cap is the parent. The Jitsi room had the same overlay
> and the Phase 19 smoke test never clicked inside it.
>
> **An operational mistake worth recording, second of its kind.** The room spec failed three times
> with "Join never enables". Cause: I ran `pnpm run build` twice WHILE the `next start` server under
> test was running, so it served HTML referencing chunk hashes that no longer existed — a 404 storm,
> no hydration, no effects, permanently disabled button. Phase 20 recorded "do not deploy during an
> audit"; this is its sibling — **do not rebuild while a local server under test is running.**
>
> **NOT VERIFIED, and stated plainly rather than implied:** no peer connection was ever established.
> One browser cannot do it. Offer/answer, ICE, the real Cloudflare `iceServers` array (the token
> lives only in Vercel; the route returns a clean 503 without it), the 6-participant cap, ICE
> restart, chunked SDP reassembly and speaker switching between two people all require two real
> browsers in one room on production credentials. **First deploy should be a two-person test call
> before a board meeting depends on it.**
>
> **Dropped, reported before dropping:** the Jitsi recording button (it called a paid-tier API and
> never worked on the free server) and Jitsi lobby mode (replaced by role-and-RLS channel auth,
> which is stronger). `jitsi_room_name` stays in the database, unread — dropping a populated column
> is a migration this phase does not ship.
>
> PRIOR: **PHASE 20 — CLOUDFLARE TURNSTILE ON EVERY PUBLIC FORM** (2026-08-16). Built, tested locally, **NOT DEPLOYED** — Reid runs deploy.ps1.
>
> **Audit first, and it changed the design.** All five public forms POSTed from the browser
> directly to `formsubmit.co`, with no server in the path. A Turnstile widget on its own would
> therefore have been decorative — the bot never loads the page. Submissions now go to
> **`/api/forms/submit`**, which verifies the token and only then forwards to Formsubmit
> server-side. The direct POST was correct while the site was a static export; Phase 1 ended that,
> and `src/lib/web3forms.ts` still carried the stale "there is no server to POST to" comment.
>
> **Five public forms, not four.** Newsletter (SiteFooter, on every page), Contact, Volunteer,
> Housing application, and — found by traversal, not in the brief — the **Impact receipt form on
> /faithproof**. Left alone with reasons recorded: `/faithproof/explorer` (a GET filter bar),
> `/login` (internal-tool door), IntakeChat (`/api/ai/intake`, already IP-limited), and everything
> under `/admin/**`.
>
> **Verification, all local against `next start` with Cloudflare's published test keys:**
> - `pnpm tsc --noEmit` **0 errors**; `pnpm run build` clean (pre-existing `<img>` warnings only).
> - New `scripts/turnstile.spec.ts`: **9 passed / 1 skipped** in pass mode; the skipped case
>   **passes** against an always-fails secret — **10/10 across both modes**.
> - **Existing `site-audit.spec.ts` against the local build: 139 passed, 1 flaky, 0 failed** — the
>   same result as the production baseline, with Turnstile in the path of every form test.
> - Gate probed directly: accepting secret → the route forwards (Formsubmit answered with its own
>   rate-limit message, which is proof the forward happened); rejecting secret → **400** and
>   nothing forwarded.
> - Asserted, not assumed: `TURNSTILE_SECRET_KEY` appears in no script the browser downloads.
>
> **A near-miss caught by reading the code instead of trusting the brief.** The route's first
> version hand-wrote the allowlist and guessed the application subject as "Housing Voucher
> Application"; the form actually sends "Housing Assistance Application". Every application would
> have been rejected with "Unknown form." Both sides now read `src/lib/formSubjects.ts`.
>
> **Two TEST defects, not product defects, found and fixed:** a wrong selector (`#interest` vs the
> volunteer form's `#v-interest`), and an assertion that a bogus token is rejected while the server
> ran Cloudflare's always-PASSES secret — which is precisely what that key is for. The rejection
> assertion now runs against a second server in fail mode.
>
> **Stated limit, not glossed:** the Formsubmit address has been public in the bundle for months.
> It is server-side now, so it is no longer advertised, but a bot that already has it can post to
> `formsubmit.co` directly and nothing here can stop that. If spam does not drop after deploy, that
> is where it is coming from.
>
> **Left for Reid to decide:** whether to gate the IntakeChat first message too. It is the most
> expensive public endpoint (writes contacts, spends Anthropic tokens); gating a conversation is a
> product call, so it was not done unasked.
>
> PRIOR: **PHASE 19 — BOARD MEETING ROOM** (2026-08-16).
> Video meetings, AI-drafted minutes and digitally signed board approval, built inside the Command
> Center. Migration 014 applied directly to the live database; the `board-minutes` storage bucket
> created by calling `/api/setup/storage` once. Build clean (0 TS errors), `vercel --prod` READY.
>
> **Live verification: 47/47.** A throwaway admin created a meeting through the real form and the
> walk confirmed the whole path: scheduled times persist, `jitsi_room_name` derives from the meeting
> UUID, the Join button and the Command Center alert appear for an imminent meeting, the pre-join
> screen renders with a camera preview and the participant sidebar, the minutes page offers
> transcript upload and manual entry, `/api/board/generate-minutes` returns **400** without a
> transcript and **503** (not 500) without `ANTHROPIC_API_KEY`, the signature canvas captures a real
> **7,306-character PNG** stored with IP address and user agent, the Approve button stays disabled
> until there is ink, a **second approval from the same person is refused by the database (23505)**,
> certification is **not** offered while approvals are outstanding, and a certified record withdraws
> the Edit button and explains why. Both new API routes return **401** unauthenticated.
>
> **A real defect found by that verification and fixed.** `datetime-local` submits wall-clock text
> with no timezone; the server was parsing it with `new Date()`, which resolves in the server's zone
> — UTC on Vercel. A 6pm Texas meeting was stored as 6pm UTC, five hours early, so the Join button
> and the meeting alert never appeared. Meeting times now convert from and display in
> `America/Chicago`, checked on both sides of the DST boundary (August -5, January -6).
>
> **A test-harness bug, not a product bug, recorded so it is not re-diagnosed:** the first run's
> failure to submit the meeting form was my selector clicking `button[type="submit"]`, which matched
> the admin shell's **Sign Out** button first. Selecting by name fixed it.
>
> **The throwaway test account could not be deleted, and that is correct.** It had written
> `audit_log` rows, and `audit_log.actor_id` references `profiles(id)` with no cascade — deleting the
> actor would orphan or falsify an append-only trail. It was neutralised instead: role set to
> `public` (out of the approval quorum and every RLS grant) and its password rotated to a random
> value. The audit history stays true. Future runs use a unique address per run.
>
> **Two documented deviations from the spec:** (1) the Jitsi iFrame API exposes participant events
> but not individual media streams, so a per-participant tile grid outside the iframe is not
> possible — a hidden iframe would show no video at all; Jitsi owns the video surface and all
> chrome, branding, participant list, active-speaker highlight and controls are ours. (2) the model
> id is read from `ANTHROPIC_MODEL` with a current default rather than hard-coding
> `claude-sonnet-4-6`, matching Phase 18.
>
> **Deliberately NOT verified: the certified-PDF render against production data.** Reaching the
> certified state requires every admin and board profile to have approved, and the only way to force
> that on the live database would be to write fabricated signatures attributed to four real, named
> directors into a legal-record table. Not done. The gate that refuses premature certification IS
> verified, and the PDF renderer was proven in isolation to embed a base64 signature and emit a
> valid `%PDF-` document in this runtime.
>
> PRIOR: **FAITHPROOF MEGA-BUILD — PHASES 9 THROUGH 18, ALL
> COMPLETE** (2026-08-16). Ten phases built end to end in one autonomous run: Zeffy webhook, CRM,
> mail merge + inbound parsing, board portal, grant tracking, volunteer management, fund
> accounting, Cornerstone tracker + public page, public API, AI intake assistant. Ten deploys, ten
> commits on `main`, migrations 006-013 applied directly to the live database. **FaithProof is
> PLATFORM COMPLETE** — what remains is data entry and four external credentials.
>
> **Verification, live on production, not merely "it built":**
> - `pnpm tsc --noEmit` **0 errors** and `pnpm run build` clean at the end of every phase; final
>   build **72 routes**.
> - `ad-grants-readiness` **64/64**.
> - `site-audit` **139 passed, 1 flaky** (the third-party Zeffy iframe on /donate, which passed on
>   retry), **0 failed**.
> - Purpose-built admin walk over every new page: **61/61**. It signs in as a throwaway `staff`
>   account, walks eleven new admin pages asserting real content and the absence of query errors,
>   confirms `staff` is redirected out of `/admin/board` **with an explanation on the Command
>   Center**, promotes the same account to `board` and confirms it gets in, then confirms a board
>   member still cannot open the admin-only record-meeting form. The user is deleted afterwards.
> - Accounting exercised against the live database: an imbalanced entry is **refused** by the
>   deferred constraint trigger; confirming a transaction posts debit-cash / credit-revenue with the
>   right accounts; re-confirming after a bounce through `pending` does **not** double-post; voiding
>   writes a reversing entry that nets both accounts back to **zero**. Test rows removed; the one
>   real $200 transaction was never touched.
> - Cornerstone public views queried **as the `anon` role**: base table returns **0 rows**, the view
>   returns only started projects, and `internal_notes` is **not a column** of the view.
> - All five public API endpoints return 200 with the documented envelope, an unknown fund filter
>   returns **400**, and no donor or recipient name appears in any response.
> - `/api/ai/intake` returns a plain **503** with no `ANTHROPIC_API_KEY` set, as designed; the three
>   database writes it performs were validated against the live schema inside a rolled-back
>   transaction.
>
> **Two defects found by that verification and fixed the same session.** The volunteer hours report
> and the event roster both selected `contacts.organization` — a column that **does not exist** — so
> both pages rendered a query error on production. Found by the admin walk (59/61), fixed,
> redeployed, re-verified **61/61**. A sweep of **all 107 explicit column references** in the source
> against `information_schema` found no other instance. `formatHours` also rendered 3.5 hours as
> "3.50 h"; it now trims trailing zeros.
>
> **An operational mistake worth recording:** the first `site-audit` run reported 26 failures. They
> were not real — two `vercel --prod` deploys landed *during* the 18-minute run, swapping the
> deployment under the tests. Re-run cleanly with nothing else touching production: 139 passed.
> Do not deploy while an audit is in flight.
>
> **Three deliberate deviations from the phase briefs, each documented where it lives:**
> 1. **Phase 18 program list** (recorded in the route and in SECRETS_PENDING.md). The brief's system
>    prompt offered Single Parent Stability, Emergency Bridge Housing, and a Financial Literacy
>    Program — all three retired on 2026-08-14, all three now 301 to `/programs`. Shipping it would
>    have the assistant offer nonexistent programs to families in housing crisis and collect their
>    income and phone number against the offer. The shipped prompt lists the real programs and
>    states that it cannot decide eligibility.
> 2. **Sitemap** (recorded in next-sitemap.config.js). The final brief asked for `/portal` and
>    `/apply-portal`; neither route exists, so neither is listed. `/cornerstone` was added and is
>    live in the sitemap (**26 URLs**).
> 3. **RLS** (recorded in each migration). Every policy in 010-013 carries `WITH CHECK` mirroring
>    `USING`; `FOR ALL` without it leaves INSERT and UPDATE unconstrained on the new row.
>
> **Still pending, human-only** (`governance/faithproof-roadmap/SECRETS_PENDING.md`):
> `ANTHROPIC_API_KEY`, `ZOHO_SMTP_PASS`, `ZEFFY_WEBHOOK_SECRET` enforcement, Zapier configuration,
> and Twilio when SMS (Phase 19) is built. Each unset credential degrades honestly: the assistant
> says it is not connected, mail records every attempt as failed, and webhook rows stay `pending`
> and non-public.
>
> **The ledger has not been reviewed by an accountant.** It is verified for correctness of posting
> and balance, not for treatment. The Treasurer should review it before it is relied on for a
> filing.
>
> PRIOR: **UI POLISH PASS — admin background darkened, stat
> cards corrected to butter, FaithProof section contrast fixed** (2026-08-16). Admin page background
> `#f0f0ef` -> **`#e8e6e1`** medium warm gray, set once in `admin/layout.tsx` and inherited by every
> sub-page (all seven verified individually on production). Four stat cards now **`#ffefb3` butter**
> via inline style with a 3px `#013e37` top rail, 24px padding and a stronger shadow; number
> 32px/700, label 11px/600 at 0.7 opacity, icon at 0.25. All white cards, tables and `/new` form
> wrappers moved to `0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)` so they lift off the
> darker page. FaithProof public page now alternates strictly navy `#16243F` -> warm gray `#f0ede6`
> -> white `#ffffff`, with **no two adjacent sections sharing a background** (asserted as a test).
> Scroll indicator was already removed last action and was re-verified. Build PASSED (0 TS errors,
> 45/45 pages); `vercel --prod` READY (`dpl_CEhUtqABQEXxPbYpYNL1UgfkugCd`). Live computed-colour
> verification **39/39**. Database untouched.
> **Known interaction:** the alternation assumes all five public sections are enabled; turning one
> off can place two `#f0ede6` sections adjacent. Not fixed — not asked for, and all five are on.
>
> PRIOR: **FIX — broken scroll indicator removed from the
> homepage hero** (2026-08-16). The animated "mouse" scroll cue (rounded oval + floating dot) at the
> bottom of the hero is gone. **It was not in `src/app/page.tsx`** — the homepage delegates its hero
> to `<HeroVideo>`, and the cue lived in `src/components/HeroVideo.tsx` lines 99-104. The wrapper
> div, the oval, the dot and the `{/* Scroll cue */}` comment were all deleted: **7 lines removed,
> one file changed, nothing else touched.** `HeroVideo` is used only by the homepage, so nothing
> else is affected; the shared `float-slow` keyframe in `tailwind.config.ts` was left alone.
> Build PASSED (0 TS errors, 45/45 pages); `vercel --prod` READY
> (`dpl_5fPXrA7Rbg5Gvv66uT9wiZ7r5G5W`). Verified live: **0 occurrences of `animate-float-slow`** on
> the homepage, hero headline/subhead/both CTAs intact.
>
> PRIOR: **FaithProof MEGA-BUILD — Phases 3D, 4, 5, 6, 7, 8.
> ALL COMPLETE** (2026-08-16). **FaithProof is FEATURE COMPLETE — ready for real data entry.**
> 3D final colour system (page `#f0f0ef`, butter `#ffefb3` stat cards, two deep green `#013e37`
> panels, white cards elsewhere) — **18/18** live. 4 status transitions + full CRUD: detail and edit
> pages for all four entities, eight transitions, clickable rows/cards, and the Phase 3C hydration
> defect fixed — **14/14** live, **closing the "nothing can be actioned" gap open since Phase 2**.
> 5 settings (migration 005, org info, password reset, five public toggles, three CSV exports).
> 6 + 7 public `/faithproof` and `/faithproof/explorer` on live Supabase data using the real
> navy/gold/cream brand tokens, with SiteHeader/SiteFooter and "Transparency" in the nav. 8 SEO,
> NGO schema, five new Playwright tests, dashboard preview. Build PASSED (0 TS errors, **45/45
> pages**); `vercel --prod` READY (`dpl_G9LJdRJp2c34nkCeRN1E3DYLtPaS`). Live production:
> `ad-grants-readiness` **64/64**, `site-audit` **135 passed + 1 flaky**, plus **18/18 + 14/14 +
> 25/25** phase suites. Database left at 0 rows in all six data tables.
> **Three corrections beyond the brief, each load-bearing:** `/faithproof` was in
> `isInternalRoute` (would have shipped with no header/footer); `robots.txt` disallowed it and the
> sitemap excluded it (would have shipped uncrawlable); `settings` needed a public read policy (every
> section would have rendered hidden for visitors). See "## 2026-08-16 — FaithProof mega-build" at
> the end of this file.
>
> PRIOR: **FaithProof Phase 3 Correction — World-Class
> Dashboard UI. COMPLETE** (2026-08-15). The all-green admin UI was replaced with a light-mode
> dashboard: warm cream page `#f8f7f4`, white floating cards with real shadows, and deep green
> `#013e37` demoted from a fill to an accent confined to the **sidebar (now the only dark
> element)**, table header rows, primary buttons, stat-card top rails, headings and numerals.
> Butter `#ffefb3` remains the sidebar accent and the table-header text. All badges are light
> pastels. Verified on live production by **computed colour — 52/52**, including the brief's two
> negative rules tested as real assertions: **zero large green fills** outside sidebar/`<th>`/
> buttons and **zero dark badges** (every pill luminance-measured). Build PASSED (0 TS errors,
> **42/42 pages**); `vercel --prod` READY (`dpl_Hu7cKpA18kdSW7tD1rCtBjkuP1kS`). Public regression:
> `ad-grants-readiness` **59/59**, `site-audit` **127 passed + 1 flaky** (third-party Zeffy embed).
> All 17 changed files are under `src/app/admin/` or `src/app/login/`.
> **⚠️ A real defect was found and deliberately NOT fixed in a colour-only phase:** `AdminForm`
> binds its submit handler on hydration, so a click in that sub-second window triggers a native GET
> submit — the values land in the URL and **the record is silently not created**. Predates this
> phase; fix first in Phase 4. See "## 2026-08-15 — FaithProof Phase 3 Correction" at the end of
> this file.
>
> PRIOR: **FaithProof Phase 3 — Color System Redesign.
> COMPLETE** (2026-08-15). The FaithProof admin colour system was rebuilt around the two brand
> colours — **deep green `#013e37`** and **butter `#ffefb3`** — across the sidebar, Command Center,
> all four list views, all four create forms, the audit log and the login page; page background
> stays `#1e293b`. **The public site is untouched as a structural fact:** all 16 modified files plus
> one new `theme.ts` live under `src/app/admin/` or `src/app/login/`; `tailwind.config.ts`,
> `globals.css`, `src/components/` and every public page are byte-identical. Build PASSED (0 TS
> errors, 42/42 pages); `vercel --prod` READY (`dpl_8xAbMpsx7Xk5aH33R6fuECgjRZZo`). Verified on live
> production by **computed colour** (`getComputedStyle`, not class names) — **46/46**; public
> regression `ad-grants-readiness` **59/59** and `site-audit` **126 passed + 2 flaky** (both green on
> retry; the newsletter flake's failing page rotates run to run with 22/23 passing each time).
> **Four specified opacities land just under WCAG AA on deep green and were applied as specified,
> not silently altered** — butter@0.5 = 3.78:1 and butter@0.55 = 4.23:1 against 4.5:1 needed;
> raising both to 0.6 (4.74:1) is a one-line fix in `theme.ts`. Internal tool only — the public
> Lighthouse Accessibility 100 is unaffected. See "## 2026-08-15 — FaithProof Phase 3" at the end of
> this file.
>
> PRIOR: **FaithProof Phase 2 — Command Center + Live Data.
> COMPLETE** (2026-08-15). The white placeholder admin shell was replaced with a dark,
> production-quality Command Center and all six sidebar sections wired to live Supabase data:
> admin-only dark design system on the admin shell and login page, a four-card live stat row, two
> live-queried dashboard panels, Transactions / Vouchers / Promises / Proof Vault each with a list
> view and a working create form, a read-only Audit Log, and migration `004_fix_audit_log_rls.sql`
> closing the anonymous-write hole flagged in Phase 1 (anon INSERT now **DENIED**, authenticated
> **ALLOWED**, both verified against the database). **The Phase 1 blocker is resolved — a real admin
> account now exists** (`info@faithfoundationsf.org`), created outside this session. Build PASSED
> (0 TS errors); `vercel --prod` READY (`dpl_CKakVCYYxj9hZE556AnsGaoJkAbF`). Against **live
> production**: a 50-check browser test **50/50**, `ad-grants-readiness` **59/59**, `site-audit`
> **127 passed + 1 flaky** (third-party Zeffy embed; passes alone with retries off). All test data
> deleted — database back to 0 rows in all six tables.
> **⚠️ Phase 2 is create-and-read only: there are no status-transition controls, so items in
> "Requires Attention" can be seen but never confirmed, approved, disbursed or fulfilled from the
> UI.** See "## 2026-08-15 — FaithProof Phase 2" at the end of this file.
>
> PRIOR: **FaithProof Phase 1 — Foundation. COMPLETE**
> (2026-08-15). The site converted from static export to server-rendered Next.js and the full
> FaithProof data layer was installed: `output: "export"` removed, `@supabase/supabase-js` +
> `@supabase/ssr` added, three Supabase client utilities created, the complete schema migrated
> (`profiles`, `transactions`, `vouchers`, `promises`, `proof_documents`, `audit_log` — 7 enums,
> 16 RLS policies, 6 triggers), `src/middleware.ts` installed as a full replacement gating `/admin`,
> `/login` + server actions scaffolded, the `/admin` Command Center shell scaffolded, Vercel env
> vars pushed. **Two blocking defects in the specified SQL were found by execution and fixed
> (migrations 002 and 003): infinite RLS recursion that made all six tables unqueryable, and a
> missing `search_path` on `handle_new_user()` that made every account creation fail — which would
> have left `/admin` permanently unreachable.** A third regression caused by removing static export
> was also fixed: `next-sitemap` would have silently shipped no sitemap and no robots.txt. Build
> PASSED (0 TS errors, 33/33 pages); `vercel --prod` READY
> (`dpl_AtMTvPTTKZQsUXDxwWi9UFRNbLdK`). Against **live production**: readiness **59/59**, site audit
> **128/128**, and a 20-check end-to-end auth test **20/20**. Database left at 0 rows / 0 auth users.
> See "## 2026-08-15 — FaithProof Phase 1: Foundation" at the end of this file.
>
> PRIOR: **Web3Forms delivery for all four forms + all
> photography self-hosted** (2026-08-14) — closes both open recommendations from the site audit.
> Contact, Volunteer, Apply and Newsletter now POST to `api.web3forms.com` routed to
> info@faithfoundationsf.org; success is shown only on a confirmed 200 **and** `success: true`.
> **⚠️ NOT DELIVERING YET: `NEXT_PUBLIC_WEB3FORMS_KEY` is still `PENDING_KEY`** — the key must be
> requested at web3forms.com, added in Vercel, and the site REDEPLOYED (NEXT_PUBLIC_* is inlined at
> build time). Until then each form states it is not connected and offers a one-click email
> fallback, so nothing is lost. All 25 Unsplash photos downloaded to `/public/photos` and the
> hotlink builder deleted — **0 `images.unsplash.com` references remain**. Build PASSED, deployed,
> audit re-run against production **128/128**. Plus a new 4-test wiring suite
> (`scripts/web3forms-wiring.spec.ts`) proving the delivery path actually fires. See
> "## 2026-08-14 — Web3Forms delivery + self-hosted photography" at the end of this file.
>
> PRIOR: **Full Playwright site audit — 128 tests, all
> passing, 3 site defects found and fixed** (2026-08-14). A 128-test suite was built
> (`scripts/site-audit.spec.ts`) and run against live production: 23 routes, 3 redirects, 4 forms,
> desktop + mobile + dropdown navigation, every internal link sitewide, the Zeffy embed, and 7
> content/SEO checks. **Headline finding: the Contact, Volunteer, and Apply forms were all
> silently destroying every submission** — the Apply form collected income, household, children,
> and eviction/unhoused status from families in crisis and told them a caseworker would call.
> All three fixed via a shared mailto helper, plus two further Apply-form defects (lost steps 1–3,
> Back wiping entries) and a dead hotlinked Unsplash hero 404ing on `/programs/veterans/`.
> Report: `governance/SITE_AUDIT_2026-08-14.md`. See
> "## 2026-08-14 — Full Playwright site audit" at the end of this file.
>
> PRIOR: **Footer newsletter routed to info@faithfoundationsf.org via mailto** (2026-08-14) —
> closed the open item raised by the Cornerstone pass; the form had been faking a success state
> while discarding the email on every page.
>
> PRIOR: **Cornerstone Communities — broken land inquiry
> form removed, housing copy corrected** (2026-08-14) — the `LandInquiryForm` posted to a
> placeholder Formspree endpoint (`YOUR_FORMSPREE_LAND_ID`) and silently discarded every land
> donation inquiry; the whole form was deleted and replaced with a gold CTA button to `/contact`,
> retaining the 48-hour promise, 501(c)(3) tax-benefit language, and preliminary-assessment note.
> All eight gallery captions rewritten from generic cost-efficiency lines to accurate descriptions
> of the expandable container homes and modular micro-apartments, plus a new explanatory paragraph
> under each of the two gallery headings (factory-built, placed on site, full kitchen / full bath /
> AC, customizable colors, flooring, and layouts). Homepage mission image alt text updated to
> match. Built clean and deployed to production; verified live at 0 Formspree references. See
> "## 2026-08-14 — Cornerstone land form removed + housing copy corrected" at the end of this file.
>
> PRIOR: **Bright Box Homes anonymized sitewide**
> (2026-08-14) — the company's name removed from all four remaining public locations (homepage
> mission block, FAQ funding answer, Financial Transparency funding-disclosure commitment,
> Cornerstone Communities Phase 3) and replaced with generic corporate partner/donor language, to
> reduce private-benefit / self-dealing exposure for the Google for Nonprofits application and
> IRS scrutiny. Built clean and deployed to production; verified live at 0 occurrences. See
> "## 2026-08-14 — Bright Box Homes anonymized sitewide" at the end of this file.
>
> PRIOR: **`next-sitemap` made the single source of truth
> for `sitemap.xml` + `robots.txt`** (2026-08-14, two passes) — config corrected (exclusions,
> per-page priorities, weekly changefreq) and the stale committed `public/sitemap.xml` +
> `public/robots.txt` fallbacks deleted. Both passes built clean and deployed to production;
> verified live at 23 www URLs. See "## 2026-08-14 — next-sitemap single source of truth" at the
> end of this file.
>
> PRIOR: a **comprehensive cleanup pass (8 tasks)**:
> Financial Literacy and Single Parent Stability retired as programs, rental-assistance language
> removed from Veterans/Recovery/Reentry, applicant vetting transparency added to Recovery and
> Reentry, a development roadmap added to Cornerstone Communities, and Tasks 6–8 (About faith
> paragraph, StatCounter SSR fix, Contact geographic copy) verified already applied.

- **Current phase:** FaithProof Phase 3 Correction — World-Class Dashboard UI
- **Current prompt:** four steps — read every admin/login file in full and map current colours;
  apply the light dashboard system (cream `#f8f7f4` page, white floating cards, deep green only on
  sidebar / table headers / primary buttons, pastel badges); touch nothing outside those two
  directories; build (42 pages) and deploy.
- **Prompt outcome:** COMPLETE, all four steps. Every end-of-run item confirmed. `pnpm tsc --noEmit`
  PASSED; `pnpm run build` PASSED (**42/42 pages**); `vercel --prod` READY
  (`dpl_Hu7cKpA18kdSW7tD1rCtBjkuP1kS`). Production verified at **52/52** computed-colour checks,
  plus **59/59** ad-grants-readiness and **127 passed + 1 flaky** site-audit.
- **Design applied:** page `#f8f7f4`; cards `#ffffff` with
  `0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(1,62,55,0.08)`; sidebar `#013e37` (the only dark
  surface) with white wordmark, butter eyebrow and a 3px butter active rail; stat cards white with
  a 3px green top rail and 28px bold green numerals; panels white with amber/blue 3px left rails;
  tables white with a deep green header row in butter text and white/cream zebra rows; forms white
  with `#d1d5db` inputs and a green focus ring; primary buttons green-on-white-text; all badges
  light pastels.
- **Public site:** untouched — verified structurally by `git status`, not by inspection.
- **⚠️ DEFECT FOUND, NOT FIXED (out of scope for a colour phase — fix first in Phase 4):**
  `AdminForm` attaches `onSubmit` on hydration. A click before hydration performs the browser's
  native **GET** submit — field values appear in the URL and **no record is created, with no error
  shown**. Reproduced against production. Predates this phase (Phase 2 pattern). Fix by disabling
  submit until hydration, or by giving the server action a no-JS `action=` path that redirects.
- **Note for future restyles:** the verification suite encodes the two negative rules as
  assertions — no element >4000px² may compute to `rgb(1,62,55)` outside the sidebar/`<th>`/buttons,
  and no badge may have luminance < 0.5. Keep them.

### Prior prompt this session (FaithProof Phase 3 — Color System Redesign)

- **Prompt:** four steps — read every file under `src/app/admin/` and `src/app/login/` and
  map every colour in use; apply the deep green `#013e37` + butter `#ffefb3` system across sidebar,
  stat cards, panels, tables, promise/proof cards, forms, add buttons, page headings and login;
  touch nothing outside those two directories; build and deploy.
- **Prompt outcome:** COMPLETE, all four steps. Every end-of-run item confirmed. `pnpm tsc --noEmit`
  PASSED; `pnpm run build` PASSED (42/42 pages); `vercel --prod` READY
  (`dpl_8xAbMpsx7Xk5aH33R6fuECgjRZZo`). Production verified at 46/46 (computed colour) + 59/59 +
  126-passed-2-flaky.
- **Colours applied:** `#013e37` deep green surfaces (sidebar, cards, panels, tables, forms, login
  card) and `#ffefb3` butter (headings, wordmark, nav active, stat numbers, buttons, borders and
  accents at 0.05–0.2 alpha). Page base stays `#1e293b`. Indicator set retuned to `#4ade80` /
  `#fbbf24` / `#f87171` / `#60a5fa`.
- **Public site:** untouched — verified structurally by `git status`, not by inspection.
- **⚠️ ACCESSIBILITY NOTE (applied as specified, flagged not altered):** butter@0.5 (sign out,
  email, date labels) measures **3.78:1** and butter@0.55 (panel subtext) **4.23:1** on deep green,
  against the 4.5:1 AA needs for normal text. `#f87171` danger text is marginal at 4.35:1. Raising
  the two alphas to 0.6 clears them at 4.74:1 — one line in
  `src/app/admin/_components/theme.ts`. Everything else measures 4.7:1 to 11:1.
- **New file of record:** `src/app/admin/_components/theme.ts` — the single source of truth for the
  admin palette. Deliberately NOT added to `tailwind.config.ts`, which the public site shares.
- **Carried forward unchanged from Phase 2:** no status transitions exist (items in Requires
  Attention can be seen but not actioned); writes are admin-only; `audit_log` actor spoofing is
  still possible via the REST API; Vercel Preview env vars still unset.

### Prior prompt this session (FaithProof Phase 2 — Command Center + live data)

- **Prompt:** ten steps — redesign the admin layout and login page against an admin-only
  dark design system; rebuild the Command Center on live queries (stat row + two panels); build
  Transactions, Vouchers, Promises and Proof Vault list + create pages with server actions; build a
  read-only Audit Log; fix the `audit_log` INSERT policy; build and deploy.
- **Prompt outcome:** COMPLETE, all ten steps. Every end-of-run item confirmed. `pnpm tsc --noEmit`
  PASSED; `pnpm run build` PASSED; `vercel --prod` READY (`dpl_CKakVCYYxj9hZE556AnsGaoJkAbF`).
  Production verified at 50/50 (FaithProof e2e) + 59/59 + 127-passed-1-flaky (public site).
- **Five deliberate deviations, all recorded in STATE_OF_THE_BUILD:** server actions return
  `{ok}`/`{error}` instead of `redirect()` so a rejected submit keeps the user's input (navigation
  is client-side to the same destination); `/login` added to `isInternalRoute()` so the full-page
  dark login is not bracketed by public chrome; admin colours kept as arbitrary Tailwind values
  rather than added to the shared `tailwind.config.ts`; `financial_literacy` excluded from fund
  dropdowns but retained in the enum for historical rows; a public proof document with no URL is
  refused.
- **⚠️ LARGEST REMAINING GAP (functional, not a defect in what was asked for):** Phase 2 is
  **create and read only**. No status transitions exist, so nothing in "Requires Attention" can be
  confirmed, approved, disbursed or fulfilled from the UI — items accumulate there until the
  database is edited directly. Confirm/approve controls are the first thing Phase 3 needs.
- **⚠️ SECURITY FOLLOW-UP (narrowed, not closed):** `audit_log` no longer accepts anonymous writes,
  but an authenticated user can still insert an entry naming any `actor_id` via the REST API. Every
  application write path sets it from the server session. Tighten to
  `WITH CHECK (auth.uid() = actor_id)` when Phase 3's write paths are designed.
- **⚠️ DEPLOY FOLLOW-UP (unchanged from Phase 1):** Vercel **Preview** env vars are still unset;
  Production and Development are set. Preview deploys will 500 on every route until added.

### Prior prompt this session (FaithProof Phase 1 — Foundation)

- **Prompt:** ten steps — remove `output: "export"`; install `@supabase/supabase-js` +
  `@supabase/ssr`; write `.env.local`; create the three Supabase client utilities; write and execute
  `supabase/migrations/001_faithproof_foundation.sql`; install `src/middleware.ts` as a full
  replacement; scaffold `/login` + server actions; scaffold the `/admin` Command Center shell; push
  Vercel env vars; build and deploy.
- **Prompt outcome:** COMPLETE, all ten steps. Every checklist item verified. Three defects found
  and fixed beyond the brief — two in the specified SQL (RLS infinite recursion; `handle_new_user`
  search_path), one caused by Step 1 (`next-sitemap` `outDir` pointing at the now-nonexistent
  `out/`). Build PASSED (0 TypeScript errors, 33/33 pages); `vercel --prod` READY
  (`dpl_AtMTvPTTKZQsUXDxwWi9UFRNbLdK`); production verified at 59/59 + 128/128 + 20/20.
- **✅ RESOLVED IN PHASE 2 — BLOCKING FOLLOW-UP (organization action, not code):** **no admin
  account exists**, so nobody can sign in yet. Create one in the Supabase dashboard (Authentication
  → Users → Add user, with "Auto Confirm User" on), then promote it — the `handle_new_user` trigger
  assigns every new user `role = 'staff'`. Deliberately not created here: a real credential belongs
  to the organization.
  > **Resolved 2026-08-15.** `info@faithfoundationsf.org` exists with `role = 'admin'`, created
  > outside this session. It is the only profile in the database.
- **✅ NARROWED IN PHASE 2 — SECURITY FOLLOW-UP:** `audit_log`'s `"System can insert audit log
  entries"` policy is `WITH CHECK (TRUE)` as specified, so any caller including `anon` can write
  arbitrary audit rows.
  > **Narrowed 2026-08-15** by migration 004 — anonymous writes are now denied. An authenticated
  > user can still name any `actor_id` via the REST API; see the Phase 2 entry.
  Close in Phase 2 by routing audit writes through the service-role client.
- **⚠️ DEPLOY FOLLOW-UP:** Vercel **Preview** env vars are not set (CLI interactivity loop);
  Production and Development are. Preview deploys will 500 on every route until added, because
  middleware requires them.

### Prior prompt this session (Web3Forms + self-hosted photography)

- **Prompt:** two tasks — (1) replace the broken/stopgap submission handlers on Apply,
  Contact, Volunteer and the footer Newsletter with a real `fetch` POST to Web3Forms routed to
  info@faithfoundationsf.org, with `NEXT_PUBLIC_WEB3FORMS_KEY` as a swappable placeholder, success
  only on a confirmed 200, a visible error on failure, and the Apply multi-step capture preserved;
  (2) download every Unsplash image and self-host it under `public/photos/`, verifying each
  download before updating references. Then build and deploy.
- **Prompt outcome:** COMPLETE, both tasks. All four forms POST to Web3Forms; delivery is claimed
  only on 200 **and** `success: true` (Web3Forms returns 200 with `success:false` for a bad key, so
  the status alone would have re-created the false-success bug). Apply merges all four steps into
  the payload. 25/25 images downloaded and verified (200 + image content-type + JPEG magic bytes +
  size), references switched to `/photos/`, the `unsplash()` builder deleted, Unsplash preconnect
  hints removed — **0 `images.unsplash.com` in the built output or on production**. Build PASSED
  (0 TypeScript errors, 31/31 static pages, exit 0); `vercel --prod` READY; full audit re-run
  against production **128/128**.
- **⚠️ BLOCKING FOLLOW-UP (organization action, not code):** the forms do **not** deliver yet.
  `NEXT_PUBLIC_WEB3FORMS_KEY` is the literal placeholder `PENDING_KEY`. Get the key at
  https://web3forms.com for info@faithfoundationsf.org, add it in Vercel (Production + Preview +
  Development), and **redeploy** — `NEXT_PUBLIC_*` is inlined at build time. Until then every form
  shows a plain "not connected" error with a one-click email fallback; nothing is lost, nothing is
  auto-delivered. Verify activation with `npx playwright test scripts/site-audit.spec.ts`.
- **Verification note worth keeping:** with the placeholder key the minifier dead-code-eliminates
  the entire fetch block, so `api.web3forms.com` is absent from the shipped bundle. The delivery
  path was therefore proven separately by rebuilding with a dummy key and running
  `scripts/web3forms-wiring.spec.ts` (4 tests) against that build served locally — **4/4 passed**,
  confirming a real POST with correct fields, a rejected key treated as failure, and all four Apply
  steps present. Keep that suite; it is the only coverage of the delivery branch until the key
  lands.

### Prior prompt this session (full Playwright site audit)

- **Prompt:** install Playwright, author a comprehensive site audit
  (`scripts/site-audit.spec.ts`) covering forms / navigation / buttons / pages / redirects /
  content / images, run it against live production, fix every failure at the source, rebuild and
  redeploy, re-run to green, and produce `governance/SITE_AUDIT_2026-08-14.md`.
- **Prompt outcome:** COMPLETE. **128 tests, 128 passed, 0 failed, 0 skipped.** Nothing was
  skipped or loosened to pass. Three site defects found and fixed at the source (three dead form
  handlers, plus two further Apply-form defects; one 404ing hero image). One brief item was
  deliberately NOT "fixed" — "Apply for Assistance" routes to `/apply`, not `/contact`; `/apply`
  is the real application page and rerouting it would be a regression, so the test records CTA
  targets and asserts they resolve instead. Build PASSED (0 TypeScript errors, 31/31 static
  pages, exit 0); `vercel --prod` READY (`dpl_9jkWenHBzMkLVXDnke6Cv4PJw8gB`); suite re-run against
  production after deploy at 128/128. **Site technically clear for the Google for Nonprofits
  submission; the mailto intake is a disclosed stopgap, not intake infrastructure.** Full detail
  in `governance/SITE_AUDIT_2026-08-14.md` and in "## 2026-08-14 — Full Playwright site audit" at
  the end of this file.

### Prior prompt this session (footer newsletter mailto fix)

- **Prompt outcome:** COMPLETE. Handler rewritten to dispatch a mailto to
  `info@faithfoundationsf.org`; styling untouched. Build PASSED; `vercel --prod` READY
  (`dpl_E3m15QGfA8B1wJJmxAZcpzHQoHJM`); verified live inside the shipped JS bundle
  (`/_next/static/chunks/app/layout-*.js`) rather than the HTML, since the footer is a client
  component. Later migrated onto the shared `src/lib/mailto.ts` helper during the audit.

### Prior prompt this session (Cornerstone land form + housing copy)

- **Prompt:** three changes — (1) delete the broken `LandInquiryForm` and replace the
  "Inquire About a Land Donation" section with a `/contact` CTA button; (2) rewrite all eight
  gallery captions and add an explanatory paragraph under each of the two gallery headings;
  (3) update the modular-home alt text on the homepage — then build and deploy.
- **Prompt outcome:** COMPLETE, all three changes applied as specified. Build PASSED (0 TypeScript
  errors, 31/31 static pages, next-sitemap regenerated); `vercel --prod` READY
  (`dpl_GMWK8gojPzLpmsHaDNtK42oSwHbN`), aliased to https://www.faithfoundationsf.org; verified
  live — **0 occurrences of "formspree"** on the cornerstone page, CTA and both new paragraphs
  present, new homepage alt text present and the old string at 0. One deviation of record: the
  brief quoted the homepage alt as ending "with soft interior light"; the actual string ended
  "with string lights and a firepit" (same image, one occurrence sitewide), replaced as specified.
  **Open item raised, not fixed:** the sitewide footer newsletter form has the same defect class —
  it fakes a success state and discards the email. Full detail in "## 2026-08-14 — Cornerstone
  land form removed + housing copy corrected" at the end of this file.

### Prior prompt this session (Bright Box Homes anonymized sitewide)

- **Prompt outcome:** COMPLETE, all four changes applied verbatim as specified. Build PASSED
  (0 TypeScript errors, 31/31 static pages, next-sitemap regenerated); `vercel --prod` READY
  (`dpl_J3BazDCruE6LnzupbLRq8PVaxHFF`), aliased to https://www.faithfoundationsf.org; verified
  live with `curl` — **0 occurrences of "Bright Box"** on all four pages and each replacement
  string present. Full detail in "## 2026-08-14 — Bright Box Homes anonymized sitewide" later in
  this file.

### Prior prompt this session (next-sitemap single source of truth)

- **Prompt outcome:** COMPLETE, both passes. Build PASSED each time (0 TypeScript errors, 31/31
  static pages); `vercel --prod` READY each time; verified live at 23 www URLs with correct
  priorities and no excluded routes. Full detail in
  "## 2026-08-14 — next-sitemap single source of truth" later in this file.

### Prior prompt this session (comprehensive cleanup, 8 tasks)

- **Prompt outcome:** ALL 8 tasks COMPLETE. `pnpm run build` PASSED (exit 0, 0 TypeScript
  errors, 31/31 static pages generated, next-sitemap regenerated). Only pre-existing
  `@next/next/no-img-element` lint warnings remain — no new warnings introduced. Tasks 6, 7,
  and 8 were found already applied in the working tree and were verified by reading the files,
  not re-applied.
- **Deploy:** `vercel --prod` ✅ READY (`dpl_yakVbCtb9w3bTU3dFmuYzLLRaAC7`), target production,
  aliased to https://www.faithfoundationsf.org. Verified live with `curl`: `/programs/
  financial-literacy`, `/programs/single-parents`, and `/programs/emergency` each return **308 →
  `/programs`**, resolving to `/programs/` with a 200.
- **Deviations from the prompt (deliberate, see notes):** the specified server-side
  `redirect('/programs')` page was implemented and built first, and the exported HTML was again
  an `__next_error__` shell with an unhandled `NEXT_REDIRECT` digest and no meta-refresh — a
  blank page for crawlers. Replaced with this repo's proven pattern: a `vercel.json` 308 plus a
  shared client-side fallback component. The `next.config.mjs` entries were added as specified
  but remain inert under `output: "export"`.
- **Consequential corrections beyond the brief:** the "8 programs" stat on the homepage and
  `/impact` was updated to **6** (two programs were deleted, so 8 was factually wrong); four
  further pages that claimed FAITH Foundation *operates* a financial-literacy program (`/events`,
  `/programs/homeownership`, `/programs/housing-voucher`, Cornerstone Communities) were pointed
  at HUD-approved counseling partners instead; and `public/sitemap.xml` was missing
  `/programs/cornerstone-communities/` (pre-existing gap, added).
- **Last updated:** 2026-08-14

## Files changed — 2026-08-14 (comprehensive cleanup, 8 tasks)

| File | Change |
|------|--------|
| `src/components/RedirectToPrograms.tsx` | **NEW, shared.** Client-side `router.replace("/programs")` fallback with visible copy and a manual link. Replaces the per-route duplicate. |
| `src/app/programs/emergency/RedirectToPrograms.tsx` | **DELETED.** Consolidated into the shared component; the emergency page now imports from `@/components`. |
| `src/app/programs/financial-literacy/page.tsx` | Replaced with a `noindex` redirect stub rendering `RedirectToPrograms`. |
| `src/app/programs/single-parents/page.tsx` | Replaced with a `noindex` redirect stub rendering `RedirectToPrograms`. |
| `vercel.json` | 308 redirects added for `/programs/financial-literacy` and `/programs/single-parents` (+ trailing slash). Authoritative production mechanism. |
| `next.config.mjs` | Matching `redirects()` entries added as specified. **Inert under `output: "export"`** — kept as documentation of intent. |
| `next-sitemap.config.js` | `exclude` extended to both retired routes (the `postbuild` crawl of `out/` would otherwise re-add them). Verified absent from `out/sitemap.xml`. |
| `src/app/programs/page.tsx` | Financial Literacy and Single Parent Stability entries deleted from `PROGRAMS` (8 → 6); "or a single parent" dropped from the intro; the "supporting services like financial literacy" clause reframed to the counseling referral partner. |
| `src/components/SiteFooter.tsx` | Both retired program links removed from `PROGRAM_LINKS`. |
| `public/sitemap.xml` | Both retired URLs removed; `/programs/cornerstone-communities/` added (pre-existing omission). |
| `src/app/faq/page.tsx` | Financial Literacy dropped as a standalone offering (education answer + volunteer answer); single-mother answer rewritten to route single parents to the Housing Voucher Program; Veterans answer corrected from "rental assistance" to "housing assistance" and counseling → counseling referrals. |
| `src/app/donate/page.tsx` | $25 tier no longer funds a financial-literacy workshop; the "double duty" paragraph now credits HUD-approved counseling referrals. |
| `src/app/apply/page.tsx` | "enrollment in our financial-literacy and tenancy coaching programs" → down payment/housing vouchers and a counseling referral. |
| `src/app/apply/ApplicationForm.tsx` | "Financial-literacy / budgeting support" removed from the assistance-type dropdown. |
| `src/app/volunteer/page.tsx` | "Financial-Literacy Tutor" role deleted; `metadata.description` and the "why volunteer" paragraph reworded off budgeting instruction. |
| `src/app/volunteer/VolunteerForm.tsx` | "Financial-literacy tutoring" removed from the interest dropdown. |
| `src/app/blog/page.tsx` | Budgeting post recategorised "Financial Literacy" → "Homeownership". |
| `src/app/news/page.tsx` | "Registration Opens for the Fall Financial Literacy Cohort" item deleted; the volunteer-orientation item no longer advertises tutoring in a financial-literacy program. |
| `src/app/financial-transparency/page.tsx` | `FUND_DIRECTION` note → "Homeownership counseling referrals and program administration." |
| `src/app/events/page.tsx` | Volunteer-orientation copy no longer cites "our financial-literacy program". |
| `src/app/programs/homeownership/page.tsx` | Step 2 and the closing cycle paragraph no longer claim a supporting financial-literacy service; both now credit the HUD-approved counselor. |
| `src/app/programs/housing-voucher/page.tsx` | "supporting financial literacy guidance" → the counselor's guidance. |
| `src/app/programs/veterans/page.tsx` | `metadata.description` rental → housing assistance; **"Rapid rental assistance"** card → **"Housing Stability Support"** (housing vouchers + down payment assistance); case step 02 reworded. |
| `src/app/programs/recovery/page.tsx` | Stage 4 rental assistance → connection to housing vouchers and down payment assistance; stage 2 "financial literacy" → "financial preparation"; `VettingStandards` rendered above the CTA. |
| `src/app/programs/reentry/page.tsx` | `VettingStandards` rendered above the CTA. **No rental-assistance language existed on this page** — nothing to remove. |
| `src/components/VettingStandards.tsx` | **NEW, shared.** Navy "Our Standards" section: intro, four numbered requirement cards (pastoral/chaplain recommendation, documented rehabilitation steps, letters of support, personal statement), gold-bordered closing note. Used by both Recovery and Reentry. |
| `src/app/programs/cornerstone-communities/page.tsx` | **NEW section** above the CTA: "Transparency in Action" / "How We're Building This — Phase by Phase" — honest intro (not yet operating a community) plus four status-badged phase cards, Phases 1–2 with `/contact` CTAs, and a gold-bordered designated-giving callout. Also dropped "financial literacy workshops" from the transitional-housing feature list. |
| `src/app/page.tsx` | Program-count stat 8 → 6. |
| `src/app/impact/page.tsx` | Program-count stat 8 → 6 in both `METRICS` and `STAT_COUNTERS`. |
| `src/app/about/page.tsx` | **Task 6 — verified already applied.** Statement of Faith carries the approved Jesus/neighbor paragraph verbatim. |
| `src/components/StatCounter.tsx` | **Task 7 — verified already applied.** `useState(value)` so SSR renders the final number; `mounted` flag; `setDisplay(0)` then animate on intersection after mount; reduced-motion short-circuits to `value`. |
| `src/app/contact/page.tsx` | **Task 8 — verified already applied.** Statewide copy with Burnet as HQ, programs/apply enquiry CTA, map heading "Our Office". |

### Prior session (superseded)

> Tracks the live execution session. Updated after a **program-accuracy cleanup pass**:
> Emergency Bridge Housing removed sitewide (it was never a real program), rental/deposit
> assistance claims replaced with down payment assistance, Homeownership Counseling reframed
> as a HUD referral model, geographic language changed from Hill Country to statewide, and the
> About dropdown hover gap fixed.

- **Phase:** Phase 3 (Build Executor) — program-accuracy cleanup pass
- **Prompt:** comprehensive cleanup (11 tasks) — delete Emergency Bridge Housing;
  single-parent page trims; remove rental-assistance language from Programs + Home; reframe
  Homeownership Counseling as HUD referral partner and promote the Housing Voucher Program to
  flagship; Impact narrative/story cleanup; statewide contact copy; FAQ + Financial
  Transparency scrubs; About faith paragraph rewrite; About dropdown hover fix; then build
  and deploy.
- **Prompt outcome:** ALL 11 tasks COMPLETE. `pnpm tsc --noEmit` PASSED (no errors);
  `pnpm run build` PASSED (exit 0, 31/31 static pages generated, next-sitemap regenerated).
  Only pre-existing `@next/next/no-img-element` lint warnings remain — no new warnings
  introduced. Verified against the built `out/` HTML: every removed phrase is absent and no
  `/programs/emergency` link survives anywhere in the site.
- **Deviations from the prompt (deliberate, see notes):** the specified `next.config.mjs`
  `redirects()` and server-side `redirect()` page do **not** work under `output: "export"`;
  both were kept but backed by a `vercel.json` 308 redirect and a client-side fallback.
  `next-sitemap` overwrites `public/sitemap.xml` at postbuild, so the emergency URL also had
  to be excluded in `next-sitemap.config.js`.
- **Last updated:** 2026-08-07

### Prior phase (superseded)

- **Phase:** Phase 3 (Build Executor) — SEO / Google Ad Grants readiness pass
- **Current prompt:** create `app/privacy-policy/page.tsx` (GDPR/CCPA), `app/events/page.tsx`,
  `app/news/page.tsx`; unique meta title+description on every page; Organization schema in
  layout; sitemap.xml via next-sitemap; robots.txt; 400+ words/page; all CTAs to real pages;
  pass Google Ad Grants review — built under `src/app/` (project's App Router root)
- **Prompt outcome:** All three pages IMPLEMENTED as static server components exporting
  `metadata`; Organization JSON-LD added to `layout.tsx`; `next-sitemap` configured
  (`next-sitemap.config.js` + `postbuild` script + devDependency) with a committed static
  `public/sitemap.xml` + `public/robots.txt` fallback; footer expanded to link every page
  (no orphans). Verified by source inspection. Build gates NOT executed (runner commands
  blocked behind an approval prompt that did not resolve — no results fabricated, Iron Law 3).
- **Completed prompts (front-end):** 8 (layout + home; About + Team; Programs hub + 3 detail
  pages; 4 more program pages; Emergency + Partnership; Donate/Contact/Volunteer/Apply;
  Blog/FAQ/Impact/Financial Transparency; **Privacy Policy / Events / News + SEO pass**)
- **Failed/aborted (prior):** 2 (`deploy` — aborted at test gate; `test` — verification not
  passed on scaffold)
- **Prior phase last updated:** 2026-06-12

## Files changed — 2026-08-07 (program-accuracy cleanup)

| File | Change |
|------|--------|
| `src/app/programs/page.tsx` | Emergency Bridge Housing entry deleted from `PROGRAMS`; metadata description no longer says "emergency and transitional housing"; hero copy "from crisis" → "from renting"; Veterans span `lg:col-span-3` → `lg:col-span-2` so the bento grid still tiles evenly at 8 programs (18 cols = 3 clean rows of 6). |
| `src/app/programs/emergency/page.tsx` | Replaced with a `noindex` redirect stub rendering `RedirectToPrograms`. |
| `src/app/programs/emergency/RedirectToPrograms.tsx` | **NEW.** Client-side `router.replace("/programs")` fallback with a manual link. |
| `next.config.mjs` | Added `async redirects()` for `/programs/emergency` (+ trailing slash). **Inert under `output: "export"`** — kept as documentation of intent; `vercel.json` is what actually redirects. |
| `vercel.json` | **NEW.** Permanent (308) redirects for `/programs/emergency` and `/programs/emergency/` → `/programs`. This is the authoritative redirect in production. |
| `next-sitemap.config.js` | Added `exclude: ["/programs/emergency", "/programs/emergency/"]`. Required because the `postbuild` `next-sitemap` run overwrites `out/sitemap.xml` and was still crawling the retired route. |
| `src/components/SiteFooter.tsx` | Removed the `/programs/emergency` link from `PROGRAM_LINKS`. |
| `public/sitemap.xml` | Emergency URL removed; all `lastmod` dates 2026-06-12 → 2026-07-28. |
| `public/robots.txt` | `Host:` and `Sitemap:` switched to the `www.` canonical. |
| `src/app/programs/single-parents/page.tsx` | Verified already clean — no childcare card, no Resource Navigation section, no rental-assistance language. |
| `src/app/programs/homeownership/page.tsx` | Verified already reframed to the HUD referral model (we facilitate the referral; partners deliver the counseling). |
| `src/app/impact/page.tsx` | `NARRATIVE` reduced to the single "Community-powered funding" block; "A single mother in Burnet" story deleted (fabricated deposit assistance); veteran story now reads "housing assistance and support navigating his VA benefits"; stewardship paragraph rewritten to down payment assistance vouchers; section heading "Three ways" → "How", stories grid `lg:grid-cols-3` → `lg:grid-cols-2` to match the reduced counts. |
| `src/app/contact/page.tsx` | Hill Country limitation → statewide service with Burnet HQ; housing-crisis CTA → down payment assistance enquiry; "Visit our Burnet office" → "Our Office". |
| `src/app/faq/page.tsx` | Emergency/deposit/rental service claims scrubbed from 5 answers; homeownership counseling reframed as HUD referral in 3 answers; single-mother answer no longer claims childcare navigation or resource connections (both removed as services). |
| `src/app/financial-transparency/page.tsx` | "Emergency rental & deposit assistance" removed from `FUND_DIRECTION`; the stewardship commitment now names only down payment vouchers, the housing voucher program, and instruction; "these three program areas" → "these program areas". |
| `src/app/about/page.tsx` | Statement-of-Faith paragraph replaced with the approved Jesus/neighbor text ending on "finding affordable housing solutions for families across Texas." |
| `src/components/SiteHeader.tsx` | About dropdown hover gap fixed: `useRef` close timer, 120 ms close delay, 8 px wrapper `paddingBottom`, panel `mt-2` → `-mt-2`, and `onClick` close on every dropdown link. |
| `src/app/page.tsx` | Pillar Two no longer cites "emergency bridge housing"; now down payment vouchers, housing assistance, and HUD-approved counseling referrals. |

## Active Build
none executing. This session added three pages (Privacy Policy, Events, News), an
Organization `NGO` JSON-LD block in the layout, a `next-sitemap` configuration plus a
committed static sitemap/robots fallback, and footer links to every page. All pages remain
static server components exporting `metadata`, fully static-exportable under `output: "export"`.

## Files changed this session
- `src/app/privacy-policy/page.tsx` — **NEW.** GDPR + CCPA/CPRA privacy policy in nine sections
  (information collected, how used, GDPR legal bases, GDPR rights, CCPA/CPRA rights, cookies,
  sharing, retention/security, changes/contact). ~900 words of real copy; per-page metadata;
  CTAs to `/contact` and `/financial-transparency`.
- `src/app/events/page.tsx` — **NEW.** Upcoming events: hero, a 3-paragraph "why attend"
  intro, and **five** dated event cards (workshop, volunteer day, benefit dinner, info night,
  resource fair) with type/date/time/location. ~700 words; CTAs to `/volunteer` and `/contact`.
- `src/app/news/page.tsx` — **NEW.** Newsroom: hero + **four** announcements (Bright Box
  voucher milestone, fall literacy cohort, volunteer orientations, annual impact summary) as
  `<article>` cards with category/date/summary/body. ~650 words; CTAs to `/blog`, `/impact`,
  `/donate`, `/events`.
- `src/app/layout.tsx` — **EDIT.** Added `metadataBase` + root `canonical`; added an
  **Organization (`NGO`) JSON-LD** `<script>` (name, legal name, 501(c)(3) status, address,
  phone, email, area served); expanded the footer from 3 to 4 columns so **every page** is
  linked (Get Involved + new "Learn More" column: About, Programs, Impact, Team, News, Blog,
  FAQ, Financial Transparency; plus a Privacy Policy link in the footer bottom bar). Closes the
  prior Law 5 orphan gap for `/team`, `/volunteer`, `/apply`, `/blog`, `/faq`, `/impact`,
  `/financial-transparency`, and the new `/events`, `/news`, `/privacy-policy`.
- `next-sitemap.config.js` — **NEW.** `siteUrl` `https://faithfoundationsf.org`,
  `generateRobotsTxt: true`, `generateIndexSitemap: false`, `outDir: "out"` (static export),
  `trailingSlash: true`.
- `package.json` — **EDIT.** Added a non-fatal `"postbuild": "pnpm dlx next-sitemap || exit 0"`
  script that runs `next-sitemap` after `next build`.
- `public/robots.txt` — **NEW.** Static fallback: `Allow: /` + `Sitemap:` pointer.
- `public/sitemap.xml` — **NEW.** Static fallback listing all 24 routes with trailing slashes.

> next-sitemap note: `pnpm add -D next-sitemap` could not run (install blocked behind the same
> approval prompt as the build gates), so to avoid a `package.json`/lockfile mismatch breaking
> CI's frozen-lockfile install, `next-sitemap` is invoked via **`pnpm dlx`** in `postbuild`
> (fetched on demand at build time) rather than added as a pinned devDependency. The `|| exit 0`
> guard keeps `pnpm build` green if the fetch is unavailable (e.g. offline local build). The
> committed `public/sitemap.xml` + `public/robots.txt` guarantee both files exist at the site
> root from the very first static export regardless; when `next-sitemap` runs on deploy it
> regenerates `out/sitemap.xml` + `out/robots.txt` from the build.

> Path note: the task said `app/...`; this project's App Router is under `src/app/`, so routes
> were created there. Public URLs are still `/privacy-policy`, `/events`, `/news`.

## Six Laws (this session)
Governance still designs **0 tables, 0 API routes**; this is a static marketing front-end.

| Law | Dimension | Verdict |
|-----|-----------|---------|
| 1 | SCHEMA | N/A — no data layer by design |
| 2 | API | N/A — static site, 0 routes |
| 3 | UI — no placeholder text | ✅ PASS — real content on all 25 pages; the three new pages each carry 400+ words; per-page unique metadata across the whole site; Organization JSON-LD in layout |
| 4 | DATA — no mock data | N/A — content-only pages; no forms/fetching on the new pages |
| 5 | WIRING — nav/links | ✅ PASS (improved) — **footer now links every page**, closing the prior orphan gap; all CTAs point to real, existing routes; sitemap.xml lists all 24 routes |
| 6 | HUMAN GATE — browser verify | ⛔ not reached — no test suite; runner blocked behind approval prompt |

**Build gates (NOT executed — runner commands blocked behind approval prompt, no results claimed):**
- `pnpm tsc --noEmit`: ⚠️ NOT RUN
- `pnpm run build`: ⚠️ NOT RUN
- `pnpm lint`: ⚠️ NOT RUN
- `pnpm postbuild` (`pnpm dlx next-sitemap`): ⚠️ NOT RUN (non-fatal; runs on deploy)

## Notes
Google Ad Grants readiness items addressed this session: a published **Privacy Policy**
(GDPR/CCPA), **unique meta title + description on every page** (verified across all
`page.tsx` metadata exports; home inherits the unique root metadata from `layout.tsx`),
**Organization structured data**, a **sitemap.xml** and **robots.txt**, **no orphaned pages**
(footer links everything), and **all CTAs resolve to real internal routes** (no dead links,
no "coming soon"). Each new page is 400+ words of substantive, mission-relevant copy.

Remaining for full Ad Grants/SEO sign-off: run the build gate sequence (`postbuild` then
`pnpm dlx next-sitemap` regenerates the sitemap/robots into `out/` on deploy); validate the
Organization + FAQ JSON-LD with Google's Rich Results test; add a Playwright suite (Law 6);
confirm HTTPS + the live domain at deploy. No gate result was fabricated (Iron Law 3).

## 2026-07-24 — Sitewide background swirls
- **Change:** BackgroundSwirls component added (`src/components/BackgroundSwirls.tsx`) — a
  sitewide SVG green swirl background (four subtle logo-green arc/swirl paths, inline
  stroke/opacity attributes, `pointer-events-none fixed inset-0 -z-10`), mounted as the first
  child of `<body>` in `src/app/layout.tsx`.
- **Gates:** `pnpm run build` ✅ PASS (0 TypeScript errors, 0 build errors, 31/31 pages).
- **Deploy:** `vercel --prod` ✅ READY, aliased to https://www.faithfoundationsf.org.
- **Result:** Sitewide SVG green swirl background implemented and deployed to production.

## 2026-07-24 — BackgroundSwirls layering fix (applied; visibility still blocked by opaque sections)
- **Edits:** `layout.tsx` (removed `bg-cream` from `<body>`; wrapped header/main/footer in
  `relative z-0 flex min-h-screen flex-col`; swirls stay first child), `BackgroundSwirls.tsx`
  (`-z-10` → `style={{ zIndex: 0 }}`; path opacities +50% → 0.09 / 0.075 / 0.07 / 0.08),
  `globals.css` (`body { background: transparent }`; cream base moved to `html` to avoid a
  white canvas).
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.
- **HONEST outcome:** NOT visible sitewide. The real blocker is opaque page sections — 128 of
  132 `<section>` tags set an opaque background, so a fixed layer behind them cannot show
  through. Swirls will only surface on the 1 transparent section (cornerstone Problem/Solution).
  To make them visible sitewide, the light section backgrounds must be made semi-transparent
  (broad change; not done without approval). No false "visible sitewide" claim recorded (Iron Law 3).

## 2026-07-24 — BackgroundSwirls re-architected (fixed → absolute-in-section)
- **Fixed-position approach permanently abandoned.** Opaque html/body fills AND opaque section
  backgrounds (128/132 sections) make any fixed layer invisible.
- **New architecture:** `BackgroundSwirls` = a single `position:absolute; inset:0; z-index:0;
  pointer-events:none` `<svg>` (no fixed positioning, no wrapper div) rendered INSIDE specific
  relative light-background sections, so it sits on top of that section's own cream fill and is
  visible. Props: `variant` / `color` (#255527) / `opacity`; one broad cubic-bezier arc per
  variant at strokeWidth 200.
- **Layout & globals reverted** to the original (body `bg-cream` restored; temporary `html`
  background rule removed; fixed swirl + wrapper removed from layout).
- **Applied to:** homepage (Mission `top-left` 0.07, Two-Pillars `bottom-right` 0.06) and About
  (Mission & Vision `diagonal` 0.06); host sections given `relative overflow-hidden`.
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.
  Verified absolute green swirl SVGs live inside the light sections on / and /about.

## 2026-07-24 — BackgroundSwirls rebuilt (3-path bands) + applied sitewide
- **Component:** rewritten so each variant renders 3 overlapping offset arcs (soft broad band,
  no CSS blur), 1440x900 viewBox, `stroke="#255527"`, `strokeWidth={300}`, `strokeLinecap="round"`,
  SVG `opacity 0.22`. Props/SVG-style unchanged (absolute inset-0, overflow visible,
  pointer-events none, z-index 0).
- **Applied sitewide** to every light-background section across 11 page files (home + about,
  programs, financial-transparency, team, contact, donate, apply, impact, governance, faq):
  section given `relative overflow-hidden`, `<BackgroundSwirls variant="…" />` as first child,
  variants cycled [top-left, bottom-right, diagonal] per file. Navy/dark + photo/video hero
  sections skipped; form components untouched. 27 swirls total; single import per file; no
  per-usage opacity props (default 0.22).
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.
  Verified live: green swirl bands (strokeWidth 300, opacity 0.22) on all 11 pages.

## 2026-07-24 — About dropdown nav + housing-voucher copy + IRS link verify
- **About dropdown** added to SiteHeader (desktop hover panel + mobile grouped label): sub-links
  About Us, Team, Financial Transparency, Governance. **Team retained as a top-level nav item**
  (appears twice on desktop, per brief). Mobile menu max-height raised to `max-h-[36rem]` to fit
  the longer list. Scroll/hamburger/logo/Donate unchanged.
- **Housing-voucher page language corrected**: rental assistance → housing/down payment
  assistance throughout (0 "rental" left); stat band label + paragraph, STEPS 3 & 4, metadata,
  and hero subtitle rewritten toward the homeownership mission.
- **IRS determination letter link verified**: `Test-Path` = True (PDF present, 121,126 bytes) →
  link left as-is; serves 200 application/pdf.
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.

## 2026-07-24 — Governance board language accuracy
- **Removed inaccurate "volunteer board" language** from `governance/page.tsx` (board receives a
  modest part-time stipend, so "volunteer" was inaccurate). 4 targeted changes: metadata
  description, hero paragraph, board h3, and board paragraph — reframed as a lean, mission-driven
  board that keeps administrative costs minimal so donor dollars reach families, not overhead.
- Unrelated policy references to organization volunteers (whistleblower / document-retention)
  left untouched. No board "volunteer" wording remains.
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.
  Verified live: new wording present, 0 "volunteer board" on the governance page.

## 2026-07-24 — Reid Whitesides bio rewrite (team page)
- **Reid Whitesides bio** in `team/page.tsx` rewritten: shortened to 3 paragraphs (matching Scott
  Ellis length), redundant mission restatement removed, wife **Mary Ann** added / family reference
  updated (recently married, growing their family in Texas), and his technology/software background
  reframed as a core operational competency (building the Foundation's systems/platforms/automation),
  not a spare-time hobby. Only Reid's `bio` array changed — nothing else in the file.
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.
  Verified live: "Mary Ann" + new opening present, old mission-restatement line gone.

## 2026-07-24 — Per-page canonical URLs (SEO fix)
- **Root canonical removed** from `layout.tsx` (`alternates: { canonical: "/" }`) so interior
  pages no longer inherit it. **Added `alternates.canonical` to all 24 listed page files**
  (each pointing to its own path). The two governance pages already had canonicals — left as-is.
- Verified: layout 0 canonical; 26 canonical values across page files, no duplicates, all targets
  present; built + live HTML each emit `<link rel="canonical">` to the page's OWN URL (no interior
  page points to bare root).
- **Expected Lighthouse SEO 92 → 100** (valid rel=canonical audit now passes). Lighthouse CLI not
  runnable in this environment — verified canonical tags directly in served HTML instead (no score
  fabricated).
- **Logo WebP flagged** as remaining perf optimization: header logo still served as PNG (~407 KB);
  no `.webp` exists, so reference left as PNG — exporting a WebP would recover the remaining points.
  (Cleared in a later session — logo now served as WebP with a preload hint.)
- **Gates:** `pnpm run build` ✅ PASS (0 TS errors, 31/31 pages). Deploy ✅ READY / aliased.

## 2026-07-27 — Bright Box Homes description corrected (3 files)
- **Why:** the old copy ("donates a portion of revenue from each home it sells") was vague and
  inaccurate. The real arrangement is **two distinct benefits**: Bright Box Homes **honors FAITH
  Foundation down payment assistance vouchers** — a **$2,500 voucher applied as a direct discount**
  to qualifying buyers — **and** makes a **separate $2,500 charitable donation** to FAITH
  Foundation **for every home sold**, a combined **$5,000 benefit** to the families we serve.
- **Files changed:**
  - `src/app/faq/page.tsx` — "How is FAITH Foundation funded?" answer in the `FAQS` array. The
    page's JSON-LD `FAQPage` schema is generated from this same array, so the structured data
    updated with it (no drift between markup and visible copy).
  - `src/app/financial-transparency/page.tsx` — "Our funding sources are disclosed" commitment body.
  - `src/app/page.tsx` — homepage Mission-section attribution paragraph (green left-border
    callout); surrounding JSX (`Reveal` wrappers, classes, CTAs) untouched.
- The "separate, independently operated company" disclosure was retained in all three places.
- **Gates:** `pnpm run build` ✅ PASS (compiled successfully, 0 TS errors, 31/31 pages; only the
  pre-existing `no-img-element` warnings). Local `postbuild` (`pnpm dlx next-sitemap`) failed on an
  npm-registry network timeout — non-fatal by design (`|| exit 0`), a local fetch issue not a code
  error; it ran normally in the Vercel build.
- **Deploy:** `vercel --prod` ✅ READY (`dpl_EyYKsLpAhJVyBNNTfECFJxi2hdpv`), aliased to
  https://www.faithfoundationsf.org.

## 2026-08-04 — Events page scrubbed of all fabricated events
- **Why:** the page listed **five invented events** that were never scheduled — "Financial Literacy
  Workshop: Building a Budget That Sticks" (Jul 12), "Community Volunteer Day" (Jul 26), "Tenancy
  Hope Benefit Dinner" (Aug 15), "Homeownership Readiness Information Night" (Sep 9), and
  "Back-to-School Family Resource Fair" (Sep 27) — several with fabricated venues and times.
  **All five removed entirely.**
- **Only two confirmed real events remain** in the `EVENTS` array of `src/app/events/page.tsx`:
  - **October 11, 2026 — Volunteer Orientation — Zoom** (Volunteer; time TBD; Online / Zoom).
    Sign-ups run through the volunteer page; Zoom link sent ahead of the event.
  - **November 24, 2026 — Annual Impact Summary Published** (Transparency; faithfoundationsf.org).
    First annual impact summary — families served, down payment assistance vouchers distributed,
    and how each category of giving was used; posted to the impact + financial-transparency pages.
- **Schema change:** the event objects use `category` where the old array used `type`. The badge
  render and style map were renamed to match (`TYPE_STYLES` → `CATEGORY_STYLES`, keyed `Volunteer` /
  `Transparency`) — required for the page to compile, not a cosmetic edit.
- **Honest-calendar copy:** every line implying a busy, established calendar was rewritten —
  `metadata.description` (no longer advertises workshops/volunteer days/donor gatherings/
  fundraisers), the hero paragraph (states the foundation is young and its calendar "is just
  beginning," more to be announced), the "Why come to an event" section (a small number of
  gatherings done well rather than a calendar filled for appearances; every listed event is
  confirmed), the list heading ("Mark your calendar" → "Confirmed events"), and the CTA (dropped
  "reserve your spot").
- Verified **no other file** referenced any removed event (grep across `src/` for all five titles:
  0 hits).
- **Gates:** `pnpm run build` ✅ PASS (compiled successfully, 0 TS errors; static export generated,
  27 page `index.html` files; `next-sitemap` postbuild completed normally this run).
- **Deploy:** `vercel --prod` ✅ READY (`dpl_83Cjab4RL7WtwnZtb3fXYcRj2QYd`), target production.
  Verified live at https://www.faithfoundationsf.org/events/ — both confirmed events present,
  **zero** occurrences of any fabricated event.
- **Last updated:** 2026-08-04

## 2026-08-14 — next-sitemap single source of truth (sitemap.xml + robots.txt)

Two passes, both built and deployed to production.

**Pass 1 — `next-sitemap.config.js` corrected.**

| File | Change |
| --- | --- |
| `next-sitemap.config.js` | `/icon.png` (+ trailing-slash variant) added to `exclude` — the App Router emits `src/app/icon.png` as a route (`○ /icon.png` in the build manifest), so a favicon was being listed as a crawlable page. Added a `transform` function setting per-page `priority` from a `PRIORITY_BY_PATH` map (`/` 1.0, `/donate` 0.9, `/programs` `/about` `/contact` `/impact` `/financial-transparency` 0.8, default 0.7) and `changefreq: "weekly"` on every entry. The six retired-program exclusions and `siteUrl` were already correct and were verified, not re-added. |

Two details that would have silently broken it: the transform strips trailing slashes before the
priority lookup (`trailingSlash: true` means paths arrive as `/donate/`, so an unslashed map would
have fallen through to 0.7 for all seven overrides); and `changefreq` is set INSIDE the transform
because a custom `transform` replaces default field generation, so the top-level value alone would
have emitted no `<changefreq>` element at all.

**Pass 2 — stale static fallbacks deleted.**

| File | Change |
| --- | --- |
| `public/sitemap.xml` | **DELETED** (`git rm`). Listed 21 URLs on the **non-www** host, contradicting the `www` canonical, and omitted `/governance/` + `/governance/donor-privacy/`. |
| `public/robots.txt` | **DELETED** (`git rm`). Diffed against the generated `out/robots.txt` first — semantically identical, no directive lost. |

These were a second hand-maintained source of truth that had drifted. They were inert only by
build ordering (`next build` copies `public/` → `out/`, then `postbuild` overwrites
`out/sitemap.xml`), and `postbuild` is non-fatal (`|| exit 0`) and has failed before on a network
timeout (2026-07-27) — which would have shipped the stale non-www sitemap as authoritative.
Repo-wide grep confirmed **zero source references** to either file before deleting.

**Accepted trade-off:** a `postbuild` failure now yields no sitemap/robots rather than a stale
one — the better failure mode, since a 404 tells Google to retry while a stale sitemap asserts
wrong URLs. Any future fallback must be generated, never hand-maintained.

- **Build:** `pnpm run build` PASSED both passes — 0 TypeScript errors, 31/31 static pages,
  `postbuild` completed normally each time.
- **Deploy:** `vercel --prod` ✅ READY both passes — `dpl_Eja29QcsJs6VRhizzjAFRFN81AUh` (pass 1)
  and `dpl_5YoGNPQyKMgBGjtfdCoyRnLYSYjA` (pass 2), target production, aliased to
  https://www.faithfoundationsf.org.
- **Verified live with `curl`:** `/sitemap.xml` → HTTP 200, **23 `<url>` entries**, all 23 `<loc>`
  on the **www** host (0 non-www), **0 hits** for `icon.png` / `/emergency` /
  `financial-literacy` / `single-parents`, both governance pages present, priority distribution
  exactly **1 × 1.0, 1 × 0.9, 5 × 0.8, 16 × 0.7**, all entries `weekly`. `/robots.txt` → HTTP 200
  with the correct `www` `Host:` and `Sitemap:` pointer.
- **Note on history above:** the "Prior phase (superseded)" section still describes the committed
  `public/` fallbacks as NEW. That is an accurate record of 2026-06-12 and was left intact; those
  files no longer exist as of this entry.

## 2026-08-14 — Bright Box Homes anonymized sitewide (4 files)

**Why.** Naming a specific for-profit homebuilder as a funding partner on a 501(c)(3) site invites
a **private benefit / self-dealing** reading: the copy read as the charity advertising a named
company and steering buyers to it. Removing the name preserves the factual disclosure of the
funding mechanism while eliminating the appearance of the nonprofit promoting one private
business. Motivated by the pending **Google for Nonprofits** application and general **IRS**
scrutiny of related-party arrangements.

| File | Change |
| --- | --- |
| `src/app/page.tsx` (~line 160) | Mission-block funding paragraph. Named Bright Box Homes plus the "$2,500 discount + $2,500 donation per home sold" mechanics → "funded by the generosity of individual and corporate donors whose gifts are directed entirely toward down payment assistance for Texas families working toward homeownership." |
| `src/app/faq/page.tsx` (`FAQS`, "How is FAITH Foundation funded?") | Whole answer replaced. The named company, the dollar figures, and the "two completely separate entities / does not own or operate any homebuilding company" disclaimer all dropped; now describes "homebuilders and construction partners" generically and points to the Financial Transparency page. |
| `src/app/financial-transparency/page.tsx` (`COMMITMENTS`, "Our funding sources are disclosed") | Body replaced. The mechanism is retained in generic terms — corporate partners "include homebuilders who honor FAITH Foundation down payment assistance vouchers as direct discounts to qualifying buyers and make additional charitable contributions to FAITH Foundation per home sold" — with the name and the $2,500/$5,000 figures removed. |
| `src/app/programs/cornerstone-communities/page.tsx` (`ROADMAP`, Phase 3 "First Home Placement") | "Bright Box Homes, our corporate partner, is positioned to provide the first home through their modular construction program." → "A corporate construction partner is positioned to provide the first home through a modular construction program, with full documentation from groundbreaking to move-in." |

**Coverage check.** Repo-wide case-insensitive grep for `bright ?box` after the edits: **0 hits
anywhere under `src/`**. Remaining hits are internal-only and were deliberately left alone —
`governance/SESSION_STATE.md` and `governance/STATE_OF_THE_BUILD.md` (historical log entries,
which must stay accurate as a record), `PRD.md`, and the untracked scratch file
`brightbox-mentions.txt`. The `/partnership` page that once carried the full named partnership no
longer exists in the route manifest, and `src/app/news/page.tsx` carried no named reference at the
time of this pass.

- **Gates:** `pnpm run build` ✅ PASS — compiled successfully, **0 TypeScript errors**, 31/31
  static pages, `next-sitemap` postbuild completed normally. Only the pre-existing
  `@next/next/no-img-element` warnings; none new.
- **Deploy:** `vercel --prod` ✅ READY (`dpl_J3BazDCruE6LnzupbLRq8PVaxHFF`), target production,
  aliased to https://www.faithfoundationsf.org.
- **Verified live with `curl`:** `/`, `/faq/`, `/financial-transparency/`, and
  `/programs/cornerstone-communities/` each return **0 occurrences of "Bright Box"**
  (case-insensitive), and each of the four replacement strings is present in the served HTML.
- **Last updated:** 2026-08-14

## 2026-08-14 — Cornerstone land form removed + housing copy corrected (2 files)

**Why (form).** `LandInquiryForm` posted to `https://formspree.io/f/YOUR_FORMSPREE_LAND_ID` — the
placeholder ID was never replaced, so every land donation inquiry was silently discarded. Phase 1
of the Cornerstone roadmap is "Active — Seeking Partners", making this form the primary conversion
path for the program's single greatest need, and it looked fully functional to the submitter.

**Why (gallery copy).** All eight captions described cost efficiency in near-identical language and
never said what the housing is. One ("Affordable manufactured housing") was also factually wrong —
manufactured housing is a distinct HUD-regulated category. Nothing on the page conveyed that these
are factory-built expandable container homes arriving with full kitchen, full bath, and AC
installed, with customizable exteriors, flooring, and layouts.

| File | Change |
| --- | --- |
| `src/app/programs/cornerstone-communities/page.tsx` | **`LandInquiryForm` DELETED** — the whole 152-line function, the last declaration in the file. The `#land-inquiry` section body replaced with a centered heading, one paragraph, and a gold CTA `Link` to `/contact`. The 48-hour response promise, the 501(c)(3) tax-benefit language, and the preliminary-assessment note moved from the form's inline disclaimer into that paragraph, so nothing was lost. `id="land-inquiry"` preserved. |
| `src/app/programs/cornerstone-communities/page.tsx` | `microHouseGallery` and `microApartmentGallery` — all **8 captions rewritten**. Container homes: factory build + on-site placement, customizable interiors, expandable modules, exterior color/configuration options. Micro-apartments: furnished with kitchenette/bath/AC, private and secure, modular cost control, community-centered siting of services. |
| `src/app/programs/cornerstone-communities/page.tsx` | **2 new explanatory paragraphs**, one after each `h3` ("Container Homes", "Transitional Micro-Apartments") and before its gallery grid, carrying the full construction and equipment description. |
| `src/app/page.tsx` | Mission-block `ParallaxImage` alt → "An expandable modular container home — fully equipped with kitchen, bath, and AC — the type of affordable home FAITH Foundation aims to place through Cornerstone Communities". |

**Side effect worth recording:** this page renders `alt={image.caption}`, so rewriting the captions
also corrected the `alt` text on all eight gallery images.

**Deviation of record.** The brief quoted the homepage alt text as ending "with soft interior
light". The actual string ended "with string lights and a firepit". Same image, verified as the
only occurrence sitewide (one hit in `src/`; the other two hits are in the untracked scratch file
`brightbox-mentions.txt`). Replaced as specified.

- **Gates:** `pnpm run build` ✅ PASS — 0 TypeScript errors, 31/31 static pages, `next-sitemap`
  postbuild completed normally. Only the pre-existing `@next/next/no-img-element` warnings.
- **Deploy:** `vercel --prod` ✅ READY (`dpl_GMWK8gojPzLpmsHaDNtK42oSwHbN`), target production,
  aliased to https://www.faithfoundationsf.org.
- **Verified live:** `/programs/cornerstone-communities/` → **0 "formspree"**, **0
  "YOUR_FORMSPREE"**, CTA button present, both explanatory paragraphs present, new captions
  present. `/` → new alt text present, old alt text **0 occurrences**.
- **OPEN ITEM (found during verification, not in scope, not fixed):** the cornerstone page still
  serves one `<form>` — the **sitewide newsletter signup in `src/components/SiteFooter.tsx`**
  (~line 89). Same defect class as the form just removed: `onSubmit` calls `preventDefault()` then
  `setSubmitted(true)`, showing a success state while discarding the email. No endpoint, no
  storage, present on **every page**. Needs either a real list provider or removal — flagged for a
  decision, not changed without one.
- **Last updated:** 2026-08-14

## 2026-08-14 — Full Playwright site audit (128 tests) + 3 defects fixed

**Tooling added.** `@playwright/test` 1.62.1 (devDependency) + Chromium 151.
`playwright.config.ts` targets live production by default; `AUDIT_BASE_URL` points it at a preview
or local build. `tsconfig.json` now excludes `scripts` and `playwright.config.ts` from the Next
typecheck. Suite: `scripts/site-audit.spec.ts`. Report: `governance/SITE_AUDIT_2026-08-14.md`.

**Result: 128 tests, 128 passed, 0 failed, 0 skipped.** No test was skipped, disabled, or loosened
to make it pass; every fix was made in source, redeployed, and the suite re-run end to end.

**Why the form tests assert two things.** The brief specified "fill all fields, submit, verify
success state". Written literally that passes on a form that destroys submissions — which is what
three of the four were doing. Each form test asserts the success state renders AND that an
outbound `mailto:` carrying the submitted data was dispatched (observable via
`page.on("request")`). Preserve the second assertion in any future edit.

| # | Issue | Status |
| --- | --- | --- |
| 1 | Contact + Volunteer + Apply forms silently discarded every submission (`preventDefault(); setSubmitted(true)`, no endpoint). Apply collected income / household / children / "Facing eviction" / "Currently unhoused" and promised a caseworker callback within three business days. | **FIXED** — shared `src/lib/mailto.ts`; newsletter migrated onto it too |
| 1b | Apply wizard unmounts each step, so steps 1–3 would have been lost even after the mailto fix — only step 4's consent checkbox was in the DOM at submit. | **FIXED** — answers captured to state on each step change |
| 1c | Apply's Back button wiped everything already typed (remounted uncontrolled inputs came back empty). | **FIXED** — values repopulate from captured state |
| 1d | Success copy still false under mailto (a draft is not a sent message). | **FIXED** — all three now say "press send", with phone fallback; Apply heading "Application received" → "One last step to send your application" |
| 2 | `/programs/veterans/` hero was a hotlinked Unsplash photo removed upstream, returning **404** — the page's main visual was blank. Only 1 dead id of the 25 checked. | **FIXED** — verified-live replacement, visually inspected before use |
| 3 | Two bugs in the audit spec itself (unscoped `footer` locator matched a testimonial card; internal-link floor set one above the real count). | **FIXED** |
| 4 | Brief expected "Apply for Assistance" → `/contact`. It goes to `/apply`, the real application page. | **NOT a defect** — rerouting would be a regression; test records CTA targets and asserts they resolve |

**Root cause left open (flagged, not fixed):** the site hotlinks a third-party CDN for hero
imagery. Issue 2 was that CDN deleting a photo out from under a live program page; every remaining
Unsplash reference carries the same risk. Self-hosting recommended.

**Scope limit on the "no console errors" pass:** uncaught exceptions always count, but console
errors count only when they originate from our own origin. Third-party embeds (Zeffy →
Stripe/hCaptcha/PayPal, Google Maps on /contact) log from their own origins. PASS means our code
is clean, not that every embed is silent.

- **Gates:** `pnpm run build` ✅ PASS — compiled successfully, 0 TypeScript errors, 31/31 static
  pages, exit 0. Only pre-existing `@next/next/no-img-element` warnings, none new.
- **Deploy:** `vercel --prod` ✅ READY (`dpl_9jkWenHBzMkLVXDnke6Cv4PJw8gB`), target production,
  aliased to https://www.faithfoundationsf.org. Suite re-run post-deploy: **128/128 green.**
- **Google for Nonprofits:** every technical item passes; no blocking defect found. Remaining item
  is organizational — all four forms depend on the visitor having a mail client and pressing send,
  and nothing is stored. A real intake endpoint is the highest-value remaining work.
- **Last updated:** 2026-08-14

## 2026-08-14 — Web3Forms delivery + self-hosted photography

Closes both open recommendations from `governance/SITE_AUDIT_2026-08-14.md`.

### Task 1 — all four forms POST to Web3Forms

| File | Change |
| --- | --- |
| `src/lib/web3forms.ts` | **NEW.** `submitForm(subject, fields)` POSTs to `https://api.web3forms.com/submit`. Reports delivery only on **200 AND `success: true`** — Web3Forms answers 200 with `success:false` for a rejected key, so a status-only check would have re-created the false-success defect. Short-circuits with a clear message while the key is the placeholder. Activation steps documented in-file. |
| `src/components/FormErrorNotice.tsx` | **NEW.** Shared failure panel. Never implies success; always offers a one-click email fallback carrying the same data to the same inbox, plus the phone number. |
| `src/app/contact/ContactForm.tsx` | mailto → Web3Forms POST; `submitting` state; error path; honeypot; success copy back to "Message sent!" (now a true statement). |
| `src/app/volunteer/VolunteerForm.tsx` | Same treatment; success copy back to a plain confirmation. |
| `src/app/apply/ApplicationForm.tsx` | Same treatment. **Multi-step capture preserved** — `collectAll()` merges the `answers` state with live step-4 FormData so the POST carries all four steps; reading `event.currentTarget` alone would send only the consent checkbox. Success copy back to "Application received". |
| `src/components/SiteFooter.tsx` | Newsletter → Web3Forms POST; inline error styled for the navy footer with a "Sign up by email instead" fallback. |
| `.env.local` | **NEW (gitignored).** `NEXT_PUBLIC_WEB3FORMS_KEY=PENDING_KEY` with activation instructions. |
| `.env.example` | **NEW (committed).** Same instructions, carried in the repo since `.env*.local` is ignored. |
| `.eslintrc.json` | `@typescript-eslint/no-unused-vars` given `argsIgnorePattern: "^_"` — required because `img()` now deliberately ignores its size args, and the default config failed the build on it. |

**Not live yet.** `PENDING_KEY` is still in place — see the blocking follow-up in the prompt
outcome above. Forms currently show a "not connected" error plus an email fallback.

**Proven, not assumed.** The placeholder makes `WEB3FORMS_CONFIGURED` a compile-time `false`, so
the minifier strips the whole fetch block — `api.web3forms.com` is absent from the shipped bundle
right now. The delivery path was therefore verified by rebuilding with a dummy key and running
`scripts/web3forms-wiring.spec.ts` against that build served locally: **4/4 passed** (real POST
with correct fields; rejected key → failure not success; error notice with working fallback; all
four Apply steps present field-by-field; Back preserves earlier answers).

### Task 2 — every Unsplash photo self-hosted

25/25 downloaded at 2000px into `/public/photos`, **verified before any reference was edited**
(HTTP 200 + `image/*` content-type + JPEG magic bytes on disk + non-trivial size). **0 failures,
9.59 MB.** `src/lib/images.ts` rewritten to local paths; the `unsplash()` builder and `BASE`
constant **deleted** so a hotlink cannot be reintroduced. `img(key, w?, h?)` keeps its signature
with the size args accepted and ignored, avoiding edits to ~19 call sites. `src/lib/media.ts`
needed no changes (already local). Unsplash `preconnect`/`dns-prefetch` removed from `layout.tsx`.
Confirmed **0 `images.unsplash.com`** in `out/` and on production.

13 of the 25 have zero references outside `images.ts` (~5 MB). Downloaded anyway to keep the
catalog complete and hotlink-free; pruning them is a reasonable follow-up, not done unasked.

### Audit suite updated, not weakened

The 26 form tests were written against the mailto contract and failed once the forms switched.
They were rewritten to assert the invariant that holds in **both** states: *a success state may
appear ONLY if a POST was actually made; otherwise an error must be shown AND the email fallback
must still carry the data to the same inbox.* The Apply test additionally asserts every step's
values survive whichever route the submission takes. These stay valid after activation — the
branch flips from fallback to delivery.

- **Gates:** `pnpm run build` ✅ PASS — 0 TypeScript errors, 31/31 static pages, exit 0.
- **Deploy:** `vercel --prod` ✅ READY, aliased to https://www.faithfoundationsf.org.
- **Post-deploy audit:** `scripts/site-audit.spec.ts` **128/128 passed** against production.
- **Last updated:** 2026-08-14

## 2026-08-15 — FaithProof Phase 1: Foundation

Converted the site from a static export to a server-rendered Next.js app and installed the complete
FaithProof data layer. No public-facing UI was built. The existing site remained 100% functional
throughout — proven, not assumed, by re-running both existing audit suites against live production
after deploy.

### What was built

| Area | Detail |
| --- | --- |
| Static export removed | `output: "export"` deleted from `next.config.mjs`; nothing else in that file touched. |
| Supabase libraries | `@supabase/supabase-js` 2.112.3, `@supabase/ssr` 0.12.4. |
| Environment | `.env.local` (gitignored, confirmed via `git check-ignore`) carries all three Supabase values alongside the pre-existing `NEXT_PUBLIC_WEB3FORMS_KEY=PENDING_KEY`, which was preserved. |
| Client utilities | `src/lib/supabase/client.ts` (browser), `server.ts` (cookie-bound, async), `service.ts` (`supabaseAdmin`, service-role, RLS-bypassing, server-only). |
| Schema | 6 tables, 7 enums, 16 RLS policies, 6 triggers — migrated and verified against the live database. |
| Middleware | `src/middleware.ts`, full replacement per the canonical rule. Gates `/admin` and `/faithproof/admin`. |
| Login | `/login` server component (no client JS) + `signIn`/`signOut` server actions. Generic failure copy so the form cannot be used to enumerate accounts. |
| Admin shell | `/admin` layout (dark `#1a1a2e` sidebar, six links, identity + role, sign-out, white content area) and the two-panel Command Center with honest empty states. |
| Vercel | Three env vars set for Production and Development. |

### Three defects found and fixed

Two were in the SQL as specified; one was caused by Step 1. All three were found by **executing**
the work and exercising it, not by reading it.

**1 — RLS infinite recursion (migration `002_fix_rls_recursion.sql`).** `profiles`' admin policies
select FROM `profiles`, so evaluating the policy required evaluating the policy. Postgres aborted
with `infinite recursion detected in policy for relation "profiles"`. Because every other table
resolved the caller's role by reading `profiles`, **all six tables failed every query for both
`anon` and `authenticated`** — measured directly after 001. Fixed with a `SECURITY DEFINER`
`public.current_user_role()` helper whose owner bypasses RLS on `profiles`, breaking the cycle.
Policy intent unchanged.

**2 — `handle_new_user()` had no `SET search_path` (migration `003_...`).** `SECURITY DEFINER`
changes privileges, not search_path. Supabase's auth service connects as `supabase_auth_admin` with
`search_path=auth`, so the unqualified `profiles` in the trigger body was never found and the
trigger aborted the `INSERT INTO auth.users`. **Every account creation failed** with GoTrue's opaque
"Database error creating new user" — meaning `/login` could never authenticate anyone and `/admin`
was permanently unreachable. It did **not** reproduce under direct SQL as `postgres`, whose
search_path includes `public`; only the real signup path exposed it. Fixed by pinning
`search_path = ''` and schema-qualifying every reference.

**3 — sitemap/robots would have silently disappeared.** `next-sitemap` wrote to `outDir: "out"`,
which stops existing once static export is removed, and `postbuild` is guarded with `|| exit 0`. The
build would have gone green while shipping neither file — on a site whose Google Ad Grants standing
depends on both. `outDir` is now `public/`; both generated files are gitignored so they cannot
become a stale committed second source.

### Gates

- `pnpm tsc --noEmit` ✅ PASS (0 errors)
- `pnpm run build` ✅ PASS (compiled successfully, 33/33 pages, `postbuild` completed)
- `vercel --prod` ✅ READY — `dpl_AtMTvPTTKZQsUXDxwWi9UFRNbLdK`, aliased to
  https://www.faithfoundationsf.org
- `scripts/ad-grants-readiness.spec.ts` vs production ✅ **59/59**
- `scripts/site-audit.spec.ts` vs production ✅ **128/128**
- End-to-end auth vs production ✅ **20/20**

### End-to-end auth test

A throwaway Supabase user was created via the service-role admin API, driven through the **real
login form** in Chromium against the live domain, then deleted (profile row confirmed
cascade-deleted). 20 checks: `handle_new_user` firing on real signup; wrong password rejected with
an inline error and no session; sign-in redirecting to `/admin`; all six sidebar links; both
Command Center panels and their empty-state copy; `<footer>` count 0 and `<nav>` count 1 proving the
public chrome is suppressed; exactly one `<main>`; signed-in identity in the sidebar; sign-out
returning to `/login`; `/admin` re-protected afterwards.

RLS semantics were separately proven inside a rolled-back transaction: `anon` sees only
`is_public = true AND status = 'confirmed'` transactions (1 of 2); `staff` sees both but is
**denied INSERT**; `admin` sees both and may INSERT; `staff` sees only their own profile while
`admin` sees all. The `updated_at` trigger was confirmed to rewrite the column on UPDATE.

**Database left clean: 6 tables, 0 rows each, 0 `auth.users`.** No test data persisted.

### Verification note worth keeping

The first version of the "public chrome is absent from /admin" check asserted on substrings
(`faith-foundation-logo`, `209 Surecast`) and **false-failed**. Both appear in the root layout's
`<head>` on every route — the logo preload hint and the Organization JSON-LD, which contains the
street address. The check now counts rendered elements instead. When testing for the *absence* of a
component, assert on elements, not on text that metadata also contains.

### Open items

1. **No admin account exists** — nobody can sign in yet. Create one in Supabase (Authentication →
   Users → Add user, "Auto Confirm User" on), then promote it to `admin`: the trigger assigns every
   new user `role = 'staff'`. Not created here because a real credential belongs to the organization.
2. **`audit_log` accepts inserts from anyone** (`WITH CHECK (TRUE)`, as specified) — a tamper
   surface to close in Phase 2 by routing audit writes through the service-role client.
3. **Vercel Preview env vars unset** — Production and Development are set; the CLI looped on
   `git_branch_required`. Preview deploys will 500 until added via the dashboard.
4. **`notepad supabase password.txt`** held the live database password in the working tree. Now
   gitignored; never committed. Move it to a password manager and delete it.

- **Last updated:** 2026-08-15

## 2026-08-15 — FaithProof Phase 2: Command Center + live data

Replaced the white placeholder admin shell with a dark, production-quality Command Center and wired
all six sidebar sections to live Supabase data. **The public site was not touched** — confirmed by
re-running both existing audit suites against live production after deploy.

### What was built

| Area | Detail |
| --- | --- |
| Design system | Admin-only dark palette (#0f1623 sidebar, #111827 main, #1e293b cards, #2d3748 borders, #4A7C59 brand green) applied to the admin shell and the login page. Existing Inter/Playfair variables reused; no new fonts. |
| Admin layout | Fixed 240px sidebar, brand-green "FAITH FOUNDATION" eyebrow over white "FaithProof", six icon nav links with active state (bg #1e293b, white text, 2px green left border), user email, role pill, Sign Out, View public site. Content area `ml-60`, bg #111827, p-8. |
| Login | Full-page #0f1623, centered #1e293b card, dark inputs with green focus ring, full-width green Sign In, red inline error. `actions.ts` unchanged as specified. |
| Command Center | Four-card live stat row (total confirmed donations, vouchers disbursed, promises kept, documents verified) above two live-queried panels — Requires Attention (unconfirmed transactions / pending vouchers / overdue promises, each a linked count badge) and Recent Accountability Activity (last 10 audit entries with actor and relative time). |
| Transactions | List with colour-coded type and status badges, anonymised donors, amounts to the cent; create form with validation. |
| Vouchers | List with status badges and anonymised recipients; create form with a `FAITH-YYYY-NNNN` suggestion derived from the current year's count. |
| Promises | Card grid with status badges, target/fulfilled dates, visibility, proof link, and an explicit **Overdue** badge for active promises past target. |
| Proof Vault | Two-column card grid with type badge, verified shield, public/internal badge, external link. |
| Audit Log | Read-only table, 100 most recent, actor joined from `profiles`, truncated entity UUIDs. |
| Migration 004 | `audit_log` INSERT policy tightened from `WITH CHECK (TRUE)` to `auth.uid() IS NOT NULL`. |

### Migration 004 was already applied by hand

The policy already existed — it had been run directly in the Supabase SQL editor — so the migration
failed on "policy already exists". Since this project applies migrations manually and has **no
migration-tracking table**, a migration that cannot be re-run is a trap; 004 now drops both the old
and the new policy name before creating. Verified against the database afterwards: anonymous INSERT
→ **DENIED**, authenticated INSERT → **ALLOWED**.

### Gates

- `pnpm tsc --noEmit` ✅ PASS (0 errors)
- `pnpm run build` ✅ PASS — all admin routes dynamic (ƒ), all public routes still static (○)
- `vercel --prod` ✅ READY — `dpl_CKakVCYYxj9hZE556AnsGaoJkAbF`
- Phase 2 e2e vs production ✅ **50/50**
- `ad-grants-readiness` vs production ✅ **59/59**
- `site-audit` vs production ✅ **127 passed, 1 flaky** (Zeffy third-party embed under parallel
  load; passes alone with `--retries=0`)
- Sitemap ✅ 23 URLs, no admin/login/faithproof entries
- Database after testing ✅ 0 rows in all six tables; only the real admin profile remains

### The 50-check end-to-end test

A throwaway **admin** user was created, driven through every screen and every create form in
Chromium against the live domain, then deleted along with everything it made. Cleanup order matters:
`created_by → profiles(id)` has no ON DELETE rule, so the rows must go before the profile.

It asserts computed colours, all six nav links, four stat cards, both panels, every list and form
page rendering without a data-access error, a transaction round-tripping at `$2,500.50`, an
anonymous voucher, an overdue promise flagged, a verified document, all three attention categories
appearing on the dashboard, exactly one audit row per create with the actor named, `aria-current` on
the active nav item, both validation rejections (zero amount; public document with no URL) leaving
the database untouched while preserving typed input, and `/admin` re-protected after sign-out.

### Two test-authoring traps hit this session

1. **`page.click('button[type="submit"]')` is the legacy non-strict Playwright API and takes the
   first match.** Once signed in, the sidebar's Sign Out button precedes every form's submit button
   in DOM order, so that selector signed the user out instead of submitting. The symptoms read
   exactly like an application auth bug — a `Next-Action` POST, a 303 with no `Location` header, the
   auth cookie cleared, and no row written. Target by accessible name.
2. **`[role="alert"]` also matches Next's empty `__next-route-announcer__`.** Scope form-error
   assertions to `p[role="alert"]`. Second session running that this produced a false failure.

### Open items

1. **Create and read only — nothing can be actioned.** No status-transition controls exist, so
   unconfirmed transactions, pending vouchers and overdue promises can be seen but never confirmed,
   approved, disbursed or fulfilled from the UI; they accumulate in "Requires Attention" until the
   database is edited directly. No edit or delete either. First thing Phase 3 should close.
2. **Writes are admin-only.** RLS grants INSERT to `role = 'admin'` alone. A `staff` user gets a
   message naming the cause, but the tool is effectively single-role today. `staff` also cannot read
   the audit log and sees only public promises — both stated in the UI rather than shown as empty.
3. **`audit_log` actor spoofing via the REST API** is still possible for an authenticated user.
4. **Total donations is summed in JavaScript** — PostgREST cannot express `SUM()` without a view or
   RPC. Fine at current volume; revisit at tens of thousands of rows.
5. **Vercel Preview env vars still unset.**
6. **`notepad supabase password.txt`** still holds the live DB password in the working tree.

- **Last updated:** 2026-08-15

## 2026-08-15 — FaithProof Phase 3: colour system redesign

Rebuilt the FaithProof admin colour system around deep green `#013e37` and butter `#ffefb3`.
The public site was not touched — and that is verifiable structurally, not by inspection: every
file the phase changed lives under `src/app/admin/` or `src/app/login/`.

### Step 1 — the colour map (read from the files, not assumed)

All 17 listed files were read before anything was written. `icons.tsx` turned out to contain no
colour literal at all — every icon is `stroke="currentColor"`, so all 15 re-tinted themselves for
free. `badges.tsx` likewise has no literals; it maps enums to tone *names* defined once in
`ui.tsx`, so retuning six tone strings recoloured every badge on every page.

| Old | Role | New |
| --- | --- | --- |
| `#0f1623` | sidebar bg, login page bg | sidebar `#013e37`; login page `#1e293b` |
| `#111827` | main bg, input bg, row hover | `#1e293b`; `rgba(1,62,55,0.6)`; `rgba(255,239,179,0.05)` |
| `#1e293b` | card bg | `#013e37` (`#1e293b` promoted to page base) |
| `#2d3748` | borders | `rgba(255,239,179,0.15 / 0.1 / 0.08)` |
| `#94a3b8` / `#475569` | secondary / muted text | butter @0.7 / @0.5 |
| `#4A7C59` / `#3d6b4a` | accent + buttons | `#ffefb3` / hover `#fff5cc`, label `#013e37` |
| `white` on headings | headings | `#ffefb3` + `font-bold` |
| `#22c55e` `#f59e0b` `#ef4444` `#3b82f6` | indicators | `#4ade80` `#fbbf24` `#f87171` `#60a5fa` |

### Step 2 — how it was applied

A new `src/app/admin/_components/theme.ts` is the single source of truth: raw hex constants, four
inline `CSSProperties` surface styles (card / stat card / soft card / table), and literal Tailwind
class strings for text, borders, controls and buttons.

Inline styles carry the gradient, the layered shadows and the card top-edge highlight. Flat rgba
colours stayed as Tailwind arbitrary values because `hover:` and `focus:` variants cannot be done
inline — and nav hover, button hover, input focus border and row hover are all in the brief. Taking
"inline styles for rgba" literally would have removed every interactive state the brief asked for.

The palette is still kept out of `tailwind.config.ts` on purpose: that file is shared with the
public marketing site.

### Verification

- `pnpm tsc --noEmit` ✅ 0 errors
- `pnpm run build` ✅ 42/42 pages
- Tailwind emission ✅ all 19 arbitrary rgba classes and all 10 solid hexes present in compiled CSS
- `vercel --prod` ✅ READY — `dpl_8xAbMpsx7Xk5aH33R6fuECgjRZZo`
- Computed-colour test vs production ✅ **46/46**
- `ad-grants-readiness` vs production ✅ **59/59**
- `site-audit` vs production ✅ **126 passed + 2 flaky** (both green on retry)
- Files outside `admin/` + `login/` ✅ **zero**

The 46-check test reads `getComputedStyle` on live production rather than asserting class names, so
a class Tailwind failed to compile would fail the test even with correct markup. It covers the
sidebar, wordmark and eyebrow, active/inactive nav (fill, text, 2px left border), ADMIN badge, sign
out, the stat-card gradient + shadow + top highlight + butter bold numbers, panel header/subtext,
table surface/header/cell/border, form card/label/submit, the Add button, and the login card,
button and input.

**On the two flakes:** the Zeffy embed is third-party. The newsletter one is the pre-existing
failure-notice timing assertion — its failing page **rotates every run** (/faq/, then
/programs/homeownership/, then /volunteer/) with 22 of 23 passing each time, and no public file was
modified this phase.

### Accessibility, measured

Butter over deep green, WCAG relative-luminance formula. Solid butter is **10.46:1**, body
`#f1f5f9` is **10.98:1**, the butter button with `#013e37` text is **10.46:1**, form labels @0.8 are
**7.26:1**, nav links @0.7 are **5.92:1**, and everything at @0.6 is **4.74:1**.

Under AA, applied as specified rather than silently changed:

- butter **@0.5** — sign out, sidebar email, promise date labels — **3.78:1** (needs 4.5)
- butter **@0.55** — panel subtext — **4.23:1** (needs 4.5)
- `#f87171` danger text — **4.35:1** — marginal
- butter **@0.35** stat icon — 2.57:1 — decorative and labelled, so exempt

Raising the two alphas to 0.6 clears both; it is one line in `theme.ts`. This is an authenticated
internal tool, so the public site's Lighthouse Accessibility 100 is unaffected.

### Two verification lessons

1. **Grepping minified CSS for a colour literal is not a test.** The first check reported the
   danger-red classes missing while every other tone was present. They were there: Tailwind escapes
   commas in the selector as `\2c `, and the minifier had rewritten those declarations away from
   literal-comma `rgba(...)`. Assert on `getComputedStyle` in a browser instead.
2. **In the admin shell the sidebar is always first in DOM order.** `document.querySelector("form")`
   matched the Sign Out form, which has no `<section>` ancestor, and the assertion threw. Phase 2
   hit the same class of bug twice (`page.click('button[type=submit]')` hitting Sign Out, and
   `[role="alert"]` matching Next's route announcer). Anchor queries on something inside the content
   area — a field id or an accessible name — never on the first element of a generic type.

### Open items — unchanged by this phase

1. **Create and read only — nothing in Requires Attention can be actioned.** Still the largest
   functional gap; first thing Phase 4 should close.
2. Writes are admin-only (RLS).
3. `audit_log` actor spoofing via the REST API.
4. Total donations summed in JavaScript, not SQL.
5. Vercel Preview env vars unset.
6. `notepad supabase password.txt` still in the working tree.

- **Last updated:** 2026-08-15

## 2026-08-15 — FaithProof Phase 3 Correction: world-class dashboard UI

Replaced the all-green admin UI with a light-mode dashboard. Green stops being a fill and becomes
an accent; warm cream becomes the dominant tone; white cards float on it with real shadows.

### The core inversion

| | Before | After |
| --- | --- | --- |
| Page | `#1e293b` slate | **`#f8f7f4` warm cream** |
| Cards, panels, tables, forms, login | `#013e37` green fills | **`#ffffff` white, floating** |
| Green `#013e37` | everywhere | sidebar · table header rows · primary buttons · stat top rails · headings · numerals |
| Butter `#ffefb3` | all text | sidebar accent · table header text · sidebar active rail |
| Badges | translucent washes on dark | **light pastels**, 1px matching border |

Sidebar keeps its green and is now the only dark surface: white wordmark, butter eyebrow at 70%,
nav idle `rgba(255,255,255,0.6)` → hover `rgba(255,255,255,0.06)` → active white on butter@12%
behind a 3px butter rail.

### Files

17 changed, every one under `src/app/admin/` or `src/app/login/`. Three needed no change and that
was confirmed by reading them: `icons.tsx` (all `currentColor`), `badges.tsx` (tone names only, so
six strings in `ui.tsx` recoloured every badge site-wide), and all five `actions.ts`.

### Two things that would have silently not worked

1. **`border-collapse` discards `border-radius` on cells.** The brief asks for rounded top corners
   on the header row; under the table's previous `border-collapse: collapse` they would simply
   never have rendered. `TableWrap` now uses `border-separate border-spacing-0` inside an
   `overflow-hidden rounded-xl` wrapper, with an inner `overflow-x-auto` so the table still scrolls
   without the page body scrolling.
2. **`Panel`'s `soft` prop no longer exists** — the light theme needs "optional coloured left rail"
   (`rail`) rather than "lighter shadow". The two call sites passing `soft` were updated; leaving
   them would have been a TypeScript error, which is how it was caught.

### Verification

- `pnpm tsc --noEmit` ✅ 0 errors
- `pnpm run build` ✅ **42/42 pages**
- Tailwind emission ✅ all 26 palette hexes plus `rounded-tl-xl`, `rounded-tr-xl`,
  `border-separate`, `border-spacing-0` present in the compiled CSS
- `vercel --prod` ✅ READY — `dpl_Hu7cKpA18kdSW7tD1rCtBjkuP1kS`
- Computed-colour test vs production ✅ **52/52**
- `ad-grants-readiness` ✅ **59/59**
- `site-audit` ✅ **127 passed + 1 flaky** (Zeffy third-party embed)
- Files outside admin/login ✅ **zero**

**The negative rules are assertions, not assumptions.** The suite sweeps the DOM and fails if any
element over 4000px² computes to `rgb(1,62,55)` outside the sidebar / `<th>` / buttons / links
(found none), and measures the relative luminance of every rounded bordered pill, failing on any
below 0.5 (found none). Those two checks are what actually encode "green is an accent, not a fill"
and "no dark badges anywhere" — keep them in any future restyle.

### Defect found while verifying — recorded, not fixed

`AdminForm` binds its submit handler on hydration. Clicking inside that window makes the browser
run the form's **native GET** submit: the field values land in the query string
(`/admin/promises/new/?title=…&status=active&…`) and **no record is created, with no error shown**.
Reproduced against production.

It predates this phase (the pattern dates from Phase 2) and the window is sub-second, but on a
product built to keep an accurate financial record, a submission that silently evaporates is the
same defect class as the 2026-08-14 forms that faked success. Fixing it is a behaviour change, and
this brief was explicitly a colour pass with "no interpretation" — so it is recorded here instead
of folded in. **Fix first in Phase 4:** disable the submit until hydration, or give the action a
no-JS `action=` path that redirects.

### Open items

1. **AdminForm hydration race** — new, highest value.
2. **Create and read only** — nothing in Requires Attention can be actioned.
3. Writes are admin-only (RLS).
4. `audit_log` actor spoofing via the REST API.
5. Total donations summed in JavaScript, not SQL.
6. Vercel Preview env vars unset.
7. `notepad supabase password.txt` still in the working tree.

- **Last updated:** 2026-08-15

## 2026-08-16 — FaithProof mega-build: Phases 3D, 4, 5, 6, 7, 8

Six phases in one autonomous session. FaithProof is now **feature complete** — an admin tool that
records and actions real financial events, and a public transparency site that publishes them.

### Phase 3D — final colour system

| Surface | Value |
| --- | --- |
| Page background | `#f0f0ef` warm light gray |
| Sidebar | `#013e37` deep green, butter text, 3px butter active rail, butter@50% icons |
| Stat cards | **`#ffefb3` butter**, 24px padding, green 32px/700 numerals, green 11px labels |
| The two Command Center panels | **`#013e37` deep green**, 28px padding, butter 17px headings |
| Every other card | `#ffffff` white, 12px radius, `rgba(0,0,0,0.07)` border, two-layer shadow |
| Table headers | `#013e37` with `#ffefb3` text, 11px uppercase, 11px rounded top corners |
| Badges | light pastels, unchanged from 3C |

Verified live by computed colour — **18/18**, including all four stated non-negotiables (page
`#f0f0ef`, butter stat cards, dark green panels, dark green sidebar).

### Phase 4 — status transitions + full CRUD

**The single largest functional gap in FaithProof is now closed.** From Phase 2 until today the
Command Center could report that a transaction was unconfirmed or a promise overdue, but nothing
could be acted on without editing the database by hand.

New: `[id]` detail pages and `[id]/edit` pages for all four entities, plus eight transitions —
confirm / reconcile / void, approve / disburse / cancel, mark in-progress / fulfilled / missed,
verify / unverify / toggle-public — and an inline proof-URL editor on promises. Rows and cards are
clickable.

Design decisions worth keeping:

- **Status is not editable from the edit forms.** Every status change goes through its own
  transition so it writes an audit entry with the correct verb. An edit form that could quietly
  flip `pending` to `confirmed` would let a change bypass the record entirely.
- **`applyTransition` reads the row before updating** and stores both old and new values in the
  audit entry, and only writes the entry *after* the update succeeds — a refused transition never
  leaves a log line claiming it happened.
- **Unverifying a document clears `verified_by` and `verified_at`.** Leaving a name attached would
  still credit someone with a check that no longer stands.
- **`ActionButton` stays disabled until hydration** and reports refusals in place rather than
  redirecting, so an RLS denial is explained instead of silently bouncing the user.

**The Phase 3C hydration defect is fixed.** `AdminForm`'s submit button is disabled until React
hydrates, closing the window in which a click performed a native GET and discarded the submission.

Verified live — **14/14**: all eight transitions land in the database with the right timestamps and
actor ids, all eight write distinct audit entries, row clicks navigate, and edit forms prefill.

### Phase 5 — settings

`005_settings_table.sql` (applied and verified). Four cards: read-only organization info, account
with Supabase password reset, five public-section toggles that save on flip, and three CSV exports.

Two notes:

- **A public SELECT policy was added beyond the brief.** With only the admin policy, a signed-out
  visitor reads zero rows from `settings` and *every* section of the public page would render as
  hidden. The values are booleans describing which sections are shown — nothing sensitive.
- **CSV export sets `Content-Disposition` client-side.** A server action is an RPC, not a route
  handler, so it cannot set response headers; the action returns the CSV string and the browser
  saves it via a Blob and the `download` attribute. Same filename, same result. The escaper also
  guards against CSV injection — a field starting `=` `+` `-` `@` is executed as a formula by Excel
  and Sheets, so those are prefixed.

### Phases 6 + 7 — public transparency pages

`/faithproof`: hero with three live counters, Accountability Pulse, Open Mission Ledger (paginated),
Promises vs Performance, Proof Vault, Nothing Hidden (programs-vs-overhead bar), and the donor
impact receipt form. `/faithproof/explorer`: fund / date-range / type filters via URL search params,
four summary pills, paginated results, and a per-fund in/out/net breakdown with proportional bars.

- **Brand tokens, not the brief's approximations.** The brief listed navy `#1B2A4A`, gold `#C8A951`,
  cream `#FAFAF5`; the live site's actual tokens are navy `#16243F`, gold `#C9A227`, cream
  `#FAF8F1`. The same brief said "match the existing public site aesthetic exactly", and those two
  instructions conflict. The real tokens were used — a transparency page rendered in a slightly
  different navy from every other page would read as broken, and the difference is invisible to
  anyone except a colour picker. Verified: the hero computes to `rgb(22, 36, 63)`.
- **Public queries filter explicitly as well as relying on RLS.** Belt and braces on the one surface
  where a loosened policy would be visible to donors.
- **Donor names are never selected** by any public query.
- Percentages degrade honestly: with nothing recorded the overhead rate is `0.0%`, not `NaN` or a
  misleading `100%`.

### Phase 8 — SEO, tests, polish

Sitemap now carries `/faithproof` (0.9) and `/faithproof/explorer` (0.8) at `changefreq: daily`;
NGO schema on the transparency page; five new Playwright tests; Public FaithProof Preview on the
dashboard; "Transparency" in the header nav between Events and Contact.

### Three corrections beyond the brief — each one load-bearing

1. **`/faithproof` was in `isInternalRoute`.** Phase 3 had put it there to strip chrome from admin
   routes. Left alone, the flagship public page would have rendered with no site header and no
   footer.
2. **`robots.txt` disallowed `/faithproof` and the sitemap excluded it.** The page would have been
   built, deployed, linked from the nav — and uncrawlable. Both reversed. And because both pages are
   `force-dynamic` they never appear in the static manifest next-sitemap reads, so they had to be
   added through `additionalPaths`; without that they were silently missing from a sitemap that
   otherwise looked correct.
3. **`settings` needed a public read policy** (above).

Each of these would have shipped as a working build with a broken outcome. None was visible from
TypeScript or the build log.

### Verification

| Gate | Result |
| --- | --- |
| `pnpm tsc --noEmit` | ✅ 0 errors |
| `pnpm run build` | ✅ **45/45 pages** |
| `vercel --prod` | ✅ READY — `dpl_G9LJdRJp2c34nkCeRN1E3DYLtPaS` |
| Phase 3D colour, vs production | ✅ **18/18** |
| Phase 4 transitions, vs production | ✅ **14/14** |
| Phases 5–7 end-to-end, vs production | ✅ **25/25** |
| `ad-grants-readiness` | ✅ **64/64** (59 + 5 new) |
| `site-audit` | ✅ **135 passed + 1 flaky** (known rotating newsletter timing flake) |
| Database after testing | ✅ 0 rows in all six data tables; 5 settings rows; only the real admin account |

The 25-check run proved the whole chain: seed public transactions, a fulfilled promise and a
verified document → the public page shows `$10,000.00` confirmed gifts, `$7,000.00` program spend,
a computed `12.5%` overhead rate, the ledger rows, the Kept promise and the verified document →
the explorer filters correctly by type and fund → a settings toggle flips the database and the
corresponding section disappears from the public page.

### Open items

1. **No real data yet.** Every figure on `/faithproof` is legitimately zero until the first
   transactions are entered. The tests assert that sections *render*, never that a number has a
   particular value, so they stay valid once real data lands.
2. **Google for Nonprofits + Ad Grants applications** — organizational, not code.
3. **Vercel Preview env vars still unset** — Preview deploys 500 until added.
4. **Donor impact receipt automation.** The form collects requests and emails them; issuing the
   receipts is still manual.
5. **`audit_log` actor spoofing via the REST API** remains possible for an authenticated user.
6. **Total donations is summed in JavaScript**, not SQL.
7. **`notepad supabase password.txt`** still holds the live DB password in the working tree.

- **Last updated:** 2026-08-16

## 2026-08-16 — Homepage hero: broken scroll indicator removed

**What was asked:** read `src/app/page.tsx`, find the scroll indicator (a mouse/oval shape with an
animated dot, absolutely positioned at the bottom of the hero), delete it entirely including its
wrapper, touch nothing else.

**Where it actually was.** `src/app/page.tsx` contains no scroll indicator. The homepage hero is
delegated to `<HeroVideo>`, and the cue lived in `src/components/HeroVideo.tsx`:

    {/* Scroll cue */}
    <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
      <span className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
        <span className="h-2 w-1 animate-float-slow rounded-full bg-green-light" />
      </span>
    </div>

That matched the description exactly — absolutely positioned at the bottom of the hero, an oval
outline (`h-10 w-6 rounded-full border-2`) with an animated dot inside (`animate-float-slow`). The
whole block including the wrapper `<div>` and its comment was deleted.

**Scope held.** One file changed, **7 lines removed, 0 added**. `src/app/page.tsx` is byte-identical
(`git diff` empty). `HeroVideo` is imported by the homepage and nowhere else — confirmed by grep —
so no other page loses a scroll cue. The `float-slow` keyframe in `tailwind.config.ts` was
deliberately **not** removed: it is a shared animation token and deleting it would reach outside the
requested change.

**Gates.** `pnpm tsc --noEmit` 0 errors · `pnpm run build` PASSED, 45/45 pages · `vercel --prod`
READY (`dpl_5fPXrA7Rbg5Gvv66uT9wiZ7r5G5W`).

**Verified live:** `animate-float-slow` appears **0 times** on the homepage, while "Opening the door
to", "homeownership", "Donate Now" and "Apply for Assistance" are all still present — the cue is
gone and the rest of the hero is untouched.

- **Last updated:** 2026-08-16

## 2026-08-16 — UI polish pass: admin background, stat cards, FaithProof section contrast

Three tasks in one pass. Everything below was verified on **live production by computed colour** —
**39/39** — not by reading the diff.

### Task 1 — admin

| Problem | Fix |
| --- | --- |
| Page background too light | `#f0f0ef` → **`#e8e6e1`**, a genuinely medium warm gray |
| Stat cards pale peach | **`#ffefb3` butter**, inline style, 3px `#013e37` top rail, 24px padding, 12px radius, shadow `0 2px 8px rgba(1,62,55,0.15), 0 1px 3px rgba(0,0,0,0.1)` |
| Sub-pages | Background is set in `layout.tsx` and **inherited**, so it was fixed there only |
| White cards too flat | Shadow → `0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)` on cards, tables and forms |
| `/new` forms invisible | Form wrapper → white, 12px radius, 32px padding, the shadow above, `1px solid rgba(0,0,0,0.08)` |

Stat card internals: number `#013e37` 32px/700, label 11px/600 uppercase `0.08em` at **opacity 0.7**,
icon `#013e37` at **opacity 0.25**. No Tailwind `bg-` class anywhere on these cards — the div carries
`style={{ backgroundColor: '#ffefb3', ... }}` directly.

**Where the changes actually went.** The brief pointed at `admin/page.tsx` for the stat cards, but
the four cards are rendered through the shared `StatCard` in `_components/ui.tsx`, whose surface
comes from `statCardStyle` in `_components/theme.ts`. `StatCard` is used **only** by the dashboard —
confirmed by grep — so editing it changes exactly those four divs and nothing else. Same reasoning
for the card and form shadows: they live in `cardStyle` / `tableStyle` / `formCardStyle`, so one edit
each covers every white card across the admin area. Duplicating the literal styles into ten page
files would have produced the same pixels and ten places to drift.

**Sub-page backgrounds: fixed in one place, verified in seven.** The brief allowed either. The
background is inherited from `layout.tsx`, so that is the only file changed — and each of
`/admin/transactions`, `/vouchers`, `/promises`, `/proof-vault`, `/audit-log`, `/settings` and
`/transactions/new` was then checked individually on production to confirm it actually resolves to
`rgb(232, 230, 225)`.

### Task 2 — FaithProof public page

Section tones now alternate strictly, top to bottom:

| Section | Tone |
| --- | --- |
| Hero | navy `#16243F` |
| Accountability Pulse | warm gray `#f0ede6` |
| Open Mission Ledger | white `#ffffff` |
| Promises vs Performance | warm gray `#f0ede6` |
| Proof Vault | white `#ffffff` |
| Nothing Hidden | navy `#16243F` — untouched, as instructed |
| Donor Impact Receipts | warm gray `#f0ede6` |

**"No two adjacent sections share a background" is enforced as an assertion**, not an eyeball: the
verification reads all seven computed backgrounds in document order and fails if any equals its
predecessor.

Cards: Pulse cards white with a 3px `#C9A227` gold top rail, 32px/24px padding, layered shadow,
navy 32px/700 number and `#6b7280` 11px uppercase label. Ledger wrapper white / 12px radius /
`0 2px 8px rgba(0,0,0,0.07)` / hairline border, with a navy header row in gold 11px uppercase at
12px 16px padding. Promise cards and document cards carry their specified values.

### Task 3 — scroll indicator

**Already removed in the previous action** and re-verified here: `animate-float-slow` appears 0 times
on the homepage, and the hero headline, subhead and both CTAs are intact. No further change was
needed, so none was made.

### Gates

- `pnpm tsc --noEmit` — 0 errors
- `pnpm run build` — PASSED, 45/45 pages
- `vercel --prod` — READY (`dpl_CEhUtqABQEXxPbYpYNL1UgfkugCd`)
- Live computed-colour verification — **39/39**
- Database untouched — 0 rows in all six data tables, 5 settings rows, only the real admin account

### Known interaction, not fixed

The alternation is correct for the current configuration, where all five public sections are
enabled. Sections render conditionally from the settings toggles, so disabling one can place two
same-tone sections adjacent — hiding the Open Mission Ledger, for instance, puts Accountability
Pulse directly above Promises and both are `#f0ede6`. Deriving each tone from the *rendered* order
rather than the authored order would make the rule hold under every combination. It was not built:
it was not asked for, and all five sections are currently on.

### Not changed, deliberately

`/login` still uses `#f0f0ef` for its page background. The brief scoped this pass to admin pages and
the FaithProof public page, and the login screen was not listed — so it was left alone rather than
swept in.

- **Last updated:** 2026-08-16
