import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * FUND DESIGNATION, END TO END.
 *
 * A donor may direct a gift to one of six programmes. This suite checks that
 * the designation survives the whole journey — stored on the transaction,
 * carried into the double-entry ledger, shown and filterable in the admin, and
 * published on the public pages as an aggregate.
 *
 * THE PRIVACY TEST IS THE IMPORTANT ONE. /governance/donor-privacy promises
 * that we never publish which fund an individual donor chose. The last tests
 * here try to break that promise and must fail to.
 *
 * WHAT THIS SUITE WILL NOT DO. It never creates a PUBLIC confirmed donation.
 * The database is shared with the live site, so a fixture marked public would
 * appear on the real transparency page — fake money on the one page whose
 * entire purpose is that the numbers are true. Every fixture here is
 * `is_public: false`, which RLS makes invisible to anonymous readers, and the
 * public assertions run against the one real donation already on record.
 *
 * TEST DATA: transactions tagged `FUND SPEC`, deleted in afterAll.
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

const STAMP = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const EMAIL = `fund-${STAMP}@faithproof.invalid`;
const PASSWORD = "Sm0ke-Test-Fund23";

/** A name that could not occur naturally, so finding it anywhere is proof. */
const SECRET_DONOR = `Zzyzx Privacycheck ${STAMP}`;

const admin: SupabaseClient | null = CONFIGURED
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

let userId: string | null = null;
const txIds: string[] = [];

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!admin) return;

  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Fund spec" },
  });
  if (error) throw new Error("createUser: " + error.message);
  userId = data.user.id;
  await admin.from("profiles").update({ role: "admin" }).eq("id", userId);

  // A designated gift for the admin-side assertions. Pending and NOT public:
  // pending keeps it out of the ledger, not public keeps it off the live site.
  const veterans = await admin
    .from("transactions")
    .insert({
      type: "donation",
      status: "pending",
      amount_cents: 12345,
      fund: "veterans",
      transaction_date: "2026-09-01",
      description: "FUND SPEC - veterans designated",
      donor_name: "Fund Spec Donor",
      donor_anonymous: false,
      is_public: false,
    })
    .select("id")
    .single();
  if (veterans.error) throw new Error("seed veterans: " + veterans.error.message);
  txIds.push(veterans.data.id);

  /**
   * A CONFIRMED gift carrying an unmistakable donor name, deliberately left
   * non-public. If the public pages ever widen what they read, this name is
   * what will show up, and the privacy tests below will catch it.
   */
  const hidden = await admin
    .from("transactions")
    .insert({
      type: "donation",
      status: "confirmed",
      amount_cents: 777_77,
      fund: "recovery",
      transaction_date: "2026-09-01",
      description: "FUND SPEC - private confirmed gift",
      donor_name: SECRET_DONOR,
      donor_anonymous: false,
      is_public: false,
    })
    .select("id")
    .single();
  if (hidden.error) throw new Error("seed hidden: " + hidden.error.message);
  txIds.push(hidden.data.id);
});

test.afterAll(async () => {
  if (!admin) return;

  /**
   * The ledger has to be cleaned FIRST, and by hand.
   *
   * `journal_entries.reference` is text, not a foreign key — deliberately, so
   * that voiding leaves an audit trail a deletion cannot erase. The
   * consequence is that deleting a transaction leaves its journal entries
   * behind, and a suite that confirms a fixture would silently accumulate fake
   * entries in the real books on every run. Net zero, but present, and a
   * ledger nobody trusts is worse than no ledger.
   */
  for (const id of txIds) {
    const refs = [`transaction:${id}`, `transaction:${id}:reversal`];
    const { data: entries } = await admin
      .from("journal_entries")
      .select("id")
      .in("reference", refs);
    for (const e of (entries ?? []) as { id: string }[]) {
      await admin.from("journal_lines").delete().eq("entry_id", e.id);
      await admin.from("journal_entries").delete().eq("id", e.id);
    }
  }

  for (const id of txIds) await admin.from("transactions").delete().eq("id", id);
  if (userId) {
    const del = await admin.auth.admin.deleteUser(userId);
    if (del.error) await admin.from("profiles").update({ role: "public" }).eq("id", userId);
  }
});

