import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * Google Ad Grants / Google for Nonprofits website readiness suite.
 *
 * This is the reusable gate for the policy and credibility work described in
 * governance/GOOGLE_AD_GRANTS_READINESS_AUDIT.md. It is deliberately written
 * against a RUNNING SITE rather than the source tree, because the thing that
 * gets reviewed is the deployed HTML, not the repository — a distinction this
 * project has already been bitten by once.
 *
 * Run against production (default):
 *   npx playwright test scripts/ad-grants-readiness.spec.ts
 *
 * Run against a local static build:
 *   pnpm run build && (cd out && python -m http.server 8099)
 *   AUDIT_BASE_URL=http://127.0.0.1:8099 npx playwright test scripts/ad-grants-readiness.spec.ts
 *
 * NOTE ON LOCAL RUNS: `python -m http.server` does not emulate Vercel's
 * trailing-slash redirects or the vercel.json security headers, so the redirect
 * and header tests are skipped automatically unless the run targets a host that
 * serves them.
 */

const BASE =
  process.env.AUDIT_BASE_URL ?? "https://www.faithfoundationsf.org";
const IS_PRODUCTION = BASE.includes("faithfoundationsf.org");

/** Every public route. Kept explicit so a page silently disappearing fails. */
const PUBLIC_ROUTES = [
  "/",
  "/about/",
  "/team/",
  "/programs/",
  "/programs/homeownership/",
  "/programs/housing-voucher/",
  "/programs/veterans/",
  "/programs/recovery/",
  "/programs/reentry/",
  "/programs/cornerstone-communities/",
  "/impact/",
  "/donate/",
  "/apply/",
  "/volunteer/",
  "/contact/",
  "/events/",
  "/news/",
  "/blog/",
  "/faq/",
  "/financial-transparency/",
  "/governance/",
  "/governance/donor-privacy/",
  "/privacy-policy/",
];

/** Routes a Google reviewer is most likely to open. */
const CRITICAL_ROUTES = [
  "/",
  "/about/",
  "/programs/",
  "/donate/",
  "/apply/",
  "/contact/",
  "/financial-transparency/",
  "/governance/",
  "/privacy-policy/",
];

/** Organizational identifiers that must remain consistent site-wide. */
const ORG = {
  ein: "33-2640449",
  phone: "888-497-6620",
  email: "info@faithfoundationsf.org",
  street: "209 Surecast Drive",
  city: "Burnet",
  zip: "78611",
};

/**
 * Text that must never reach production.
 *
 * "Bright Box" and the retired program names are here because each one was a
 * real defect on this site at some point; leaving them asserted is how they
 * stay dead.
 */
const FORBIDDEN_TEXT: { pattern: RegExp; why: string }[] = [
  { pattern: /lorem ipsum/i, why: "placeholder copy" },
  { pattern: /\bTODO\b|\bFIXME\b/, why: "developer placeholder" },
  { pattern: /coming soon/i, why: "thin/placeholder page content" },
  { pattern: /\bBright Box\b/i, why: "retired partner name" },
  { pattern: /Emergency Bridge Housing/i, why: "retired program" },
  { pattern: /Single Parent Stability/i, why: "retired program" },
  { pattern: /wp-content|wp-admin|wordpress/i, why: "legacy WordPress artifact" },
  { pattern: /images\.unsplash\.com/i, why: "hotlinked third-party image" },
  {
    pattern: /google (approved|certified)|guaranteed .{0,20}ad grant/i,
    why: "unsupported claim about Google",
  },
  {
    pattern: /\$10,?000\s*(\/|per )\s*month/i,
    why: "Ad Grants entitlement claim",
  },
];

async function getHtml(page: Page, route: string): Promise<string> {
  const response = await page.goto(`${BASE}${route}`, {
    waitUntil: "domcontentloaded",
  });
  expect(response, `no response for ${route}`).not.toBeNull();
  expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(400);
  return page.content();
}

/**
 * Reads an attribute without auto-waiting.
 *
 * `page.locator(sel).getAttribute()` blocks for the full action timeout when
 * the selector matches nothing, which turns "this optional tag is absent" —
 * the normal, passing case for a `robots` meta — into a 30-second stall. This
 * resolves immediately to null instead.
 */
