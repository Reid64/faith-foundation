# Google Ad Grants Readiness Audit & Remediation Report

**Site:** https://www.faithfoundationsf.org
**Organization:** FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope
**501(c)(3) EIN:** 33-2640449
**Date:** 2026-08-15
**Scope:** Full remediation pass — credibility, Ad Grants policy, accessibility, technical SEO, structured data, performance, security, privacy.

---

## Executive summary

The site began this pass at roughly 87/100 readiness. It was already well built:
clean information architecture, real leadership bios, genuine programs, a working
donation handoff, no analytics or tracking cruft, and no thin pages. The problems
were not structural. They were **credibility inconsistencies** — places where the
site described outcomes that had not happened, and where two pages disagreed with
each other about the same fact.

The most serious findings were not the one the brief flagged. The homepage
"Maria & David — Down Payment Voucher recipients" testimonial was real and is
fixed. But the News page was worse: it carried an article dated 18 April 2026
announcing that FAITH Foundation **had published** its first annual impact
summary, describing "how many families we served" — while the Events page
scheduled that same publication for **24 November 2026**, and the Impact page
stated the organization had no completed outcomes. Three pages, three
incompatible claims about the same event. A reviewer who read the site in order
would have caught it.

Everything found has been fixed in code and deployed. The site now:

- makes no claim of a completed beneficiary outcome anywhere;
- labels every illustrative scenario as illustrative, in the eyebrow, the body,
  and the caption;
- scopes every "100%" claim to designated gifts, consistently, on all nine pages
  that make one;
- separates **verified results**, **targets**, and **illustrations** into three
  explicitly numbered sections on the Impact page;
- scores **100 Accessibility / 100 Best Practices / 100 SEO** on mobile
  Lighthouse across all seven audited pages, with Performance 91–99;
- passes a new 59-test automated readiness suite that encodes every one of these
  invariants so they cannot silently regress.

**Final estimated readiness score: 96/100.** The four points withheld are not
website defects — they are external verifications this pass could not perform
(IRS address of record, Goodstack profile, Formsubmit mailbox activation, and
current financial filings). They are enumerated in
`governance/OPERATOR_ACTIONS.md` and summarized at the end of this report.

---

## Original risks found

Ordered by how badly each would have damaged a review.

### Critical — credibility

| # | Finding | Location |
| --- | --- | --- |
| C1 | **News claimed a milestone the Events page scheduled for the future.** "FAITH Foundation Publishes Its Annual Impact Summary" (18 Apr 2026) described past-tense results — "how many families we served, how down payment assistance vouchers were distributed" — while `/events` scheduled that publication for 24 Nov 2026 and `/impact` said no outcomes existed. | `src/app/news/page.tsx` |
| C2 | **News claimed volunteer momentum that had not occurred.** "The response from neighbors wanting to serve has been humbling… Beginning this spring, we are hosting a monthly orientation" — while `/events` listed the **first** orientation as 11 Oct 2026, still in the future. | `src/app/news/page.tsx` |
| C3 | **Homepage presented an unverified testimonial as a real beneficiary.** "Maria & David — Down Payment Voucher recipients", with a first-person quote about owning "the home we used to rent". No evidence in the repository that these are real, consenting beneficiaries. | `src/app/page.tsx` |
| C4 | **Impact page's stories read as case histories despite an "illustrative" header.** "James (name changed) served his country… Today he has stable housing and is mentoring other veterans" — past tense, with an attributed quotation. The disclaimer sat above; the story below contradicted it. | `src/app/impact/page.tsx` |
| C5 | **Impact page meta description claimed delivered outcomes**: "down payment vouchers funded, families served, dollars stewarded, and neighbors who became owners." This is what Google indexes. | `src/app/impact/page.tsx` |
| C6 | **Blog described an active financial-literacy program that had been retired**, with staff who do not exist: "Our financial-literacy coaches", "In our financial-literacy program, we meet families", "nearly every family we coach". | `src/app/blog/page.tsx` |
| C7 | **Cornerstone Communities read as an operating program for several screens** before disclosing, far down the page, "We are not yet operating a Cornerstone Community." | `src/app/programs/cornerstone-communities/page.tsx`, `src/app/programs/page.tsx` |
| C8 | **A citation attributed a claim to Bankrate but linked to `apfreg.com`**, an unrelated third-party blog. Misattribution regardless of intent. | `src/app/about/page.tsx` |
| C9 | **FAQ and Financial Transparency asserted grant funding and an established corporate partner roster** ("Our corporate partners include homebuilders who…") that a newly established organization is unlikely to have. | `src/app/faq/page.tsx`, `src/app/financial-transparency/page.tsx` |

