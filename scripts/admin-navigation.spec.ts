import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ADMIN NAVIGATION CRAWL — the standing guard against orphaned pages.
 *
 * WHY THIS EXISTS. Three separate live incidents, all the same class: a page
 * that exists, builds, and works, but that no logged-in user can REACH by
 * clicking. The video room (Phase 21), the minutes page (21.1), and meeting
 * creation (21.2). Every one of them passed its own tests, because every one of
 * those tests navigated by URL.
 *
 * A static link check does not catch this. In all three cases a link existed in
 * the source — wrapped in a role gate or a time window that hid it in practice.
 * Only walking the rendered DOM finds that.
 *
 * WHAT IT DOES. Enumerates every route from the App Router file tree, then
 * crawls from /admin as an ADMIN and again as a BOARD member, following only
 * anchors that are actually rendered, and asserts that every route was reached.
 * It fails if a future phase ships a page nobody can click to.
 *
 * Six Laws: this is Law 5, WIRING. See governance/AGENTS.md.
 */

function readEnvLocal(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.local");
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = readEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SUPABASE_URL && SERVICE_KEY);

/** Every route under /admin, read from the file tree — never hand-maintained. */
function enumerateRoutes(): string[] {
  const appDir = path.join(process.cwd(), "src", "app", "admin");
  const routes: string[] = [];
  (function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "page.tsx") {
        const rel = path
          .relative(path.join(process.cwd(), "src", "app"), dir)
          .replace(/\\/g, "/");
        routes.push("/" + rel);
      }
    }
  })(appDir);
  return routes.sort();
}

const ROUTES = enumerateRoutes();

/**
 * Routes deliberately left out of the reachability assertion, each with a
 * reason. Anything not listed here MUST be reachable by clicking.
 */
const EXCLUDED: Record<string, string> = {
  // Opening the room acquires camera and microphone and starts a signalling
  // session. It IS reachable — scripts/meeting-room.spec.ts clicks into it from
  // the detail page and asserts exactly that — but a blind crawl should not
  // open a live call on every pass.
  "/admin/board/meetings/[id]/room":
    "covered by meeting-room.spec.ts, which clicks into it from the detail page",
};

/**
 * Additionally excluded for the BOARD role — a data-visibility limit, not an
 * orphan.
 *
 * `promises` carries two policies from migration 001: anyone may read rows with
 * is_public = true, and ADMINS may read everything. A board member therefore
 * sees only published promises, so a promise detail page is reachable for them
 * only when a public promise happens to exist. The seed here is deliberately
 * internal (is_public: false) because a fixture promise must never appear on
 * the public /faithproof page, even for the minutes a test run lasts.
 *
 * The admin crawl covers both routes, and the board crawl still asserts that
 * /admin/promises itself is reachable.
 */
const EXCLUDED_FOR_BOARD: Record<string, string> = {
  "/admin/promises/[id]":
    "RLS: board members may read only public promises; covered by the admin crawl",
  "/admin/promises/[id]/edit":
    "RLS: board members may read only public promises; covered by the admin crawl",
};

const EMAIL_ADMIN = `nav-admin-${Date.now().toString(36)}@faithproof.invalid`;
const EMAIL_BOARD = `nav-board-${Date.now().toString(36)}@faithproof.invalid`;
const PASSWORD = "Sm0ke-Test-Nav212";

const admin: SupabaseClient | null = CONFIGURED
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

const users: Record<string, string> = {};
const seeded: { table: string; id: string }[] = [];

async function seed(table: string, row: Record<string, unknown>) {
  const { data, error } = await admin!.from(table).insert(row).select("id").single();
  if (error) throw new Error(`${table}: ${error.message}`);
  seeded.unshift({ table, id: (data as { id: string }).id });
  return (data as { id: string }).id;
}

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!admin) return;

  for (const [email, role] of [
    [EMAIL_ADMIN, "admin"],
    [EMAIL_BOARD, "board"],
  ] as const) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `Nav crawl ${role}` },
    });
    if (error) throw new Error(`createUser ${role}: ${error.message}`);
    users[role] = data.user.id;
    await admin.from("profiles").update({ role }).eq("id", data.user.id);
  }

  /**
   * One row per entity, so that list pages render the row links that lead to
   * detail pages. Without data every detail route looks orphaned for the
   * uninteresting reason that there is nothing to click.
   *
   * Everything is created in a state with no side effects: transactions and
   * vouchers stay `pending` so the accounting triggers do not fire.
   */
  const contactId = await seed("contacts", {
    type: "donor",
    first_name: "Nav",
    last_name: "Crawl",
    email: "nav-crawl@example.invalid",
  });
  await seed("tasks", {
    contact_id: contactId,
    title: "NAV CRAWL - delete me",
    priority: "low",
    status: "pending",
  });
  await admin
    .from("campaign_tags")
    .insert({ contact_id: contactId, campaign: "NAV CRAWL CAMPAIGN" });
  await seed("email_templates", {
    name: "NAV CRAWL TEMPLATE",
    subject: "Nav crawl",
    body_html: "<p>nav crawl</p>",
  });
  await seed("transactions", {
    type: "donation",
    status: "pending",
    amount_cents: 100,
    fund: "unrestricted",
    transaction_date: "2026-09-01",
    description: "NAV CRAWL - delete me",
  });
  await seed("vouchers", {
    voucher_number: `NAV-${Date.now().toString(36)}`,
    status: "pending",
    amount_cents: 100,
    fund: "housing_voucher",
  });
  await seed("promises", {
    title: "NAV CRAWL - delete me",
    status: "active",
    is_public: false,
  });
  await seed("proof_documents", {
    title: "NAV CRAWL - delete me",
    type: "other",
    is_public: false,
    verified: false,
  });
  await seed("grants", { name: "NAV CRAWL", funder: "Nav", status: "prospect" });
  await seed("volunteer_events", {
    name: "NAV CRAWL - delete me",
    date: "2026-09-01",
    status: "scheduled",
  });
  await seed("cornerstone_projects", {
    name: "NAV CRAWL - delete me",
    phase: 1,
    phase_status: "not_started",
  });
  await seed("board_meetings", {
    meeting_date: "2026-09-01",
    type: "regular",
    agenda: "NAV CRAWL - delete me",
  });
});

