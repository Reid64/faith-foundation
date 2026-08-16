"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import {
  INTERACTION_TYPES,
  TASK_PRIORITIES,
  isValidStage,
  type ContactType,
  type InteractionType,
  type TaskPriority,
} from "@/lib/faithproof/crm";

type Result = { error?: string; ok?: boolean };

const revalidate = (id: string) => {
  revalidatePath(`/admin/crm/contacts/${id}`);
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contacts");
  revalidatePath("/admin/crm/tasks");
};

export async function updatePipelineStage(
  id: string,
  stage: string
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const { data: contact } = await session.supabase
    .from("contacts")
    .select("type, pipeline_stage")
    .eq("id", id)
    .maybeSingle();

  if (!contact) return { error: "Contact not found." };
  if (stage && !isValidStage(contact.type as ContactType, stage)) {
    return { error: "That stage does not belong to this contact type." };
  }

  const { error } = await session.supabase
    .from("contacts")
    .update({ pipeline_stage: stage || null })
    .eq("id", id);

  if (error) return { error: describeDbError(error, "update the stage") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "contact.stage_changed",
    entityType: "contacts",
    entityId: id,
    oldValue: { pipeline_stage: contact.pipeline_stage },
    newValue: { pipeline_stage: stage || null },
  });

  revalidate(id);
  return { ok: true };
}

export async function logInteraction(
  contactId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const type = String(formData.get("type") ?? "note");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const occurred = String(formData.get("occurred_at") ?? "").trim();

  if (!INTERACTION_TYPES.includes(type as InteractionType)) {
    return { error: "Choose a valid interaction type." };
  }
  if (!subject && !body) {
    return { error: "Add a subject or a note — an empty entry records nothing." };
  }

  const { error } = await session.supabase.from("interactions").insert({
    contact_id: contactId,
    type: type as InteractionType,
    subject: subject || null,
    body: body || null,
    occurred_at: occurred ? new Date(occurred).toISOString() : new Date().toISOString(),
    created_by: session.userId,
  });

  if (error) return { error: describeDbError(error, "log this interaction") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "interaction.logged",
    entityType: "interactions",
    entityId: contactId,
    newValue: { type, subject },
  });

  revalidate(contactId);
  return { ok: true };
}

export async function createTask(
  contactId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");
  const assigned = String(formData.get("assigned_to") ?? "").trim();

  if (!title) return { error: "Enter a task title." };
  if (!TASK_PRIORITIES.includes(priority as TaskPriority)) {
    return { error: "Choose a valid priority." };
  }

  const { error } = await session.supabase.from("tasks").insert({
    contact_id: contactId,
    title,
    description: description || null,
    due_date: dueDate || null,
    priority: priority as TaskPriority,
    status: "pending",
    assigned_to: assigned || null,
    created_by: session.userId,
  });

  if (error) return { error: describeDbError(error, "create this task") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "task.created",
    entityType: "tasks",
    entityId: contactId,
    newValue: { title, priority, due_date: dueDate || null },
  });

  revalidate(contactId);
  return { ok: true };
}

export async function completeTask(taskId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const { data: before } = await session.supabase
    .from("tasks")
    .select("contact_id, title, status")
    .eq("id", taskId)
    .maybeSingle();

  const { error } = await session.supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: describeDbError(error, "complete this task") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "task.completed",
    entityType: "tasks",
    entityId: taskId,
    oldValue: { status: before?.status },
    newValue: { status: "completed" },
  });

  if (before?.contact_id) revalidate(before.contact_id);
  revalidatePath("/admin/crm/tasks");
  return { ok: true };
}

export async function linkTransaction(
  contactId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const transactionId = String(formData.get("transaction_id") ?? "").trim();
  if (!transactionId) return { error: "Enter a transaction ID." };

  // Verify it exists first, so a typo produces a clear message rather than a
  // raw foreign-key violation.
  const { data: tx } = await session.supabase
    .from("transactions")
    .select("id")
    .eq("id", transactionId)
    .maybeSingle();
  if (!tx) return { error: "No transaction found with that ID." };

  const { error } = await session.supabase
    .from("contact_transactions")
    .insert({ contact_id: contactId, transaction_id: transactionId });

  if (error) {
    if (error.code === "23505") {
      return { error: "That transaction is already linked to this contact." };
    }
    return { error: describeDbError(error, "link this transaction") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "contact.transaction_linked",
    entityType: "contact_transactions",
    entityId: contactId,
    newValue: { transaction_id: transactionId },
  });

  revalidate(contactId);
  return { ok: true };
}

export async function addCampaignTag(
  contactId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const campaign = String(formData.get("campaign") ?? "").trim();
  if (!campaign) return { error: "Enter a campaign name." };

  const { error } = await session.supabase.from("campaign_tags").insert({
    contact_id: contactId,
    campaign,
    tagged_by: session.userId,
  });

  if (error) return { error: describeDbError(error, "add this campaign tag") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "contact.campaign_tagged",
    entityType: "campaign_tags",
    entityId: contactId,
    newValue: { campaign },
  });

  revalidate(contactId);
  revalidatePath("/admin/crm/campaigns");
  return { ok: true };
}
