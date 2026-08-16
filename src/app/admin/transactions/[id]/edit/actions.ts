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
 * Edit a transaction.
 *
 * Status is deliberately NOT editable here — status changes go through the
 * transition actions so that every one of them produces its own audit entry
 * with the right verb. An edit form that could quietly flip `pending` to
 * `confirmed` would let a change bypass that record.
 */
export async function updateTransaction(
  id: string,
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
  const isPublic = formData.get("is_public") === "on";

  if (!TRANSACTION_TYPES.includes(type as TransactionType)) {
    return { error: "Choose a valid transaction type." };
  }
  if (!FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }
  if (!transactionDate) return { error: "Enter the transaction date." };

  const amountCents = dollarsToCents(amountRaw);
  if (amountCents === null) {
    return {
      error:
        "Enter an amount greater than zero, in dollars (for example 250 or 250.00).",
    };
  }

  const { data: before } = await session.supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const patch = {
    type: type as TransactionType,
    fund: fund as FundDesignation,
    amount_cents: amountCents,
    transaction_date: transactionDate,
    donor_name: donorAnonymous ? null : donorName || null,
    donor_anonymous: donorAnonymous,
    description: description || null,
    reference_number: reference || null,
    is_public: isPublic,
  };

  const { error } = await session.supabase
    .from("transactions")
    .update(patch)
    .eq("id", id);

  if (error) {
    return { error: describeDbError(error, "save this transaction") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "transaction.updated",
    entityType: "transactions",
    entityId: id,
    oldValue: before ?? null,
    newValue: patch,
  });

  revalidatePath(`/admin/transactions/${id}`);
  revalidatePath("/admin/transactions");
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");
  revalidatePath("/faithproof");

  return { ok: true };
}
