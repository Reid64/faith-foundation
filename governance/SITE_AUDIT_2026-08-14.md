# FAITH Foundation — Full Site Audit

**Date:** 2026-08-14
**Target:** https://www.faithfoundationsf.org (live production)
**Tool:** Playwright 1.62.1 / Chromium 151, `scripts/site-audit.spec.ts`
**Command:** `npx playwright test scripts/site-audit.spec.ts --reporter=list`
**Purpose:** pre-submission check for the Google for Nonprofits application.

---

## FINAL RESULT

| | |
|---|---|
| Tests run | **128** |
| Passed | **128** |
| Failed | **0** |
| Skipped | **0** |
| Issues found | **4** (3 site defects, 1 documentation discrepancy) |
| Issues fixed | **3 of 3 site defects** |
| Final run | `128 passed (1.6m)` |

No test was skipped, disabled, or loosened to make it pass. Every fix was made
in the source and redeployed; the suite was then re-run end to end against
production.

---

## HOW THE FORM TESTS ARE WRITTEN (read this first)

The brief asked the form tests to "fill all fields, submit, verify success
state." **Written that way, all four form tests would have passed while the
forms were completely broken.** Every form on this site is a client component
that can render a "thank you" panel without sending anything anywhere — and
three of them were doing exactly that.

So each form test asserts two things, not one:

1. the success state renders, **and**
2. an actual outbound `mailto:` was dispatched **containing the submitted data**.

Playwright surfaces `mailto:` navigations through `page.on("request")`, which is
what makes (2) checkable. This is the difference between an audit that certifies
the site and an audit that certifies the appearance of the site.

---

## ISSUES FOUND AND FIXED

### ISSUE 1 — Contact, Volunteer, and Apply forms silently destroyed every submission. **[FIXED]**

**Severity: critical.** All three forms had an identical handler:

```js
event.preventDefault();
setSubmitted(true);
```

`preventDefault()` stopped the browser's native submission, and nothing replaced
it. No endpoint, no storage, no network call. The visitor was shown an
affirmative success message for something that never happened.

The **Apply** form is the most serious of the three. It collects household size,
number of children, approximate monthly income, employment status, and current
housing status — including options like *"Facing eviction"* and *"Currently
unhoused"* — from people in active housing crisis. It then displayed
**"Application received … A caseworker will review your information and contact
you within three business days."** No application was ever received. Anyone who
applied through this site and waited for a callback waited for nothing.

**Fix.** A shared helper (`src/lib/mailto.ts`) now builds a labelled message and
hands it to the visitor's mail client, addressed to `info@faithfoundationsf.org`
— the address already published in the footer and on the contact page. Applied
to all three forms plus the footer newsletter, which was converted from its own
inline copy of the same logic so there is now one implementation.

**Second defect found in the Apply form while fixing the first.** It is a
four-step wizard that *unmounts* each step when you move off it, so those inputs
leave the DOM entirely. Reading the form at submit time would have captured only
step 4 (the consent checkbox) — steps 1–3 would have been lost even after the
mailto fix. Answers are now captured into component state on every step change
and merged at submit. The same change fixes a pre-existing usability bug: the
**Back** button used to wipe everything already typed, because remounted inputs
came back empty. They now repopulate.

**Success copy corrected.** With a mailto the message is a *draft* until the
visitor presses send, so the old copy was still false. All three now say the
mail app has opened, instruct the visitor to press send, and give the phone
number as a fallback. The Apply heading changed from "Application received" to
"One last step to send your application", and offers to take the application
over the phone instead.

### ISSUE 2 — Broken hero image on the Veterans program page. **[FIXED]**

The `/programs/veterans/` hero pointed at a hotlinked Unsplash photo
(`photo-1541252260730-0412e8e2108e`) that had been **removed upstream and was
returning 404**. This is the full-bleed background of the page hero, so the
page's most prominent visual was blank.

All 25 IDs in `src/lib/images.ts` were checked; this was the only dead one.
Replaced with a verified-live photo of a veteran saluting at a community
ceremony — visually inspected before use to confirm it is appropriate and
weapons-free — and annotated in the catalog with why it changed.

**Root cause not fully closed:** the site hotlinks a third-party CDN for hero
imagery, so this can recur at any time without warning. Recommendation below.

### ISSUE 3 — Two defects in the audit spec itself. **[FIXED]**

