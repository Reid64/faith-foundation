import { revalidatePath } from "next/cache";
import { describeDbError, getSession, writeAuditLog } from "./session";

/**
 * Shared machinery for every status transition in FaithProof.
 *
 * Each transition does the same four things in the same order: check the
 * session, apply the update through the USER's client so row level security
 * decides whether it is allowed, write an audit entry describing what changed,
 * and revalidate the affected pages.
 *
 * Ordering matters: the audit entry is written only AFTER the update succeeds,
 * so a refused transition never leaves a log line claiming it happened.
 */
export async function applyTransition({
  table,
  id,
  patch,
  action,
  entityType,
  detailPath,
  listPath,
  describe,
}: {
  table: string;
  id: string;
  /** Column values to set. Timestamps and actor ids are filled in by callers. */
  patch: Record<string, unknown>;
  /** Audit `action` string, e.g. "transaction.confirmed". */
  action: string;
  entityType: string;
  detailPath: string;
  listPath: string;
  /** Human phrase for the error message, e.g. "confirm this transaction". */
  describe: string;
}): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  // Read the row first so the audit entry can record what it was before.
  const { data: before } = await session.supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await session.supabase
    .from(table)
    .update(patch)
    .eq("id", id);

  if (error) {
    return { error: describeDbError(error, describe) };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action,
    entityType,
    entityId: id,
    oldValue: before ? pick(before, Object.keys(patch)) : null,
    newValue: patch,
  });

  revalidatePath(detailPath);
  revalidatePath(listPath);
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");
  revalidatePath("/faithproof");

  return { ok: true };
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = row[k];
  return out;
}

/** Today as YYYY-MM-DD, for DATE columns. */
export function todayISODate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
