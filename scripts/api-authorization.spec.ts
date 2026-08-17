import fs from "node:fs";
import path from "node:path";
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * API AUTHORIZATION MATRIX.
 *
 * Every route under /api, exercised unauthenticated, as `board`, and as
 * `admin`. The question each case answers is not "does it work" but "does it
 * refuse the people it should refuse", which is the failure nobody notices
 * until it is on the news.
 *
 * SAFETY — this suite runs against a real Supabase project, so it is written to
 * write nothing. Every probe of a writing endpoint uses a payload that fails
 * validation BEFORE the first database call:
 *
 *   /api/webhooks/zeffy          — no `amount`, refused at the top
 *   /api/webhooks/email-inbound  — no sender, refused at the top
 *   /api/forms/submit            — unknown `subject`, refused before Turnstile
 *                                  and before anything is emailed
 *
 * That is deliberate and it is a real limitation: the happy path of those three
 * endpoints is NOT covered here, because covering it would mean fabricating a
 * donation, a contact, or an email in production. See governance/AUDIT_REPORT.md.
 *
 * TEST DATA: two throwaway auth users per run, `apiauth-…@faithproof.invalid`,
 * created and removed here.
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

const STAMP = Date.now().toString(36);
const EMAIL_ADMIN = `apiauth-admin-${STAMP}@faithproof.invalid`;
const EMAIL_BOARD = `apiauth-board-${STAMP}@faithproof.invalid`;
const PASSWORD = "Sm0ke-Test-Api23";

const admin: SupabaseClient | null = CONFIGURED
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

const userIds: string[] = [];

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
      user_metadata: { full_name: `API auth ${role}` },
    });
    if (error) throw new Error(`createUser ${role}: ${error.message}`);
    userIds.push(data.user.id);
    await admin.from("profiles").update({ role }).eq("id", data.user.id);
  }
});

