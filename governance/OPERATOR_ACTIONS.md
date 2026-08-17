# OPERATOR ACTIONS — Required Before the Google for Nonprofits Application

**Last updated: 2026-08-16**

This file lists work that **cannot be completed from the codebase**. Every item
here requires a human with access to an external account, a legal record, or
knowledge the repository does not contain. Nothing in this file has been done by
an automated pass, and nothing here should be marked complete until the person
who performed it records the date and outcome below.

The website itself has been remediated — see
`GOOGLE_AD_GRANTS_READINESS_AUDIT.md` for what was changed and verified. The
items below are the remaining gap between a compliant website and an approved
Google for Nonprofits / Google Ad Grants account.

---

## 1. IRS address of record — HIGHEST PRIORITY

**Status: NOT VERIFIED. Requires human action.**

**The situation.** The website consistently states FAITH Foundation's
headquarters as:

> 209 Surecast Drive, Suite 105, Burnet, TX 78611

That address is now used in every public-facing location on the site — footer,
Contact page, FAQ, Donate (check-mailing address), Governance, Privacy Policy,
Donor Privacy Policy, Financial Transparency, and the `PostalAddress` in the
organization structured data. A repository-wide search confirms **no conflicting
legacy address appears anywhere in the codebase** — in particular, there is no
occurrence of a Weir, Texas address in any source file, content file, config,
build output, or governance document.

**What the codebase cannot tell you.** The repository contains no evidence about
what address the IRS currently holds. External IRS-derived records — including
IRS Tax Exempt Organization Search, IRS Business Master File extracts, and the
many third-party nonprofit databases that mirror them (GuideStar/Candid,
ProPublica Nonprofit Explorer, Charity Navigator) — may still show an older
address. **This has not been checked and must not be assumed either way.**

**Why it matters for this application.** Google for Nonprofits does not verify
nonprofits itself; it delegates verification to a third-party validation partner
(Goodstack, formerly Percent). That partner matches the organization details you
submit against public registry data derived from IRS records. If the address on
your application and website does not match the address in the registry data,
verification can be delayed or rejected — and the rejection reason is often
opaque.

**Required human action:**

1. Look up EIN **33-2640449** in IRS Tax Exempt Organization Search
   (https://apps.irs.gov/app/eos/) and record the address the IRS currently
   shows.
2. If it is not the Burnet address, file **IRS Form 8822-B** (Change of Address
   or Responsible Party — Business) to update the organization's address of
   record. Allow processing time; the IRS states this can take up to 60 days.
3. Check the same EIN on Candid/GuideStar and ProPublica Nonprofit Explorer and
   request corrections where those mirrors are stale.
4. Only after steps 1–3, submit the Google for Nonprofits application so the
   address you enter matches the registry.

**Do not change the address on the website** to match a stale IRS record. The
website should state where the organization actually operates. The fix direction
is to update the IRS record, not the site.

**Recorded outcome:** _(fill in — date checked, address found, action taken)_

---

## 2. Goodstack / nonprofit verification profile

**Status: NOT VERIFIED. Requires human action.**

Google for Nonprofits eligibility runs through Goodstack. Confirm that the
organization's Goodstack profile (if one already exists from a previous
application attempt) shows:

- Legal name matching IRS records
- EIN 33-2640449
- Current Burnet headquarters address (see item 1)
- Website `https://www.faithfoundationsf.org`
- A contact email at the organization's own domain

A mismatch between the Goodstack profile and either the IRS record or the
website is a common cause of verification failure.

**Recorded outcome:** _(fill in)_

---

## 3. Google for Nonprofits organization information

**Status: NOT VERIFIED. Requires human action.**

When completing the application, confirm the organization name, address, EIN,
and website URL exactly match items 1 and 2. Use the **www** form of the domain
(`https://www.faithfoundationsf.org`) — the apex domain 308-redirects to www,
and the canonical URLs, sitemap, and structured data all use www.

Also confirm the applicant's email is at the organization's domain rather than a
personal address.

**Recorded outcome:** _(fill in)_

---

## 4. Board and officer information

