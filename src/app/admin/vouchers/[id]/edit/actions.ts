"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { dollarsToCents } from "@/lib/faithproof/format";
import { FUND_DESIGNATIONS, type FundDesignation } from "@/lib/faithproof/types";

export async function updateVoucher(
  id: string,
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

  if (!voucherNumber) return { error: "Enter a voucher number." };
  if (!FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }

  const amountCents = dollarsToCents(amountRaw);
  if (amountCents === null) {
    return { error: "Enter an amount greater than zero, in dollars." };
  }

  const { data: before } = await session.supabase
    .from("vouchers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const patch = {
    voucher_number: voucherNumber,
    fund: fund as FundDesignation,
    amount_cents: amountCents,
    program: program || null,
    recipient_name: recipientAnonymous ? null : recipientName || null,
    recipient_anonymous: recipientAnonymous,
    notes: notes || null,
  };

  const { error } = await session.supabase
    .from("vouchers")
    .update(patch)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save this voucher") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "voucher.updated",
    entityType: "vouchers",
    entityId: id,
    oldValue: before ?? null,
    newValue: patch,
  });

  revalidatePath(`/admin/vouchers/${id}`);
  revalidatePath("/admin/vouchers");
  revalidatePath("/admin/audit-log");
  return { ok: true };
}
