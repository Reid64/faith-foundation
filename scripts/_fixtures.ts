import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

/**
 * Shared audit fixtures — throwaway users and one row per entity.
 *
 * Not a spec file (Playwright collects `*.spec.ts` only), so it holds no tests.
 *
 * TEST DATA POLICY. Everything created here is written through the service-role
 * client, tagged `AUDIT SWEEP`, and deleted in `teardown()`. Rows are created in
 * states with no side effects: transactions and vouchers stay `pending` so the
 * double-entry accounting triggers never fire, and the promise and proof
 * document are `is_public: false` so nothing can surface on the public
 * transparency pages, even for the minutes a run lasts.
 */

export function readEnvLocal(): Record<string, string> {
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
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const CONFIGURED = Boolean(SUPABASE_URL && SERVICE_KEY);

export const TAG = "AUDIT SWEEP";
export const PASSWORD = "Sm0ke-Test-Audit23";

export type Fixture = {
  admin: SupabaseClient;
  users: Record<"admin" | "board", { id: string; email: string }>;
  ids: Record<string, string>;
  campaign: string;
};

export async function setup(stamp: string): Promise<Fixture> {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const users = {} as Fixture["users"];
  for (const role of ["admin", "board"] as const) {
    const email = `sweep-${role}-${stamp}@faithproof.invalid`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `Audit sweep ${role}` },
    });
    if (error) throw new Error(`createUser ${role}: ${error.message}`);
    await admin.from("profiles").update({ role }).eq("id", data.user.id);
    users[role] = { id: data.user.id, email };
  }

  const ids: Record<string, string> = {};
  const order: string[] = [];
  async function seed(table: string, row: Record<string, unknown>) {
    const { data, error } = await admin.from(table).insert(row).select("id").single();
    if (error) throw new Error(`${table}: ${error.message}`);
    const id = (data as { id: string }).id;
    ids[table] = id;
    order.unshift(table);
    return id;
  }

  const contactId = await seed("contacts", {
    type: "donor",
    first_name: "Audit",
    last_name: "Sweep",
    email: `sweep-${stamp}@example.invalid`,
  });
  await seed("tasks", {
    contact_id: contactId,
    title: `${TAG} - delete me`,
    priority: "low",
    status: "pending",
  });
  const campaign = `${TAG} CAMPAIGN ${stamp}`;
  await admin.from("campaign_tags").insert({ contact_id: contactId, campaign });
  await seed("email_templates", {
    name: `${TAG} TEMPLATE ${stamp}`,
    subject: "Audit sweep",
    body_html: "<p>audit sweep</p>",
  });
  await seed("transactions", {
    type: "donation",
    status: "pending",
    amount_cents: 100,
    fund: "unrestricted",
    transaction_date: "2026-09-01",
    description: `${TAG} - delete me`,
  });
  await seed("vouchers", {
    voucher_number: `SWEEP-${stamp}`,
    status: "pending",
    amount_cents: 100,
    fund: "housing_voucher",
  });
  await seed("promises", {
    title: `${TAG} - delete me`,
    status: "active",
    is_public: false,
  });
  await seed("proof_documents", {
    title: `${TAG} - delete me`,
    type: "other",
    is_public: false,
    verified: false,
  });
  await seed("grants", { name: TAG, funder: "Audit", status: "prospect" });
  await seed("volunteer_events", {
    name: `${TAG} - delete me`,
    date: "2026-09-01",
    status: "scheduled",
  });
  await seed("cornerstone_projects", {
    name: `${TAG} - delete me`,
    phase: 1,
    phase_status: "not_started",
  });
  await seed("board_meetings", {
    meeting_date: "2026-09-01",
    type: "regular",
    agenda: `${TAG} - delete me`,
  });

  (admin as unknown as { __order: string[] }).__order = order;
  return { admin, users, ids, campaign };
}

export async function teardown(fx: Fixture | null) {
  if (!fx) return;
  const { admin, ids, users, campaign } = fx;
  await admin.from("campaign_tags").delete().eq("campaign", campaign);
  const order = (admin as unknown as { __order: string[] }).__order ?? Object.keys(ids);
  for (const table of order) {
    if (ids[table]) await admin.from(table).delete().eq("id", ids[table]);
  }
  for (const { id } of Object.values(users)) {
    const del = await admin.auth.admin.deleteUser(id);
    // audit_log.actor_id references profiles with no cascade, deliberately, so
    // a user who acted during the run cannot be deleted. Demote instead.
    if (del.error) await admin.from("profiles").update({ role: "public" }).eq("id", id);
  }
}

export async function signIn(page: Page, email: string) {
  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

/** Every route under /admin, read from the App Router tree — never by hand. */
export function adminRoutes(): string[] {
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

/** Every public route — everything outside /admin and /api. */
export function publicRoutes(): string[] {
  const appDir = path.join(process.cwd(), "src", "app");
  const routes: string[] = [];
  (function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "admin" || entry.name === "api") continue;
        walk(p);
      } else if (entry.name === "page.tsx") {
        const rel = path.relative(appDir, dir).replace(/\\/g, "/");
        routes.push(rel === "" ? "/" : "/" + rel);
      }
    }
  })(appDir);
  return routes.sort();
}

/** Turn a route pattern into a URL that actually exists, using the seeded rows. */
export function concreteUrl(pattern: string, fx: Fixture): string | null {
  const map: Record<string, string> = {
    "/admin/board/meetings/[id]": fx.ids.board_meetings,
    "/admin/cornerstone/[id]": fx.ids.cornerstone_projects,
    "/admin/crm/contacts/[id]": fx.ids.contacts,
    "/admin/crm/templates/[id]": fx.ids.email_templates,
    "/admin/grants/[id]": fx.ids.grants,
    "/admin/promises/[id]": fx.ids.promises,
    "/admin/proof-vault/[id]": fx.ids.proof_documents,
    "/admin/transactions/[id]": fx.ids.transactions,
    "/admin/volunteers/events/[id]": fx.ids.volunteer_events,
    "/admin/vouchers/[id]": fx.ids.vouchers,
  };

  if (pattern.includes("[campaign]")) {
    return pattern.replace("[campaign]", encodeURIComponent(fx.campaign)) + "/";
  }

  let out = pattern;
  for (const [prefix, id] of Object.entries(map)) {
    if (pattern.startsWith(prefix)) {
      if (!id) return null;
      out = pattern.replace(prefix, `${prefix.replace(/\/\[id\]$/, "")}/${id}`);
      break;
    }
  }
  if (out.includes("[")) return null;
  return out.endsWith("/") ? out : out + "/";
}
