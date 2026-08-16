"use server";

import { getSession } from "@/lib/faithproof/session";
import { applyTransition } from "@/lib/faithproof/transitions";

const LIST = "/admin/proof-vault";

export async function verifyDocument(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  return applyTransition({
    table: "proof_documents",
    id,
    patch: {
      verified: true,
      verified_by: session.userId,
      verified_at: new Date().toISOString(),
    },
    action: "document.verified",
    entityType: "proof_documents",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "verify this document",
  });
}

export async function unverifyDocument(id: string) {
  return applyTransition({
    table: "proof_documents",
    id,
    // Clear the verifier too — leaving a name attached to an unverified
    // document would still credit someone with a check that no longer stands.
    patch: { verified: false, verified_by: null, verified_at: null },
    action: "document.unverified",
    entityType: "proof_documents",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: "unverify this document",
  });
}

export async function togglePublic(id: string, next: boolean) {
  return applyTransition({
    table: "proof_documents",
    id,
    patch: { is_public: next },
    action: next ? "document.made_public" : "document.made_private",
    entityType: "proof_documents",
    detailPath: `${LIST}/${id}`,
    listPath: LIST,
    describe: next ? "make this document public" : "make this document private",
  });
}
