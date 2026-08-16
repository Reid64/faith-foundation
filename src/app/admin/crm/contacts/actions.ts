"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import {
  CONTACT_TYPES,
  isValidStage,
  type ContactType,
} from "@/lib/faithproof/crm";

type Result = { error?: string; ok?: boolean; id?: string };

/** Shared field parsing for create and update. */
function parseContact(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const smsConsent = formData.get("sms_consent") === "on";
  const pipeline_stage = String(formData.get("pipeline_stage") ?? "").trim();
  const assigned = String(formData.get("assigned_to") ?? "").trim();

  return {
    type,
    first_name,
    last_name,
    email,
    phone,
    smsConsent,
    pipeline_stage,
    assigned,
    address_line1: String(formData.get("address_line1") ?? "").trim(),
    address_line2: String(formData.get("address_line2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    zip: String(formData.get("zip") ?? "").trim(),
    source: String(formData.get("source") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function validate(p: ReturnType<typeof parseContact>): string | null {
  if (!CONTACT_TYPES.includes(p.type as ContactType)) {
    return "Choose a valid contact type.";
  }
  if (!p.first_name || !p.last_name) {
    return "First and last name are both required.";
  }
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    return "Enter a valid email address, or leave it blank.";
  }
  // The stage list is per type; an applicant stage on a donor would corrupt the
  // pipeline summary, and the column itself is unconstrained TEXT.
  if (p.pipeline_stage && !isValidStage(p.type as ContactType, p.pipeline_stage)) {
    return "That pipeline stage does not belong to the selected contact type.";
  }
  return null;
}

export async function createContact(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const p = parseContact(formData);
  const invalid = validate(p);
  if (invalid) return { error: invalid };

  const { data, error } = await session.supabase
    .from("contacts")
    .insert({
      type: p.type as ContactType,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email || null,
      phone: p.phone || null,
      sms_consent: p.smsConsent,
      // Stamped only when consent is affirmatively given — the date is the
      // evidence, and TCPA disputes turn on being able to show when.
      sms_consent_date: p.smsConsent ? new Date().toISOString() : null,
      address_line1: p.address_line1 || null,
      address_line2: p.address_line2 || null,
      city: p.city || null,
      state: p.state || null,
      zip: p.zip || null,
      source: p.source || null,
      notes: p.notes || null,
      pipeline_stage: p.pipeline_stage || null,
      assigned_to: p.assigned || null,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "create this contact") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "contact.created",
    entityType: "contacts",
    entityId: data.id,
    newValue: { type: p.type, name: `${p.first_name} ${p.last_name}` },
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contacts");
  return { ok: true, id: data.id };
}

export async function updateContact(
  id: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) {
    return { error: "Your session has expired. Sign in again to continue." };
  }

  const p = parseContact(formData);
  const invalid = validate(p);
  if (invalid) return { error: invalid };

  const { data: before } = await session.supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const patch: Record<string, unknown> = {
    type: p.type as ContactType,
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email || null,
    phone: p.phone || null,
    sms_consent: p.smsConsent,
    address_line1: p.address_line1 || null,
    address_line2: p.address_line2 || null,
    city: p.city || null,
    state: p.state || null,
    zip: p.zip || null,
    source: p.source || null,
    notes: p.notes || null,
    pipeline_stage: p.pipeline_stage || null,
    assigned_to: p.assigned || null,
  };

  // Only move the consent date when consent actually changes state, so an
  // unrelated edit cannot silently re-date the evidence.
  if (p.smsConsent && !before?.sms_consent) {
    patch.sms_consent_date = new Date().toISOString();
  } else if (!p.smsConsent) {
    patch.sms_consent_date = null;
  }

  const { error } = await session.supabase
    .from("contacts")
    .update(patch)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "save this contact") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "contact.updated",
    entityType: "contacts",
    entityId: id,
    oldValue: before ?? null,
    newValue: patch,
  });

  revalidatePath(`/admin/crm/contacts/${id}`);
  revalidatePath("/admin/crm/contacts");
  return { ok: true, id };
}
