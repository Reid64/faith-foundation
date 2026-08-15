"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { PROMISE_STATUSES, type PromiseStatus } from "@/lib/faithproof/types";

export async function createPromise(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const targetDate = String(formData.get("target_date") ?? "").trim();
  const proofUrl = String(formData.get("proof_url") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";

  if (!title) {
    return { error: "Enter a title for this promise." };
  }
  if (!PROMISE_STATUSES.includes(status as PromiseStatus)) {
    return { error: "Choose a valid status." };
  }
  if (proofUrl && !/^https?:\/\//i.test(proofUrl)) {
    return {
      error:
        "The proof URL must start with http:// or https:// so it resolves as a link.",
    };
  }

  const { data, error } = await session.supabase
    .from("promises")
    .insert({
      title,
      description: description || null,
      status: status as PromiseStatus,
      target_date: targetDate || null,
      // A promise marked fulfilled needs a fulfilment date, otherwise the
      // Promises page shows "kept" with nothing saying when.
      fulfilled_date:
        status === "fulfilled" ? new Date().toISOString().slice(0, 10) : null,
      proof_url: proofUrl || null,
      is_public: isPublic,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: describeDbError(error, "record this promise") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "created",
    entityType: "promise",
    entityId: data?.id ?? null,
    newValue: { title, status, target_date: targetDate || null, is_public: isPublic },
  });

  revalidatePath("/admin/promises");
  revalidatePath("/admin");
  revalidatePath("/admin/audit-log");

  return { ok: true };
}
