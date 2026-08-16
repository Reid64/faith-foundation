"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/faithproof/types";

/**
 * Edit a document.
 *
 * `verified` and `is_public` are not editable here — both are consequential
 * claims and change through their own actions so each one is audited.
 */
export async function updateProofDocument(
  id: string,
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

  if (!title) return { error: "Enter a title for this document." };
  if (!DOCUMENT_TYPES.includes(type as DocumentType)) {
    return { error: "Choose a valid document type." };
  }
  if (externalUrl && !/^https?:\/\//i.test(externalUrl)) {
    return { error: "The document URL must start with http:// or https://." };
  }

  const { data: before } = await session.supabase
    .from("proof_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // A public document with no link appears publicly with nothing to open.
  if (before?.is_public && !externalUrl) {
    return {
      error:
        "This document is public, so it needs a URL. Add a link, or make it private first.",
    };
  }

  const patch = {
    title,
    type: type as DocumentType,
    description: description || null,
    external_url: externalUrl || null,
  };

  const { error } = await session.supabase
    .from("proof_documents")
    .update(patch)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save this document") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "document.updated",
    entityType: "proof_documents",
    entityId: id,
    oldValue: before ?? null,
    newValue: patch,
  });

  revalidatePath(`/admin/proof-vault/${id}`);
  revalidatePath("/admin/proof-vault");
  revalidatePath("/admin/audit-log");
  revalidatePath("/faithproof");
  return { ok: true };
}
