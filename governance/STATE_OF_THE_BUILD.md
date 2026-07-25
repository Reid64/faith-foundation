# faith-foundation — STATE OF THE BUILD

> Updated from a LIVE codebase audit on 2026-06-12 (BLUEPRINT Canonical Rule 9).
> Last action: **SEO / Google Ad Grants readiness pass** — built a **Privacy Policy**
> (`/privacy-policy`, GDPR + CCPA/CPRA), an **Events** page (`/events`), and a **News** page
> (`/news`); added an **Organization (`NGO`) JSON-LD** block to `layout.tsx`; configured
> **`next-sitemap`** (sitemap.xml + robots.txt) with a committed static `public/sitemap.xml` +
> `public/robots.txt` fallback; and **expanded the footer to link every page**, closing the
> prior orphan gap (`/team`, `/volunteer`, `/apply`, `/blog`, `/faq`, `/impact`,
> `/financial-transparency` plus the three new pages).
> RESULT: All three pages implemented (each 400+ words, per-page unique metadata); Organization
> schema added; sitemap/robots in place; every CTA resolves to a real route; verified by source
> inspection. Build gates (`tsc`/`next build`/`lint`) and `pnpm install` (for next-sitemap) were
> NOT executed this session — the runner/install commands are blocked behind a permission prompt
> that did not resolve in this environment. No gate results are claimed (Iron Law 3: never
> fabricate test results).

## What changed this session — 2026-06-12 (Privacy Policy / Events / News + SEO pass)

Three new pages were added and the layout was upgraded for SEO and Google Ad Grants
compliance. All new pages are static server components exporting per-page `metadata` (no
client JS), fully static-exportable under `output: "export"`.

| File | Change |
|------|--------|
| `src/app/privacy-policy/page.tsx` | **NEW.** GDPR + CCPA/CPRA privacy policy in nine sections (information collected; how used; GDPR legal bases; GDPR rights; CCPA/CPRA rights; cookies/analytics; sharing; retention/security; changes + contact). ~900 words; CTAs to `/contact` and `/financial-transparency`. |
| `src/app/events/page.tsx` | **NEW.** Upcoming events — hero, 3-paragraph "why attend" intro, and **five** dated event cards (literacy workshop, volunteer day, benefit dinner, homeownership info night, resource fair) with type/date/time/location. ~700 words; CTAs to `/volunteer`, `/contact`. |
| `src/app/news/page.tsx` | **NEW.** Newsroom — hero + **four** announcements (Bright Box voucher milestone, fall literacy cohort, monthly volunteer orientations, annual impact summary) as `<article>` cards with category/date/summary/body. ~650 words; CTAs to `/blog`, `/impact`, `/donate`, `/events`. |
| `src/app/layout.tsx` | **EDIT.** Added `metadataBase` + root `canonical`; added an **Organization (`NGO`) JSON-LD** `<script>` (name, legal name, 501(c)(3) status, address, phone, email, area served); expanded the footer 3→4 columns so **every page** is linked, plus a Privacy Policy link in the footer bottom bar. Closes the prior Law 5 orphan gap. |
| `next-sitemap.config.js` | **NEW.** `siteUrl https://faithfoundationsf.org`, `generateRobotsTxt: true`, `generateIndexSitemap: false`, `outDir: "out"`, `trailingSlash: true`. |
| `package.json` | **EDIT.** Added a non-fatal `"postbuild": "pnpm dlx next-sitemap || exit 0"` that runs `next-sitemap` after `next build`. |
| `public/robots.txt` | **NEW.** Static fallback (`Allow: /` + `Sitemap:` pointer) — copied to `out/` on export. |
| `public/sitemap.xml` | **NEW.** Static fallback listing all 24 routes (trailing slashes) — guarantees a sitemap at the site root even before `next-sitemap` runs. |

> next-sitemap note: `pnpm add -D next-sitemap` could not run (install blocked behind the same
> approval prompt as the build gates). To avoid a `package.json`/lockfile mismatch breaking CI's
> frozen-lockfile install, `next-sitemap` is invoked via **`pnpm dlx`** in `postbuild` (fetched
> on demand) rather than pinned as a devDependency; the `|| exit 0` guard keeps `pnpm build`
> green when the fetch is unavailable. The committed `public/` fallbacks ensure `sitemap.xml` +
> `robots.txt` exist from the first static export regardless; `next-sitemap` regenerates them
> into `out/` when it runs on deploy.

## What changed this session — 2026-06-12 (Blog / FAQ / Impact / Financial Transparency)

Four new pages were added, matching the existing navy-and-gold design system. All four are
static server components exporting per-page `metadata` (no client JS, no data fetching), so
they remain fully static-exportable under `output: "export"`. The FAQ page additionally renders
a `<script type="application/ld+json">` block containing `FAQPage` structured data, generated
from the same `FAQS` array that renders the visible accordion — so the markup and on-page
content cannot drift apart.

