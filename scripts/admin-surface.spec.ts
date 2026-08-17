import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import {
  CONFIGURED,
  adminRoutes,
  concreteUrl,
  setup,
  signIn,
  teardown,
  type Fixture,
} from "./_fixtures";

/**
 * ADMIN SURFACE SWEEP.
 *
 * Loads every route under /admin as an ADMIN and again as a BOARD member and
 * asks, of each page, the questions a person would ask while using it:
 *
 *   - does it render at all, or does it throw
 *   - does anything on it say `undefined`, `NaN`, `[object Object]` or
 *     `Invalid Date` — the visible face of a data bug
 *   - does every button have a name a screen reader could announce
 *   - does every internal link go somewhere that exists
 *   - does every form control have a label
 *
 * READ ONLY. This suite navigates and inspects. It clicks nothing that submits,
 * transitions or deletes; those are covered separately and only against seeded
 * rows. Nothing here can change production data.
 *
 * The findings are written to `test-results/admin-surface.json` so the audit
 * report quotes measurements rather than impressions.
 */

const ROUTES = adminRoutes();

/** Opening the room starts a live call; scripts/meeting-room.spec.ts owns it. */
const SKIP = new Set(["/admin/board/meetings/[id]/room"]);

/**
 * A board member may read only PUBLIC promises (migration 001), so the seeded
 * internal promise 404s for them. That is RLS working, not a broken page.
 */
const BOARD_EXPECT_DENIED = new Set([
  "/admin/promises/[id]",
  "/admin/promises/[id]/edit",
]);

const BAD_TEXT = [
  { needle: "undefined", label: "undefined" },
  { needle: "NaN", label: "NaN" },
  { needle: "[object Object]", label: "[object Object]" },
  { needle: "Invalid Date", label: "Invalid Date" },
];

type Finding = {
  role: string;
  route: string;
  url: string;
  kind: string;
  detail: string;
};

const findings: Finding[] = [];
const stats: Record<string, { buttons: number; links: number; inputs: number }> = {};
let fx: Fixture | null = null;

/** Cache of link targets already checked, so 56 pages do not re-check /admin/. */
const linkStatus = new Map<string, number>();

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  fx = await setup(Date.now().toString(36));
});

test.afterAll(async () => {
  await teardown(fx);
  const out = path.join(process.cwd(), "test-results");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "admin-surface.json"),
    JSON.stringify({ findings, stats }, null, 2)
  );
});

