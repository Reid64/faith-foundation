"use server";

import { applyTransition, todayISODate } from "@/lib/faithproof/transitions";

const LIST = "/admin/promises";

export async function fulfillPromise(id: string) {
  return applyTransition({
    table: "promises",
    id,
    patch: { status: "fulfilled", fulfilled_date: todayISODate() },
    action: "promise.fulfilled",
    entityType: "promises",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "mark this promise fulfilled",
  });
}

export async function markInProgress(id: string) {
  return applyTransition({
    table: "promises",
    id,
    patch: { status: "in_progress" },
    action: "promise.in_progress",
    entityType: "promises",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "mark this promise in progress",
  });
}

export async function markMissed(id: string) {
  return applyTransition({
    table: "promises",
    id,
    patch: { status: "missed" },
    action: "promise.missed",
    entityType: "promises",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "mark this promise missed",
  });
}

/**
 * Attach or replace the evidence link.
 *
 * A promise page that shows "Kept" with a dead link is worse than one with no
 * link at all, so the URL is validated before it is stored.
 */
export async function updateProofUrl(id: string, formData: FormData) {
  const url = String(formData.get("proof_url") ?? "").trim();

  if (url && !/^https?:\/\//i.test(url)) {
    return {
      error:
        "The proof URL must start with http:// or https:// so it resolves as a link.",
    };
  }

  return applyTransition({
    table: "promises",
    id,
    patch: { proof_url: url || null },
    action: url ? "promise.proof_updated" : "promise.proof_removed",
    entityType: "promises",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "save the proof URL",
  });
}
