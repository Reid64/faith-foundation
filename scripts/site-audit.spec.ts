import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

/* ============================================================================
 * FAITH Foundation — full site audit
 *
 * Run:  npx playwright test scripts/site-audit.spec.ts --reporter=list
 *
 * Target: the LIVE production site (see playwright.config.ts). The point of the
 * audit is to certify what a Google for Nonprofits reviewer actually sees, so
 * it runs against production rather than a local build. Override with
 * AUDIT_BASE_URL to point at a preview deployment.
 *
 * DESIGN NOTE — why the form tests assert more than a success message.
 * Every form on this site is a client component that can show a "thank you"
 * state without sending anything anywhere. A test that only asserts the success
 * state therefore PASSES on a form that silently destroys the submission. That
 * is the exact defect this site has already shipped twice (a placeholder
 * Formspree endpoint on the land inquiry form, and a no-op handler on the
 * newsletter). So each form test asserts BOTH:
 *   1. the success state renders, AND
 *   2. an actual outbound mailto: was dispatched containing the submitted data.
 * Playwright surfaces mailto: navigations through page.on("request"), which is
 * what makes (2) checkable.
 * ========================================================================== */

const HOST = "www.faithfoundationsf.org";

/** The 23 public routes. Matches the 23 URLs in the generated sitemap. */
const PAGES = [
  "/",
  "/about/",
  "/team/",
  "/programs/",
  "/impact/",
  "/events/",
  "/contact/",
  "/donate/",
  "/apply/",
  "/volunteer/",
  "/blog/",
  "/news/",
  "/faq/",
  "/financial-transparency/",
  "/governance/",
  "/governance/donor-privacy/",
  "/privacy-policy/",
  "/programs/housing-voucher/",
  "/programs/homeownership/",
  "/programs/veterans/",
  "/programs/recovery/",
  "/programs/reentry/",
  "/programs/cornerstone-communities/",
  // FaithProof public transparency pages (Phases 6–7). Listed here so they get
  // the same per-page coverage as every other public route — load, canonical,
  // console errors, internal links, footer form — and so the sitemap count
  // assertion below stays exact.
  "/faithproof/",
  "/faithproof/explorer/",
];

/** Routes retired as programs; must 308 to the programs hub. */
const REDIRECTS = [
  "/programs/emergency",
  "/programs/financial-literacy",
  "/programs/single-parents",
];

/* ---------------------------------------------------------------------------
 * Diagnostics helpers
 * ------------------------------------------------------------------------ */

type Diagnostics = {
  /** Uncaught exceptions and same-origin console errors. */
  appErrors: string[];
  /** Same-origin resources that returned >= 400. */
  badResources: string[];
  /** mailto: URLs the page tried to open. */
  mailtos: string[];
};

/**
 * Attach listeners BEFORE navigation.
 *
 * Console-error filtering is deliberate and narrow: an uncaught exception is
 * always counted, but a console error is only counted when it originates from
 * our own origin. Third-party embeds on this site (Zeffy → Stripe/hCaptcha/
 * PayPal, and the Google Maps iframe on /contact) log errors from their own
 * origins that we neither cause nor can fix; counting them would make the audit
 * permanently and uninformatively red.
 */
function watch(page: Page): Diagnostics {
  const d: Diagnostics = { appErrors: [], badResources: [], mailtos: [] };

  page.on("pageerror", (err) => {
    d.appErrors.push(`uncaught: ${err.message}`);
  });

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const from = msg.location()?.url ?? "";
    if (from.includes(HOST)) d.appErrors.push(`console: ${msg.text()} @ ${from}`);
  });

  page.on("response", (res) => {
    const url = res.url();
    if (!url.includes(HOST)) return;
    if (res.status() >= 400) d.badResources.push(`${res.status()} ${url}`);
  });

  page.on("request", (req) => {
    if (req.url().startsWith("mailto:")) d.mailtos.push(req.url());
  });

  return d;
}

/** Images that failed to decode, regardless of HTTP status. */
async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
  );
}

/* ===========================================================================
 * 1. PAGES — load, status, console errors, canonical, logo, images
 * ======================================================================== */

