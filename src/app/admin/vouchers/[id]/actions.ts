"use server";

import { getSession } from "@/lib/faithproof/session";
import { applyTransition } from "@/lib/faithproof/transitions";

const LIST = "/admin/vouchers";

export async function approveVoucher(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  return applyTransition({
    table: "vouchers",
    id,
    patch: {
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: session.userId,
    },
    action: "voucher.approved",
    entityType: "vouchers",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "approve this voucher",
  });
}

export async function disburseVoucher(id: string) {
  return applyTransition({
    table: "vouchers",
    id,
    patch: {
      status: "disbursed",
      disbursed_at: new Date().toISOString(),
    },
    action: "voucher.disbursed",
    entityType: "vouchers",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "mark this voucher disbursed",
  });
}

export async function cancelVoucher(id: string) {
  return applyTransition({
    table: "vouchers",
    id,
    patch: { status: "cancelled" },
    action: "voucher.cancelled",
    entityType: "vouchers",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "cancel this voucher",
  });
}
