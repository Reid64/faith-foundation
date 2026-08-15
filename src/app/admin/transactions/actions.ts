"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { dollarsToCents } from "@/lib/faithproof/format";
import {
  FUND_DESIGNATIONS,
  TRANSACTION_TYPES,
  type FundDesignation,
  type TransactionType,
} from "@/lib/faithproof/types";

/**
 * Create a transaction.
 *
 * Returns `{ error }` rather than redirecting so <AdminForm> can render the
 * failure inline without discarding what the user typed. Success returns
 * `{ ok: true }` and the client navigates — see the note in AdminForm.tsx.
 *
 * Writes go through the USER's Supabase client, not the service-role client, so
 * row level security decides who may insert. Only `role = 'admin'` can; a staff
 * account gets a policy violation, which describeDbError turns into a sentence
 * that names the cause. Using supabaseAdmin here would have made the form work
 * for everyone and quietly deleted the authorisation model.
 */
export async function createTransaction(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const type = String(formData.get("type") ?? "");
  const fund = String(formData.get("fund") ?? "");
  const transactionDate = String(formData.get("transaction_date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const donorAnonymous = formData.get("donor_anonymous") === "on";
  const donorName = String(formData.get("donor_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const reference = String(formData.get("reference_number") ?? "").trim();

  if (!TRANSACTION_TYPES.includes(type as TransactionType)) {
    return { error: "Choose a valid transaction type." };
  }
  if (!FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }
  if (!transactionDate) {
    return { error: "Enter the transaction date." };
  }

  const amountCents = dollarsToCents(amountRaw);
  if (amountCents === null) {
    return {
      error:
        "Enter an amount greater than zero, in dollars (for example 250 or 250.00).",
    };
  }

  const { data, error } = await session.supabase
    .from("transactions")
    .insert({
      type: type as TransactionType,
      fund: fund as FundDesignation,
      status: "pending",
      amount_cents: amountCents,
      transaction_date: transactionDate,
      // Storing a donor name alongside an anonymous flag would defeat the
      // flag — the name would still sit in the database and in any export.
      donor_name: donorAnonymous ? null : donorName || null,
      donor_anonymous: donorAnonymous,
      description: description || null,
      reference_number: reference || null,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: describeDbError(error, "record this transaction") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "created",
    entityType: "transaction",
    entityId: data?.id ?? null,
    newValue: {
      type,
      fund,
      amount_cents: amountCents,
      transaction_date: transactionDate,
      donor_anonymous: donorAnonymous,
    },
  });

  revalidatePath("/admin/transactions");
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");

  return { ok: true };
}
