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
  type FundDesignation,
} from "@/lib/faithproof/types";

/**
 * Issue a voucher.
 *
 * `voucher_number` is UNIQUE NOT NULL. The form only suggests a number, so two
 * people filling the form at once can collide; the 23505 branch in
 * describeDbError turns that into a sentence telling them to change it rather
 * than a raw constraint dump.
 */
export async function createVoucher(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const voucherNumber = String(formData.get("voucher_number") ?? "").trim();
  const fund = String(formData.get("fund") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const program = String(formData.get("program") ?? "").trim();
  const recipientAnonymous = formData.get("recipient_anonymous") === "on";
  const recipientName = String(formData.get("recipient_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!voucherNumber) {
    return { error: "Enter a voucher number." };
  }
  if (!FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }

  const amountCents = dollarsToCents(amountRaw);
  if (amountCents === null) {
    return {
      error:
        "Enter an amount greater than zero, in dollars (for example 2500 or 2500.00).",
    };
  }

  const { data, error } = await session.supabase
    .from("vouchers")
    .insert({
      voucher_number: voucherNumber,
      fund: fund as FundDesignation,
      status: "pending",
      amount_cents: amountCents,
      program: program || null,
      // As with donors: an anonymised recipient's name is discarded, not just
      // hidden. These are families in housing crisis; the flag has to mean the
      // name is not in the database.
      recipient_name: recipientAnonymous ? null : recipientName || null,
      recipient_anonymous: recipientAnonymous,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: describeDbError(error, "issue this voucher") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "created",
    entityType: "voucher",
    entityId: data?.id ?? null,
    newValue: {
      voucher_number: voucherNumber,
      fund,
      amount_cents: amountCents,
      recipient_anonymous: recipientAnonymous,
    },
  });

  revalidatePath("/admin/vouchers");
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");

  return { ok: true };
}