Recorded for completeness, since a wrong test is as misleading as a wrong page.
An unscoped `footer` locator matched two elements (a testimonial card on the
homepage also uses a `<footer>` tag), and the internal-link sanity floor was set
one above the site's actual link count, which masked the real assertion behind a
threshold failure. Both corrected; neither indicated a site problem.

### ISSUE 4 — "Apply for Assistance" routes to `/apply`, not `/contact`. **[NOT A DEFECT — brief was mistaken]**

The brief asked to verify that every "Apply for Assistance" button routes to
`/contact`. It does not — it routes to `/apply`, which is a real, working page
containing the application form. Routing it to `/contact` would be a regression,
so this was **not** "fixed". The test instead records where every apply/contact
CTA points and asserts each reaches a working page. Observed targets:

```
/                → /apply/
/                → /apply/
/programs/       → /contact/
/programs/       → /apply/
/contact/        → /apply/
/apply/          → /apply/
```

All resolve with HTTP 200.

---

## TEST INVENTORY — 128 tests, all passing

### PAGES (69 tests — 23 routes × 3 checks)

For each of the 23 public routes: **HTTP 200**, **no uncaught exceptions or
same-origin console errors**, **no same-origin resource ≥ 400**, **no image that
failed to decode**, **self-referencing canonical on the www host**, and **header
logo present and decoded**.

`/` · `/about/` · `/team/` · `/programs/` · `/impact/` · `/events/` ·
`/contact/` · `/donate/` · `/apply/` · `/volunteer/` · `/blog/` · `/news/` ·
`/faq/` · `/financial-transparency/` · `/governance/` ·
`/governance/donor-privacy/` · `/privacy-policy/` · `/programs/housing-voucher/` ·
`/programs/homeownership/` · `/programs/veterans/` · `/programs/recovery/` ·
`/programs/reentry/` · `/programs/cornerstone-communities/`

> Console-error scope is deliberately narrow: uncaught exceptions always count,
> but console errors count only when they originate from our own origin.
> Third-party embeds (Zeffy → Stripe/hCaptcha/PayPal, and the Google Maps iframe
> on `/contact`) log from their own origins and are neither our bugs nor ours to
> fix. Counting them would make the audit permanently red and uninformative.
> **PASS status here means our code is clean, not that every third-party embed
> is silent.**

### REDIRECTS (6 tests — 3 routes × 2 checks)

`/programs/emergency`, `/programs/financial-literacy`, `/programs/single-parents`
each return **HTTP 308** with a `Location` pointing at `/programs`, and each
resolves in a real browser to `/programs/` with a 200.

### FORMS (27 tests)

| Test | Result |
|---|---|
| Contact form — fills 5 fields, submits, shows success, **dispatches mailto containing the entered data** | PASS |
| Volunteer form — fills 5 fields, submits, shows success, **dispatches mailto containing the entered data** | PASS |
| Apply form — completes all 4 steps, consents, submits, shows success, **dispatches mailto containing the entered data** | PASS |
| Cornerstone land inquiry — renders a `/contact` button, **contains no `<form>`**, and the page contains **zero** occurrences of "formspree" | PASS |
| Footer newsletter — fill, submit, success state, **mailto dispatched with the address** — tested on **all 23 pages**, not a sample | 23 PASS |

### NAVIGATION (14 tests)

Header links Programs / Impact / Events / Contact / Team each click through to
the correct route; header **Donate** → `/donate/`; logo returns to `/`.
**About dropdown**: opens on hover, sets `aria-expanded="true"`, exposes all four
sub-links, and closes after the pointer leaves (120 ms timer); About Us,
Financial Transparency, and Governance each click through correctly.
**Mobile** (390×844): hamburger opens and exposes all nine links; a mobile link
navigates. **Every footer link resolves** (all 23+ hrefs fetched, none ≥ 400).

### BUTTONS (5 tests)

- **Every internal link across the whole site resolves** — every `href^="/"` on
  all 23 pages collected, deduped, and fetched. Zero returned ≥ 400.
- All donate-labelled CTAs across 5 key pages point at `/donate`.
- Apply/contact CTAs all reach working pages (see Issue 4).
- Every CTA on all 6 program pages resolves.
- **Zeffy embed** mounts on `/donate` and the embed URL is reachable. The embed
  is intentionally lazy (IntersectionObserver + manual fallback button), so the
  test scrolls to it the way a donor would rather than expecting it on load.