### High — financial claims

| # | Finding | Location |
| --- | --- | --- |
| F1 | **Donate contradicted Financial Transparency.** Donate: "Every donation is tax-deductible and **goes directly toward down payment assistance vouchers**." Financial Transparency: administrative operations are funded through separately designated operational support. Both cannot be true. | `src/app/donate/page.tsx` |
| F2 | Five different phrasings of the same 100% claim across nine pages, none identical, several unscoped. | 9 files |
| F3 | **Governance claimed "administrative costs minimal"** — an unsupportable claim for an organization with no completed financial year. | `src/app/governance/page.tsx` |
| F4 | Donation tier descriptions ("$25 helps cover…") implied per-gift accounting. | `src/app/donate/page.tsx` |
| F5 | Zeffy embed said "100% of your gift reaches FAITH Foundation" without explaining the optional-tip model that makes it true. | `src/components/ZeffyEmbed.tsx` |

### High — policy, trust and technical

| # | Finding | Location |
| --- | --- | --- |
| P1 | **Four placeholder social links** pointed at `facebook.com`, `instagram.com`, `linkedin.com`, `youtube.com` — the platforms' own home pages, not FAITH Foundation profiles. Irrelevant outbound links on every page of the site. | `src/components/SiteFooter.tsx` |
| P2 | **Mojibake in the site title**, live in every page `<title>`, `og:title`, `twitter:title` and the schema `legalName`: "FAITH Foundation **â€"** Foundation for Affordable…". | `src/app/layout.tsx` |
| P3 | **Privacy Policy did not match site behaviour** — it described analytics and cookies the site does not use, and omitted **Formsubmit**, the third party that actually receives every form submission including household income and housing status. | `src/app/privacy-policy/page.tsx` |
| P4 | **Collapsed mobile menu was a keyboard trap.** `max-h-0` hid it visually but left all ten links in the tab order. | `src/components/SiteHeader.tsx` |
| P5 | **No skip link.** With a fixed header overlay, keyboard users tabbed the entire nav on every route. | `src/app/layout.tsx` |
| P6 | About dropdown had no `aria-haspopup`/`aria-controls` and could not be dismissed with Escape. | `src/components/SiteHeader.tsx` |
| P7 | **No security headers at all** — no HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, or `Permissions-Policy`. | `vercel.json` |
| P8 | Schema `taxID` contained the label `"EIN: 33-2640449"` inside a machine-readable identifier field; no `logo`, no `ContactPoint`, no `WebSite` node. | `src/app/layout.tsx` |
| P9 | **407 KB PNG logo loaded in the footer of every page** while a 22 KB WebP of the same mark already existed. | `src/components/SiteFooter.tsx` |
| P10 | All photography served as 2000px JPEGs regardless of device — Lighthouse mobile measured 426 KiB oversized + 201 KiB format waste on `/about/` alone, LCP 4.4 s. | `src/lib/images.ts` |
| P11 | NAR citation pointed at a URL that 301-redirects (`/blogs/` → `/news/`). | `src/app/page.tsx` |
| P12 | Sensitive application form had no privacy disclosure and no non-web alternative. | `src/app/apply/ApplicationForm.tsx` |

### Checked and found already correct