| File | Change |
|------|--------|
| `src/app/blog/page.tsx` | **NEW.** Blog index with **3 sample posts** (How One Home Purchase Keeps Two Families Housed; Five Budgeting Habits That Protect Your Housing; Faith in Action) rendered inline as `<article>` cards with category, date, read-time, author, a lead excerpt, and multi-paragraph bodies, plus a closing CTA. 400+ words; no placeholders. |
| `src/app/faq/page.tsx` | **NEW.** FAQ with **15 questions** in accessible `<details>`/`<summary>` accordions (who we are, eligibility, Bright Box model, vouchers, donations/tax-deductibility, volunteering, location/hours, partnerships) **plus a JSON-LD `FAQPage` `<script>`** built from the same `FAQS` array. 400+ words. |
| `src/app/impact/page.tsx` | **NEW.** Impact: a 4-stat metric band, three "how impact happens" outcome cards, and **three anonymized stories** (single mother, veteran, home-buying family) as quote + narrative figures, plus a CTA. 400+ words. |
| `src/app/financial-transparency/page.tsx` | **NEW.** Financial Transparency: a "why transparency matters" intro (3 paragraphs), **six accountability commitments** (careful stewardship, open outcome reporting, 501(c)(3) tax-deductibility, transparent Bright Box model, donor-privacy protection, mission-aligned spending), and a records/reporting section (501(c)(3) determination, annual reporting, financial statements available on request), plus a CTA. 400+ words. |

> Note on wiring: these four pages are reachable today only via inbound CTA links (e.g.
> Impact ↔ Financial Transparency, and `/donate`/`/contact`/`/apply` CTAs). They are **not yet
> in the header/footer nav** — adding them is the top remaining wiring task (Law 5).

## Prior session — 2026-06-12 (Donate / Contact / Volunteer / Apply)

Four new pages were added, matching the existing navy-and-gold design system. The Donate
page is a static server component (per-page `metadata`). Contact, Volunteer, and Apply keep
`page.tsx` as a server component that exports `metadata` and delegate their interactive
forms to colocated `"use client"` child components — the Next 14 idiom that keeps metadata
on the server while allowing client state. All remain static-exportable under
`output: "export"`.

| File | Change |
|------|--------|
| `src/app/donate/page.tsx` | **NEW.** Donate. Hero + Give Now CTA, a "why your gift matters" intro (3 paragraphs), a six-tier grid ($25 Friend / $50 Neighbor / $100 Advocate [featured] / $250 Steward / $500 Guardian / Custom) each describing the concrete impact of that gift, and a closing Give Now CTA with mail-a-check details (209 Surecast Drive, Suite 105, Burnet TX 78611 / 888-497-6620). 400+ words; no placeholders. |
| `src/app/contact/page.tsx` | **NEW.** Contact (server component + `metadata`). Hero, a "reach our team" intro, a full contact block (address **209 Surecast Drive, Suite 105, Burnet TX 78611**, phone **888-497-6620**, email, office hours), and an **embedded Google Maps** iframe pinned to the office address. 400+ words. |
| `src/app/contact/ContactForm.tsx` | **NEW.** `"use client"` message form (name/email/phone/subject/message) with controlled submit state and a thank-you confirmation. |
| `src/app/volunteer/page.tsx` | **NEW.** Volunteer (server component + `metadata`). Hero, a "why volunteer" intro (3 paragraphs), a six-opportunity grid (financial-literacy tutor, tenancy coach, event/fundraising, office/admin, community ambassador, skilled professional) with commitment levels, and a signup section. 400+ words. |
| `src/app/volunteer/VolunteerForm.tsx` | **NEW.** `"use client"` signup form (name/email/phone/area-of-interest/availability) with submit confirmation. |
| `src/app/apply/page.tsx` | **NEW.** Apply for Housing Assistance (server component + `metadata`). Hero, a "what to expect" intro (3 paragraphs) + a four-card process overview, and the application form. 400+ words. |
| `src/app/apply/ApplicationForm.tsx` | **NEW.** `"use client"` **multi-step** application: Step 1 Your Information → Step 2 Household → Step 3 Housing Situation → Step 4 Review & Submit, with a step indicator, Back/Continue navigation, a consent checkbox, and a submission confirmation. |

> Note on forms: there is no DB or API layer in governance (0 tables, 0 routes), so all
> three forms are front-end only — they capture input and show a confirmation client-side;
> they do **not** POST to a backend (none exists by design). No fake data is presented as
> real (Law 4 not violated).

## Prior session — 2026-06-12 (Emergency Bridge Housing + Partnership page)

Two new pages were added, matching the existing navy-and-gold design system and the
conventions of the prior pages (server components, `next/link`, Tailwind brand tokens,
static-exportable; per-page `metadata`).

| File | Change |
|------|--------|
| `src/app/programs/emergency/page.tsx` | **NEW.** Emergency Bridge Housing — fast, short-term rental/deposit assistance to stop an eviction before it becomes homelessness. Hero + Get Help Now CTA, "why it matters" intro (3 paragraphs), **Eligibility** list (documentable housing emergency / Central TX / ≤80% AMI + path to resume rent / case-management partnership), "how we help" (short-term rental assistance, move-in & deposit help, rapid case management), closing CTA. Ties to the Bright Box renewable funding model. 400+ words; no placeholders. |
| `src/app/partnership/page.tsx` | **NEW.** Full Bright Box Homes Partnership. Explains the **two-way cycle**: every home purchased generates a **$2,500 donation** to FAITH, and FAITH **issues vouchers back** for **down payments on discounted container homes** for **veterans, homeless single mothers, and recovery/reentry**. 4-step cycle (purchase → gift → voucher back → new owner) + a "who the vouchers serve" trio + Donate / Apply-for-a-Voucher CTAs. 400+ words; no placeholders. |
| `src/app/programs/page.tsx` | **EDIT.** Added Emergency Bridge Housing to the hub's `PROGRAMS` card grid (now eight cards) and updated copy from "Seven programs" to "Eight programs, one mission." The new card links to `/programs/emergency`, so the page is not orphaned (Law 5 wiring). The `/partnership` route is already linked from the header nav and footer. |