### CONTENT (7 tests)

| Check | Result |
|---|---|
| Zero occurrences of "Bright Box" across all 23 pages | PASS |
| Zero occurrences of "Emergency Bridge Housing" across all 23 pages | PASS |
| Zero occurrences of "rental assistance" on `/`, `/programs/`, `/financial-transparency/` | PASS |
| "Financial Literacy" / "Single Parent" absent from header and footer text **and** hrefs | PASS |
| StatCounter reaches **100%**, not 0%, after scrolling into view | PASS |
| `google-site-verification` meta tag present on the homepage | PASS |
| `robots.txt` 200 with a `Sitemap:` pointer; `sitemap.xml` 200 with exactly 23 URLs and no `icon.png` | PASS |

---

## GOOGLE FOR NONPROFITS READINESS

**Every technical item in the brief passes.** No broken links, no 404s, no
console errors from our code, no broken images, correct canonicals sitewide, a
valid sitemap and robots.txt, the verification tag in place, working redirects,
and no retired-program or private-benefit language anywhere on the site.

**One judgment call belongs to the organization, not to this audit.** All four
forms now route through the visitor's mail client rather than a server, because
the site is a static export with no backend. That is a genuine improvement over
silently destroying submissions, and it fails *visibly* (an unsent draft) rather
than invisibly. But it is not intake infrastructure:

1. It depends on the visitor having a working mail client. If none is
   configured, nothing opens — the copy now warns about this and gives the phone
   number, but the outcome is still a lost lead.
2. It requires the visitor to press send. A draft is not a submission.
3. Nothing is stored or tracked. There is no application queue, no newsletter
   list, no unsubscribe mechanism.

For a housing nonprofit whose Apply form is the front door for families in
crisis, a real intake path is the highest-value remaining work.

**Recommendations, in priority order:**

1. **Replace mailto with a real form endpoint** (Formspree, Basin, Netlify
   Forms, or a small serverless function). This is the one item that materially
   affects the organization's ability to serve people.
2. **Self-host hero imagery.** Issue 2 was a third-party CDN deleting a photo out
   from under a live program page. Every remaining Unsplash hotlink carries the
   same risk.
3. **Wire the newsletter to a real list provider** with double opt-in and
   unsubscribe, or remove the signup until one exists.
4. **Run this audit before each deploy** — `npx playwright test
   scripts/site-audit.spec.ts` — so regressions surface before the public does.

**Bottom line:** the site is technically sound and I found no defect that should
block the Google for Nonprofits submission. The mailto-based intake is a
disclosed stopgap, not a hidden one, and should be replaced on its own timeline.

---

## FILES CHANGED IN THIS AUDIT

| File | Change |
|---|---|
| `src/lib/mailto.ts` | **NEW.** Shared mailto builder/dispatcher with the rationale and limits documented in-file. |
| `src/app/contact/ContactForm.tsx` | No-op handler → mailto dispatch; success copy corrected to "press send". |
| `src/app/volunteer/VolunteerForm.tsx` | No-op handler → mailto dispatch; success copy corrected. |
| `src/app/apply/ApplicationForm.tsx` | No-op handler → mailto dispatch; cross-step answer capture added (steps 1–3 were being lost); Back no longer wipes entries; success copy corrected from the false "Application received". |
| `src/components/SiteFooter.tsx` | Inline mailto logic replaced with the shared helper. |
| `src/lib/images.ts` | Dead `veteran` photo id replaced with a verified-live one, annotated. |
| `scripts/site-audit.spec.ts` | **NEW.** The 128-test audit suite. |
| `playwright.config.ts` | **NEW.** Targets production by default; `AUDIT_BASE_URL` overrides. |
| `package.json` | `@playwright/test` added as a devDependency. |
| `tsconfig.json` | `scripts` and `playwright.config.ts` excluded from the Next build's typecheck. |

**Build:** `pnpm run build` — compiled successfully, 0 TypeScript errors, 31/31
static pages, exit 0. Only the pre-existing `@next/next/no-img-element`
warnings; none new.
**Deploy:** `vercel --prod` — `dpl_9jkWenHBzMkLVXDnke6Cv4PJw8gB` READY, target
production, aliased to https://www.faithfoundationsf.org.