Recording these so the next audit does not re-litigate them: no legacy **Weir, Texas**
address anywhere in source, build output, or config; no WordPress artifacts;
single consistent ZIP (78611) and phone (888-497-6620) across all 27 pages; no
thin pages (lowest real page is 368 words, and it is the Contact page); exactly
one `<h1>` per page; no analytics or tracking scripts; only two external link
destinations site-wide; sitemap correctly excludes the three retired program
routes, which 308-redirect rather than 404; `StatCounter` SSR fix intact; Events
page honest (future dates only, no fabricated history); Team page consistent and
detailed.

---

## Every change made

### 1. Credibility and impact reporting

**`src/app/page.tsx`** — Replaced the "Maria & David" testimonial with a section
headed **"Illustrative Family Story"**. It now describes the outcome the programs
are designed to produce, states in the body that it is "an example of the families
FAITH Foundation is designed to serve, not an account of a past recipient", and
links to `/impact`. Added a source comment forbidding reintroduction of a named
recipient without verified consent. Fixed the NAR citation to its non-redirecting
URL.

**`src/app/impact/page.tsx`** — Restructured into three explicitly numbered
sections that a reader cannot conflate:

- **Section 1 of 3 — Verified Results To Date.** New. States plainly: *"FAITH
  Foundation is in its initial program implementation stage and has no completed
  beneficiary outcomes to report yet."* Names what *has* been achieved (501(c)(3)
  recognition, programs built, board seated) and what has not (no families-served
  figures, no dollars-distributed figures, no testimonials). Links to the
  committed 24 Nov 2026 reporting date.
- **Section 2 of 3 — Targets & Standards.** The existing counters, relabelled as
  goals, with "not a claim of results already delivered" in bold.
- **Section 3 of 3 — Illustrative Examples.** The two stories rewritten with no
  named individuals and **no attributed quotations**, each carrying an
  "Illustrative scenario" badge and closing with an explicit "This describes the
  intended outcome of the program, not a past case."

Also rewrote the meta description (which previously claimed delivered outcomes)
and added a file-level comment documenting the three-section rule.

**`src/app/news/page.tsx`** — Rewrote all three articles so none claims an
unachieved milestone, and all three agree with `/events`:

- "…Publishes Its Annual Impact Summary" → **"We Will Publish Our First Annual
  Impact Summary in November 2026"**, matching the Events date and committing to
  report shortfalls.
- "New Monthly Volunteer Orientations Announced" → **"Our First Volunteer
  Orientation Is Scheduled for October 11, 2026"**, matching the Events date.
- "Community Donations Grow… Housing Fund" → **"How Community Giving Funds Our
  Down Payment Assistance"**, an explainer rather than a growth claim.

Added a standing disclosure that these are the organization's own announcements
and **"not press coverage"**, and a file-level credibility rule for future edits.

**`src/app/blog/page.tsx`** — Removed the retired financial-literacy program and
its non-existent coaching staff. The budgeting article is now general educational
guidance, states that FAITH Foundation refers families to HUD-approved
counseling partners rather than counselling them directly, and carries a
not-financial-advice line. Softened two other posts from asserted present
practice to designed intent.

**`src/app/programs/cornerstone-communities/page.tsx`** and
**`src/app/programs/page.tsx`** — Moved the "not yet operating" disclosure to the
**top** of the Cornerstone page as a visible badge, and labelled it "A planned
program, not yet operating" in the programs index.

**`src/app/about/page.tsx`** — Corrected the misattributed citation.

### 2. Donation and "100%" claim normalization

One formulation is now used everywhere:

> **100% of every gift designated for down payment assistance is used to support
> the program for which it was designated.**

with the paired disclosure that gifts designated for operational support fund
administration. Applied across `page.tsx`, `donate/page.tsx`,
`financial-transparency/page.tsx`, `impact/page.tsx`, `faq/page.tsx`,
`governance/page.tsx`, and `ZeffyEmbed.tsx`.