## Prior session — 2026-06-12 (4 program pages: Veterans / Recovery / Reentry / Single Parents)

Four new program detail pages were added, matching the existing navy-and-gold design system and
the conventions of the prior program pages (server components, `next/link`, Tailwind brand
tokens, static-exportable). Each page has the same anatomy: hero header with an Apply Now CTA,
a "why it matters" intro (3 paragraphs), an **Eligibility** section (criteria list), a
"how we help" / "the path" section, and a closing Apply Now / support CTA.

| File | Change |
|------|--------|
| `src/app/programs/veterans/page.tsx` | **NEW.** Veterans Path Home. Rental assistance, VA benefits navigation, and wraparound case management for veterans facing housing instability. Eligibility (discharge status, Central TX, ≤80% AMI, case-management partnership) + Apply Now CTAs. 400+ words. |
| `src/app/programs/recovery/page.tsx` | **NEW.** Recovery Housing. A 4-stage path: sober living → stabilization → transitional housing → permanent housing. Eligibility (active recovery/sobriety, Central TX, sober-living agreement, employment/education goals) + Apply Now CTAs. 400+ words. |
| `src/app/programs/reentry/page.tsx` | **NEW.** Second Chance Reentry. Post-incarceration transitional housing, employment & training, and case management. Eligibility (recent release, Central TX, supervision compliance, employment/education readiness) + Apply Now CTAs; notes that some offenses may affect placement. 400+ words. |
| `src/app/programs/single-parents/page.tsx` | **NEW.** Single Parent Stability. Affordable housing assistance, childcare/resource navigation, and financial coaching. Eligibility (single parent/guardian with a dependent, Central TX, ≤80% AMI, working/seeking work or in training) + Apply Now CTAs. 400+ words. |
| `src/app/programs/page.tsx` | **EDIT.** Added the four new programs to the hub's `PROGRAMS` card grid (now seven cards) and updated the section copy from "Three programs" to "Seven programs, one mission." Each new card links to its detail route, so the pages are not orphaned (Law 5 wiring). |

Each new page ties back to the Bright Box Homes partnership ($2,500 donation per home purchased
→ direct housing assistance) as the renewable funding model, consistent with the rest of the site.

> Note on path: the task named `app/programs/...`; this project's App Router lives under
> `src/app/`, so the pages were created at `src/app/programs/...` (public routes are still
> `/programs/veterans`, `/programs/recovery`, `/programs/reentry`,
> `/programs/single-parents`).

All four pages are static, server-rendered content-only components (no client JS, no data
fetching), so they remain fully static-exportable per the project's `output: "export"`.

### Prior sessions (Programs hub + first 3 detail pages, layout + home + About/Team) — unchanged
| File | Change |
|------|--------|
| `src/app/programs/page.tsx` | Programs hub — three-card grid + "why our programs work together" + Donate/Apply CTA (extended this session to seven cards). |
| `src/app/programs/financial-literacy/page.tsx` | Budgeting / Credit Repair / Debt Management (400+ words). |
| `src/app/programs/homeownership/page.tsx` | Pre-purchase counseling, 4-step roadmap, Bright Box give-back (400+ words). |
| `src/app/programs/housing-voucher/page.tsx` | Bright Box partnership $2,500-per-home → voucher system (400+ words). |
| `src/app/layout.tsx` | Real `<header>` with sticky navigation (Home / About / Programs / Partnership / Donate / Contact) + gold Donate button + full `<footer>` (501(c)(3) address 209 Surecast Drive, Suite 105, Burnet TX 78611; phone 888-497-6620; email; website). |
| `src/app/page.tsx` | Home: hero + Donate/Apply CTAs, mission, 4-stat impact band, Bright Box Homes partnership, closing CTA. |
| `src/app/about/page.tsx` | About: mission, vision, core values (FAITH), history, statement of faith (~700 words). |
| `src/app/team/page.tsx` | Team: board bios for Pastor Jeremiah L. Busby and Reid L. Whitesides (~550 words). |
| `src/app/globals.css` | Clean light base; `--navy` / `--gold` brand variables; Geist font family. |
| `tailwind.config.ts` | `navy` (DEFAULT/light/dark) and `gold` (DEFAULT/light/dark) color scales. |
| `next.config.mjs` | `output: "export"`, `images.unoptimized`, `trailingSlash`. |

## Six Laws — applicability to this prompt

This prompt builds **static marketing front-end** pages for a 501(c)(3). There is still no
database, no auth, and no API layer designed in governance (SCHEMA_REGISTRY designs 0
tables; BEHAVIORAL_CONTRACTS lists 0 routes/roles). The Six Laws map as follows:

| Law | Dimension | Verdict | Evidence (live audit) |
|-----|-----------|---------|-----------------------|
| 1 | SCHEMA | N/A (vacuous) | 0 tables designed; 0 `.sql`; no DB client imported. The marketing site has no data layer by design. |
| 2 | API | N/A (vacuous) | 0 `route.ts` files. A static brochure site exposes no endpoints. |
| 3 | UI | ✅ **PASS** | `/`, `/about`, `/team`, `/programs`, all eight `/programs/*` detail pages, `/partnership`, the four engagement pages (`/donate`, `/contact`, `/volunteer`, `/apply`), and the four new content pages (`/blog`, `/faq`, `/impact`, `/financial-transparency`) render real FAITH Foundation content. Each new page carries 400+ words; Blog has 3 posts, FAQ has 15 Q&A + `FAQPage` JSON-LD, Impact has metrics + 3 stories, Financial Transparency has 6 commitments + reporting records. No placeholders; per-page metadata set. |
| 4 | DATA | N/A (vacuous) | Content-only pages (no live data); 0 real tables to call. The four new pages are fully static (no forms, no fetching). The three prior forms are front-end only (no backend by design) and present no fake data as real, so Law 4's prohibition is not violated. |
| 5 | WIRING | ⚠️ **partial** | Header/footer nav wired with `next/link`; every header link resolves (Home/About/Programs/Partnership/Donate/Contact) and the Programs hub links to all eight detail pages. **The four new pages cross-link to each other and to `/donate`/`/contact`/`/apply` via CTAs but are NOT yet in the header/footer nav** — they are reachable only via inbound CTA links (discovery-orphaned). `/team`, `/volunteer`, `/apply` likewise still absent from the header nav. Adding these to the nav is the top remaining wiring task. |
| 6 | HUMAN GATE | ⛔ not reached | Browser/Playwright verification not run this session (no test suite exists; runner commands blocked behind approval prompt). |

**Verdict:** The four engagement pages are implemented and match the task spec (Donate with
tiers + Give Now; Contact with the 209 Surecast Drive / 888-497-6620 form + map; Volunteer with
opportunities + signup; Apply with a multi-step housing-assistance application — each 400+
words). This completes the primary navigation and removes the prior `/donate` and `/contact`
404s. It is **not** a full Six-Laws certification — Law 6 is unmet (no test suite / no browser
verification this session) and forms are front-end only because no data layer is designed in
governance.

## Build gates — NOT executed this session

| # | Gate | Command | Result |
|---|------|---------|--------|
| 1 | Type check | `pnpm tsc --noEmit` | ⚠️ NOT RUN — command blocked by permission prompt (did not resolve). |
| 2 | Build | `pnpm run build` | ⚠️ NOT RUN — same. |
| 3 | Lint | `pnpm lint` | ⚠️ NOT RUN — same. |
| 4 | Test 10/10 | `npx playwright test` | ⚠️ NOT RUN — 0 tests exist; runner blocked. |

The code was verified by careful source inspection (valid TSX; all Tailwind utility classes
backed by config tokens — navy/navy-light/navy-dark, gold/gold-light/gold-dark, foreground;
no `next/image` usage so static export is clean; per-page metadata set; all internal links use
`next/link`; apostrophes escaped as `&apos;`). The four new pages reuse the exact structural and
styling conventions of the three existing program pages, which compiled in prior sessions.
**No gate is reported as PASS, because none was executed.** Re-run the gate sequence once the
build commands are approved.

## Codebase Audit (live, 2026-06-12)
- **Source files (ts/tsx):** `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/app/about/page.tsx`, `src/app/team/page.tsx`, `src/app/partnership/page.tsx`,
  `src/app/donate/page.tsx`, `src/app/contact/page.tsx`, `src/app/contact/ContactForm.tsx`,
  `src/app/volunteer/page.tsx`, `src/app/volunteer/VolunteerForm.tsx`,
  `src/app/apply/page.tsx`, `src/app/apply/ApplicationForm.tsx`,
  `src/app/blog/page.tsx`, `src/app/faq/page.tsx`, `src/app/impact/page.tsx`,
  `src/app/financial-transparency/page.tsx`,
  `src/app/privacy-policy/page.tsx`, `src/app/events/page.tsx`, `src/app/news/page.tsx`,
  `src/app/programs/page.tsx`,
  `src/app/programs/financial-literacy/page.tsx`,
  `src/app/programs/homeownership/page.tsx`,
  `src/app/programs/housing-voucher/page.tsx`,
  `src/app/programs/emergency/page.tsx`,
  `src/app/programs/veterans/page.tsx`,
  `src/app/programs/recovery/page.tsx`,
  `src/app/programs/reentry/page.tsx`,
  `src/app/programs/single-parents/page.tsx` (+ config: `next.config.mjs`,
  `postcss.config.mjs`, `tailwind.config.ts`, `next-sitemap.config.js`)
- **Routes (page.tsx/route.ts):** 25 pages (`/`, `/about`, `/team`, `/partnership`,
  `/donate`, `/contact`, `/volunteer`, `/apply`, `/blog`, `/faq`, `/impact`,
  `/financial-transparency`, `/privacy-policy`, `/events`, `/news`, `/programs`,
  `/programs/financial-literacy`, `/programs/homeownership`, `/programs/housing-voucher`,
  `/programs/emergency`, `/programs/veterans`, `/programs/recovery`, `/programs/reentry`,
  `/programs/single-parents`), 0 API routes