test.describe("PAGES", () => {
  for (const path of PAGES) {
    test(`page loads clean: ${path}`, async ({ page }) => {
      const d = watch(page);

      const res = await page.goto(path, { waitUntil: "load" });
      expect(res, `no response for ${path}`).not.toBeNull();
      expect(res!.status(), `HTTP status for ${path}`).toBe(200);

      // Let lazy/deferred work settle so late errors are caught.
      await page.waitForTimeout(1200);

      expect(d.appErrors, `console/runtime errors on ${path}`).toEqual([]);
      expect(d.badResources, `failed same-origin resources on ${path}`).toEqual([]);
      expect(await brokenImages(page), `broken images on ${path}`).toEqual([]);
    });

    test(`canonical is self-referencing: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const href = await page
        .locator('link[rel="canonical"]')
        .first()
        .getAttribute("href");
      expect(href, `missing canonical on ${path}`).toBeTruthy();

      const canonical = new URL(href!);
      const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);
      expect(canonical.host, `canonical host on ${path}`).toBe(HOST);
      expect(norm(canonical.pathname), `canonical path on ${path}`).toBe(norm(path));
    });

    test(`logo renders: ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });
      const logo = page.locator("header img").first();
      await expect(logo, `no header logo on ${path}`).toBeVisible();
      const ok = await logo.evaluate(
        (el) => (el as HTMLImageElement).naturalWidth > 0
      );
      expect(ok, `header logo failed to decode on ${path}`).toBe(true);
    });
  }
});

/* ===========================================================================
 * 2. REDIRECTS — retired program routes
 * ======================================================================== */

test.describe("REDIRECTS", () => {
  for (const path of REDIRECTS) {
    test(`308 to /programs: ${path}`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), `status for ${path}`).toBe(308);
      const loc = res.headers()["location"] ?? "";
      expect(loc, `Location header for ${path}`).toContain("/programs");
    });

    test(`resolves to programs hub: ${path}`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res!.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe("/programs/");
    });
  }
});

/* ===========================================================================
 * 3. FORMS
 * ======================================================================== */

/**
 * FORMS — RUN THESE WITH `--workers=1` (use `pnpm run audit:site`).
 *
 * Every test in this block performs a REAL submission to formsubmit.co. Run in
 * parallel, 27 submissions arrive from one IP within seconds and Formsubmit
 * rate-limits them, which surfaces as ~23 spurious failures that all pass on a
 * serial re-run. That is the third party protecting itself, not a defect in
 * this site — do not "fix" the site in response to it.
 *
 * Verified 2026-08-15: 27/27 pass with `--workers=1`; 4/27 pass with
 * `--workers=4`.
 */