- **Donate hero** — the direct contradiction with Financial Transparency is gone.
- **Donate tiers** — added: the descriptions "are examples of how gifts are put
  to work, not a per-donation accounting."
- **Governance** — the unsupportable "administrative costs minimal" claim replaced
  with the designated-gift separation the board actually maintains.
- **Zeffy** — now explains *why* the full gift arrives (Zeffy charges nonprofits
  no platform fee) and discloses that the optional tip Zeffy requests is not part
  of the donation to FAITH Foundation.
- **FAQ / Financial Transparency** — funding answers no longer assert grants or an
  established partner roster; they describe the partnership model being built and
  state the intent to pursue grants.

### 3. Address and organizational identity

No address change was made — none was warranted. The Burnet address is already
used consistently in all 13 locations and no legacy address exists in the
repository. What was added:

- **Footer** now carries `EIN 33-2640449 · Headquarters: Burnet, Texas` on every
  page.
- **Financial Transparency** gained a plain-language identity block: legal name,
  tax status, EIN, and current headquarters as a definition list.
- **`governance/OPERATOR_ACTIONS.md`** created — documents that the IRS address of
  record must be independently checked and, if stale, corrected via Form 8822-B
  *before* applying, and explicitly instructs **not** to change the website to
  match a stale IRS record.

### 4. Financial Transparency page

Added a "What being new means for these disclosures" section stating that no
audited financial statement or published Form 990 exists yet, and that the
organization would rather say so than imply a reporting history it does not have.
Reframed the outcomes commitment around the committed 24 Nov 2026 publication
date.

### 5. Privacy policy accuracy

Rewritten to match observed behaviour rather than a generic template:

- Removed claims of first-party analytics and cookies — **the site has neither**.
- Named every actual processor: **Vercel** (hosting/server logs), **Formsubmit**
  (receives all form submissions), **Zeffy** (donations), **Google** (Contact page
  map embed).
- Disclosed explicitly that housing-application data — household size, income,
  employment, housing status — **passes through Formsubmit** before reaching the
  Foundation, and offered a phone alternative.
- Section 1 now enumerates exactly what the application asks for and why.

### 6. Accessibility

- **Skip link** added as the first focusable element on every page.
- `<main id="main-content">` landmark added as its target.
- **Mobile menu keyboard trap fixed** — collapsed state now uses `invisible` plus
  `aria-hidden`, removing the ten links from the tab order rather than merely
  hiding them.
- **Escape** closes both the mobile menu and the About dropdown.
- `aria-haspopup`, `aria-controls` added to the About trigger; `aria-controls` to
  the mobile menu button.
- Apply form: privacy disclosure, and `autoComplete`/`inputMode` on name, email
  and phone for mobile usability.
- Social icon links (if re-enabled) now carry descriptive labels and focus rings.

### 7. Structured data

- `@type` widened to `["NGO", "NonprofitOrganization"]` with a stable `@id`.
- `taxID` corrected from `"EIN: 33-2640449"` to the bare `"33-2640449"`.
- Added `logo` (ImageObject), `image`, `naics`, and **two `ContactPoint` entries**
  (general enquiries, housing applications).
- `areaServed` upgraded from a string to a typed `State`.
- **New `WebSite` node** linked to the organization by `@id`.
- `sameAs` deliberately **absent** — no verified public profiles exist. A test
  now fails if `sameAs` is ever populated with a bare platform home page.
- Existing `FAQPage` schema verified valid (17 entries).

### 8. Technical SEO

- **Mojibake eliminated** from the site title, OG/Twitter titles and schema
  `legalName`. Verified at byte level, not by eye.
- Citation redirect chain removed (`nar.realtor/blogs/` → `/news/`).
- Canonicals verified unique and self-referential across all 23 public routes.
- robots.txt, sitemap (23 entries, retired routes excluded, all www-canonical),
  OG/Twitter metadata verified on every critical page.

### 9. Performance

