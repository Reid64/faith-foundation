import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * Zeffy donation webhook.
 *
 * Zeffy has no native webhook, so this is fed by a Zapier Zap today (see
 * governance/faithproof-roadmap/ZAPIER-SETUP.md). The payload shape is
 * deliberately permissive so a future native Zeffy webhook can post here too.
 *
 * SERVICE-ROLE CLIENT BY NECESSITY: a webhook carries no session, and RLS
 * grants INSERT on transactions only to `role = 'admin'`. The session client
 * would be refused on every call.
 *
 * Everything lands as `status: 'pending'` and `is_public: false`. Nothing this
 * endpoint writes counts toward a public total until a human confirms it in the
 * Command Center — an unauthenticated endpoint must never be able to publish a
 * figure on the transparency page.
 */

export const dynamic = "force-dynamic";

const FUND_MAP: Record<string, string> = {
  "housing voucher": "housing_voucher",
  housing: "housing_voucher",
  veterans: "veterans",
  veteran: "veterans",
  recovery: "recovery",
  reentry: "reentry",
  "second chance": "reentry",
  "single parent": "single_parent_stability",
  emergency: "emergency_bridge",
  "financial literacy": "financial_literacy",
  cornerstone: "cornerstone_communities",
  general: "unrestricted",
  unrestricted: "unrestricted",
};

function mapFund(campaign: string): string {
  if (!campaign) return "unrestricted";
  const lower = campaign.toLowerCase();
  for (const [key, value] of Object.entries(FUND_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "unrestricted";
}

/** Parse "$1,234.56" / "1234.56" / 1234.56 into integer cents. */
function toCents(amount: unknown): number | null {
  const cleaned = String(amount ?? "").replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  const cents = Math.round(value * 100);
  return cents > 0 ? cents : null;
}

/** YYYY-MM-DD, falling back to today when the payload date is unusable. */
function toDate(value: unknown): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!value) return today;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? today : d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      donor_name,
      donor_email,
      amount,
      fund,
      campaign,
      transaction_id,
      date,
    } = body as Record<string, unknown>;

    const amountCents = toCents(amount);
    if (amountCents === null) {
      return NextResponse.json(
        { error: "Missing or invalid amount" },
        { status: 400 }
      );
    }

    const fundDesignation = fund
      ? mapFund(String(fund))
      : mapFund(String(campaign ?? ""));
    const txDate = toDate(date);
    const zeffyId = transaction_id
      ? String(transaction_id)
      : `zapier-${Date.now()}`;
    const donorName = donor_name ? String(donor_name).trim() : "";
    const donorEmail = donor_email ? String(donor_email).trim() : "";

    // Fast path for a repeat delivery. The UNIQUE constraint below is what
    // actually guarantees this — two simultaneous deliveries both pass this
    // check, and the second one is caught by 23505.
    if (transaction_id) {
      const { data: existing } = await supabaseAdmin
        .from("transactions")
        .select("id")
        .eq("zeffy_transaction_id", zeffyId)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
    }

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .insert({
        type: "donation",
        status: "pending",
        amount_cents: amountCents,
        fund: fundDesignation,
        // `donor_anonymous` here means "Zeffy sent us no name", not a donor
        // request for anonymity. The name is stored when we have one.
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        donor_anonymous: !donorName,
        zeffy_transaction_id: zeffyId,
        zeffy_campaign: campaign ? String(campaign) : null,
        transaction_date: txDate,
        is_public: false,
        description: `Zeffy donation${campaign ? ` — ${String(campaign)}` : ""}`,
      })
      .select("id")
      .single();

    if (txError) {
      // 23505 = the UNIQUE constraint fired: this donation is already recorded.
      // Answering 200 stops Zapier retrying forever over a non-problem.
      if (txError.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error("[zeffy] transaction insert failed:", txError.message);
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // actor_id is NULL: no human performed this. The action verb records that
    // it arrived through the webhook rather than being entered by someone.
    await supabaseAdmin.from("audit_log").insert({
      action: "transaction.created_via_webhook",
      entity_type: "transactions",
      entity_id: tx.id,
      new_value: {
        source: "zeffy_webhook",
        amount_cents: amountCents,
        fund: fundDesignation,
        campaign: campaign ?? null,
      },
    });

    // ── CRM auto-link (Phase 10) ────────────────────────────────────────
    // Best-effort: a CRM failure must never lose the donation, which is
    // already committed above.
    if (donorEmail) {
      try {
        await linkToCrm(donorEmail, donorName, tx.id, amountCents);
      } catch (crmError) {
        console.error("[zeffy] CRM link failed (donation kept):", crmError);
      }
    }

    return NextResponse.json({ ok: true, transaction_id: tx.id });
  } catch (err) {
    console.error("[zeffy] webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Attach the donation to a CRM contact, creating one if the email is new.
 *
 * Runs only if the `contacts` table exists — Phase 9 can be deployed before
 * Phase 10's migration is applied, and a missing table must not turn a real
 * donation into a 500.
 */
async function linkToCrm(
  email: string,
  name: string,
  transactionId: string,
  amountCents: number
) {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("contacts")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  // 42P01 = relation does not exist. Phase 10 not applied yet; nothing to do.
  if (lookupError && lookupError.code === "42P01") return;

  let contactId = existing?.id as string | undefined;

  if (!contactId) {
    const parts = name.split(/\s+/).filter(Boolean);
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "Donor";

    const { data: created } = await supabaseAdmin
      .from("contacts")
      .insert({
        type: "donor",
        first_name: firstName,
        last_name: lastName,
        email,
        source: "Zeffy donation",
        pipeline_stage: "active_donor",
      })
      .select("id")
      .single();
    contactId = created?.id;
  }

  if (!contactId) return;

  await supabaseAdmin
    .from("contact_transactions")
    .insert({ contact_id: contactId, transaction_id: transactionId });

  await supabaseAdmin.from("interactions").insert({
    contact_id: contactId,
    type: "donation",
    subject: "Donation received via Zeffy",
    body: `${(amountCents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })} recorded as pending, awaiting confirmation.`,
  });
}
