"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { MAIL_CONFIGURED, sendEmail } from "@/lib/email";
import { renderSubject, renderTemplate } from "@/lib/mergeTemplates";
import type { Contact } from "@/lib/faithproof/crm";

export type SendSummary = {
  error?: string;
  sent?: number;
  failed?: number;
  skipped?: number;
  detail?: string;
};

/**
 * Render and send one template to the selected contacts.
 *
 * Every attempt is written to `email_sends` — sent or failed, with the reason.
 * The action reports the real counts; it never claims a send that did not
 * happen. A contact with no email address is counted as skipped rather than
 * failed, because that is a data gap, not a delivery problem.
 *
 * Sends run sequentially with a small delay. Zoho enforces rate limits, and a
 * burst of parallel connections is the fastest way to get the account throttled
 * mid-campaign.
 */
export async function sendCampaign(
  campaign: string,
  formData: FormData
): Promise<SendSummary> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." };

  const templateId = String(formData.get("template_id") ?? "");
  if (!templateId) return { error: "Choose a template first." };

  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  if (contactIds.length === 0) {
    return { error: "Select at least one contact." };
  }

  const { data: template, error: tErr } = await session.supabase
    .from("email_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (tErr) return { error: describeDbError(tErr, "load the template") };
  if (!template) return { error: "That template no longer exists." };

  const { data: contacts, error: cErr } = await session.supabase
    .from("contacts")
    .select("*")
    .in("id", contactIds);

  if (cErr) return { error: describeDbError(cErr, "load the contacts") };

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const contact of (contacts ?? []) as Contact[]) {
    const html = renderTemplate(template.body_html as string, contact);
    const subject = renderSubject(template.subject as string, contact);

    if (!contact.email) {
      skipped++;
      await session.supabase.from("email_sends").insert({
        template_id: templateId,
        contact_id: contact.id,
        subject,
        body_html: html,
        status: "failed",
        error_text: "Contact has no email address on file.",
        created_by: session.userId,
      });
      continue;
    }

    try {
      await sendEmail({ to: contact.email, subject, html });
      sent++;
      await session.supabase.from("email_sends").insert({
        template_id: templateId,
        contact_id: contact.id,
        subject,
        body_html: html,
        status: "sent",
        sent_at: new Date().toISOString(),
        created_by: session.userId,
      });
      // The send is also part of the contact's history, not just the mail log.
      await session.supabase.from("interactions").insert({
        contact_id: contact.id,
        type: "email",
        subject,
        body: `Campaign "${campaign}" sent using template "${template.name}".`,
        created_by: session.userId,
      });
    } catch (err) {
      failed++;
      await session.supabase.from("email_sends").insert({
        template_id: templateId,
        contact_id: contact.id,
        subject,
        body_html: html,
        status: "failed",
        error_text: err instanceof Error ? err.message : "Unknown send error",
        created_by: session.userId,
      });
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "campaign.sent",
    entityType: "email_sends",
    entityId: null,
    newValue: { campaign, template: template.name, sent, failed, skipped },
  });

  revalidatePath("/admin/crm/campaigns");

  return {
    sent,
    failed,
    skipped,
    detail: MAIL_CONFIGURED
      ? undefined
      : "ZOHO_SMTP_PASS is not set, so nothing was actually delivered. Every attempt is recorded as failed with the reason.",
  };
}