test.afterAll(async () => {
  if (!admin) return;
  await admin.from("campaign_tags").delete().eq("campaign", "NAV CRAWL CAMPAIGN");
  for (const { table, id } of seeded) {
    await admin.from(table).delete().eq("id", id);
  }
  for (const id of Object.values(users)) {
    const del = await admin.auth.admin.deleteUser(id);
    // audit_log.actor_id references profiles with no cascade, deliberately.
    if (del.error) await admin.from("profiles").update({ role: "public" }).eq("id", id);
  }
});

async function signIn(page: Page, email: string) {
  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

/** Does a concrete URL match a route pattern like /admin/grants/[id]? */
function matchesPattern(url: string, pattern: string): boolean {
  const u = url.replace(/\/+$/, "").split("/").filter(Boolean);
  const p = pattern.replace(/\/+$/, "").split("/").filter(Boolean);
  if (u.length !== p.length) return false;
  return p.every((seg, i) => (seg.startsWith("[") ? true : seg === u[i]));
}

/**
 * Walk the admin from /admin, following ONLY anchors that are rendered.
 * Returns the set of route patterns actually reached.
 */
async function crawl(page: Page): Promise<{ reached: Set<string>; visited: string[] }> {
  const queue = ["/admin/"];
  const seen = new Set<string>();
  const reached = new Set<string>();
  const visited: string[] = [];

  while (queue.length > 0 && visited.length < 80) {
    const next = queue.shift() as string;
    const key = next.replace(/\/+$/, "");
    if (seen.has(key)) continue;
    seen.add(key);

    // The room is excluded from the crawl itself; see EXCLUDED.
    if (/\/room\/?$/.test(key)) continue;

    await page.goto(next, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    visited.push(key);

    for (const pattern of ROUTES) {
      if (matchesPattern(key, pattern)) reached.add(pattern);
    }

    const hrefs: string[] = await page.$$eval('a[href^="/admin"]', (nodes) =>
      nodes
        .map((n) => (n as HTMLAnchorElement).getAttribute("href") ?? "")
        .filter(Boolean)
    );

    for (const href of hrefs) {
      const clean = href.split("#")[0].split("?")[0];
      if (!clean.startsWith("/admin")) continue;
      if (!seen.has(clean.replace(/\/+$/, ""))) queue.push(clean);
    }
  }

  return { reached, visited };
}

test.describe("ADMIN NAVIGATION — no orphaned pages", () => {
  test("every admin route is reachable by clicking, as an ADMIN", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await signIn(page, EMAIL_ADMIN);
    const { reached, visited } = await crawl(page);

    const missing = ROUTES.filter((r) => !reached.has(r) && !(r in EXCLUDED));
    console.log(`admin crawl visited ${visited.length} pages`);
    expect(
      missing,
      `Unreachable by clicking from /admin as an admin:\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  test("every admin route is reachable by clicking, as a BOARD member", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await signIn(page, EMAIL_BOARD);
    const { reached, visited } = await crawl(page);

    const missing = ROUTES.filter(
      (r) => !reached.has(r) && !(r in EXCLUDED) && !(r in EXCLUDED_FOR_BOARD)
    );
    console.log(`board crawl visited ${visited.length} pages`);

    // The section itself must still be reachable even though its detail pages
    // hold nothing this role may read.
    expect(reached.has("/admin/promises")).toBe(true);
    expect(
      missing,
      `Unreachable by clicking from /admin as a board member:\n  ${missing.join("\n  ")}`
    ).toEqual([]);
  });

  test("the route enumeration is not silently empty", () => {
    // A guard on the guard: if the file-tree walk ever breaks, the two crawls
    // above would pass vacuously.
    expect(ROUTES.length).toBeGreaterThan(40);
    expect(ROUTES).toContain("/admin/board/meetings/new");
  });
});
