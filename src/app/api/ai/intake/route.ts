import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * POST /api/ai/intake — public intake assistant.
 *
 * WHY THE PROGRAM LIST BELOW DIFFERS FROM THE PHASE BRIEF
 *
 * The brief's system prompt offers Single Parent Stability, Emergency Bridge
 * Housing, and a Financial Literacy Program. All three were RETIRED on
 * 2026-08-14: their routes now 301 to /programs, they are excluded from
 * SELECTABLE_FUNDS, and they appear nowhere on the public site. Repeating them
 * here would have the assistant offer three programs that do not exist to
 * families in housing crisis, then collect their income and phone number
 * against that offer. The list below is the set of programs FAITH Foundation
 * actually runs. Everything else in the brief's prompt is carried over as
 * written.
 *
 * The assistant PRE-SCREENS. It never states or implies an eligibility
 * decision — approval is a human judgement, and the public eligibility language
 * is deliberately careful. The prompt says so explicitly.
 *
 * SERVICE ROLE: this route has no session (a visitor is not signed in), so it
 * writes through supabaseAdmin. That is the documented exception, and it is why
 * the write path is narrow: one contact, one interaction, one follow-up task,
 * with fixed values for everything the model does not supply.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** One place to update the model, per the phase spec's note 6. */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

// Unauthenticated and it costs money per call, so both dimensions are capped.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES = 30;
const MAX_CHARS = 2000;

const SYSTEM_PROMPT = `You are the FAITH Foundation intake assistant. FAITH Foundation helps economically disadvantaged individuals and families in Texas achieve homeownership through down payment assistance vouchers and housing support services. You help pre-screen potential applicants, answer questions about eligibility, and collect intake information.

Programs offered: Housing Voucher Program (down payment assistance), Veterans Path Home, Recovery Housing Support, Second Chance Reentry, and Homeownership Counseling. Cornerstone Communities is a long-term vision that is not yet operating — describe it only as a future goal, never as available help.

Eligibility generally requires: Texas residency, demonstrated financial need, and a commitment to a homeownership or housing stability goal.

You do NOT decide eligibility and must never say or imply that someone qualifies, is approved, or will receive assistance. Every application is reviewed by a person. If asked directly, say that a team member makes that decision after reviewing the application.

FAITH Foundation does NOT discriminate based on religion, race, ethnicity, or any protected class. All are welcome.

Your goal is to:
1. Welcome the visitor warmly
2. Ask about their housing situation and what kind of help they are seeking
3. Identify which program fits best
4. Collect: full name, email, phone, household size, approximate annual income, current housing situation, program interest
5. When you have collected all this information, end with: 'Thank you [name]. A FAITH Foundation team member will review your information and contact you within 2 business days at [email]. Is there anything else you would like to share before we close?'
6. After that final response, include a JSON block at the very end in this exact format: <INTAKE_DATA>{"name":"...","email":"...","phone":"...","household_size":N,"program":"...","notes":"..."}</INTAKE_DATA>

Keep responses warm, brief, and conversational. Never name any corporate homebuilding partner.`;

type Msg = { role: "user" | "assistant"; content: string };

type IntakeData = {
  name?: string;
  email?: string;
  phone?: string;
  household_size?: number;
  program?: string;
  notes?: string;
};

/** Pull the structured block out and strip it from what the visitor sees. */
function extractIntake(text: string): { visible: string; data: IntakeData | null } {
  const match = text.match(/<INTAKE_DATA>([\s\S]*?)<\/INTAKE_DATA>/);
  if (!match) return { visible: text, data: null };

  const visible = text.replace(match[0], "").trim();
  try {
    const parsed = JSON.parse(match[1].trim()) as IntakeData;
    return { visible, data: parsed };
  } catch {
    // A malformed block is not an intake. Better to lose the record and have
    // the visitor talk to a person than to write a half-parsed one.
    return { visible, data: null };
  }
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/**
 * Persist the intake.
 *
 * Returns true ONLY if the contact row actually committed — the same invariant
 * every form in this codebase holds. The interaction and follow-up task are
 * best effort on top of that; losing a task is recoverable, reporting a
 * contact that does not exist is not.
 */
async function persistIntake(data: IntakeData, sessionId: string): Promise<boolean> {
  if (!data.email && !data.phone) return false;

  const { first, last } = splitName(data.name ?? "");

  const { data: contact, error } = await supabaseAdmin
    .from("contacts")
    .insert({
      type: "applicant",
      first_name: first || "Unknown",
      last_name: last || "",
      email: data.email ?? null,
      phone: data.phone ?? null,
      pipeline_stage: "inquiry",
      // Says where this came from and that nobody has checked it yet.
      source: "AI intake assistant (unverified)",
      notes: [
        data.program ? `Program interest: ${data.program}` : null,
        data.household_size ? `Household size: ${data.household_size}` : null,
        data.notes ?? null,
      ]
        .filter(Boolean)
        .join("\n"),
    })
    .select("id")
    .single();

  if (error || !contact) return false;

  await supabaseAdmin.from("interactions").insert({
    contact_id: contact.id,
    type: "note",
    subject: "Intake started through the website assistant",
    // The transcript is NOT stored. This collects household income and housing
    // status from families in crisis; a summary is enough for staff to follow
    // up, and a full transcript in a CRM note is a liability with no upside.
    body: `Collected by the AI intake assistant (session ${sessionId.slice(0, 8)}). Program interest: ${data.program ?? "not stated"}. Household size: ${data.household_size ?? "not stated"}. Nothing here has been verified.`,
  });

  await supabaseAdmin.from("tasks").insert({
    contact_id: contact.id,
    title: `Follow up with ${data.name ?? "new applicant"} within 2 business days`,
    priority: "high",
    status: "pending",
  });

  return true;
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = checkRateLimit(`ai:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many messages from this connection. Please try again later, or use the application form.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Say so plainly rather than pretending to be a chatbot that never answers.
    return NextResponse.json(
      {
        error:
          "The intake assistant is not connected yet. Please use the application form and we will be in touch.",
      },
      { status: 503 }
    );
  }

  let body: { messages?: Msg[]; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const sessionId = String(body.sessionId ?? "anonymous");

  if (messages.length === 0) {
    return NextResponse.json({ error: "No message to answer." }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      {
        error:
          "This conversation has run long. Please use the application form so a person can pick it up.",
      },
      { status: 400 }
    );
  }

  const cleaned: Msg[] = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, MAX_CHARS),
    }))
    .filter((m) => m.content.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "No message to answer." }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: cleaned,
    });

    const text = completion.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    const { visible, data } = extractIntake(text);

    let contactCreated = false;
    if (data) {
      contactCreated = await persistIntake(data, sessionId);
    }

    return NextResponse.json({
      response: visible,
      // "complete" means the assistant finished collecting, and the record
      // committed. A failed write is not reported as a completed intake.
      complete: Boolean(data) && contactCreated,
      contact_created: contactCreated,
      // Told honestly, so the widget can ask the visitor to use the form
      // instead of leaving them believing someone has their details.
      save_failed: Boolean(data) && !contactCreated,
    });
  } catch (cause) {
    console.error("AI intake failed:", cause);
    return NextResponse.json(
      {
        error:
          "The assistant could not respond just now. Please use the application form and we will be in touch.",
      },
      { status: 502 }
    );
  }
}
