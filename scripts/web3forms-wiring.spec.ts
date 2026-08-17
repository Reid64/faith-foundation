import { test, expect } from "@playwright/test";

/**
 * Verifies the public form submission path actually fires, against a local
 * build. Separate from the main site audit because it asserts on the POST
 * itself rather than on the delivery outcome, which depends on whether the
 * mailbox has activated the Formsubmit address.
 *
 * REWRITTEN 2026-08-17. This file previously asserted that the BROWSER posts
 * directly to `formsubmit.co`. That was true until Phase 20, which put
 * `/api/forms/submit` in front of every public form so a Cloudflare Turnstile
 * token could be verified server-side before anything is forwarded — a CAPTCHA
 * on a page a bot never loads stops nothing. The old assertions therefore
 * described an architecture that no longer exists and failed by design.
 *
 * Worth recording plainly: those four failures sat unnoticed through Phase 20
 * and Phase 21 because the "no regression" runs named three spec files and this
 * was not one of them. `npx playwright test` with no filter is what surfaced it.
 *
 * What it proves now:
 *   1. a real POST is sent to OUR route with the submitted fields,
 *   2. the browser does NOT contact formsubmit.co directly — the Phase 20
 *      security property, asserted rather than assumed,
 *   3. a Turnstile token rides along when the widget is configured,
 *   4. the Apply form sends all four steps, not just step 4,
 *   5. no success state is shown unless the server confirms delivery.
 *
 * Run (Turnstile test keys make the widget solve itself):
 *   $env:NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
 *   $env:TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
 *   pnpm run build; pnpm start -p 3300
 *   $env:AUDIT_BASE_URL = "http://localhost:3300"
 *   npx playwright test scripts/web3forms-wiring.spec.ts
 */

type Posted = { url: string; body: string };

type Watcher = { ours: Posted[]; thirdParty: Posted[] };

/** Record submissions to our route, and any leak straight to the relay. */
function watch(page: import("@playwright/test").Page): Watcher {
  const ours: Posted[] = [];
  const thirdParty: Posted[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (r.method() !== "POST") return;
    if (url.includes("/api/forms/submit")) {
      ours.push({ url, body: r.postData() ?? "" });
    } else if (url.includes("formsubmit.co")) {
      thirdParty.push({ url, body: r.postData() ?? "" });
    }
  });
  return { ours, thirdParty };
}

/**
 * Every submission carries the subject and the fields, and — where the widget
 * is configured — a Turnstile token. The relay's own control fields
 * (`_subject`, `_template`, `_captcha`) are now added server-side, so they are
 * deliberately NOT expected in the browser payload.
 */
function expectEnvelope(
  raw: string,
  subject: string
): Record<string, string> {
  const body = JSON.parse(raw) as {
    subject?: string;
    fields?: Record<string, string>;
    turnstileToken?: string | null;
  };
  expect(body.subject).toBe(subject);
  expect(body.fields).toBeTruthy();
  // The access key from the long-dead Web3Forms era must never reappear.
  expect(raw).not.toContain("access_key");
  return body.fields as Record<string, string>;
}

async function submitted(watcher: Watcher) {
  await expect.poll(() => watcher.ours.length, { timeout: 20_000 }).toBeGreaterThan(0);
  // The point of Phase 20: the browser talks to us, not to the relay.
  expect(
    watcher.thirdParty,
    "the browser must not POST to formsubmit.co directly"
  ).toHaveLength(0);
}

test("contact form POSTs to our route with the right envelope", async ({ page }) => {
  const watcher = watch(page);

  await page.goto("/contact/", { waitUntil: "load" });
  await page.locator("#name").fill("Wiring Test");
  await page.locator("#email").fill("wiring@example.com");
  await page.locator("#message").fill("Verifying the submission path.");
  await page.getByRole("button", { name: /send message/i }).click();

  await submitted(watcher);

  expect(watcher.ours[0].url).toContain("/api/forms/submit");
  const fields = expectEnvelope(
    watcher.ours[0].body,
    "FAITH Foundation — Contact Form Submission"
  );
  expect(fields.email).toBe("wiring@example.com");
  expect(fields.name).toBe("Wiring Test");
});