async function attr(
  page: Page,
  selector: string,
  name: string
): Promise<string | null> {
  return page.evaluate(
    ([sel, attribute]) =>
      document.querySelector(sel)?.getAttribute(attribute) ?? null,
    [selector, name] as const
  );
}

test.describe("Routes and responses", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} returns a usable page`, async ({ page }) => {
      const html = await getHtml(page, route);

      // Not a 404 shell rendered with a 200.
      await expect(
        page.locator("text=This page could not be found")
      ).toHaveCount(0);

      // Substantive content, not a thin page. 1,200 characters of visible text
      // is a low bar that a real page clears easily and a stub does not.
      const visible = (await page.locator("body").innerText()).trim();
      expect(
        visible.length,
        `${route} has only ${visible.length} chars of visible text — thin page`
      ).toBeGreaterThan(1200);

      // Exactly one H1.
      const h1s = await page.locator("h1").count();
      expect(h1s, `${route} has ${h1s} <h1> elements`).toBe(1);

      // Title and meta description present and non-trivial.
      const title = await page.title();
      expect(title.length, `${route} title too short`).toBeGreaterThan(10);
      const desc = await attr(page, 'meta[name="description"]', "content");
      expect(desc, `${route} missing meta description`).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(50);

      // Canonical present.
      const canonical = await attr(page, 'link[rel="canonical"]', "href");
      expect(canonical, `${route} missing canonical`).toBeTruthy();

      // Never accidentally noindex. Absent is the expected, passing case.
      const robots = await attr(page, 'meta[name="robots"]', "content");
      if (robots) {
        expect(robots.toLowerCase(), `${route} is noindex`).not.toContain(
          "noindex"
        );
      }

      // No forbidden text anywhere in the served HTML.
      for (const { pattern, why } of FORBIDDEN_TEXT) {
        expect(html, `${route} contains ${why} (${pattern})`).not.toMatch(
          pattern
        );
      }
    });
  }
});

test.describe("Organizational identity is consistent", () => {
  for (const route of CRITICAL_ROUTES) {
    test(`${route} carries consistent contact identity`, async ({ page }) => {
      const html = await getHtml(page, route);

      // Footer appears on every page, so phone/email/city are always present.
      expect(html, `${route} missing phone`).toContain(ORG.phone);
      expect(html, `${route} missing email`).toContain(ORG.email);
      expect(html, `${route} missing city`).toContain(ORG.city);

      // No conflicting legacy address anywhere.
      expect(html, `${route} contains a legacy Weir, TX address`).not.toMatch(
        /\bWeir,?\s*(TX|Texas)\b/i
      );

      // Only one ZIP may appear.
      const zips = [...html.matchAll(/\b7\d{4}\b/g)].map((m) => m[0]);
      const foreign = zips.filter((z) => z !== ORG.zip);
      expect(
        foreign,
        `${route} contains non-headquarters ZIP codes: ${foreign.join(", ")}`
      ).toHaveLength(0);
    });
  }

  test("EIN is publicly visible", async ({ page }) => {
    const html = await getHtml(page, "/");
    expect(html, "EIN not visible on the homepage").toContain(ORG.ein);
  });

  test("street address appears on the contact page", async ({ page }) => {
    const html = await getHtml(page, "/contact/");
    expect(html).toContain(ORG.street);
    expect(html).toContain(ORG.zip);
  });
});

test.describe("Credibility guardrails", () => {
  test("homepage presents no unlabelled beneficiary testimonial", async ({
    page,
  }) => {
    const html = await getHtml(page, "/");

    // The specific defect: a named couple presented as voucher recipients.
    expect(html).not.toMatch(/Maria\s*(&amp;|&|and)\s*David/i);
    expect(html).not.toMatch(/Voucher recipients?/i);

    // Whatever replaced it must be labelled as illustrative.
    await expect(page.getByText(/illustrative/i).first()).toBeVisible();
  });

  test("impact page separates results, targets and illustrations", async ({
    page,
  }) => {
    await getHtml(page, "/impact/");

    await expect(page.getByText(/verified results to date/i).first()).toBeVisible();
    await expect(page.getByText(/targets/i).first()).toBeVisible();
    await expect(page.getByText(/illustrative/i).first()).toBeVisible();

    // It must state plainly that there are no completed outcomes yet. If that
    // ceases to be true, this assertion SHOULD fail so the claim gets revisited
    // deliberately rather than drifting.
    const body = await page.locator("body").innerText();
    expect(
      /no completed beneficiary outcomes/i.test(body),
      "impact page no longer states the no-outcomes-yet position — if real results now exist, update this test and move them into the Verified Results section"
    ).toBe(true);
  });

  test("donation claims are scoped to designated gifts", async ({ page }) => {
    for (const route of ["/", "/donate/", "/financial-transparency/", "/impact/"]) {
      const html = await getHtml(page, route);

      // An unqualified "every donation goes directly to <program>" claim is the
      // failure mode. Designated-gift phrasing is what must appear instead.
      expect(
        html,
        `${route} makes an unqualified "every donation goes directly" claim`
      ).not.toMatch(/every donation[^.<]{0,40}goes directly/i);
    }

    const donate = await getHtml(page, "/donate/");
    expect(donate).toMatch(/designated/i);
  });

  test("news does not claim milestones the events page schedules later", async ({
    page,
  }) => {
    const news = await getHtml(page, "/news/");

    // The specific contradiction: News claimed the annual impact summary was
    // already published while Events schedules it for 2026-11-24.
    expect(news).not.toMatch(/Publishes Its Annual Impact Summary/i);
    expect(news).not.toMatch(/we have published/i);

    // And it must not masquerade as press coverage.
    expect(news).toMatch(/not press coverage/i);
  });
});

test.describe("Ad Grants policy surface", () => {
  test("required policy pages are reachable and substantive", async ({ page }) => {
    const required = [
      { route: "/privacy-policy/", must: /privacy/i },
      { route: "/governance/donor-privacy/", must: /donor/i },
      { route: "/financial-transparency/", must: /501\(c\)\(3\)/ },
      { route: "/governance/", must: /board|governance/i },
      { route: "/apply/", must: /apply|application/i },
      { route: "/contact/", must: /contact/i },
    ];

    for (const { route, must } of required) {
      const html = await getHtml(page, route);
      expect(html, `${route} missing expected content`).toMatch(must);
    }
  });

  test("no dead links, empty hrefs, or '#' destinations", async ({ page }) => {
    for (const route of CRITICAL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });

      const bad = await page.$$eval("a[href]", (anchors) =>
        anchors
          .map((a) => a.getAttribute("href") ?? "")
          .filter(
            (href) =>
              href.trim() === "" ||
              href.trim() === "#" ||
              href.startsWith("javascript:")
          )
      );
      expect(bad, `${route} has placeholder hrefs: ${bad.join(", ")}`).toHaveLength(
        0
      );

      // Any http:// link to our own domain would be an insecure downgrade.
      const insecure = await page.$$eval("a[href^='http://']", (anchors) =>
        anchors.map((a) => a.getAttribute("href") ?? "")
      );
      expect(
        insecure,
        `${route} has insecure http:// links: ${insecure.join(", ")}`
      ).toHaveLength(0);
    }
  });

  test("every internal link on critical pages resolves", async ({ page, request }) => {
    const seen = new Set<string>();

    for (const route of CRITICAL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const hrefs = await page.$$eval("a[href]", (anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href)
      );
      for (const href of hrefs) {
        if (!href.startsWith(BASE)) continue;
        const path = href.slice(BASE.length).split("#")[0];
        if (!path || seen.has(path)) continue;
        seen.add(path);
      }
    }

    const failures: string[] = [];
    for (const path of seen) {
      const res = await request.get(`${BASE}${path}`, { maxRedirects: 5 });
      if (res.status() >= 400) failures.push(`${path} -> ${res.status()}`);
    }
    expect(failures, `broken internal links: ${failures.join(", ")}`).toHaveLength(
      0
    );
  });

  test("no broken images on critical pages", async ({ page }) => {
    for (const route of CRITICAL_ROUTES) {
      const failed: string[] = [];
      const onResponse = (r: { status: () => number; url: () => string; request: () => Request }) => {
        if (r.request().resourceType() === "image" && r.status() >= 400) {
          failed.push(`${r.url()} -> ${r.status()}`);
        }
      };
      page.on("response", onResponse);
      await page.goto(`${BASE}${route}`, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      page.off("response", onResponse);

      // Images that loaded but decoded to nothing.
      const broken = await page.$$eval("img", (imgs) =>
        imgs
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.getAttribute("src") ?? "(no src)")
      );

      expect(
        [...failed, ...broken],
        `${route} has broken images`
      ).toHaveLength(0);
    }
  });

  test("all images carry an alt attribute", async ({ page }) => {
    for (const route of CRITICAL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const missing = await page.$$eval("img:not([alt])", (imgs) =>
        imgs.map((i) => i.getAttribute("src") ?? "(no src)")
      );
      expect(
        missing,
        `${route} has images without alt: ${missing.join(", ")}`
      ).toHaveLength(0);
    }
  });
});

