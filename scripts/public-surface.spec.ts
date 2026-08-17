import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { publicRoutes } from "./_fixtures";

/**
 * PUBLIC SURFACE SWEEP.
 *
 * Every page a visitor — or a Google for Nonprofits reviewer — can reach,
 * loaded and inspected. Read-only: it submits nothing, so no email is sent and
 * no row is written.
 *
 * What it asks of each page:
 *   - does it answer 200
 *   - does it have exactly one h1, and a <title>
 *   - does it show `undefined`, `NaN`, `[object Object]`, `Invalid Date`
 *   - does every internal link resolve
 *   - does it carry the site header and footer
 *   - does any form on it have a submit control
 *   - does any copy name the corporate donor partner directly (a standing rule:
 *     that partner is never named in public copy)
 *
 * Findings land in `test-results/public-surface.json`.
 */

const ROUTES = publicRoutes();

const BAD_TEXT: [RegExp, string][] = [
  [/\bundefined\b/, "undefined"],
  [/\bNaN\b/, "NaN"],
  [/\[object Object\]/, "[object Object]"],
  [/Invalid Date/, "Invalid Date"],
  [/lorem ipsum/i, "lorem ipsum"],
  [/\bTODO\b/, "TODO"],
  [/coming soon/i, "coming soon"],
  [/example\.com/i, "example.com"],
  [/123-456-7890/, "placeholder phone"],
];

/** The corporate donor partner is never named in public-facing copy. */
const NEVER_IN_PUBLIC = /bright\s*box/i;

type Finding = { route: string; kind: string; detail: string };
const findings: Finding[] = [];
const linkStatus = new Map<string, number>();

test.afterAll(async () => {
  const out = path.join(process.cwd(), "test-results");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "public-surface.json"), JSON.stringify(findings, null, 2));
});

test("every public page renders, links resolve, and nothing reads like a placeholder", async ({
  page,
}) => {
  test.setTimeout(20 * 60_000);

  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  for (const route of ROUTES) {
    const url = route === "/" ? "/" : route + "/";
    consoleErrors.length = 0;

    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      findings.push({ route, kind: "status", detail: String(status) });
      continue;
    }

    const title = await page.title();
    if (!title.trim()) findings.push({ route, kind: "no-title", detail: "empty <title>" });

    const h1s = await page.locator("h1").count();
    if (h1s === 0) findings.push({ route, kind: "no-h1", detail: "no h1" });
    if (h1s > 1) findings.push({ route, kind: "multiple-h1", detail: `${h1s} h1 elements` });

    const body = await page.locator("body").innerText();
    for (const [re, label] of BAD_TEXT) {
      if (re.test(body)) {
        const line = body.split("\n").find((l) => re.test(l)) ?? "";
        findings.push({ route, kind: "placeholder-text", detail: `${label}: ${line.trim().slice(0, 120)}` });
      }
    }
    if (NEVER_IN_PUBLIC.test(body)) {
      findings.push({ route, kind: "named-partner", detail: "corporate donor partner named in public copy" });
    }

    // Header and footer, on every page, so navigation never dead-ends.
    if ((await page.locator("header").count()) === 0) {
      findings.push({ route, kind: "no-header", detail: "no <header>" });
    }
    if ((await page.locator("footer").count()) === 0) {
      findings.push({ route, kind: "no-footer", detail: "no <footer>" });
    }

    /**
     * A form with no control at all is a dead end. A form whose submit button
     * appears only on the last step of a wizard is NOT — /apply is exactly
     * that, and flagging it was a false positive. So require *some* control,
     * and let the wizard test below prove the submit actually arrives.
     */
    const forms = await page.locator("form").all();
    for (const [i, form] of forms.entries()) {
      const controls = await form.locator('button, input[type="submit"]').count();
      if (controls === 0) {
        findings.push({ route, kind: "form-no-submit", detail: `form #${i + 1} has no button of any kind` });
      }
    }

    const hrefs = await page.locator("a[href]").evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? "")
    );
    for (const href of new Set(hrefs)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const target = href.split("#")[0] || "/";
      if (linkStatus.has(target)) {
        if ((linkStatus.get(target) ?? 0) >= 400) {
          findings.push({ route, kind: "dead-link", detail: `${target} → ${linkStatus.get(target)}` });
        }
        continue;
      }
      const r = await page.request.get(target, { failOnStatusCode: false });
      linkStatus.set(target, r.status());
      if (r.status() >= 400) {
        findings.push({ route, kind: "dead-link", detail: `${target} → ${r.status()}` });
      }
    }

    const real = consoleErrors.filter(
      (e) => !/favicon|net::ERR_|Failed to load resource|third-party cookie/i.test(e)
    );
    if (real.length) {
      findings.push({ route, kind: "console-error", detail: real[0].slice(0, 200) });
    }
  }

  console.log(`public: ${ROUTES.length} routes, ${findings.length} findings`);
  for (const f of findings) console.log(`  [${f.kind}] ${f.route} — ${f.detail}`);

  const serious = findings.filter((f) =>
    ["status", "dead-link", "console-error", "named-partner", "placeholder-text", "form-no-submit"].includes(f.kind)
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

/**
 * The application wizard has to be walked, not just loaded: its submit button
 * lives on the last step, so a page-level check cannot see it. This clicks
 * through every step and stops at the submit — it never presses it, because
 * pressing it emails a real application to the foundation.
 */
test("the application wizard reaches a submit button", async ({ page }) => {
  await page.goto("/apply/", { waitUntil: "domcontentloaded" });

  const cont = page.getByRole("button", { name: /continue/i });
  for (let step = 0; step < 12; step++) {
    if (!(await cont.isVisible().catch(() => false))) break;
    await cont.click();
    await page.waitForTimeout(150);
  }

  // Named, not positional: the footer's newsletter form also holds a submit,
  // and `form button[type=submit]` matches both.
  const submit = page.getByRole("button", {
    name: /submit application|complete the spam check/i,
  });
  // Disabled until the spam check passes is correct, so assert on presence and
  // on the label telling the applicant why, not on it being clickable.
  await expect(submit).toBeVisible();
});
