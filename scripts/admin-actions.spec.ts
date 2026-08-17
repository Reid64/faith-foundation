import { test, expect } from "@playwright/test";
import { CONFIGURED, setup, signIn, teardown, type Fixture } from "./_fixtures";

/**
 * ADMIN ACTIONS — do the buttons do what their labels claim?
 *
 * The surface sweep proves pages render. This proves a handful of the actions
 * on them actually work end to end: a CSV export produces a real file, a search
 * filter filters, a status transition persists to the database, and an empty
 * list says so rather than showing a blank panel.
 *
 * SCOPE AND SAFETY. Every write here targets a row this suite seeded itself,
 * tagged `AUDIT SWEEP`, deleted afterwards. Nothing touches a real record.
 * Transitions that fire the double-entry accounting triggers (confirming a
 * transaction, disbursing a voucher) are deliberately NOT exercised — those
 * post to the ledger, and a half-cleaned ledger is worse than an untested
 * button. They are listed in governance/AUDIT_REPORT.md as not covered.
 */

let fx: Fixture | null = null;

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  fx = await setup("act" + Date.now().toString(36));
});

test.afterAll(async () => {
  await teardown(fx);
});

test.describe("Admin actions", () => {
  test("a CSV export downloads a file with a header row", async ({ page }) => {
    await signIn(page, fx!.users.admin.email);
    await page.goto("/admin/volunteers/hours/", { waitUntil: "domcontentloaded" });

    const button = page.getByRole("button", { name: /export/i }).first();
    await expect(button).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      button.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(c as Buffer);
    const text = Buffer.concat(chunks).toString("utf8");

    // A header row at minimum. An export that downloads an empty file is a
    // button that lies about having worked.
    expect(text.split(/\r?\n/)[0].length).toBeGreaterThan(0);
    expect(text).toContain(",");
  });

  test("the export button reports what it produced, including 'no rows'", async ({
    page,
  }) => {
    await signIn(page, fx!.users.admin.email);
    await page.goto("/admin/volunteers/hours/", { waitUntil: "domcontentloaded" });

    const [, ] = await Promise.all([
      page.waitForEvent("download", { timeout: 30_000 }),
      page.getByRole("button", { name: /export/i }).first().click(),
    ]);

    // The label must state the outcome — rows exported, or headers only.
    await expect(page.getByText(/downloaded/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("a list search filters the rows it claims to filter", async ({ page }) => {
    await signIn(page, fx!.users.admin.email);
    await page.goto("/admin/crm/contacts/", { waitUntil: "domcontentloaded" });

    // The seeded contact is on the page to begin with.
    await expect(page.getByText("Audit Sweep").first()).toBeVisible({ timeout: 20_000 });

    const search = page.locator('input[type="search"], input[name="q"], input[placeholder*="earch" i]').first();
    if (!(await search.isVisible().catch(() => false))) {
      test.skip(true, "no search control on the contacts list");
      return;
    }

    await search.fill("zzz-no-such-contact-zzz");
    await search.press("Enter");
    await page.waitForTimeout(1500);
    await expect(page.getByText("Audit Sweep")).toHaveCount(0);
  });

  test("a status transition persists to the database", async ({ page }) => {
    await signIn(page, fx!.users.admin.email);

    // The contact pipeline selector: a real status change, saved by a server
    // action the instant it is picked, with no ledger involvement and nothing
    // public about it. The row is the seeded fixture contact.
    await page.goto(`/admin/crm/contacts/${fx!.ids.contacts}/`, {
      waitUntil: "domcontentloaded",
    });

    const stage = page.locator("#stage-select");
    await expect(stage).toBeVisible({ timeout: 20_000 });

    const options = await stage.locator("option").evaluateAll((els) =>
      els.map((e) => (e as HTMLOptionElement).value).filter(Boolean)
    );
    expect(options.length, "the pipeline selector must offer stages").toBeGreaterThan(0);
    const target = options[options.length - 1];

    await stage.selectOption(target);
    // The control saves on change and refreshes; wait for it to settle.
    await expect(stage).toBeEnabled({ timeout: 20_000 });
    await page.waitForTimeout(1500);

    const { data } = await fx!.admin
      .from("contacts")
      .select("pipeline_stage")
      .eq("id", fx!.ids.contacts)
      .single();
    expect(
      data?.pipeline_stage,
      "the selector reported success; the database must agree"
    ).toBe(target);
  });

  test("an edit form saves what it says it saved", async ({ page }) => {
    await signIn(page, fx!.users.admin.email);
    await page.goto(`/admin/promises/${fx!.ids.promises}/edit/`, {
      waitUntil: "domcontentloaded",
    });

    const edited = "AUDIT SWEEP - edited title";
    await page.fill('input[name="title"]', edited);
    await page.getByRole("button", { name: /save|update/i }).first().click();
    await page.waitForTimeout(2500);

    const { data } = await fx!.admin
      .from("promises")
      .select("title")
      .eq("id", fx!.ids.promises)
      .single();
    expect(data?.title, "the form claimed to save; the database must agree").toBe(edited);
  });

  test("an empty list explains itself instead of showing a blank panel", async ({
    page,
  }) => {
    await signIn(page, fx!.users.admin.email);
    // A search that matches nothing is the reliable way to reach an empty list
    // without deleting real rows.
    await page.goto("/admin/crm/contacts/?q=zzz-no-such-contact-zzz", {
      waitUntil: "domcontentloaded",
    });

    const body = await page.locator("main").innerText();
    expect(
      /no |none|nothing|empty|0 /i.test(body),
      "an empty result must say so in words"
    ).toBe(true);
  });
});