| Change | Effect |
| --- | --- |
| Footer logo PNG → WebP | 407 KB → 22 KB on **every page** |
| 25 catalogue photos → WebP @1600px | 9.59 MB → 2.50 MB (−74%) |
| 3 brand home photos → WebP @1200px | 725 KB → 458 KB (−37%) |
| `home-evening` **kept as JPEG** | every WebP encoding came out larger |
| JPEG originals moved out of `public/` | deployment 31 MB → 21 MB |
| `fetchPriority="high"` on six hero images | faster LCP |
| Long-lived immutable cache headers on `/photos`, `/Images`, `/videos` | repeat-visit cost |

New `scripts/optimize-photos.js` makes this reproducible and idempotent, and
**refuses to ship a re-encode that is larger than the original** — the guard that
caught `home-evening`.

### 10. Security

Added to `vercel.json`: `Strict-Transport-Security` (2 years, preload),
`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(camera/mic/geolocation denied, payment scoped to Zeffy),
`Cross-Origin-Opener-Policy`, `X-DNS-Prefetch-Control`.

**No Content-Security-Policy was set, deliberately.** The Zeffy embed loads
Stripe, PayPal, hCaptcha and Amplitude at runtime; a CSP that missed any one
would silently break the donation flow. Documented in `OPERATOR_ACTIONS.md` with
a report-only rollout path.

### 11. Automated readiness suite

**`scripts/ad-grants-readiness.spec.ts`** — 59 tests, run against the deployed
site rather than the source tree, because the deployment is what gets reviewed.
Covers: all 23 routes return usable, non-thin pages with unique canonicals and no
accidental `noindex`; forbidden-text guards (placeholder copy, "coming soon",
retired program names, "Bright Box", WordPress artifacts, Unsplash hotlinks,
Google-approval claims, Ad Grants entitlement claims); NAP consistency and a
guard against any non-headquarters ZIP; credibility guardrails (no unlabelled
testimonial, three-section Impact page, designated-gift phrasing, News/Events
agreement); no empty/`#`/`javascript:` hrefs, no insecure `http://` links; every
internal link resolves; no broken images; every image has `alt`; robots.txt,
sitemap and canonical validation; schema truthfulness including the `sameAs`
guard; skip-link, mobile-menu tab-order, Escape-to-close, landmark and form-label
checks; security headers; a secret-scanner over the shipped JS bundle; and
verification that the donation handoff points at Zeffy over HTTPS.

Added npm scripts: `audit:readiness`, `audit:site`, `audit:forms`, `audit:all`,
`optimize:photos`.

---

## Files changed

**Content and credibility (12):** `src/app/page.tsx`, `impact/page.tsx`,
`news/page.tsx`, `blog/page.tsx`, `donate/page.tsx`, `about/page.tsx`,
`faq/page.tsx`, `financial-transparency/page.tsx`, `governance/page.tsx`,
`privacy-policy/page.tsx`, `programs/page.tsx`,
`programs/cornerstone-communities/page.tsx`

**Components (4):** `SiteHeader.tsx`, `SiteFooter.tsx`, `ZeffyEmbed.tsx`,
`apply/ApplicationForm.tsx`

**Infrastructure (5):** `src/app/layout.tsx`, `src/lib/images.ts`,
`src/lib/media.ts`, `vercel.json`, `package.json`

**Also touched for hero priority (4):** `apply/page.tsx`, `team/page.tsx`,
`faq/page.tsx`, `financial-transparency/page.tsx`

**New (4):** `scripts/ad-grants-readiness.spec.ts`, `scripts/optimize-photos.js`,
`governance/OPERATOR_ACTIONS.md`, `GOOGLE_AD_GRANTS_READINESS_AUDIT.md`

**Test harness (1):** `scripts/site-audit.spec.ts` — documented the FORMS
concurrency constraint.

**Assets:** 28 WebP files generated in `public/photos`; 29 JPEG originals moved to
`assets/photo-originals/` (outside the deployed directory).

