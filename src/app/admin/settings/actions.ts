"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { PUBLIC_SECTION_KEYS, type SettingKey } from "./keys";


/** Flip one public-transparency toggle. */
export async function updateSetting(
  key: string,
  value: boolean
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }
  if (!PUBLIC_SECTION_KEYS.includes(key as SettingKey)) {
    return { error: "Unknown setting." };
  }

  const { error } = await session.supabase.from("settings").upsert(
    {
      key,
      value,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    return { error: describeDbError(error, "save this setting") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: value ? "setting.enabled" : "setting.disabled",
    entityType: "settings",
    entityId: null,
    newValue: { key, value },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/faithproof");
  return { ok: true };
}

// ── CSV export ──────────────────────────────────────────────────────────────

/**
 * Escape one CSV field.
 *
 * Quoting is not cosmetic here: descriptions and notes routinely contain
 * commas, and an unescaped one silently shifts every later column in the row.
 * The leading-character guard blocks CSV injection — a value starting = + - @
 * is executed as a formula when the file is opened in Excel or Sheets.
 */
function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const head = columns.map(csvField).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvField(row[c])).join(","))
    .join("\r\n");
  return rows.length ? `${head}\r\n${body}` : head;
}

export type ExportResult =
  | { error: string }
  | { filename: string; csv: string; rows: number };

async function exportTable(
  table: string,
  columns: string[],
  order: { column: string; ascending: boolean },
  limit?: number
): Promise<ExportResult> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  let query = session.supabase
    .from(table)
    .select("*")
    .order(order.column, { ascending: order.ascending });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return { error: describeDbError(error, `export ${table}`) };

  const rows = (data ?? []) as Record<string, unknown>[];
  const date = new Date().toISOString().slice(0, 10);

  return {
    filename: `faithproof-${table.replace("_", "-")}-${date}.csv`,
    csv: toCsv(rows, columns),
    rows: rows.length,
  };
}

export async function exportTransactions(): Promise<ExportResult> {
  return exportTable(
    "transactions",
    [
      "id", "transaction_date", "type", "status", "fund", "amount_cents",
      "donor_name", "donor_anonymous", "description", "reference_number",
      "is_public", "confirmed_at", "created_at",
    ],
    { column: "transaction_date", ascending: false }
  );
}

export async function exportVouchers(): Promise<ExportResult> {
  return exportTable(
    "vouchers",
    [
      "id", "voucher_number", "status", "fund", "amount_cents", "program",
      "recipient_name", "recipient_anonymous", "approved_at", "disbursed_at",
      "notes", "created_at",
    ],
    { column: "created_at", ascending: false }
  );
}

export async function exportAuditLog(): Promise<ExportResult> {
  return exportTable(
    "audit_log",
    ["id", "created_at", "actor_id", "action", "entity_type", "entity_id"],
    { column: "created_at", ascending: false },
    1000
  );
}
