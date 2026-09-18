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
 * DEPARTED-OFFICER SWEEP — added 2026-09-18.
 *
 * The President and Executive Director resigned on 2026-09-18 and every
 * reference to them was removed from the site. This walks the whole public
 * surface and asserts three things at once:
 *
 *   1. The departed officer's name appears nowhere in a rendered DOM — not in
 *      copy, not in an `alt` attribute, not in a `<title>`, not in a meta
 *      description, and not in JSON-LD.
 *   2. No vacancy language leaks. The office is vacant, and the public is told
 *      nothing about that: no empty card, no "Position Open", no "TBD".
 *   3. The board renders as exactly the three serving directors.
 *
 * (1) is the reason this test exists at all: a name removed from a component
 * but left in a metadata string is still on the page as far as a search engine
 * is concerned, and only a rendered-DOM assertion catches that.
 */
const DEPARTED = /\bron\b|\blanders\b/i;

/**
 * Vacancy language. `TBD` is checked separately below because /events has
 * carried an unrelated "Time TBD" on the volunteer orientation since long
 * before the resignation — it is an event time, not an unfilled office.
 */
const VACANCY_LANGUAGE =
  /\bvacant\b|\bvacancy\b|position open|open position|coming soon|to be appointed|to be announced|interim president/i;
const UNRELATED_TBD = "Time TBD";

test("the departed officer appears nowhere on the public site", async ({ page }) => {
  test.setTimeout(20 * 60_000);
  const leaks: string[] = [];

  for (const route of ROUTES) {
    const url = route === "/" ? "/" : route + "/";
    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    if ((res?.status() ?? 0) >= 400) continue;

    // The whole document, not just visible text: alt attributes, <title>, meta
    // descriptions and JSON-LD all carry names a visitor never reads but a
    // crawler does.
    const html = await page.content();
    if (DEPARTED.test(html)) {
      const line = html.split("\n").find((l) => DEPARTED.test(l)) ?? html;
      leaks.push(`${route}: departed officer named — ${line.trim().slice(0, 200)}`);
    }

    const alts = await page
      .locator("img[alt]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? ""));
    for (const alt of alts) {
      if (DEPARTED.test(alt)) leaks.push(`${route}: alt text names departed officer — ${alt}`);
    }

    const body = await page.locator("body").innerText();
    if (VACANCY_LANGUAGE.test(body)) {
      const line = body.split("\n").find((l) => VACANCY_LANGUAGE.test(l)) ?? "";
      leaks.push(`${route}: vacancy language — ${line.trim().slice(0, 200)}`);
    }
    const tbd = body
      .split("\n")
      .filter((l) => /\bTBD\b/.test(l) && !l.includes(UNRELATED_TBD));
    for (const l of tbd) leaks.push(`${route}: unexplained TBD — ${l.trim().slice(0, 200)}`);

    // A card carrying an officer title but no name would be an empty slot
    // reaching the page — the exact failure the roster's name filter exists to
    // prevent.
    const emptyCards = await page.evaluate(() =>
      [...document.querySelectorAll("li, article")].filter((el) => {
        const t = (el as HTMLElement).innerText ?? "";
        if (!/president|executive director|secretary|treasurer|board chair/i.test(t)) return false;
        const withoutTitles = t.replace(
          /president|executive director|secretary|treasurer|board chair|founder|chief strategy officer|protector/gi,
          ""
        );
        return withoutTitles.replace(/[^a-z]/gi, "").length === 0;
      }).length
    );
    if (emptyCards > 0) {
      leaks.push(`${route}: ${emptyCards} officer card(s) carry a title but no name`);
    }
  }

  console.log(`departed-officer sweep: ${ROUTES.length} routes, ${leaks.length} leaks`);
  for (const l of leaks) console.log(`  ${l}`);
  expect(leaks, leaks.join("\n")).toEqual([]);
});

test("team, about and governance render exactly the three serving directors", async ({
  page,
}) => {
  const SERVING = ["Pastor Juan Valdez", "Scott Ellis", "Reid Whitesides"];

  // /governance — three name cards in a single row, no fourth and no hole.
  await page.goto("/governance/", { waitUntil: "domcontentloaded" });
  const govCards = page.locator("section ul.grid > li");
  await expect(govCards).toHaveCount(3);
  for (const name of SERVING) {
    await expect(govCards.filter({ hasText: name })).toHaveCount(1);
  }

  // /team — three directory cards, each with a name, a role and a portrait.
  await page.goto("/team/", { waitUntil: "domcontentloaded" });
  const teamCards = page.locator("article.card-team");
  await expect(teamCards).toHaveCount(3);
  for (const name of SERVING) {
    await expect(teamCards.filter({ hasText: name })).toHaveCount(1);
  }
  const brokenPortraits = await page.evaluate(() =>
    [...document.querySelectorAll("article.card-team img")].filter(
      (i) => !(i as HTMLImageElement).getAttribute("src")
    ).length
  );
  expect(brokenPortraits, "team portraits with no src").toBe(0);

  // The grid must not leave a hole where the fourth card used to be: with an
  // odd roster the last card is centred, so no card may sit flush left in a
  // row of its own while the row beside it is empty.
  const rowGeometry = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("article.card-team")];
    const grid = cards[0]?.parentElement;
    if (!grid) return null;
    const g = grid.getBoundingClientRect();
    const last = cards[cards.length - 1].getBoundingClientRect();
    const leftGap = last.left - g.left;
    const rightGap = g.right - last.right;
    return { leftGap: Math.round(leftGap), rightGap: Math.round(rightGap) };
  });
  expect(rowGeometry, "team grid geometry").not.toBeNull();
  // Centred means the space either side of the final card matches.
  expect(
    Math.abs((rowGeometry?.leftGap ?? 0) - (rowGeometry?.rightGap ?? 0)),
    `final team card is not centred: ${JSON.stringify(rowGeometry)}`
  ).toBeLessThanOrEqual(2);

  // /about — three avatars in the leadership strip, named in their alt text.
  await page.goto("/about/", { waitUntil: "domcontentloaded" });
  const avatarAlts = await page
    .locator("img[alt*='at FAITH Foundation']")
    .evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? ""));
  expect(avatarAlts.length, "about leadership avatars").toBe(3);
  for (const name of SERVING) {
    expect(avatarAlts.some((a) => a.includes(name)), `${name} in about avatars`).toBe(true);
  }
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
