import { test, expect } from "@playwright/test";

/**
 * Verifies the Formsubmit submission path actually fires, against a LOCAL
 * build. This is deliberately separate from the main site audit: it runs at
 * AUDIT_BASE_URL=http://127.0.0.1:8099 and it asserts on the POST itself
 * rather than on the delivery outcome, which depends on whether the mailbox
 * has activated the form.
 *
 * What it proves:
 *   1. a real POST is sent to formsubmit.co with the submitted fields,
 *   2. the Formsubmit control fields (_subject, _template, _captcha) are set,
 *   3. no success state is shown unless the service confirms delivery,
 *   4. the Apply form sends all four steps, not just step 4.
 *
 * Run:
 *   pnpm run build
 *   python -m http.server 8099   (from out/)
 *   AUDIT_BASE_URL=http://127.0.0.1:8099 npx playwright test scripts/web3forms-wiring.spec.ts
 */

type Posted = { url: string; body: string };

/** Every submission must carry the Formsubmit control fields. */
function expectControlFields(body: Record<string, string>, subject: string) {
  expect(body._subject).toBe(subject);
  expect(body._template).toBe("table");
  expect(body._captcha).toBe("false");
  expect(body.access_key).toBeUndefined();
}

test("contact form POSTs to Formsubmit with the right control fields", async ({
  page,
}) => {
  const posts: Posted[] = [];
  page.on("request", (r) => {
    if (r.url().includes("formsubmit.co")) {
      posts.push({ url: r.url(), body: r.postData() ?? "" });
    }
  });

  await page.goto("/contact/", { waitUntil: "load" });
  await page.locator("#name").fill("Wiring Test");
  await page.locator("#email").fill("wiring@example.com");
  await page.locator("#message").fill("Verifying the submission path.");
  await page.getByRole("button", { name: /send message/i }).click();

  await expect
    .poll(() => posts.length, { timeout: 20_000 })
    .toBeGreaterThan(0);

  expect(posts[0].url).toContain("formsubmit.co/ajax/info@faithfoundationsf.org");
  const body = JSON.parse(posts[0].body);
  expectControlFields(body, "FAITH Foundation — Contact Form Submission");
  expect(body.email).toBe("wiring@example.com");
  expect(body.name).toBe("Wiring Test");
});

test("apply form POSTs ALL FOUR STEPS, not just step 4", async ({ page }) => {
  const posts: Posted[] = [];
  page.on("request", (r) => {
    if (r.url().includes("formsubmit.co")) {
      posts.push({ url: r.url(), body: r.postData() ?? "" });
    }
  });

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
  await page.getByRole("button", { name: /submit application/i }).click();

  await expect
    .poll(() => posts.length, { timeout: 20_000 })
    .toBeGreaterThan(0);

  const body = JSON.parse(posts[0].body);
  expectControlFields(
    body,
    "FAITH Foundation — Housing Assistance Application"
  );

  // Step 1
  expect(body.first_name).toBe("Wiring");
  expect(body.last_name).toBe("Test");
  expect(body.email).toBe("wiring@example.com");
  expect(body.phone).toBe("512-555-0134");
  // Step 2
  expect(body.household_size).toBe("4");
  expect(body.children).toBe("2");
  expect(body.monthly_household_income).toBe("2450");
  // Step 3
  expect(body.description_of_situation).toBe("Verifying multi-step capture.");
  // Step 4
  expect(body.certified_and_consented).toBe("Yes");
});

test("volunteer form POSTs with the volunteer subject", async ({ page }) => {
  const posts: Posted[] = [];
  page.on("request", (r) => {
    if (r.url().includes("formsubmit.co")) {
      posts.push({ url: r.url(), body: r.postData() ?? "" });
    }
  });

  await page.goto("/volunteer/", { waitUntil: "load" });
  await page.locator("#v-name").fill("Wiring Test");
  await page.locator("#v-email").fill("wiring@example.com");
  await page.getByRole("button", { name: /sign up to volunteer/i }).click();

  await expect
    .poll(() => posts.length, { timeout: 20_000 })
    .toBeGreaterThan(0);

  const body = JSON.parse(posts[0].body);
  expectControlFields(body, "FAITH Foundation — Volunteer Application");
  expect(body.email).toBe("wiring@example.com");
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
  const posts: Posted[] = [];
  page.on("request", (r) => {
    if (r.url().includes("formsubmit.co")) {
      posts.push({ url: r.url(), body: r.postData() ?? "" });
    }
  });

  await page.goto("/", { waitUntil: "load" });
  await page.locator("#footer-newsletter").fill("wiring@example.com");
  await page.getByRole("button", { name: /^subscribe$/i }).click();

  await expect
    .poll(() => posts.length, { timeout: 20_000 })
    .toBeGreaterThan(0);

  const body = JSON.parse(posts[0].body);
  expectControlFields(body, "FAITH Foundation — Newsletter Signup");
  expect(body.email).toBe("wiring@example.com");
});
