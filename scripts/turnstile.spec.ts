import { test, expect, type Page } from "@playwright/test";

/**
 * Cloudflare Turnstile coverage for every public form.
 *
 * RUN AGAINST A BUILD THAT HAS THE KEYS:
 *
 *   $env:NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
 *   $env:TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
 *   pnpm run build; pnpm start
 *   $env:AUDIT_BASE_URL = "http://localhost:3000"; npx playwright test scripts/turnstile.spec.ts
 *
 * Those are Cloudflare's published always-passes test keys. Against the live
 * site (the default baseURL) the real keys apply and the same assertions hold.
 *
 * The widget renders inside an iframe from challenges.cloudflare.com, so
 * "present in the DOM" is asserted as: the container this codebase renders, and
 * the Cloudflare iframe or its hidden response input inside it.
 */

/** Every public form, and how to reach it. */
const FORMS: { name: string; path: string; anchor: string }[] = [
  { name: "Newsletter (footer, every page)", path: "/", anchor: "#footer-newsletter" },
  { name: "Contact", path: "/contact/", anchor: "#message" },
  { name: "Volunteer", path: "/volunteer/", anchor: "#v-interest" },
  { name: "Impact receipt (FaithProof)", path: "/faithproof/", anchor: "#receipt-email" },
];

const TURNSTILE_IFRAME = 'iframe[src*="challenges.cloudflare.com"]';
const TURNSTILE_INPUT = 'input[name="cf-turnstile-response"]';

async function expectWidget(page: Page, label: string) {
  // Either artefact proves the widget mounted: Cloudflare's iframe, or the
  // hidden response input it injects.
  const iframe = page.locator(TURNSTILE_IFRAME);
  const input = page.locator(TURNSTILE_INPUT);

  await expect
    .poll(
      async () => (await iframe.count()) + (await input.count()),
      { message: `Turnstile widget never appeared on ${label}`, timeout: 20_000 }
    )
    .toBeGreaterThan(0);
}

test.describe("TURNSTILE — public forms", () => {
  for (const form of FORMS) {
    test(`widget is present: ${form.name}`, async ({ page }) => {
      await page.goto(form.path, { waitUntil: "load" });

      // The form itself must still be there — a widget on a page whose form
      // has gone missing is not a pass.
      await expect(
        page.locator(form.anchor),
        `${form.name} form field is missing`
      ).toBeAttached();

      // The footer newsletter sits at the bottom of a long page; Turnstile
      // renders eagerly, but scrolling makes the failure mode unambiguous.
      await page.locator(form.anchor).scrollIntoViewIfNeeded();
      await expectWidget(page, form.name);
    });
  }

  test("widget is present: Apply (final step of four)", async ({ page }) => {
    await page.goto("/apply/", { waitUntil: "load" });

    // The widget is deliberately mounted only on the last step: a token
    // expires in about five minutes, and this form takes longer than that to
    // fill in.
    await expect(page.locator(TURNSTILE_IFRAME)).toHaveCount(0);

    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
    }

    await expect(
      page.getByRole("button", { name: /submit application|complete the spam check/i })
    ).toBeVisible();
    await expectWidget(page, "Apply (step 4)");
  });

  test("submit is gated until the check passes", async ({ page }) => {
    await page.goto("/contact/", { waitUntil: "load" });

    const submit = page.getByRole("button", {
      name: /send message|complete the spam check/i,
    });
    await expect(submit).toBeVisible();

    // With Cloudflare's always-passes test key the widget solves on its own,
    // so the button must end up enabled. What is being asserted is that the
    // button's state is driven by the token at all.
    await expect(submit).toBeEnabled({ timeout: 20_000 });
    await expect(submit).toHaveText(/send message/i);
  });
});

test.describe("TURNSTILE — the server gate", () => {
  test("a submission with no token is refused with 400", async ({ request }) => {
    const response = await request.post("/api/forms/submit", {
      data: {
        subject: "FAITH Foundation — Newsletter Signup",
        fields: { email: "bot@example.com", list: "Newsletter" },
      },
    });

    expect(response.status(), "no token must not be accepted").toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/spam check/i);
  });

  /**
   * Only meaningful against a server whose secret REJECTS tokens.
   *
   * Under Cloudflare's always-passes test secret a bogus token is accepted on
   * purpose — that is what "always passes" means — so asserting a 400 there
   * would be asserting the test key's behaviour, not ours. Run the suite a
   * second time with TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA
   * (always fails) and TURNSTILE_TEST_MODE=fail to execute this.
   */
  test("a submission with a token Cloudflare rejects is refused with 400", async ({
    request,
  }) => {
    test.skip(
      process.env.TURNSTILE_TEST_MODE !== "fail",
      "needs a server running the always-fails secret"
    );

    const response = await request.post("/api/forms/submit", {
      data: {
        subject: "FAITH Foundation — Newsletter Signup",
        fields: { email: "bot@example.com", list: "Newsletter" },
        turnstileToken: "definitely-not-a-real-token",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/spam check/i);
  });

  test("an unknown form subject is refused", async ({ request }) => {
    const response = await request.post("/api/forms/submit", {
      data: {
        subject: "Something nobody on this site sends",
        fields: { email: "bot@example.com" },
        turnstileToken: "x",
      },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toMatch(/unknown form/i);
  });

  test("the secret key is never exposed to the browser", async ({ page }) => {
    // The site key is public by design. The SECRET must appear nowhere in any
    // script the browser downloads.
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

    expect(scripts).not.toContain("TURNSTILE_SECRET_KEY");
    // Cloudflare's secret test key, and the shape of a real one.
    expect(scripts).not.toContain("1x0000000000000000000000000000000AA");
    expect(scripts).not.toMatch(/0x4[A-Za-z0-9_-]{30,}/);
  });
});
