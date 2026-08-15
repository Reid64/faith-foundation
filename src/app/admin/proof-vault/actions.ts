"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/faithproof/types";

export async function createProofDocument(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const externalUrl = String(formData.get("external_url") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";
  const verified = formData.get("verified") === "on";

  if (!title) {
    return { error: "Enter a title for this document." };
  }
  if (!DOCUMENT_TYPES.includes(type as DocumentType)) {
    return { error: "Choose a valid document type." };
  }
  if (externalUrl && !/^https?:\/\//i.test(externalUrl)) {
    return {
      error:
        "The document URL must start with http:// or https:// so it resolves as a link.",
    };
  }
  // The public RLS policy exposes documents where is_public AND verified. A
  // public document with no link is therefore publishable but unreadable.
  if (isPublic && !externalUrl) {
    return {
      error:
        "A public document needs a URL — otherwise it appears publicly with nothing to open. Add a link or untick 'Show this document publicly'.",
    };
  }

  const { data, error } = await session.supabase
    .from("proof_documents")
    .insert({
      title,
      type: type as DocumentType,
      description: description || null,
      external_url: externalUrl || null,
      is_public: isPublic,
      verified,
      // Only stamp the verifier when the claim is actually being made, so an
      // unverified document never carries a name implying someone checked it.
      verified_by: verified ? session.userId : null,
      verified_at: verified ? new Date().toISOString() : null,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: describeDbError(error, "add this document") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: verified ? "created and verified" : "created",
    entityType: "proof_document",
    entityId: data?.id ?? null,
    newValue: { title, type, is_public: isPublic, verified },
  });

  revalidatePath("/admin/proof-vault");
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");

  return { ok: true };
}