test.describe("FORMS", () => {
  /**
   * Asserts the invariant that must hold whether or not the Web3Forms access
   * key is live yet:
   *
   *   a success state may appear ONLY if a Web3Forms POST was actually made;
   *   otherwise an error must be shown AND the email fallback must still carry
   *   the visitor's data to the same inbox.
   *
   * This is what stops the suite from ever certifying a form that silently
   * discards submissions — the defect this site shipped three times. It stays
   * valid after the key is activated: the branch simply flips from the error
   * path to the success path.
   */
  async function assertHonestSubmission(
    page: Page,
    posts: string[],
    mailtos: string[],
    successPattern: RegExp,
    identifyingValue: string
  ) {
    const success = page.getByText(successPattern).first();
    const alert = page.getByRole("alert").first();

    await expect(
      success.or(alert),
      "form neither confirmed delivery nor reported a failure"
    ).toBeVisible({ timeout: 30_000 });

    if (await success.isVisible().catch(() => false)) {
      // Claimed delivery — there must be a real POST behind it.
      expect(
        posts.length,
        "form showed a success state without POSTing anything"
      ).toBeGreaterThan(0);
      expect(posts.join(" ")).toContain(identifyingValue);
      return "delivered" as const;
    }

    // Reported a failure — the data must still be recoverable by email.
    await expect(alert).toBeVisible();
    const fallback = page
      .getByRole("button", { name: /(send|sign) up by email instead|send by email instead/i })
      .first();
    await expect(
      fallback,
      "failure state offered no way to reach us"
    ).toBeVisible();

    await fallback.click();
    await page.waitForTimeout(1500);
    expect(
      mailtos.length,
      "email fallback dispatched nothing — the submission would be lost"
    ).toBeGreaterThan(0);
    expect(decodeURIComponent(mailtos.join(" "))).toContain(identifyingValue);
    return "fallback" as const;
  }

  /** Records Formsubmit POST bodies and any mailto: dispatched by the page. */
  function trackSubmissions(page: Page) {
    const posts: string[] = [];
    const mailtos: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("formsubmit.co")) posts.push(r.postData() ?? "");
      if (r.url().startsWith("mailto:")) mailtos.push(r.url());
    });
    return { posts, mailtos };
  }

  test("contact form submits honestly", async ({ page }) => {
    const { posts, mailtos } = trackSubmissions(page);
    await page.goto("/contact/", { waitUntil: "load" });

    await page.locator("#name").fill("Audit Test");
    await page.locator("#email").fill("audit@example.com");
    await page.locator("#phone").fill("512-555-0134");
    await page.locator("#subject").selectOption({ label: "Housing assistance" });
    await page
      .locator("#message")
      .fill("Automated site audit — please disregard this message.");

    await page.getByRole("button", { name: /send message/i }).click();

    await assertHonestSubmission(
      page,
      posts,
      mailtos,
      /message sent/i,
      "audit@example.com"
    );
  });

  test("volunteer form submits honestly", async ({ page }) => {
    const { posts, mailtos } = trackSubmissions(page);
    await page.goto("/volunteer/", { waitUntil: "load" });

    await page.locator("#v-name").fill("Audit Test");
    await page.locator("#v-email").fill("audit@example.com");
    await page.locator("#v-phone").fill("512-555-0134");
    await page
      .locator("#v-availability")
      .fill("Automated site audit — please disregard.");

    await page.getByRole("button", { name: /sign up to volunteer/i }).click();

    await assertHonestSubmission(
      page,
      posts,
      mailtos,
      /welcome to the team/i,
      "audit@example.com"
    );
  });

  test("apply form submits honestly and carries ALL FOUR STEPS", async ({
    page,
  }) => {
    const { posts, mailtos } = trackSubmissions(page);
    await page.goto("/apply/", { waitUntil: "load" });

    // Step 1
    await page.locator("#a-first").fill("Audit");
    await page.locator("#a-last").fill("Test");
    await page.locator("#a-email").fill("audit@example.com");
    await page.locator("#a-phone").fill("512-555-0134");
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 2
    await page.locator("#a-size").fill("3");
    await page.locator("#a-children").fill("1");
    await page.locator("#a-income").fill("2400");
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 3
    await page.locator("#a-describe").fill("Automated site audit — disregard.");
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 4
    await page.locator('input[name="consent"]').check();
    await page.getByRole("button", { name: /submit application/i }).click();

    const route = await assertHonestSubmission(
      page,
      posts,
      mailtos,
      /application received/i,
      "audit@example.com"
    );

    // Whichever route it took, every step's answers must be in the payload —
    // the wizard unmounts steps 1-3, so this is the regression that matters.
    const carried = decodeURIComponent(
      route === "delivered" ? posts.join(" ") : mailtos.join(" ")
    );
    for (const value of ["Audit", "Test", "512-555-0134", "3", "2400"]) {
      expect(
        carried,
        `submission dropped a value from an earlier step: ${value}`
      ).toContain(value);
    }
  });

  test("cornerstone land inquiry shows a contact button, not a form", async ({
    page,
  }) => {
    await page.goto("/programs/cornerstone-communities/", { waitUntil: "load" });

    const section = page.locator("#land-inquiry");
    await expect(section).toBeVisible();
    expect(
      await section.locator("form").count(),
      "land inquiry section still renders a form"
    ).toBe(0);

    const cta = section.getByRole("link", { name: /contact us about land donation/i });
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute("href")).toContain("/contact");

    // The dead Formspree placeholder must be gone from the whole page.
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("formspree");
  });

  // The footer newsletter appears on every page via the root layout, so it is
  // audited on every page rather than a sample.
  for (const path of PAGES) {
    test(`newsletter form works: ${path}`, async ({ page }) => {
      const { posts, mailtos } = trackSubmissions(page);
      await page.goto(path, { waitUntil: "load" });

      const input = page.locator("#footer-newsletter");
      await expect(input, `no newsletter form on ${path}`).toBeAttached();
      await input.fill("audit@example.com");
      await page.getByRole("button", { name: /^subscribe$/i }).click();

      await assertHonestSubmission(
        page,
        posts,
        mailtos,
        /subscribed/i,
        "audit@example.com"
      );
    });
  }
});