*Note: `ContactForm.tsx`, `VolunteerForm.tsx`, `src/lib/web3forms.ts`,
`FormErrorNotice.tsx` and `.env.example` also show as modified — those are from
the earlier Formsubmit migration in this session, not this remediation pass.*

---

## Broken links repaired

| Issue | Resolution |
| --- | --- |
| 4 placeholder social links to platform home pages | Removed; re-enable instructions left in code |
| "Bankrate" citation → `apfreg.com` | Repointed to NAR |
| NAR citation 301 redirect chain | Repointed to final URL |

**Full crawl result:** every internal link on all critical pages resolves; zero
empty `href`s; zero `#` destinations; zero `javascript:` links; zero insecure
`http://` links; zero broken images; zero 404s across all 23 routes. The three
retired program routes correctly 308-redirect.

---

## Forms tested

All four forms exercised end-to-end against production.

| Form | Required fields | Labels | Correct destination | Honest failure |
| --- | --- | --- | --- | --- |
| Contact | ✅ | ✅ | ✅ Formsubmit → info@ | ✅ |
| Volunteer | ✅ | ✅ | ✅ | ✅ |
| Housing Application (4-step) | ✅ | ✅ | ✅ all 4 steps transmitted | ✅ |
| Newsletter (footer, all pages) | ✅ | ✅ | ✅ | ✅ |
| Donation handoff (Zeffy) | n/a | ✅ iframe title | ✅ HTTPS to zeffy.com | n/a |

`site-audit.spec.ts` FORMS block: **27/27 passing** with `--workers=1`.

**Important harness note:** these tests make *real* submissions. Run in parallel,
27 arrive from one IP in seconds and Formsubmit rate-limits them, producing ~23
spurious failures that all pass serially. This is the third party protecting
itself, not a site defect. `pnpm run audit:site` now pins `--workers=1`, and the
constraint is documented in the spec so it is not mistaken for a regression.

**Security checks passed:** no secrets in the client bundle (scanned for Stripe
live/test keys, AWS keys, private keys, service-role tokens); no PII written to
console; honeypot present on all three main forms; success is reported only on a
confirmed accepted response, never optimistically.

**Limitation — cannot be verified from code:** Formsubmit requires a one-time
activation click in the `info@faithfoundationsf.org` mailbox before **any** form
delivers. Until then the site correctly shows an error and offers an email
fallback rather than faking success. See operator item 6.

---

## Performance results

Mobile Lighthouse (default throttling), against production, after remediation:

| Page | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 91 | 100 | 100 | 100 | 3.1 s | 0 | 160 ms |
| About | 93 | 100 | 100 | 100 | 2.4 s | 0 | 250 ms |
| Programs | 95 | 100 | 100 | 100 | 2.9 s | 0 | 90 ms |
| Donate | 96 | 100 | 100 | 100 | 2.8 s | 0 | 80 ms |
| Apply | 98 | 100 | 100 | 100 | 2.4 s | 0 | 30 ms |
| Contact | 99 | 100 | 100 | 100 | 2.1 s | 0 | 60 ms |
| Financial Transparency | 97 | 100 | 100 | 100 | 2.5 s | 0 | 60 ms |
| **Average** | **96** | **100** | **100** | **100** | — | **0** | — |

Desktop homepage: **99 / 100 / 100 / 100**.

**All four targets met on every page** (Performance ≥90, Accessibility ≥95, Best
Practices ≥95, SEO ≥95). Before remediation, About was 81 and Home 85; CLS was
already 0 and remains 0.

**Remaining headroom, disclosed:** the homepage carries a 1.5 MB hero video
(`hero-720p.mp4`), ~70% of that page's weight. The `HeroVideo` component already
handles it well — poster paints first as a high-priority image, and the video
source is attached only after first paint on `requestIdleCallback`. Re-encoding
it smaller would likely push the homepage into the mid-90s, but Playwright's
bundled ffmpeg is a minimal build without H.264 support, so it could not be done
safely here. It is a brand asset; re-encoding is an operator decision, not a
defect.