async function signIn(page: Page) {
  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

/** The six funds a donor can choose, by the name the Zeffy form uses. */
const SIX = [
  "General Fund",
  "Housing Voucher Program",
  "Veterans Path Home",
  "Recovery Housing",
  "Second Chance Reentry",
  "Cornerstone Communities",
];

test.describe("Fund designation — admin", () => {
  test("the transaction list shows the fund and offers all six as filters", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/transactions/", { waitUntil: "domcontentloaded" });

    const filter = page.getByTestId("fund-filter");
    await expect(filter).toBeVisible();
    for (const label of SIX) {
      await expect(filter.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // `operational` is an internal designation, never a donor's choice, so it
    // must not be offered as a way to filter gifts.
    await expect(filter).not.toContainText(/operational/i);

    await expect(page.getByTestId("tx-fund").first()).toBeVisible();
  });

  test("filtering by fund actually filters", async ({ page }) => {
    await signIn(page);

    await page.goto("/admin/transactions/?fund=veterans", {
      waitUntil: "domcontentloaded",
    });
    // The list shows date, type, fund, amount, donor, status and reference —
    // not the description — so identify the fixture by its donor and amount.
    await expect(page.getByText("Fund Spec Donor")).toBeVisible();
    await expect(page.getByText("$123.45")).toBeVisible();
    const funds = await page.getByTestId("tx-fund").allInnerTexts();
    expect(funds.length).toBeGreaterThan(0);
    expect(
      funds.every((f) => f.trim() === "Veterans Path Home"),
      `every row must be the filtered fund, got: ${funds.join(" | ")}`
    ).toBe(true);

    // A different fund must not show it.
    await page.goto("/admin/transactions/?fund=housing_voucher", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Fund Spec Donor")).toHaveCount(0);
  });

  test("a fund that was inferred is marked unverified, not asserted", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/transactions/?fund=unrestricted", {
      waitUntil: "domcontentloaded",
    });
    // The one real donation on record predates any path that captured a
    // designation, so it carries the flag.
    await expect(page.getByText(/unverified/i).first()).toBeVisible();
  });

  test("the detail page shows the fund", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/transactions/${txIds[0]}/`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("tx-fund")).toContainText("Veterans Path Home");
  });
});

test.describe("Fund designation — the ledger", () => {
  test("confirming a designated gift posts it to that fund, restricted", async () => {
    // Uses its own row so the suite can confirm without touching anything real,
    // then voids it, which reverses rather than deletes.
    const seeded = await admin!
      .from("transactions")
      .insert({
        type: "donation",
        status: "pending",
        amount_cents: 4200,
        fund: "cornerstone_communities",
        transaction_date: "2026-09-01",
        description: "FUND SPEC - ledger check",
        is_public: false,
        donor_anonymous: true,
      })
      .select("id")
      .single();
    expect(seeded.error, seeded.error?.message).toBeNull();
    const id = seeded.data!.id as string;
    txIds.push(id);

    await admin!.from("transactions").update({ status: "confirmed" }).eq("id", id);

    const { data: lines } = await admin!
      .from("journal_lines")
      .select("fund, debit_cents, credit_cents, journal_entries!inner(reference), accounts!inner(code, is_restricted)")
      .eq("journal_entries.reference", `transaction:${id}`);

    const rows = (lines ?? []) as unknown as {
      fund: string;
      debit_cents: number;
      credit_cents: number;
      accounts: { code: string; is_restricted: boolean };
    }[];

    expect(rows.length, "a confirmed donation must post two lines").toBe(2);
    expect(
      rows.every((r) => r.fund === "cornerstone_communities"),
      "every line must carry the fund it belongs to"
    ).toBe(true);
    expect(
      rows.every((r) => r.accounts.is_restricted),
      "a donor-designated gift is restricted under ASU 2016-14"
    ).toBe(true);
    // Debits equal credits.
    expect(rows.reduce((n, r) => n + r.debit_cents - r.credit_cents, 0)).toBe(0);

    // Clean the ledger up: void reverses, which is the only correct way.
    await admin!.from("transactions").update({ status: "voided" }).eq("id", id);
    const { data: after } = await admin!
      .from("journal_lines")
      .select("debit_cents, credit_cents, journal_entries!inner(reference)")
      .like("journal_entries.reference", `transaction:${id}%`);
    const net = ((after ?? []) as unknown as { debit_cents: number; credit_cents: number }[]).reduce(
      (n, r) => n + r.debit_cents - r.credit_cents,
      0
    );
    expect(net, "the reversal must return the fund to zero").toBe(0);
  });
});

test.describe("Fund designation — public, and donor privacy", () => {
  test("/faithproof publishes a total for every fund", async ({ page }) => {
    await page.goto("/faithproof/", { waitUntil: "domcontentloaded" });
    const totals = page.getByTestId("fund-totals");
    await expect(totals).toBeVisible();
    for (const label of SIX) {
      await expect(totals).toContainText(label);
    }
    // The one real confirmed public donation: $200.00 to the General Fund.
    await expect(totals).toContainText("$200.00");
  });

  test("the explorer publishes per-fund totals too", async ({ page }) => {
    await page.goto("/faithproof/explorer/", { waitUntil: "domcontentloaded" });
    const totals = page.getByTestId("fund-totals");
    await expect(totals).toBeVisible();
    for (const label of SIX) {
      await expect(totals).toContainText(label);
    }
  });

  /**
   * THE PROMISE. A donor's designation is theirs, not ours to publish.
   */
  test("no donor name appears anywhere beside a fund", async ({ page }) => {
    // Every donor name the database holds, including the deliberately planted
    // one on a private confirmed gift.
    const { data } = await admin!
      .from("transactions")
      .select("donor_name")
      .not("donor_name", "is", null);
    const names = ((data ?? []) as { donor_name: string }[])
      .map((r) => r.donor_name)
      .filter(Boolean);

    expect(names, "the planted name must exist, or this test proves nothing").toContain(
      SECRET_DONOR
    );

    for (const url of ["/faithproof/", "/faithproof/explorer/"]) {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const totals = await page.getByTestId("fund-totals").innerText();
      for (const name of names) {
        expect(totals, `${url} named a donor beside a fund: ${name}`).not.toContain(name);
      }

      // And nowhere on the page at all — a private gift is private everywhere,
      // not merely absent from one block.
      const body = await page.locator("body").innerText();
      expect(body, `${url} leaked a private donor`).not.toContain(SECRET_DONOR);
      expect(body, `${url} leaked a donor email`).not.toMatch(/@faithproof\.invalid/);
    }
  });

  test("a private confirmed gift is excluded from the published totals", async ({
    page,
  }) => {
    // The planted gift is $777.77 to Recovery Housing and is_public = false.
    // If it ever counts, Recovery stops reading $0.00 and this catches it.
    await page.goto("/faithproof/", { waitUntil: "domcontentloaded" });
    const totals = page.getByTestId("fund-totals");
    await expect(totals).not.toContainText("$777.77");
  });
});