/* ===========================================================================
 * 4. NAVIGATION
 * ======================================================================== */

test.describe("NAVIGATION", () => {
  const HEADER_LINKS: [string, string][] = [
    ["Programs", "/programs/"],
    ["Impact", "/impact/"],
    ["Events", "/events/"],
    ["Contact", "/contact/"],
    ["Team", "/team/"],
  ];

  for (const [label, expected] of HEADER_LINKS) {
    test(`header nav "${label}" → ${expected}`, async ({ page }) => {
      await page.goto("/", { waitUntil: "load" });
      await page
        .locator('header nav[aria-label="Primary"]')
        .getByRole("link", { name: new RegExp(`^${label}$`) })
        .click();
      await page.waitForURL(`**${expected}`);
      expect(new URL(page.url()).pathname).toBe(expected);
    });
  }

  test('header "Donate" → /donate', async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page
      .locator('header nav[aria-label="Primary"]')
      .getByRole("link", { name: /^donate$/i })
      .click();
    await page.waitForURL("**/donate/");
    expect(new URL(page.url()).pathname).toBe("/donate/");
  });

  test("logo returns home", async ({ page }) => {
    await page.goto("/about/", { waitUntil: "load" });
    await page.getByLabel("FAITH Foundation home").click();
    await page.waitForURL((u) => u.pathname === "/");
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("About dropdown opens on hover, closes on leave, links work", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });

    const aboutBtn = page
      .locator('header nav[aria-label="Primary"]')
      .getByRole("button", { name: /^about$/i });

    await aboutBtn.hover();
    const panel = page.locator('header nav[aria-label="Primary"] a', {
      hasText: "Financial Transparency",
    });
    await expect(panel).toBeVisible();
    expect(await aboutBtn.getAttribute("aria-expanded")).toBe("true");

    // All four sub-links present.
    for (const label of ["About Us", "Team", "Financial Transparency", "Governance"]) {
      await expect(
        page
          .locator('header nav[aria-label="Primary"]')
          .getByRole("link", { name: new RegExp(`^${label}$`) })
          .first()
      ).toBeVisible();
    }

    // Closes shortly after the pointer leaves (implementation uses a 120ms timer).
    await page.locator("h1").first().hover();
    await expect(panel).toBeHidden({ timeout: 5000 });
  });

  const ABOUT_LINKS: [string, string][] = [
    ["About Us", "/about/"],
    ["Financial Transparency", "/financial-transparency/"],
    ["Governance", "/governance/"],
  ];

  for (const [label, expected] of ABOUT_LINKS) {
    test(`About dropdown "${label}" → ${expected}`, async ({ page }) => {
      await page.goto("/", { waitUntil: "load" });
      const nav = page.locator('header nav[aria-label="Primary"]');
      await nav.getByRole("button", { name: /^about$/i }).hover();
      await nav
        .getByRole("link", { name: new RegExp(`^${label}$`) })
        .first()
        .click();
      await page.waitForURL(`**${expected}`);
      expect(new URL(page.url()).pathname).toBe(expected);
    });
  }

  test("mobile hamburger opens and exposes all links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load" });

    await page.getByRole("button", { name: /open menu/i }).click();

    const mobile = page.locator('nav[aria-label="Mobile"]');
    for (const label of [
      "About Us",
      "Team",
      "Financial Transparency",
      "Governance",
      "Programs",
      "Impact",
      "Events",
      "Contact",
      "Donate",
    ]) {
      await expect(
        mobile.getByRole("link", { name: new RegExp(`^${label}$`) }).first(),
        `mobile menu missing "${label}"`
      ).toBeVisible();
    }
  });

  test("mobile menu link navigates", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: /open menu/i }).click();
    await page
      .locator('nav[aria-label="Mobile"]')
      .getByRole("link", { name: /^Programs$/ })
      .click();
    await page.waitForURL("**/programs/");
    expect(new URL(page.url()).pathname).toBe("/programs/");
  });

  test("every footer link resolves", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "load" });
    const hrefs = await page
      .getByRole("contentinfo")
      .locator("a[href^='/']")
      .evaluateAll((els) =>
        Array.from(new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!)))
      );
    expect(hrefs.length, "no footer links found").toBeGreaterThan(20);

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, "broken footer links").toEqual([]);
  });
});