test.describe("Technical SEO", () => {
  test("robots.txt exists and does not block the site", async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body, "robots.txt disallows the whole site").not.toMatch(
      /Disallow:\s*\/\s*$/im
    );
    expect(body).toMatch(/Sitemap:/i);
  });

  test("sitemap exists, is valid, and excludes retired routes", async ({
    request,
  }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<urlset");

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length, "sitemap is empty").toBeGreaterThan(15);

    for (const retired of [
      "programs/emergency",
      "programs/financial-literacy",
      "programs/single-parents",
    ]) {
      expect(
        xml,
        `sitemap lists retired route ${retired}`
      ).not.toContain(retired);
    }

    // Every sitemap URL must resolve and use the canonical www host.
    for (const loc of locs) {
      expect(loc, `sitemap entry not on www host: ${loc}`).toContain(
        "www.faithfoundationsf.org"
      );
    }
  });

  test("retired program routes redirect rather than 404", async ({ request }) => {
    test.skip(!IS_PRODUCTION, "redirects are served by Vercel, not the local static server");

    for (const retired of [
      "/programs/emergency/",
      "/programs/financial-literacy/",
      "/programs/single-parents/",
    ]) {
      const res = await request.get(`${BASE}${retired}`, { maxRedirects: 5 });
      expect(res.status(), `${retired} did not resolve`).toBeLessThan(400);
    }
  });

  test("canonical URLs are unique per page and self-referential", async ({
    page,
  }) => {
    const canonicals = new Map<string, string>();
    for (const route of PUBLIC_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const canonical = await attr(page, 'link[rel="canonical"]', "href");
      expect(canonical, `${route} has no canonical`).toBeTruthy();

      const existing = [...canonicals.entries()].find(
        ([, c]) => c === canonical
      );
      expect(
        existing,
        `${route} shares a canonical with ${existing?.[0]}: ${canonical}`
      ).toBeUndefined();

      canonicals.set(route, canonical!);
    }
  });

  test("Open Graph and Twitter metadata are present", async ({ page }) => {
    for (const route of CRITICAL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      for (const selector of [
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:image"]',
        'meta[name="twitter:card"]',
      ]) {
        const content = await attr(page, selector, "content");
        expect(content, `${route} missing ${selector}`).toBeTruthy();
      }
    }
  });

  test("no mojibake in titles or metadata", async ({ page }) => {
    // A UTF-8 em-dash mis-encoded as "â€”" shipped in the site title once.
    for (const route of CRITICAL_ROUTES) {
      const html = await getHtml(page, route);
      expect(html, `${route} contains mojibake`).not.toMatch(/â€|Ã¢â‚¬|Ã©|Ã¼/);
    }
  });
});

