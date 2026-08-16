import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * Inbound email → CRM.
 *
 * Fed by Zoho Mail forwarding/webhook. Uses the service-role client because a
 * webhook carries no session.
 *
 * ── SECURITY, STATED PLAINLY ──────────────────────────────────────────────
 * A `From` header is trivially forged and this endpoint is unauthenticated, so
 * anything it creates is UNVERIFIED by definition. Two consequences are built
 * in rather than assumed away:
 *
 *  1. If INBOUND_WEBHOOK_SECRET is set, it is required (as `?token=` or the
 *     `x-webhook-token` header). Set it. Without it, anyone who finds this URL
 *     can create CRM contacts at will.
 *  2. Contacts created here are marked `source: "Inbound email (unverified)"`
 *     so nobody mistakes a self-asserted applicant for a screened one.
 *
 * Contact TYPE is inferred from the subject line, which is a guess. It is
 * recorded as such, and a human reclassifies from the contact record.
 */

export const dynamic = "force-dynamic";

const SECRET = process.env.INBOUND_WEBHOOK_SECRET;

function inferType(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("apply") || s.includes("application")) return "applicant";
  if (s.includes("volunteer")) return "volunteer";
  if (s.includes("donat")) return "donor";
  return "partner";
}

function splitName(from: string, fallbackEmail: string) {
  // "Jane Doe <jane@x.com>" → Jane / Doe. Otherwise fall back to the local part.
  const display = from.replace(/<[^>]*>/, "").replace(/["']/g, "").trim();
  const source = display || fallbackEmail.split("@")[0] || "Unknown";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return {
    first: parts[0] || "Unknown",
    last: parts.slice(1).join(" ") || "Sender",
  };
}

function extractEmail(value: string): string {
  const m = value.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m ? m[0].toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  try {
    if (SECRET) {
      const token =
        req.nextUrl.searchParams.get("token") ||
        req.headers.get("x-webhook-token");
      if (token !== SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    const fromRaw = String(raw.from_email ?? raw.from ?? raw.sender ?? "");
    const subject = String(raw.subject ?? "").trim() || "(no subject)";
    const bodyText = String(raw.body_text ?? raw.text ?? raw.body ?? "");

    const email = extractEmail(fromRaw);
    if (!email) {
      return NextResponse.json(
        { error: "Could not determine sender email" },
        { status: 400 }
      );
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (lookupError && lookupError.code === "42P01") {
      return NextResponse.json(
        { error: "CRM not available" },
        { status: 503 }
      );
    }

    let contactId = existing?.id as string | undefined;
    let created = false;

    if (!contactId) {
      const { first, last } = splitName(fromRaw, email);
      const { data: newContact, error: insertError } = await supabaseAdmin
        .from("contacts")
        .insert({
          type: inferType(subject),
          first_name: first,
          last_name: last,
          email,
          source: "Inbound email (unverified)",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[email-inbound] contact insert failed:", insertError.message);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      contactId = newContact.id;
      created = true;
    }

    await supabaseAdmin.from("interactions").insert({
      contact_id: contactId,
      type: "email",
      subject,
      // Truncated: the CRM is a history, not a mail archive.
      body: bodyText.slice(0, 500),
      occurred_at: new Date().toISOString(),
    });

    await supabaseAdmin.from("audit_log").insert({
      action: created
        ? "contact.created_via_inbound_email"
        : "interaction.logged_via_inbound_email",
      entity_type: "contacts",
      entity_id: contactId,
      new_value: { email, subject, unverified: true },
    });

    return NextResponse.json({ ok: true, contact_id: contactId, created });
  } catch (err) {
    console.error("[email-inbound] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