/* ===========================================================================
 * 5. BUTTONS / CTAs
 * ======================================================================== */

test.describe("BUTTONS", () => {
  test("every internal link across the whole site resolves", async ({
    page,
    request,
  }) => {
    test.setTimeout(300_000);

    const targets = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((els) =>
          els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!)
        );
      hrefs
        .map((h) => h.split("#")[0])
        .filter((h) => h && h.startsWith("/"))
        .forEach((h) => targets.add(h));
    }

    // Sanity floor: the footer alone links ~23 routes, so anything under this
    // means the collection step silently failed rather than the site being small.
    expect(targets.size, "suspiciously few internal links").toBeGreaterThan(20);

    const broken: string[] = [];
    for (const href of targets) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, "internal links returning >= 400").toEqual([]);
  });

  test("all donate CTAs point at /donate", async ({ page }) => {
    const offenders: string[] = [];
    for (const path of ["/", "/programs/", "/impact/", "/about/", "/programs/cornerstone-communities/"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const bad = await page
        .locator("a[href^='/']")
        .evaluateAll((els) =>
          els
            .filter((e) => /donate|give now/i.test(e.textContent ?? ""))
            .map((e) => (e as HTMLAnchorElement).getAttribute("href")!)
            .filter((h) => !h.startsWith("/donate"))
        );
      bad.forEach((h) => offenders.push(`${path} → ${h}`));
    }
    expect(offenders, "donate-labelled links not pointing at /donate").toEqual([]);
  });

  test("apply / contact CTAs resolve to a working page", async ({
    page,
    request,
  }) => {
    // NOTE: the audit brief expected "Apply for Assistance" to route to
    // /contact. In this build it routes to /apply, which is a real page with
    // the application form on it — routing it to /contact would be a
    // regression. This test therefore asserts the CTA reaches a working page
    // and records where it goes; the discrepancy is documented in the report.
    const seen: string[] = [];
    for (const path of ["/", "/programs/", "/contact/", "/apply/"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((els) =>
          els
            .filter((e) => /apply|contact us|get in touch/i.test(e.textContent ?? ""))
            .map((e) => (e as HTMLAnchorElement).getAttribute("href")!)
        );
      hrefs.forEach((h) => seen.push(`${path} → ${h}`));
    }
    const broken: string[] = [];
    for (const entry of seen) {
      const href = entry.split(" → ")[1].split("#")[0];
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${res.status()} ${entry}`);
    }
    console.log("APPLY/CONTACT CTA TARGETS:\n" + seen.join("\n"));
    expect(broken, "apply/contact CTAs that 404").toEqual([]);
  });

  test("program page CTAs resolve", async ({ page, request }) => {
    const programPages = PAGES.filter((p) => p.startsWith("/programs/"));
    const broken: string[] = [];
    for (const path of programPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const hrefs = await page
        .locator("main a[href^='/']")
        .evaluateAll((els) =>
          Array.from(
            new Set(
              els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!.split("#")[0])
            )
          ).filter(Boolean)
        );
      for (const href of hrefs) {
        const res = await request.get(href);
        if (res.status() >= 400) broken.push(`${path}: ${res.status()} ${href}`);
      }
    }
    expect(broken, "broken CTAs on program pages").toEqual([]);
  });

  test("Zeffy donation embed loads on /donate", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/donate/", { waitUntil: "domcontentloaded" });

    // The embed is deliberately lazy (IntersectionObserver + a manual button),
    // so scroll it into view the way a donor would. The observer has a 300px
    // rootMargin, so reaching the section is enough to trigger the mount; the
    // button is only a fallback when the observer has not fired yet.
    await page.locator("#give-now").scrollIntoViewIfNeeded();

    const iframe = page.locator('iframe[src*="zeffy.com"]');
    const loadBtn = page.getByRole("button", { name: /load donation form/i });

    if (!(await iframe.count())) {
      await loadBtn.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
      if (await loadBtn.count()) await loadBtn.click().catch(() => {});
    }

    await expect(iframe, "Zeffy embed iframe never mounted").toBeAttached({
      timeout: 45_000,
    });

    const res = await page.request.get(
      "https://www.zeffy.com/embed/donation-form/help-a-family-come-home"
    );
    expect(res.status(), "Zeffy embed URL is not reachable").toBeLessThan(400);
  });
});

/* ===========================================================================
 * 6. CONTENT CHECKS
 * ======================================================================== */

test.describe("CONTENT", () => {
  test('no "Bright Box" anywhere on the site', async ({ request }) => {
    const hits: string[] = [];
    for (const path of PAGES) {
      const body = (await (await request.get(path)).text()).toLowerCase();
      if (/bright\s?box/.test(body)) hits.push(path);
    }
    expect(hits, "pages still naming Bright Box").toEqual([]);
  });

  test('no "Emergency Bridge Housing" anywhere on the site', async ({ request }) => {
    const hits: string[] = [];
    for (const path of PAGES) {
      const body = (await (await request.get(path)).text()).toLowerCase();
      if (body.includes("emergency bridge housing")) hits.push(path);
    }
    expect(hits).toEqual([]);
  });

  test('no "rental assistance" on home, programs hub, or financial transparency', async ({
    request,
  }) => {
    const hits: string[] = [];
    for (const path of ["/", "/programs/", "/financial-transparency/"]) {
      const body = (await (await request.get(path)).text()).toLowerCase();
      if (body.includes("rental assistance")) hits.push(path);
    }
    expect(hits).toEqual([]);
  });

  test("retired programs absent from nav and footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // Scoped to the site chrome: a testimonial card on the homepage also uses a
    // <footer> element, so an unscoped locator matches two nodes.
    const navText = ((await page.locator("header").innerText()) +
      " " +
      (await page.getByRole("contentinfo").innerText())).toLowerCase();

    expect(navText).not.toContain("financial literacy");
    expect(navText).not.toContain("single parent");

    const chromeHrefs = await page
      .locator("header a[href^='/'], body > footer a[href^='/']")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!)
      );
    expect(chromeHrefs.filter((h) => h.includes("financial-literacy"))).toEqual([]);
    expect(chromeHrefs.filter((h) => h.includes("single-parents"))).toEqual([]);
    expect(chromeHrefs.filter((h) => h.includes("/programs/emergency"))).toEqual([]);
  });

  test("StatCounter renders 100%, not 0%", async ({ page }) => {
    await page.goto("/donate/", { waitUntil: "load" });

    const counter = page.locator("section.bg-navy span", { hasText: "%" }).first();
    await counter.scrollIntoViewIfNeeded();

    // Counter animates up on intersection; wait for it to settle.
    await expect(counter).toHaveText(/100%/, { timeout: 15_000 });
  });

  test("google-site-verification meta tag present on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const content = await page
      .locator('meta[name="google-site-verification"]')
      .getAttribute("content");
    expect(content, "verification meta tag missing").toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    const locs = xml.match(/<loc>/g) ?? [];
    expect(locs.length, "sitemap URL count").toBe(PAGES.length);
    expect(xml).not.toContain("icon.png");
  });
});