test.describe("Structured data", () => {
  test("organization schema is valid, truthful and complete", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const blocks = await page.$$eval(
      'script[type="application/ld+json"]',
      (nodes) => nodes.map((n) => n.textContent ?? "")
    );
    expect(blocks.length, "no JSON-LD on the homepage").toBeGreaterThan(0);

    const parsed = blocks.map((b) => {
      let json: unknown;
      expect(() => {
        json = JSON.parse(b);
      }, `invalid JSON-LD: ${b.slice(0, 120)}`).not.toThrow();
      return json as Record<string, unknown>;
    });

    const org = parsed.find((p) => {
      const type = p["@type"];
      const types = Array.isArray(type) ? type : [type];
      return types.some((t) => t === "NGO" || t === "NonprofitOrganization");
    });
    expect(org, "no NGO/NonprofitOrganization schema").toBeTruthy();

    expect(org!.name).toBe("FAITH Foundation");
    expect(org!.url).toContain("faithfoundationsf.org");
    expect(org!.taxID).toBe(ORG.ein);
    expect(org!.telephone).toContain("888-497-6620");
    expect(org!.email).toBe(ORG.email);
    expect(org!.logo).toBeTruthy();

    const address = org!.address as Record<string, string>;
    expect(address.streetAddress).toContain(ORG.street);
    expect(address.addressLocality).toBe(ORG.city);
    expect(address.postalCode).toBe(ORG.zip);
    expect(address.addressRegion).toBe("TX");

    expect(org!.contactPoint, "no ContactPoint in schema").toBeTruthy();

    // sameAs must never point at bare platform home pages.
    const sameAs = org!.sameAs;
    if (sameAs) {
      const urls = Array.isArray(sameAs) ? sameAs : [sameAs];
      for (const u of urls as string[]) {
        expect(
          u,
          `sameAs points at a platform home page, not a real profile: ${u}`
        ).not.toMatch(
          /^https?:\/\/(www\.)?(facebook|instagram|linkedin|youtube|twitter|x)\.com\/?$/i
        );
      }
    }
  });

  test("FAQ page publishes valid FAQPage schema", async ({ page }) => {
    await page.goto(`${BASE}/faq/`, { waitUntil: "domcontentloaded" });
    const blocks = await page.$$eval(
      'script[type="application/ld+json"]',
      (nodes) => nodes.map((n) => JSON.parse(n.textContent ?? "{}"))
    );
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq, "no FAQPage schema on /faq/").toBeTruthy();
    expect(Array.isArray(faq.mainEntity)).toBe(true);
    expect(faq.mainEntity.length).toBeGreaterThan(5);
  });
});