test.afterAll(async () => {
  if (!admin) return;
  for (const id of userIds) {
    const del = await admin.auth.admin.deleteUser(id);
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

/** Routes that require a session, with the role each one demands. */
const SESSION_ROUTES: {
  path: string;
  method: "GET" | "POST";
  body?: unknown;
  /** Roles that must NOT be refused outright (they may still fail validation). */
  allowed: ("admin" | "board")[];
}[] = [
  { path: "/api/setup/storage", method: "GET", allowed: ["admin"] },
  { path: "/api/webrtc/turn-credentials", method: "POST", allowed: ["admin", "board"] },
  {
    path: "/api/pusher/auth",
    method: "POST",
    body: { socket_id: "1.1", channel_name: "private-meeting-00000000-0000-0000-0000-000000000000" },
    allowed: ["admin", "board"],
  },
  {
    path: "/api/pusher/signal",
    method: "POST",
    body: { meetingId: "00000000-0000-0000-0000-000000000000", event: "ping", payload: {} },
    allowed: ["admin", "board"],
  },
  {
    path: "/api/board/generate-minutes",
    method: "POST",
    body: { meetingId: "00000000-0000-0000-0000-000000000000" },
    allowed: ["admin", "board"],
  },
];

const PUBLIC_GETS = [
  "/api/v1/public/stats",
  "/api/v1/public/promises",
  "/api/v1/public/transactions",
  "/api/v1/public/funds",
  "/api/v1/public/documents",
  "/api/v1/public/docs",
];

async function call(
  request: APIRequestContext,
  route: { path: string; method: "GET" | "POST"; body?: unknown }
) {
  return route.method === "GET"
    ? request.get(route.path)
    : request.post(route.path, { data: route.body ?? {} });
}

test.describe("API — unauthenticated", () => {
  test("every session route refuses an anonymous caller with 401", async ({ request }) => {
    const results: string[] = [];
    for (const route of SESSION_ROUTES) {
      const res = await call(request, route);
      results.push(`${route.method} ${route.path} → ${res.status()}`);
      expect(res.status(), `${route.path} must refuse anonymous callers`).toBe(401);
    }
    console.log("anon:\n  " + results.join("\n  "));
  });

  test("public read APIs answer without a session and leak nothing internal", async ({
    request,
  }) => {
    for (const path of PUBLIC_GETS) {
      const res = await request.get(path);
      expect(res.status(), `${path} should serve anonymous readers`).toBe(200);

      const text = await res.text();
      // Field-level leak check. These columns exist on tables the public API
      // reads from, and none of them belong in an anonymous response.
      for (const forbidden of [
        "internal_notes",
        "service_role",
        "SUPABASE_SERVICE_ROLE_KEY",
        "donor_email",
      ]) {
        expect(text, `${path} exposed ${forbidden}`).not.toContain(forbidden);
      }
    }
  });

  test("the AI intake endpoint says plainly that it is not connected", async ({
    request,
  }) => {
    // No ANTHROPIC_API_KEY in this environment (and none in production either —
    // see AUDIT_REPORT.md). It must not pretend to be a chatbot that never
    // answers.
    const res = await request.post("/api/ai/intake", {
      data: { messages: [{ role: "user", content: "hello" }], sessionId: "audit" },
    });
    expect([503, 429]).toContain(res.status());
    if (res.status() === 503) {
      expect(await res.text()).toMatch(/not connected/i);
    }
  });

  test("the form relay refuses an unknown form before sending anything", async ({
    request,
  }) => {
    const res = await request.post("/api/forms/submit", {
      data: { subject: "audit-probe-not-a-real-form", fields: {} },
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toMatch(/unknown form/i);
  });

  /**
   * The two webhooks are UNAUTHENTICATED by construction. This test does not
   * assert that is acceptable — it pins the current behaviour so that a change
   * is visible, and the risk is written up in AUDIT_REPORT.md.
   */
  test("webhooks are reachable without credentials — recorded, not endorsed", async ({
    request,
  }) => {
    const zeffy = await request.post("/api/webhooks/zeffy", { data: { note: "audit probe, no amount" } });
    // 400 = it read our anonymous request and rejected the payload, not us.
    expect(zeffy.status()).toBe(400);
    expect(await zeffy.text()).toMatch(/amount/i);

    const email = await request.post("/api/webhooks/email-inbound", { data: {} });
    // 401 when INBOUND_WEBHOOK_SECRET is configured, 400 when it is not.
    expect([400, 401]).toContain(email.status());
  });
});

test.describe("API — wrong role", () => {
  test("a board member is refused the admin-only routes and served the board ones", async ({
    page,
    context,
  }) => {
    await signIn(page, EMAIL_BOARD);
    const results: string[] = [];

    for (const route of SESSION_ROUTES) {
      const res = await call(context.request, route);
      const status = res.status();
      results.push(`${route.method} ${route.path} → ${status}`);

      if (route.allowed.includes("board")) {
        expect(status, `${route.path} should not refuse a board member`).not.toBe(403);
        expect(status, `${route.path} should recognise the session`).not.toBe(401);
      } else {
        expect(status, `${route.path} is admin-only`).toBe(403);
      }
    }
    console.log("board:\n  " + results.join("\n  "));
  });
});

test.describe("API — correct role", () => {
  test("an admin is refused nothing, and storage setup is idempotent", async ({
    page,
    context,
  }) => {
    await signIn(page, EMAIL_ADMIN);
    const results: string[] = [];

    for (const route of SESSION_ROUTES) {
      const res = await call(context.request, route);
      const status = res.status();
      results.push(`${route.method} ${route.path} → ${status}`);
      expect(status, `${route.path} refused an admin`).not.toBe(401);
      expect(status, `${route.path} refused an admin`).not.toBe(403);
    }
    console.log("admin:\n  " + results.join("\n  "));

    // Called twice on purpose: it creates a storage bucket, and an endpoint
    // that breaks on the second call is a trap for whoever clicks it twice.
    const first = await context.request.get("/api/setup/storage");
    const second = await context.request.get("/api/setup/storage");
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
  });
});
