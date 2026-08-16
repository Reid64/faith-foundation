"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { applyTransition, todayISODate } from "@/lib/faithproof/transitions";
import { dollarsToCents } from "@/lib/faithproof/format";
import { FUND_DESIGNATIONS, type FundDesignation } from "@/lib/faithproof/types";
import {
  GRANT_STATUSES,
  type Grant,
  type GrantStatus,
} from "@/lib/faithproof/grants";

type Result = { error?: string; ok?: boolean; id?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v ? v : null);

export async function createGrant(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const name = str(formData, "name");
  const funder = str(formData, "funder");
  const status = str(formData, "status") || "prospect";
  const fund = str(formData, "fund");
  const amountRaw = str(formData, "amount");

  if (!name) return { error: "Enter the grant name." };
  if (!funder) return { error: "Enter the funder." };
  if (!GRANT_STATUSES.includes(status as GrantStatus)) {
    return { error: "Choose a valid status." };
  }
  if (fund && !FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }

  // Amount is optional — a prospect has no award figure yet. But if something
  // was typed, it has to parse, or the value would be dropped silently.
  let amount_cents: number | null = null;
  if (amountRaw) {
    amount_cents = dollarsToCents(amountRaw);
    if (amount_cents === null) {
      return {
        error:
          "Enter the amount in dollars (for example 25000 or 25000.00), or leave it blank.",
      };
    }
  }

  const { data, error } = await session.supabase
    .from("grants")
    .insert({
      name,
      funder,
      status: status as GrantStatus,
      amount_cents,
      program: orNull(str(formData, "program")),
      fund: fund ? (fund as FundDesignation) : null,
      application_deadline: orNull(str(formData, "application_deadline")),
      award_date: orNull(str(formData, "award_date")),
      reporting_deadline: orNull(str(formData, "reporting_deadline")),
      reporting_period: orNull(str(formData, "reporting_period")),
      application_notes: orNull(str(formData, "application_notes")),
      award_notes: orNull(str(formData, "award_notes")),
      reporting_notes: orNull(str(formData, "reporting_notes")),
      contact_name: orNull(str(formData, "contact_name")),
      contact_email: orNull(str(formData, "contact_email")),
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "create this grant") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "grant.created",
    entityType: "grants",
    entityId: data.id,
    newValue: { name, funder, status, amount_cents },
  });

  revalidatePath("/admin/grants");
  return { ok: true, id: data.id };
}

/**
 * Status transitions.
 *
 * Routed through applyTransition so every move gets the same guarantees as
 * transactions and vouchers: RLS-scoped update, audit entry written only after
 * the update succeeds, consistent revalidation.
 */
export async function updateGrantStatus(
  id: string,
  next: GrantStatus,
  formData: FormData
): Promise<Result> {
  if (!GRANT_STATUSES.includes(next)) {
    return { error: "That is not a valid status." };
  }

  const patch: Record<string, unknown> = { status: next };

  if (next === "applied") {
    const deadline = str(formData, "application_deadline");
    if (deadline) patch.application_deadline = deadline;
  }

  if (next === "awarded") {
    const amountRaw = str(formData, "amount");
    if (amountRaw) {
      const cents = dollarsToCents(amountRaw);
      if (cents === null) {
        return { error: "Enter the awarded amount in dollars, or leave it blank." };
      }
      patch.amount_cents = cents;
    }
    patch.award_date = str(formData, "award_date") || todayISODate();
  }

  if (next === "reporting") {
    const deadline = str(formData, "reporting_deadline");
    if (deadline) patch.reporting_deadline = deadline;
    const period = str(formData, "reporting_period");
    if (period) patch.reporting_period = period;
  }

  return applyTransition({
    table: "grants",
    id,
    patch,
    action: `grant.${next}`,
    entityType: "grants",
    detailPath: `/admin/grants/${id}`,
    listPath: "/admin/grants",
    describe: `move this grant to ${next}`,
  });
}

/** Inline note editing — one field per call, so a save cannot clobber a sibling. */
export async function updateGrantNotes(
  id: string,
  field: "application_notes" | "award_notes" | "reporting_notes",
  formData: FormData
): Promise<Result> {
  const allowed = ["application_notes", "award_notes", "reporting_notes"];
  if (!allowed.includes(field)) return { error: "Unknown field." };

  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const value = String(formData.get(field) ?? "").trim();

  const { error } = await session.supabase
    .from("grants")
    .update({ [field]: value || null })
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save these notes") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "grant.notes_updated",
    entityType: "grants",
    entityId: id,
    newValue: { field },
  });

  revalidatePath(`/admin/grants/${id}`);
  return { ok: true };
}

/**
 * Record an awarded grant as revenue.
 *
 * Idempotent by construction: the grant row remembers the transaction it
 * created, and this refuses to run a second time. Without that, a double click
 * books the same award twice and the public financial totals overstate what the
 * foundation actually received.
 */
export async function recordGrantTransaction(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const { data: grant, error: readError } = await session.supabase
    .from("grants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError) return { error: describeDbError(readError, "read this grant") };
  if (!grant) return { error: "That grant no longer exists." };

  const g = grant as Grant;

  if (g.transaction_id) {
    return { error: "This grant has already been recorded as a transaction." };
  }
  if (g.status !== "awarded" && g.status !== "reporting" && g.status !== "closed") {
    return { error: "Only an awarded grant can be recorded as revenue." };
  }
  if (!g.amount_cents || g.amount_cents <= 0) {
    return { error: "Set the awarded amount on this grant first." };
  }

  const { data: tx, error: txError } = await session.supabase
    .from("transactions")
    .insert({
      type: "grant",
      // Pending, like every other unverified inflow — an administrator
      // confirms it once the money is actually in the account.
      status: "pending",
      amount_cents: g.amount_cents,
      fund: g.fund ?? "unrestricted",
      transaction_date: g.award_date ?? todayISODate(),
      description: `Grant award — ${g.name} (${g.funder})`,
      donor_name: g.funder,
      donor_anonymous: false,
      is_public: false,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (txError) {
    return { error: describeDbError(txError, "record this grant as a transaction") };
  }

  const { error: linkError } = await session.supabase
    .from("grants")
    .update({ transaction_id: tx.id })
    .eq("id", id);

  if (linkError) {
    // The transaction exists; the link does not. Say so plainly rather than
    // reporting success — the next click would otherwise create a duplicate.
    return {
      error:
        "The transaction was created but could not be linked back to this grant. Check /admin/transactions before recording it again.",
    };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "grant.recorded_as_transaction",
    entityType: "grants",
    entityId: id,
    newValue: { transaction_id: tx.id, amount_cents: g.amount_cents },
  });

  revalidatePath(`/admin/grants/${id}`);
  revalidatePath("/admin/transactions");
  revalidatePath("/admin");
  return { ok: true, id: tx.id };
}