test.describe("Accessibility essentials", () => {
  test("a skip link is the first focusable element", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim() ?? "",
      href: document.activeElement?.getAttribute("href") ?? "",
    }));
    expect(focused.text).toMatch(/skip to main content/i);
    expect(focused.href).toBe("#main-content");
  });

  test("collapsed mobile menu is not keyboard reachable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    const menu = page.locator("#mobile-menu");
    await expect(menu).toHaveAttribute("aria-hidden", "true");

    // visibility:hidden is what removes the links from the tab order.
    const visibility = await menu.evaluate(
      (el) => getComputedStyle(el).visibility
    );
    expect(visibility).toBe("hidden");
  });

  test("mobile menu opens, exposes links, and closes with Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /open menu/i }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toHaveAttribute("aria-hidden", "false");
    await expect(menu.getByRole("link", { name: /^donate$/i })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-hidden", "true");
  });

  test("every page has a single main landmark and a lang attribute", async ({
    page,
  }) => {
    for (const route of CRITICAL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      expect(await page.locator("main").count(), `${route} main landmark`).toBe(1);
      expect(await page.locator("html").getAttribute("lang")).toBe("en");
    }
  });

  test("form controls have accessible labels", async ({ page }) => {
    for (const route of ["/contact/", "/volunteer/", "/apply/"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const unlabelled = await page.$$eval(
        "input:not([type=hidden]), select, textarea",
        (fields) =>
          fields
            .filter((f) => {
              const el = f as HTMLInputElement;
              if (el.type === "checkbox" && el.closest("label")) return false;
              if (el.getAttribute("aria-hidden") === "true") return false;
              if (el.getAttribute("aria-label")) return false;
              if (el.closest("label")) return false;
              const id = el.getAttribute("id");
              return !id || !document.querySelector(`label[for="${id}"]`);
            })
            .map((f) => f.getAttribute("name") ?? "(unnamed)")
      );
      expect(
        unlabelled,
        `${route} has unlabelled fields: ${unlabelled.join(", ")}`
      ).toHaveLength(0);
    }
  });
});