---

## Accessibility results

**Lighthouse Accessibility: 100/100 on all seven audited pages.**

Fixed: keyboard trap in the collapsed mobile menu; missing skip link; missing
`main` landmark target; missing `aria-haspopup`/`aria-controls`; no
Escape-to-dismiss; unlabelled social links; missing mobile autocomplete hints.

Verified already correct: global `:focus-visible` ring; `prefers-reduced-motion`
honoured; exactly one `<h1>` per page; `lang="en"`; every image has `alt`
(decorative images correctly `alt=""` + `aria-hidden`); every form control has an
associated label; `main` landmark present and unique; touch targets meet size
minimums; no buttons implemented as divs.

Automated coverage for all of the above is in the readiness suite so it cannot
regress silently.

---

## Technical SEO results

All verified against production:

- **robots.txt** — present, `User-agent: *` allow, `Sitemap:` directive, no
  site-wide disallow.
- **sitemap.xml** — 23 URLs, all on the canonical `www` host, retired routes
  excluded.
- **Canonicals** — present, unique and self-referential on all 23 routes.
- **www/non-www** — apex 308-redirects to `www`; canonicals, sitemap and schema
  all agree on `www`.
- **Trailing slashes** — consistent (`trailingSlash: true`).
- **HTTPS** — enforced; no insecure links anywhere.
- **Indexability** — no accidental `noindex` on any public route.
- **Metadata** — unique title and description ≥50 chars on every page; OG and
  Twitter tags complete.
- **Mojibake** — eliminated and byte-verified.
- **Redirect chains** — the one found (NAR) removed.
- **Orphan pages** — none; every public route is linked from navigation or footer.
- **WordPress artifacts** — zero, in source and in build output.
- **External links** — only two destinations site-wide; no excessive linking.
- **PDFs** — one (IRS determination letter, 121 KB, resolves); no page is
  primarily a PDF.

---

## Schema results

Validated by parsing the served JSON-LD and asserting field-by-field:

- `NGO` + `NonprofitOrganization`, `@id`-anchored — valid JSON, parses cleanly.
- Truthful and cross-checked against the site: name, legal name, URL,
  `taxID` 33-2640449, telephone, email, full `PostalAddress`, `logo`,
  `areaServed` (Texas), two `ContactPoint` entries.
- `WebSite` node linked to the organization.
- `BreadcrumbList` present.
- `FAQPage` on `/faq/` with 17 entries.
- No stale or conflicting nodes; `sameAs` correctly absent.

---

## Items that could NOT be independently verified

Stated plainly, because a report that implies otherwise is worse than no report:

1. **Whether the IRS holds the current Burnet address.** The repository contains
   no evidence either way, and no external registry was queried.
2. **Whether the Goodstack verification profile exists or is current.**
3. **Whether the Zeffy campaign is live and deposits correctly.** Only the embed
   code and its HTTPS destination were verified.
4. **Whether Formsubmit has been activated.** Until it is, no form delivers.
5. **Whether the published board roster matches current governing documents.**
   Internal consistency across the site was verified; external accuracy was not.
6. **Whether the linked IRS determination letter is the current document**, and
   whether required annual returns have been filed.
7. **Whether FAITH Foundation controls any social media profiles.** None were
   found, so none are claimed.
8. **Real-user performance.** All Lighthouse figures are lab data from one
   location; field data (CrUX) was not available for this domain.

---

## REQUIRED HUMAN ACTION BEFORE GOOGLE FOR NONPROFITS APPLICATION

Full detail, including exact steps, is in **`governance/OPERATOR_ACTIONS.md`**.