async function sweep(page: Page, role: "admin" | "board") {
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  for (const route of ROUTES) {
    if (SKIP.has(route)) continue;
    const url = concreteUrl(route, fx!);
    if (!url) {
      findings.push({
        role,
        route,
        url: "",
        kind: "no-fixture",
        detail: "no seeded row to build a concrete URL from",
      });
      continue;
    }

    consoleErrors.length = 0;
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    const status = response?.status() ?? 0;

    const denied = BOARD_EXPECT_DENIED.has(route) && role === "board";
    if (denied) {
      // Refusal is the correct answer; only assert it is a clean one.
      expect(
        [200, 403, 404],
        `${role} ${route} answered ${status}`
      ).toContain(status);
      continue;
    }

    if (status >= 500) {
      findings.push({ role, route, url, kind: "server-error", detail: String(status) });
      continue;
    }
    expect(status, `${role} ${route} answered ${status}`).toBeLessThan(400);

    // ── Does the page actually say anything ────────────────────────────
    const h1 = await page.locator("h1").count();
    if (h1 === 0) {
      findings.push({ role, route, url, kind: "no-h1", detail: "page has no h1" });
    }

    const bodyText = await page.locator("body").innerText();
    for (const { needle, label } of BAD_TEXT) {
      // `NaN` inside a longer word is a false positive; match it standalone.
      const re = label === "NaN" ? /\bNaN\b/ : new RegExp(needle.replace(/[[\]]/g, "\\$&"));
      if (re.test(bodyText)) {
        const line = bodyText.split("\n").find((l) => re.test(l)) ?? "";
        findings.push({ role, route, url, kind: "bad-text", detail: `${label}: ${line.trim().slice(0, 120)}` });
      }
    }

    // ── Interactive elements ───────────────────────────────────────────
    const buttons = await page.locator("button").all();
    let nameless = 0;
    for (const b of buttons) {
      const name = ((await b.getAttribute("aria-label")) ?? (await b.innerText()) ?? "").trim();
      if (!name) nameless++;
    }
    if (nameless > 0) {
      findings.push({ role, route, url, kind: "unnamed-button", detail: `${nameless} button(s) with no accessible name` });
    }

    const inputs = await page.locator("input, select, textarea").all();
    let unlabelled = 0;
    for (const el of inputs) {
      const type = (await el.getAttribute("type")) ?? "";
      if (type === "hidden") continue;
      const aria = (await el.getAttribute("aria-label")) ?? (await el.getAttribute("aria-labelledby"));
      const placeholder = await el.getAttribute("placeholder");
      // `<label>Date <input/></label>` is implicit labelling and perfectly
      // accessible — checking only `label[for]` reports it as a defect when it
      // is not one, so look for a wrapping label too.
      const labelled = await el.evaluate((node) => {
        const el2 = node as HTMLElement;
        if (el2.closest("label")) return true;
        const id = el2.getAttribute("id");
        return Boolean(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
      });
      if (!labelled && !aria && !placeholder) unlabelled++;
    }
    if (unlabelled > 0) {
      findings.push({ role, route, url, kind: "unlabelled-input", detail: `${unlabelled} control(s) with no label, aria-label or placeholder` });
    }

    stats[`${role} ${route}`] = {
      buttons: buttons.length,
      links: await page.locator("a[href]").count(),
      inputs: inputs.length,
    };

    // ── Internal links must resolve ────────────────────────────────────
    const hrefs = await page.locator("a[href]").evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? "")
    );
    for (const href of new Set(hrefs)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      if (href.startsWith("/admin/board/meetings/") && href.endsWith("/room/")) continue;
      if (linkStatus.has(href)) {
        if ((linkStatus.get(href) ?? 0) >= 400) {
          findings.push({ role, route, url, kind: "dead-link", detail: `${href} → ${linkStatus.get(href)}` });
        }
        continue;
      }
      const res = await page.request.get(href, { failOnStatusCode: false });
      linkStatus.set(href, res.status());
      if (res.status() >= 400) {
        findings.push({ role, route, url, kind: "dead-link", detail: `${href} → ${res.status()}` });
      }
    }

    // ── Client-side crashes ────────────────────────────────────────────
    const real = consoleErrors.filter(
      (e) =>
        !/favicon|net::ERR_|Failed to load resource|third-party cookie|Pusher/i.test(e)
    );
    if (real.length) {
      findings.push({ role, route, url, kind: "console-error", detail: real[0].slice(0, 200) });
    }
  }
}

/**
 * Serial: both tests append to one `findings` array that `afterAll` writes to
 * `test-results/admin-surface.json`. Split across workers, each would write a
 * partial file over the other's.
 */
test.describe.configure({ mode: "serial" });

test.describe("Admin surface", () => {
  test("every admin route renders cleanly for an administrator", async ({ page }) => {
    test.setTimeout(20 * 60_000);
    await signIn(page, fx!.users.admin.email);
    await sweep(page, "admin");

    const mine = findings.filter((f) => f.role === "admin");
    const serious = mine.filter((f) =>
      ["server-error", "dead-link", "console-error", "bad-text"].includes(f.kind)
    );
    console.log(`admin: ${ROUTES.length} routes, ${mine.length} findings`);
    for (const f of mine) console.log(`  [${f.kind}] ${f.route} — ${f.detail}`);
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("every admin route renders cleanly for a board member", async ({ page }) => {
    test.setTimeout(20 * 60_000);
    await signIn(page, fx!.users.board.email);
    await sweep(page, "board");

    const mine = findings.filter((f) => f.role === "board");
    const serious = mine.filter((f) =>
      ["server-error", "dead-link", "console-error", "bad-text"].includes(f.kind)
    );
    console.log(`board: ${ROUTES.length} routes, ${mine.length} findings`);
    for (const f of mine) console.log(`  [${f.kind}] ${f.route} — ${f.detail}`);
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
