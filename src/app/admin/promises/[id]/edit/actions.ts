"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";

/**
 * Edit a promise.
 *
 * Status is not editable here — it changes through the transition actions so
 * each change writes its own audit entry with the correct verb.
 */
export async function updatePromise(
  id: string,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("target_date") ?? "").trim();
  const proofUrl = String(formData.get("proof_url") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";

  if (!title) return { error: "Enter a title for this promise." };
  if (proofUrl && !/^https?:\/\//i.test(proofUrl)) {
    return {
      error: "The proof URL must start with http:// or https://.",
    };
  }

  const { data: before } = await session.supabase
    .from("promises")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const patch = {
    title,
    description: description || null,
    target_date: targetDate || null,
    proof_url: proofUrl || null,
    is_public: isPublic,
  };

  const { error } = await session.supabase
    .from("promises")
    .update(patch)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save this promise") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "promise.updated",
    entityType: "promises",
    entityId: id,
    oldValue: before ?? null,
    newValue: patch,
  });

  revalidatePath(`/admin/promises/${id}`);
  revalidatePath("/admin/promises");
  revalidatePath("/admin/audit-log");
  revalidatePath("/faithproof");
  return { ok: true };
}