| # | Action | Status | Blocking? |
| --- | --- | --- | --- |
| 1 | **Verify the IRS address of record** for EIN 33-2640449 at IRS Tax Exempt Organization Search. If it is not the Burnet address, file **Form 8822-B** and allow up to 60 days. Then correct Candid/GuideStar and ProPublica mirrors. **Do not change the website to match a stale IRS record.** | ❌ Not verified | **Likely blocking** |
| 2 | **Check the Goodstack profile** (Google's verification partner) — legal name, EIN, address, website, and an email on the organization's own domain must match items 1 and 3. | ❌ Not verified | **Likely blocking** |
| 3 | **Complete the Google for Nonprofits application** using the exact same details, and the **www** form of the domain. | ❌ Not started | **Yes, at submission** |
| 4 | **Activate Formsubmit** — submit the contact form once, then click the activation link emailed to `info@faithfoundationsf.org`. **No form delivers until this is done.** No redeploy needed. | ❌ Not done | **Yes — forms are dead until then** |
| 5 | **Confirm board/officer information** matches current governing documents and the latest IRS filing. | ⚠️ Internally consistent only | Possibly |
| 6 | **Test a live donation** through Zeffy; confirm deposit account and that receipts carry the correct legal name and EIN. | ⚠️ Embed verified only | No, but donations may fail |
| 7 | **Confirm financial records** — that the linked determination letter is current, that the required annual return has been filed, and that someone can honour the site's promise that financial summaries are "available on request". | ❌ Not verified | Possibly |
| 8 | **Beneficiary testimonials** — obtain and retain written consent before any real testimonial is published. Source-code comments enforce this rule at the two locations where one would go. | ✅ Site is safe as-is | No |
| 9 | **Social profiles** — if real accounts exist or are created, add them to `SOCIALS` in `SiteFooter.tsx` **and** `sameAs` in the schema. | ✅ Removed pending real accounts | No |
| 10 | **Content Security Policy** — optional. Roll out in `Report-Only` mode, complete a test donation, review violations, then enforce. | ⚠️ Deliberately not set | No |

---

## Final estimated Google Ad Grants website readiness score

# 96 / 100

**Basis for the score.**

| Dimension | Assessment |
| --- | --- |
| Mission, programs, who is served | Clear, specific, substantive on every page |
| Original content depth | 27 pages, none thin, no filler added |
| Truthfulness of claims | Every unsupported claim found was removed or scoped |
| Financial claim consistency | One formulation, applied everywhere |
| Transparency and governance | Exemplary for an organization this young |
| Contact, privacy, donor privacy | Complete and accurate to actual behaviour |
| Navigation and link health | Zero broken links, zero placeholders |
| Accessibility | 100/100 on all audited pages |
| Technical SEO | 100/100 on all audited pages |
| Performance (mobile) | 91–99, average 96 |
| Security | Headers set; no secrets; HTTPS enforced |
| Structured data | Complete, truthful, validated |

**Why not higher.** The remaining four points are withheld for things a website
cannot fix about itself:

- **−2** Formsubmit activation is outstanding, so **the forms do not currently
  deliver**. A reviewer who submits the contact form will hit an error state.
  This is the single highest-value item on the list and takes about two minutes.
- **−1** External verification chain (IRS address, Goodstack profile, financial
  filings) is unverified. Any mismatch there causes rejection regardless of site
  quality.
- **−1** The organization has no completed outcomes, no published Form 990, and
  no verified social presence. The site now handles this with unusual honesty —
  which is the right answer, and reviewers respond well to it — but it is still
  less evidence than an established nonprofit presents.

Once item 4 is done and items 1–3 are confirmed, this site should present as a
credible, transparent, technically strong nonprofit website that withstands close
scrutiny from Google reviewers, donors, grantmakers and the public.

---

## How to re-verify

```bash
pnpm run build          # 0 TypeScript errors, 31/31 static pages
pnpm run audit:readiness # 59 Ad Grants readiness tests against production
pnpm run audit:site      # 128 site audit tests (pinned to --workers=1)
pnpm run optimize:photos # idempotent; regenerates the WebP catalogue
```

**Verified at time of writing:** build clean; `audit:readiness` **59/59 passing**;
`audit:site` FORMS block **27/27 passing** serially; mobile Lighthouse as tabled
above.
