import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * TOTP MFA — enrolment only.
 *
 * The whole point of this feature is that it changes nothing for anyone who
 * does not opt in, so the load-bearing test here is the LAST one: after a user
 * enrols a factor, a plain password sign-in must still work exactly as before.
 * If that ever fails, enforcement has leaked in somewhere and four directors
 * are one deploy away from being locked out of their own board portal.
 *
 * The rest is a real end-to-end cycle: enrol, read the secret out of the DOM,
 * compute a genuine RFC 6238 code from it, verify, list, add a backup, remove.
 * No mocking — if Supabase's TOTP implementation and ours disagree, this fails.
 *
 * TEST DATA: one throwaway auth user per run, `mfa-…@faithproof.invalid`,
 * created and removed here. It touches nothing else.
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

const EMAIL = `mfa-${Date.now().toString(36)}@faithproof.invalid`;
const PASSWORD = "Sm0ke-Test-Mfa23";

let userId: string | null = null;

const admin: SupabaseClient | null = CONFIGURED
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

/** RFC 4648 base32 decode — authenticator secrets are base32, not hex. */
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/**
 * The secret of the FIRST factor enrolled in this run.
 *
 * Later tests need it because Supabase will not let an `aal1` session add or
 * remove a factor once one is verified — the UI asks for a code from the
 * existing authenticator first, and here we are that authenticator.
 */
let firstSecret = "";

/** RFC 6238 TOTP, SHA-1, 6 digits, 30 second step — what every app implements. */
function totp(secret: string, atMs = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(atMs / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!admin) return;
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "MFA test" },
  });
  if (error) throw new Error("createUser: " + error.message);
  userId = data.user.id;
});

test.afterAll(async () => {
  if (!admin || !userId) return;
  const del = await admin.auth.admin.deleteUser(userId);
  if (del.error) {
    await admin.from("profiles").update({ role: "public" }).eq("id", userId);
  }
});

async function signIn(page: Page) {
  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

/**
 * A code that has not been used before in this run.
 *
 * TOTP codes are single-use per factor: replaying one inside the same 30 second
 * window is rejected, which is correct behaviour and exactly what happens when
 * two tests step up seconds apart. So wait for a fresh window instead.
 */
const usedCodes = new Set<string>();
async function freshCode(secret: string): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const counter = Math.floor(Date.now() / 1000 / 30);
    const key = `${secret}:${counter}`;
    if (!usedCodes.has(key)) {
      usedCodes.add(key);
      return totp(secret);
    }
    const msIntoWindow = Date.now() % 30_000;
    await new Promise((r) => setTimeout(r, 30_000 - msIntoWindow + 1_000));
  }
  throw new Error("could not obtain an unused TOTP window");
}

/**
 * Clear the step-up prompt if it is showing.
 *
 * Adding or removing a factor from a password-only session hits Supabase's
 * "AAL2 required" rule, so the UI asks for a code from the authenticator the
 * user already has.
 */
async function passStepUp(page: Page) {
  const form = page.getByTestId("mfa-stepup");
  // The prompt appears only once Supabase answers the challenge, so wait for it
  // rather than sampling the DOM the instant after the click.
  await expect(form).toBeVisible({ timeout: 20_000 });
  expect(firstSecret, "step-up needs the first factor's secret").not.toBe("");
  await page.getByTestId("mfa-stepup-code").fill(await freshCode(firstSecret));
  await page.getByTestId("mfa-stepup-verify").click();
  await expect(form).toBeHidden({ timeout: 20_000 });
}

/** Enrol one factor through the UI and return the secret it showed. */
async function enrol(page: Page, opts: { stepUp?: boolean } = {}): Promise<string> {
  await page.getByTestId("mfa-enroll").click();
  if (opts.stepUp) await passStepUp(page);
  await expect(page.getByTestId("mfa-qr")).toBeVisible({ timeout: 20_000 });

  // The secret is masked until asked for — a fallback for people who cannot
  // scan, not something left on screen by default.
  await page.getByRole("button", { name: /^show$/i }).click();
  const secret = ((await page.getByTestId("mfa-secret").textContent()) ?? "").trim();
  expect(secret.length).toBeGreaterThan(15);

  await page.getByTestId("mfa-code").fill(totp(secret));
  await page.getByTestId("mfa-verify").click();
  return secret;
}

test.describe("MFA — opt-in TOTP enrolment", () => {
  test("the settings page offers enrolment and says it is not enforced", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/settings/", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("mfa-section")).toBeVisible();
    await expect(page.getByTestId("mfa-enroll")).toBeVisible();

    // The claim the user reads must match reality: registering a factor does
    // not make it required.
    const caveat = page.getByTestId("mfa-not-enforced");
    await expect(caveat).toBeVisible();
    await expect(caveat).toContainText(/not required at sign-in/i);

    // Named apps, so a director knows what to install.
    await expect(page.getByTestId("mfa-section")).toContainText(
      /google authenticator/i
    );
  });

  test("a real TOTP code completes enrolment", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/settings/", { waitUntil: "domcontentloaded" });

    firstSecret = await enrol(page);

    await expect(page.getByText(/authenticator registered/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("mfa-section")).toContainText(/1 registered/i);

    // And Supabase agrees, not just our UI.
    const { data } = await admin!.auth.admin.getUserById(userId!);
    const factors = data.user?.factors ?? [];
    expect(factors.filter((f) => f.status === "verified")).toHaveLength(1);
  });

  test("with one factor the backup warning is prominent, and a second clears it", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/settings/", { waitUntil: "domcontentloaded" });

    // Recovery matters: Supabase issues no printable codes, so a second factor
    // is the only self-service way back in.
    const warning = page.getByTestId("mfa-backup-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/second authenticator/i);
    await expect(warning).toContainText(/recovery codes/i);

    await expect(page.getByTestId("mfa-enroll")).toHaveText(/backup/i);

    // Supabase will not add a second factor from a password-only session, so
    // the screen warns before the click rather than surfacing "AAL2 required".
    await expect(page.getByTestId("mfa-section")).toContainText(
      /code from your existing authenticator/i
    );

    await enrol(page, { stepUp: true });

    await expect(page.getByTestId("mfa-section")).toContainText(/2 registered/i, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("mfa-backup-warning")).toHaveCount(0);
  });

  test("a factor can be removed", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await signIn(page);
    await page.goto("/admin/settings/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /^remove$/i }).first().click();
    await passStepUp(page);
    await expect(page.getByTestId("mfa-section")).toContainText(/1 registered/i, {
      timeout: 20_000,
    });
  });

  /**
   * THE ONE THAT MATTERS.
   *
   * A user with a verified factor must still be able to sign in with a password
   * alone, because nothing in this application asks Supabase to step the
   * session up to aal2. If this test ever fails, enforcement has arrived by
   * accident and somebody is about to be locked out.
   */
  test("a user WITH a factor can still sign in with only a password", async ({
    page,
  }) => {
    const { data } = await admin!.auth.admin.getUserById(userId!);
    const verified = (data.user?.factors ?? []).filter(
      (f) => f.status === "verified"
    );
    expect(
      verified.length,
      "precondition: the account must still hold a factor"
    ).toBeGreaterThan(0);

    await page.context().clearCookies();
    await signIn(page);

    // Signed in, on the admin, with no second factor prompt anywhere.
    expect(page.url()).toContain("/admin");
    await expect(page.getByRole("heading", { name: /command center/i })).toBeVisible();
    await expect(page.getByText(/verification code/i)).toHaveCount(0);
  });
});