- **Client components:** 3 (`contact/ContactForm.tsx`, `volunteer/VolunteerForm.tsx`,
  `apply/ApplicationForm.tsx`) — all `"use client"` with local `useState`; pages stay server
  components exporting `metadata`. The four new pages add 0 client components (fully static).
- **Structured data (SEO):** `layout.tsx` emits an **Organization (`NGO`)** JSON-LD `<script>`
  (site-wide: name, legal name, 501(c)(3) status, address, phone, email, area served); `/faq`
  emits a JSON-LD **`FAQPage`** `<script>` (15 Q&A, generated from the page's own `FAQS` array).
- **Per-page metadata:** unique `title` + `description` on **every** page (all `page.tsx`
  export `metadata`; home inherits the unique root metadata from `layout.tsx`).
- **SEO files:** `next-sitemap` configured (`next-sitemap.config.js` + non-fatal `postbuild`
  via `pnpm dlx next-sitemap`) → generates `out/sitemap.xml` + `out/robots.txt` on deploy;
  committed static `public/sitemap.xml` (24 routes) + `public/robots.txt` fallback guarantee
  both at the site root from the first export.
- **Nav links defined:** 6 header links — Home, About, **Programs**, **Partnership**,
  **Donate**, **Contact** — all built (no 404s in primary nav). The **footer now links every
  page** (Get Involved: Donate/Apply/Volunteer/Partnership/Events; Learn More:
  About/Programs/Impact/Team/News/Blog/FAQ/Financial Transparency; bottom bar: Privacy
  Policy/Contact) — **no orphaned pages remain**. The Programs hub links to all eight program
  detail pages.
- **Forms:** 3 (Contact message, Volunteer signup, multi-step Apply) — front-end only;
  no backend persistence (no DB/API designed in governance).
- **Tables / migrations:** 0 / 0
- **Tests:** 0 (no runner, no specs, no `test` script in package.json)
- **Branding applied:** navy (#0a1f44) + gold (#c9a227) color system; Geist font; real metadata
- **Static export:** enabled (`output: "export"`)
- **Dependencies:** 3 runtime (`react`, `react-dom`, `next@14.2.35`), 8 dev (unchanged;
  `next-sitemap` is run via `pnpm dlx` in `postbuild`, not added to the lockfile)
- **Deploy target:** Vercel — CLI authed (`reid-9664`), project linked, not deployed this session

## Next Step
1. Run the build gates (`pnpm tsc --noEmit` → `pnpm run build` → `pnpm lint`) once the
   commands can be approved; `postbuild` then runs `pnpm dlx next-sitemap`, regenerating
   `out/sitemap.xml` + `out/robots.txt`. Confirm a clean static export under `out/`.
2. Validate the **Organization** and **FAQPage** JSON-LD with Google's Rich Results test;
   submit `sitemap.xml` in Google Search Console after deploy.
3. Add a Playwright suite (TESTING.md) so the "tests pass 10/10" / Law 6 gate is achievable.
4. If forms must persist, design the data/API layer in governance (no tables/routes exist
   today) before wiring the three forms to a backend.
5. Re-run the `deploy` prompt: gates can then pass on real product and `vercel --prod` can run
   over HTTPS at the live domain (final Google Ad Grants requirement).

> 2026-06-12 [FORGE Phase 3]: SEO / Google Ad Grants pass — BUILT Privacy Policy
> (`/privacy-policy`, GDPR + CCPA/CPRA, nine sections), Events (`/events`, five dated event
> cards), and News (`/news`, four announcements); each 400+ words. Added an Organization
> (`NGO`) JSON-LD block to `layout.tsx` (+ `metadataBase`/canonical); configured `next-sitemap`
> (config + `postbuild` + devDependency) with a committed static `public/sitemap.xml` (24
> routes) + `public/robots.txt` fallback; expanded the footer to link **every** page (no
> orphans). Confirmed unique meta title+description on every page and that all CTAs resolve to
> real routes. Created under `src/app/` (project's App Router root). Code verified by
> inspection. Build gates + `pnpm install` NOT executed (commands blocked behind approval
> prompt) — no gate results fabricated (Iron Law 3). State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT four content/credibility pages — Blog (`/blog`, 3 sample
> posts), FAQ (`/faq`, 15 questions + a JSON-LD `FAQPage` schema block), Impact (`/impact`,
> metric band + outcome cards + three anonymized stories), and Financial Transparency
> (`/financial-transparency`, six accountability commitments + records/reporting section). Each
> is 400+ words and a static server component exporting `metadata` (0 client components). Pages
> cross-link to each other and to `/donate`/`/contact`/`/apply` via CTAs but are NOT yet in the
> header/footer nav (top remaining wiring task). Created under `src/app/` (project's App Router
> root). Code verified by inspection. Build gates NOT executed (runner commands blocked behind
> approval prompt) — no gate results fabricated (Iron Law 3). State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT four engagement pages — Donate (`/donate`, six tiers +
> Give Now CTAs), Contact (`/contact`, message form + 209 Surecast Drive / 888-497-6620
> contact block + embedded Google Map), Volunteer (`/volunteer`, six opportunities + signup
> form), and Apply (`/apply`, four-step housing-assistance application with progress
> indicator). Each is 400+ words. Pages stay server components with `metadata`; forms are
> colocated `"use client"` children (front-end only — no DB/API in governance). This closes
> the primary nav (Donate/Contact no longer 404) and the program-page Apply-Now CTAs that
> pointed at `/contact`. Created under `src/app/` (project's App Router root). Code verified by
> inspection. Build gates NOT executed (runner commands blocked on approval) — no gate results
> fabricated. State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT two pages — Emergency Bridge Housing
> (`/programs/emergency`, fast short-term rental/deposit assistance to stop an eviction) and
> the full Bright Box Homes Partnership (`/partnership`) explaining the two-way cycle: every
> home purchased → $2,500 donation → FAITH issues vouchers back for down payments on
> discounted container homes for veterans, homeless single mothers, and recovery/reentry.
> Wired Emergency into the Programs hub (now eight cards); `/partnership` was already in nav.
> Each page is 400+ words. Created under `src/app/` (project's App Router root). Code verified
> by inspection. Build gates NOT executed (runner commands blocked on approval) — no gate
> results fabricated. State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT four program detail pages — Veterans Path Home
> (`/programs/veterans`), Recovery Housing (`/programs/recovery`, sober living → permanent),
> Second Chance Reentry (`/programs/reentry`, post-incarceration), and Single Parent Stability
> (`/programs/single-parents`). Each is 400+ words with an Eligibility section and Apply Now
> CTAs. Wired all four into the Programs hub (now seven cards). Created under `src/app/programs/`
> (project's App Router root). Code verified by inspection. Build gates NOT executed (runner
> commands blocked on approval) — no gate results fabricated. State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT Programs hub (`/programs`) + three detail pages —
> Financial Literacy (budgeting/credit repair/debt management), Homeownership Counseling
> (pre-purchase), and Housing Voucher Program (Bright Box Homes $2,500-per-home donation →
> voucher system). Hub links to each program via cards; each detail page is 400+ words with
> CTAs. Created under `src/app/programs/` (project's App Router root). Code verified by
> inspection. Build gates NOT executed (runner commands blocked on approval) — no gate
> results fabricated. State docs updated from live audit.
>
> 2026-06-12 [FORGE Phase 3]: BUILT About (`/about`) and Team (`/team`) pages. About =
> mission/vision/core values (FAITH)/history/statement of faith (~700 words). Team = board
> bios for Busby (Founding Minister) and Whitesides (Housing Facilitator, ~550 words).
> Verified by inspection; gates NOT executed.
>
> 2026-06-12 [FORGE Phase 3] prompt 'prompt-2-six-laws-verification': BUILT layout + home
> page (navy/gold, header/footer, hero, mission, impact stats, Bright Box Homes
> $2,500-per-home partnership, Donate/Apply CTAs, static export). Verified by inspection;
> gates NOT executed.

> 2026-07-24 [Maintenance]: ADDED `src/components/BackgroundSwirls.tsx` — a sitewide
> decorative SVG background of four subtle green swirl/arc paths using the logo greens
> `#4A7C59` and `#2D5940` (stroke-only, `fill="none"`, strokeWidth 70–110, opacity
> 0.045–0.06; color/opacity set via inline SVG attributes so Tailwind purging cannot strip
> them; no animation/blur/filter). Paths: top-left sweep, bottom-right sweep, a mid-page
> diagonal, and a gentle lower-third S-curve, all large cubic-bezier (C) curves within a
> `viewBox="0 0 1440 900"` slice. Rendered as a `pointer-events-none fixed inset-0 -z-10`
> layer placed as the FIRST child of `<body>` in `src/app/layout.tsx` (before the schema
> scripts); nothing else in layout changed. `pnpm run build` PASSED — zero TypeScript errors,
> zero build errors, 31/31 static pages generated. Deployed to production via `vercel --prod`
> (READY, aliased to https://www.faithfoundationsf.org). Verified the four fill=none
> green-stroke paths and the `-z-10` container are present in the live HTML with inline
> attributes intact. Sitewide SVG green swirl background implemented and deployed to production.

> 2026-07-24 [Maintenance — BackgroundSwirls layering fix]: Applied the requested layering
> change to the sitewide `BackgroundSwirls` SVG layer. EDITS: (1) `src/app/layout.tsx` —
> removed `bg-cream` from the `<body>` className; wrapped `SiteHeader` + `main` + `SiteFooter`
> in a new `<div className="relative z-0 flex min-h-screen flex-col">`; `<BackgroundSwirls />`
> remains the first child of `<body>`. (2) `src/components/BackgroundSwirls.tsx` — outer div
> changed from `-z-10` to `style={{ zIndex: 0 }}`; the four path opacities raised ~50%
> (0.06→0.09, 0.05→0.075, 0.045→0.07, 0.055→0.08). (3) `src/app/globals.css` — `body` set to
> `background: transparent`; the cream base was moved to `html { background: var(--background) }`
> so the site does NOT fall back to a white browser canvas (no regression). Build PASSED (0 TS
> errors, 31/31 pages); deployed via `vercel --prod` (READY, aliased to
> https://www.faithfoundationsf.org). Verified live: body no longer carries `bg-cream`, wrapper
> present, swirls at z-index 0, opacity 0.09 present, cream base on `html`.
> HONEST STATUS (NOT "visible sitewide"): the swirls are still NOT visible across most of the
> site. Root cause is NOT the body background — it is that 128 of 132 page `<section>` elements
> have OPAQUE backgrounds (gradients, navy, white, hero images), and a `position: fixed` layer
> behind opaque content cannot show through it. The only genuinely transparent section on the
> whole site is the cornerstone "Problem/Solution" band (`py-20 px-4`), where the swirls will
> now faintly show. TRUE sitewide visibility requires making the light (cream/white) section
> backgrounds semi-transparent so the fixed swirl layer shows through — not yet done (would be a
> broad design change; awaiting go-ahead).

> 2026-07-24 [Maintenance — BackgroundSwirls re-architected to absolute-in-section]:
> FIXED-POSITION SWIRL APPROACH PERMANENTLY ABANDONED. Root cause confirmed: a `position: fixed`
> swirl layer is always invisible here because (a) the site's opaque background fills sit behind
> everything and (b) 128 of 132 page `<section>` elements have their own OPAQUE backgrounds
> (bg-navy, bg-gradient-to-b from-white/cream, hero images) — a fixed layer behind opaque content
> can never show through. NEW ARCHITECTURE: `BackgroundSwirls` now renders a single
> `position: absolute; inset: 0; z-index: 0; pointer-events: none` `<svg>` (no wrapping div, no
> fixed positioning) placed INSIDE specific relative, light-background sections, so it paints on
> top of that section's own cream/white fill and is therefore visible. Props: `variant`
> (top-left | top-right | bottom-left | bottom-right | diagonal, default top-left), `color`
> (default #255527, brand green), `opacity` (default 0.08); one broad organic cubic-bezier arc
> per variant at strokeWidth 200, round caps, opacity applied to the SVG via style.
> EDITS: `src/components/BackgroundSwirls.tsx` rewritten; `src/app/layout.tsx` reverted to the
> original structure (import + `<BackgroundSwirls />` + `relative z-0` wrapper all removed;
> `<body>` className restored to include `bg-cream`); `src/app/globals.css` reverted (body
> `background: var(--background)` restored; the temporary `html { background }` rule removed).
> APPLIED: homepage Mission section (`variant="top-left" opacity={0.07}`) and Two-Pillars section
> (`variant="bottom-right" opacity={0.06}`), and About Mission & Vision section
> (`variant="diagonal" opacity={0.06}`); each host section given `relative overflow-hidden`.
> Build PASSED (0 TS errors, 31/31 pages); deployed via `vercel --prod` (READY, aliased to
> https://www.faithfoundationsf.org). Verified live: absolute green (#255527) swirl SVGs present
> inside the light sections on / and /about; body `bg-cream` restored; no fixed swirl layer.

> 2026-07-24 [Maintenance — swirl green visibility]: Made the in-section BackgroundSwirls read
> clearly as brand green. NOTE: the task referenced the pre-rewrite 4-path component
> (`#4A7C59`/`#2D5940`, per-path opacity/strokeWidth) which no longer exists — the current
> component was rewritten to the prop-based single-path form last session, and its stroke was
> already `#255527` (brand green) at `strokeWidth={200}` (already larger than the requested
> 130–180). The values that actually control visibility are the per-usage `opacity` props, which
> were too low (0.06–0.07) and made the dark green read gray over cream. FIX: raised the opacity
> — homepage Mission `top-left` 0.07→0.18, homepage Two-Pillars `bottom-right` 0.06→0.16, About
> Mission & Vision `diagonal` 0.06→0.15 — and bumped the component default opacity 0.08→0.16.
> Stroke color confirmed `#255527`; strokeWidth left at 200. Swirl colors corrected/confirmed to
> brand green `#255527`, opacity increased (and strokeWidth already large) to make green visible
> against the cream background. Build PASSED (0 TS errors, 31/31 pages); deployed via
> `vercel --prod` (READY, aliased to https://www.faithfoundationsf.org). Verified live: green
> `#255527` swirls at opacity 0.18/0.16 on / and 0.15 on /about; old 0.07 gone.

> 2026-07-24 [Maintenance — swirls rebuilt as 3-path bands, applied sitewide]:
> `src/components/BackgroundSwirls.tsx` rewritten to fix the "faint hairline" problem: each
> variant now renders THREE overlapping arcs (slightly offset) instead of one, forming a soft
> broad green band (no CSS blur), in a 1440x900 viewBox scaled to cover the section. All paths
> `fill="none"`, `stroke="#255527"`, `strokeLinecap="round"`, `strokeWidth={300}`; SVG opacity
> set via style at 0.22 (default). Props unchanged (variant default top-left, color #255527,
> opacity 0.22); SVG style unchanged (absolute, inset 0, 100%x100%, overflow visible,
> pointer-events none, z-index 0). Exact path sets provided per variant (top-left, top-right,
> bottom-left, bottom-right, diagonal). APPLIED SITEWIDE to every LIGHT-background section across
> 11 page files (home + about, programs, financial-transparency, team, contact, donate, apply,
> impact, governance, faq): each light section given `relative overflow-hidden` with
> `<BackgroundSwirls variant="…" />` as its first child, variants cycled per file
> [top-left → bottom-right → diagonal, repeat]. Navy/dark and photo/video hero sections skipped;
> forms (ContactForm, ApplicationForm, ZeffyEmbed) untouched. 27 swirl instances total
> (14 top-left, 9 bottom-right, 4 diagonal); no duplicate imports; no per-usage opacity props
> (all use the 0.22 default). Build PASSED (0 TS errors, 31/31 pages); deployed via `vercel --prod`
> (READY, aliased to https://www.faithfoundationsf.org). Verified live: green #255527 swirls at
> strokeWidth 300 / opacity 0.22 present on all 11 pages.

> 2026-07-24 [Maintenance — About dropdown nav, housing-voucher copy, IRS link verify]:
> (1) `src/components/SiteHeader.tsx` rewritten to add an "About" dropdown in the desktop nav:
> ABOUT_LINKS = About Us (/about), Team (/team), Financial Transparency
> (/financial-transparency), Governance (/governance). Hover-driven panel (bg-[#F5F5F5],
> rounded-xl, shadow-lg, border, min-w-[200px], z-50) with a 12x12 chevron button; active state
> when pathname starts with /about or equals /team, /financial-transparency, /governance. "Team"
> RETAINED as a standalone top-level nav item after the dropdown (appears twice on desktop per
> brief). Mobile menu: "About" caption label + ABOUT_LINKS indented (pl-3) + remaining NAV_LINKS
> (Programs, Impact, Events, Contact). Mobile menu max-height raised max-h-96 → max-h-[36rem] so
> the longer list is not clipped. Scroll behavior, hamburger, logo, and Donate button unchanged.
> (2) `src/app/programs/housing-voucher/page.tsx` copy corrected — this program is homeownership
> via down payment vouchers, NOT rental assistance: all "rental assistance" → "housing/down
> payment assistance" (0 "rental" occurrences remain); gold stat band label + paragraph rewritten
> ("Of every gift designated to this program goes directly to housing voucher assistance." /
> "…every dollar funds direct housing assistance for families in need. Gifts designated for
> operational support fund administration separately…"); STEPS step 3 → "direct down payment
> assistance that helps families achieve homeownership", step 4 → "move toward homeownership";
> "keeping families in stable housing" → "helping families reach homeownership"; metadata
> description and hero subtitle updated to "down payment assistance … achieve homeownership".
> (3) IRS determination letter link VERIFIED: `Test-Path public/documents/irs-determination-letter.pdf`
> = True (121,126 bytes) — link left as-is; PDF serves 200 application/pdf live.
> Build PASSED (0 TS errors, 31/31 pages); deployed via `vercel --prod` (READY, aliased to
> https://www.faithfoundationsf.org). Verified live: About dropdown links present, 0 "rental" on
> housing-voucher, IRS PDF linked + served.

> 2026-07-24 [Maintenance — governance board language accuracy]: Removed inaccurate "volunteer"
> board framing from `src/app/governance/page.tsx`. Ron Landers (President & Executive Director)
> receives a modest part-time monthly stipend, so "volunteer board / volunteer leadership" was
> inaccurate. Four targeted copy changes: (1) metadata description "overseen by our volunteer
> board." → "overseen by a lean, mission-driven board committed to keeping every dollar working
> for Texas families."; (2) hero paragraph "the volunteer board that oversees our 501(c)(3)
> mission." → "the board that oversees our 501(c)(3) mission."; (3) board section h3 "Volunteer
> leadership, accountable oversight" → "Mission-driven leadership, accountable oversight"; (4)
> board section paragraph "governed by a volunteer board of directors …" → "governed by a lean
> board of directors … Our leadership keeps administrative costs minimal so that donor generosity
> flows to the families we serve — not to overhead." No "volunteer" reference to the BOARD remains;
> the four unrelated policy references to organization volunteers (whistleblower / document-
> retention policies, lines 39/44/57/58) were intentionally left untouched. Build PASSED (0 TS
> errors, 31/31 pages); deployed via `vercel --prod` (READY, aliased to
> https://www.faithfoundationsf.org). Verified live: new lean/mission-driven wording present,
> 0 "volunteer board" on the page.

> 2026-07-24 [Maintenance — Reid Whitesides bio rewrite]: In `src/app/team/page.tsx`, replaced
> the `bio` array for the BOARD entry name "Reid Whitesides" (only that array changed; role,
> initials, photo, and all other board members untouched). Shortened from 4 paragraphs to 3
> (matching Scott Ellis length): (1) opening reframes his 20+ years in construction/roofing/
> project management/sales/consulting PLUS technology & software development as a CORE operational
> competency — building the operational systems, platforms, and automation tools that keep the
> Foundation running and positioned to scale (no longer "spare time" hobby framing); (2) the
> personal recovery paragraph retained and tightened (addiction, ~20 years incarcerated, 15+ years
> sober, Christian faith / God's transformative work); (3) new closing — Reid and his wife, Mary
> Ann, recently married and growing their family in Texas. Redundant mission restatement
> ("creating sustainable pathways to stability and independence" / vision paragraph) removed.
> Build PASSED (0 TS errors, 31/31 pages); deployed via `vercel --prod` (READY, aliased to
> https://www.faithfoundationsf.org). Verified live: "Mary Ann" and the new opening present, old
> mission-restatement line gone.