**Status: SITE IS INTERNALLY CONSISTENT — external accuracy NOT VERIFIED.**

The website presents four leaders on `/team` and a board on `/governance`:

| Name | Title as published |
| --- | --- |
| Ron Landers | President & Executive Director |
| Pastor Juan Valdez | Secretary & Protector |
| Scott Ellis | Treasurer & Board Chair |
| Reid Whitesides | Founder & Chief Strategy Officer |

These titles are used consistently across the site. **What cannot be verified
from the repository** is whether they match the organization's current governing
documents and most recent IRS filing. Before applying, confirm the published
roster matches the board of record, and that any officer who has joined or
departed is reflected on the site.

**Recorded outcome:** _(fill in)_

---

## 5. Donation processor information

**Status: PARTIALLY VERIFIED. Requires human confirmation.**

The Donate page embeds a Zeffy donation form at
`https://www.zeffy.com/embed/donation-form/help-a-family-come-home`. The embed
code is present and correct, and it is lazy-loaded so it does not slow the page.

**What could not be verified automatically:** that the Zeffy campaign is live,
that it deposits to the organization's current bank account, and that receipting
is configured with the correct legal name and EIN for tax-deductibility
statements. Submit a small live test donation and confirm the receipt.

Note also that the Donate page states Zeffy charges nonprofits no platform fee.
That is accurate to Zeffy's published model, in which Zeffy is funded by optional
donor tips. If Zeffy's pricing model changes, that sentence in
`src/components/ZeffyEmbed.tsx` must change with it.

**Recorded outcome:** _(fill in)_

---

## 6. Form delivery — Formsubmit activation

**Status: BLOCKED ON A HUMAN. Requires mailbox access.**

> **UPDATED 2026-08-16 (Phase 20 — Turnstile).** Two corrections to the paragraph
> below. There are **five** forms, not four — the impact receipt form on
> `/faithproof` was missed in the original count. And they no longer POST to
> Formsubmit from the browser: they POST to **`/api/forms/submit`** on this
> site, which verifies a Cloudflare Turnstile token and only then forwards to
> Formsubmit server-side. The activation requirement below is unchanged and
> still outstanding.

All five site forms (Contact, Volunteer, Housing Assistance Application,
Newsletter, Impact receipt) reach
`https://formsubmit.co/ajax/info@faithfoundationsf.org` — now via this site's
own `/api/forms/submit` rather than directly from the browser.

Formsubmit sends a **one-time activation email** to
`info@faithfoundationsf.org` on the first submission to a new address. **Until
someone opens that mailbox and clicks the activation link, no form on this site
delivers.** Until then the site correctly reports the failure and offers an
email fallback rather than faking success — but a Google reviewer or a family in
crisis submitting an application would hit that failure path.

**Required human action:** submit the contact form once, then open
`info@faithfoundationsf.org` and click the Formsubmit activation link. No
redeploy is needed afterwards.

**Separate consideration for the operator to decide:** the Housing Assistance
Application collects income, household composition, employment status, and
housing status (including "Facing eviction" and "Currently unhoused"). That data
currently transits a free third-party form relay. This is disclosed accurately in
the Privacy Policy, and the form offers a phone alternative. If the organization
wants applicant data to avoid third-party relay entirely, that requires moving to
a hosted form endpoint or a case-management intake system — an infrastructure
decision, not a content fix.

**Recorded outcome:** _(fill in)_

---

## 6b. Cloudflare Turnstile — keys and spam monitoring

**Status: KEYS ALREADY SET BY THE OPERATOR. One thing to watch after deploy.**

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are set in Vercel
production. They were **not** created or modified by the build, and they are not
in local `.env.local` — a local `pnpm dev` therefore shows "Spam protection is
not configured in this environment" and skips the check with a warning, while
production refuses every submission if the secret is ever missing.

**What to watch after deploying.** The bot signups may not stop, and if they do
not, the cause is knowable: the Formsubmit address
(`formsubmit.co/ajax/info@faithfoundationsf.org`) has been present in the public
JavaScript bundle for months. It is server-side only now, so it is no longer
advertised — but any bot that already harvested it can keep POSTing to
Formsubmit **directly**, completely bypassing this site and its CAPTCHA. Nothing
in the codebase can prevent that.

