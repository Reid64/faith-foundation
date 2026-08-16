"use server";

import { getSession } from "@/lib/faithproof/session";
import { applyTransition } from "@/lib/faithproof/transitions";

const LIST = "/admin/transactions";

export async function confirmTransaction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  return applyTransition({
    table: "transactions",
    id,
    patch: {
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      confirmed_by: session.userId,
    },
    action: "transaction.confirmed",
    entityType: "transactions",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "confirm this transaction",
  });
}

export async function reconcileTransaction(id: string) {
  return applyTransition({
    table: "transactions",
    id,
    patch: { status: "reconciled" },
    action: "transaction.reconciled",
    entityType: "transactions",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "reconcile this transaction",
  });
}

export async function voidTransaction(id: string) {
  return applyTransition({
    table: "transactions",
    id,
    patch: { status: "voided" },
    action: "transaction.voided",
    entityType: "transactions",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "void this transaction",
  });
}