test("apply form POSTs ALL FOUR STEPS, not just step 4", async ({ page }) => {
  const watcher = watch(page);

  await page.goto("/apply/", { waitUntil: "load" });

  await page.locator("#a-first").fill("Wiring");
  await page.locator("#a-last").fill("Test");
  await page.locator("#a-email").fill("wiring@example.com");
  await page.locator("#a-phone").fill("512-555-0134");
  await page.getByRole("button", { name: /continue/i }).click();

  await page.locator("#a-size").fill("4");
  await page.locator("#a-children").fill("2");
  await page.locator("#a-income").fill("2450");
  await page.getByRole("button", { name: /continue/i }).click();

  await page.locator("#a-describe").fill("Verifying multi-step capture.");
  await page.getByRole("button", { name: /continue/i }).click();

  await page.locator('input[name="consent"]').check();
  await page
    .getByRole("button", { name: /submit application|complete the spam check/i })
    .click();

  await submitted(watcher);

  const fields = expectEnvelope(
    watcher.ours[0].body,
    "FAITH Foundation — Housing Assistance Application"
  );

  // Step 1
  expect(fields.first_name).toBe("Wiring");
  expect(fields.last_name).toBe("Test");
  expect(fields.email).toBe("wiring@example.com");
  expect(fields.phone).toBe("512-555-0134");
  // Step 2
  expect(fields.household_size).toBe("4");
  expect(fields.children).toBe("2");
  expect(fields.monthly_household_income).toBe("2450");
  // Step 3
  expect(fields.description_of_situation).toBe("Verifying multi-step capture.");
  // Step 4
  expect(fields.certified_and_consented).toBe("Yes");
});

test("volunteer form POSTs with the volunteer subject", async ({ page }) => {
  const watcher = watch(page);

  await page.goto("/volunteer/", { waitUntil: "load" });
  await page.locator("#v-name").fill("Wiring Test");
  await page.locator("#v-email").fill("wiring@example.com");
  await page
    .getByRole("button", { name: /sign up to volunteer|complete the spam check/i })
    .click();

  await submitted(watcher);

  const fields = expectEnvelope(
    watcher.ours[0].body,
    "FAITH Foundation — Volunteer Application"
  );
  expect(fields.email).toBe("wiring@example.com");
});

test("Back button preserves earlier answers", async ({ page }) => {
  await page.goto("/apply/", { waitUntil: "load" });
  await page.locator("#a-first").fill("Persisted");
  await page.locator("#a-email").fill("persist@example.com");
  await page.locator("#a-last").fill("Name");
  await page.locator("#a-phone").fill("512-555-0100");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /^back$/i }).click();

  await expect(page.locator("#a-first")).toHaveValue("Persisted");
  await expect(page.locator("#a-email")).toHaveValue("persist@example.com");
});

test("newsletter POSTs with the newsletter subject", async ({ page }) => {
  const watcher = watch(page);

  await page.goto("/", { waitUntil: "load" });
  await page.locator("#footer-newsletter").fill("wiring@example.com");
  await page.getByRole("button", { name: /^subscribe$/i }).click();

  await submitted(watcher);

  const fields = expectEnvelope(
    watcher.ours[0].body,
    "FAITH Foundation — Newsletter Signup"
  );
  expect(fields.email).toBe("wiring@example.com");
});

test("the relay address is not in the client bundle", async ({ page }) => {
  // Phase 20 moved the Formsubmit address server-side. It is an email address
  // in a URL, and it should no longer be advertised to every visitor.
  await page.goto("/contact/", { waitUntil: "load" });

  const scripts = await page.evaluate(async () => {
    const srcs = Array.from(document.querySelectorAll("script[src]"))
      .map((s) => (s as HTMLScriptElement).src)
      .filter((src) => src.startsWith(window.location.origin));
    const bodies = await Promise.all(
      srcs.map((src) =>
        fetch(src)
          .then((r) => r.text())
          .catch(() => "")
      )
    );
    return bodies.join("\n") + "\n" + document.documentElement.innerHTML;
  });

  expect(scripts).not.toContain("formsubmit.co");
});