If spam continues at the same rate after deploy, that is the explanation, and
the fix is at the Formsubmit end (enable their own captcha for the address, or
move to a different destination) — not a code change here.

**Recorded outcome:** _(fill in)_

---

## 7. Beneficiary and testimonial verification

**Status: RESOLVED ON THE SITE — re-verify before adding anything back.**

The site previously presented "Maria & David — Down Payment Voucher recipients"
on the homepage as an apparent testimonial. Because the repository contains no
evidence that Maria and David are real, consenting beneficiaries who received
assistance, that presentation has been replaced with a clearly labelled
illustrative scenario. The Impact page's stories have likewise been converted to
explicitly labelled illustrative scenarios with no attributed quotations.

**Required human action before any testimonial is added back:** obtain written
consent from a real beneficiary, retain that consent record, and only then
publish. If a name is used, it must be that person's name or a pseudonym that is
disclosed as such. The relevant source files carry comments stating this rule —
see `src/app/page.tsx` and `src/app/impact/page.tsx`.

**Recorded outcome:** _(fill in)_

---

## 8. Current financial records

**Status: NOT VERIFIED. Requires human action.**

The Financial Transparency page states that the IRS determination letter is
available (and links to `/documents/irs-determination-letter.pdf`), that annual
returns are filed as required, and that financial summaries are available on
request.

**Required human action:** confirm that (a) the linked determination letter PDF
is the current, correct document, (b) the required annual return (Form 990/990-EZ
/990-N as applicable) has actually been filed for the most recent period, and
(c) someone is prepared to respond if a donor or reviewer requests financial
summaries, since the site promises they are available on request. A promise of
availability that the organization cannot honour is worse than no promise.

**Recorded outcome:** _(fill in)_

---

## 9. Social media profiles

**Status: REMOVED FROM SITE pending real accounts.**

The footer previously displayed Facebook, Instagram, LinkedIn and YouTube icons
linking to those platforms' **home pages** — not to FAITH Foundation profiles.
Those were placeholder links sending visitors off-site to nothing related to the
organization, and they have been removed.

**Required human action if the organization has or creates real profiles:** add
them to the `SOCIALS` array in `src/components/SiteFooter.tsx` using full profile
URLs, and add the same URLs to `sameAs` in the organization schema in
`src/app/layout.tsx` so the two never disagree. Instructions are in the code
comments at both locations.

**Recorded outcome:** _(fill in)_

---

## 10. Content Security Policy

**Status: DELIBERATELY NOT SET. Operator decision.**

Security headers were added in `vercel.json` (HSTS, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`). A `Content-Security-Policy` was **deliberately
omitted**: the Zeffy donation embed loads Stripe, PayPal, hCaptcha and Amplitude
at runtime, and a CSP that misses any one of them would silently break the
donation flow — the single most costly thing on the site to break.

**If a CSP is wanted**, add it in `Content-Security-Policy-Report-Only` mode
first, complete a live test donation, read the violation reports, and only then
enforce.

**Recorded outcome:** _(fill in)_

---

## Summary table

| # | Item | Can the repo verify it? | Blocking the application? |
| --- | --- | --- | --- |
| 1 | IRS address of record | No | **Likely — highest priority** |
| 2 | Goodstack verification profile | No | **Likely** |
| 3 | Google for Nonprofits org info | No | **Yes, at submission** |
| 4 | Board / officer accuracy | Internal consistency only | Possibly |
| 5 | Zeffy processor configuration | Embed only | No, but donations may fail |
| 6 | Formsubmit activation | No | **Yes — forms do not deliver until done** |
| 6b | Turnstile keys set; watch spam after deploy | Keys not visible to the repo | No |
| 7 | Beneficiary verification | Resolved on site | No |
| 8 | Financial records | No | Possibly |
| 9 | Social profiles | Removed pending real accounts | No |
| 10 | Content Security Policy | Decision, not a defect | No |
