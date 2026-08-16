"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";

const TEMPLATE_TYPES = [
  "donor_receipt",
  "impact_report",
  "volunteer_welcome",
  "application_update",
  "board_report",
  "custom",
] as const;

type Result = { error?: string; ok?: boolean; id?: string };

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    subject: String(formData.get("subject") ?? "").trim(),
    body_html: String(formData.get("body_html") ?? "").trim(),
    type: String(formData.get("type") ?? "custom"),
  };
}

function validate(p: ReturnType<typeof parse>): string | null {
  if (!p.name) return "Give the template a name.";
  if (!p.subject) return "Enter a subject line.";
  if (!p.body_html) return "The template body cannot be empty.";
  if (!TEMPLATE_TYPES.includes(p.type as (typeof TEMPLATE_TYPES)[number])) {
    return "Choose a valid template type.";
  }
  return null;
}

export async function createTemplate(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const p = parse(formData);
  const invalid = validate(p);
  if (invalid) return { error: invalid };

  const { data, error } = await session.supabase
    .from("email_templates")
    .insert({ ...p, created_by: session.userId })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "save this template") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "template.created",
    entityType: "email_templates",
    entityId: data.id,
    newValue: { name: p.name, type: p.type },
  });

  revalidatePath("/admin/crm/templates");
  return { ok: true, id: data.id };
}

export async function updateTemplate(
  id: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const p = parse(formData);
  const invalid = validate(p);
  if (invalid) return { error: invalid };

  const { data: before } = await session.supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await session.supabase
    .from("email_templates")
    .update(p)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save this template") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "template.updated",
    entityType: "email_templates",
    entityId: id,
    oldValue: before ?? null,
    newValue: p,
  });

  revalidatePath("/admin/crm/templates");
  revalidatePath(`/admin/crm/templates/${id}/edit`);
  return { ok: true, id };
}