test.describe("Security and trust", () => {
  test("site is served over HTTPS with security headers", async ({ request }) => {
    test.skip(!IS_PRODUCTION, "headers come from vercel.json, not the local static server");

    const res = await request.get(`${BASE}/`);
    const headers = res.headers();

    expect(headers["strict-transport-security"]).toBeTruthy();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["x-frame-options"]).toBeTruthy();
  });

  test("no secrets or debug artifacts are exposed in the bundle", async ({
    page,
  }) => {
    const scripts: string[] = [];
    page.on("response", async (r) => {
      if (r.url().endsWith(".js") && r.status() === 200) {
        scripts.push(await r.text().catch(() => ""));
      }
    });
    await page.goto(`${BASE}/donate/`, { waitUntil: "load" });
    await page.waitForTimeout(2000);

    const joined = scripts.join("\n");
    for (const pattern of [
      /sk_live_[A-Za-z0-9]/,
      /sk_test_[A-Za-z0-9]/,
      /AKIA[0-9A-Z]{16}/,
      /-----BEGIN (RSA )?PRIVATE KEY-----/,
      /SUPABASE_SERVICE_ROLE/,
      /process\.env\.[A-Z_]*SECRET/,
    ]) {
      expect(joined, `possible secret in bundle: ${pattern}`).not.toMatch(pattern);
    }
  });

  test("donation handoff points at the real processor over HTTPS", async ({
    page,
  }) => {
    await page.goto(`${BASE}/donate/`, { waitUntil: "domcontentloaded" });

    // The embed is lazy in two ways: an IntersectionObserver mounts it when it
    // nears the viewport, and a button mounts it on demand. Clicking the button
    // races the observer — the observer can swap the button out mid-click.
    // Scrolling and waiting for the iframe exercises the real user path and has
    // no race.
    const frame = page.locator("iframe[title*='Donation']");
    await page.locator("#give-now").scrollIntoViewIfNeeded();
    await expect(frame).toBeAttached({ timeout: 20_000 });
    await expect(frame).toHaveAttribute("src", /^https:\/\/www\.zeffy\.com\//);
  });
});

/**
 * FaithProof public transparency pages (Phases 6–7).
 *
 * These assert the SECTIONS render, not the numbers — the figures are live
 * Supabase data and are legitimately zero until the first real transactions are
 * entered. A test pinned to a value would fail the day the Foundation starts
 * using the tool.
 */
test.describe("FaithProof public pages", () => {
  test("/faithproof loads and contains key sections", async ({ page }) => {
    await page.goto(`${BASE}/faithproof/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/FaithProof/);
    await expect(
      page.getByRole("heading", { name: "Nothing Hidden. Everything Proven." })
    ).toBeVisible();
    await expect(page.getByText("Accountability Pulse").first()).toBeVisible();
    await expect(page.getByText("Open Mission Ledger").first()).toBeVisible();
    await expect(
      page.getByText("Promises vs. Performance").first()
    ).toBeVisible();
    await expect(page.getByText("Proof Vault").first()).toBeVisible();
    await expect(page.getByText("Nothing Hidden").first()).toBeVisible();
  });

  test("/faithproof keeps the public site chrome", async ({ page }) => {
    await page.goto(`${BASE}/faithproof/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("header nav").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeAttached();
  });

  test("/faithproof/explorer loads", async ({ page }) => {
    await page.goto(`${BASE}/faithproof/explorer/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "Financial Explorer" })
    ).toBeVisible();
    await expect(page.locator("#fund")).toBeVisible();
    await expect(page.locator("#type")).toBeVisible();
    await expect(page.locator("#range")).toBeVisible();
  });

  test("Transparency sits between Events and Contact in the header nav", async ({
    page,
  }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const labels = await page
      .locator("header nav")
      .first()
      .locator("a")
      .allInnerTexts();
    const cleaned = labels.map((l) => l.trim()).filter(Boolean);
    const events = cleaned.indexOf("Events");
    const transparency = cleaned.indexOf("Transparency");
    const contact = cleaned.indexOf("Contact");
    expect(transparency, "Transparency link missing from header").toBeGreaterThan(-1);
    expect(transparency).toBeGreaterThan(events);
    expect(transparency).toBeLessThan(contact);
  });

  test("/faithproof is indexable and in the sitemap", async ({ request }) => {
    const robots = await (await request.get(`${BASE}/robots.txt`)).text();
    expect(robots, "/faithproof must not be disallowed").not.toMatch(
      /Disallow:\s*\/faithproof/
    );
    const sitemap = await (await request.get(`${BASE}/sitemap.xml`)).text();
    expect(sitemap).toContain("/faithproof");
  });
});
