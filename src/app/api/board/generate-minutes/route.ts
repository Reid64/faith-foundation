import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getSession, writeAuditLog } from "@/lib/faithproof/session";
import { MAIL_CONFIGURED, sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/service";

/**
 * POST /api/board/generate-minutes
 *
 * Drafts formal minutes from a meeting transcript.
 *
 * MODEL: the phase brief names `claude-sonnet-4-6`. Phase 18 already settled
 * this — the id is read from ANTHROPIC_MODEL with a current default, so the
 * model can be changed without touching the prompt or redeploying a code edit.
 *
 * The draft is exactly that: a DRAFT. It lands as `under_review`, every board
 * member has to read and sign it, and the prompt forbids inventing anything not
 * in the transcript. Nothing here produces a certified record on its own.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const SYSTEM_PROMPT = `You are a professional nonprofit board secretary for Foundation for Affordable Instruction and Tenancy Hope (FAITH Foundation), EIN 33-2640449. Generate formal board meeting minutes from the provided transcript. Use third person throughout. Be precise and professional.

Format exactly as follows:

MINUTES OF THE [MEETING TYPE] MEETING
FOUNDATION FOR AFFORDABLE INSTRUCTION AND TENANCY HOPE
[DATE]

ATTENDEES
[List attendees]

I. CALL TO ORDER
[From transcript]

II. AGENDA ITEMS
[Numbered list of topics with brief summaries]

III. MOTIONS AND VOTES
[Each motion: Motion by [name] to [action]. Seconded by [name if mentioned]. Vote: [For]-[Against]-[Abstain]. Motion [passed/failed].]

IV. ACTION ITEMS
[List with responsible party]

V. ADJOURNMENT
[Time if mentioned, otherwise "Meeting adjourned."]

Respectfully submitted,
Juan Valdez, Secretary

Do not add any information that is not present in the transcript or the recorded votes. If something was not said, leave it out rather than inferring it.`;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Your session has expired." }, { status: 401 });
  }
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return NextResponse.json(
      { error: "Only board members and administrators can generate minutes." },
      { status: 403 }
    );
  }

  let body: { meeting_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const meetingId = String(body.meeting_id ?? "").trim();
  if (!meetingId) {
    return NextResponse.json({ error: "No meeting specified." }, { status: 400 });
  }

  // Read through the SESSION client so RLS decides what this user may see.
  const [{ data: meetingRow }, { data: voteRows }] = await Promise.all([
    session.supabase
      .from("board_meetings")
      .select("id, meeting_date, type, attendees, transcript_text, minutes_status")
      .eq("id", meetingId)
      .maybeSingle(),
    session.supabase
      .from("board_votes")
      .select("motion, result, votes_for, votes_against, votes_abstain, notes")
      .eq("meeting_id", meetingId),
  ]);

  const meeting = meetingRow as
    | {
        id: string;
        meeting_date: string;
        type: string;
        attendees: string[] | null;
        transcript_text: string | null;
        minutes_status: string;
      }
    | null;

  if (!meeting) {
    return NextResponse.json({ error: "That meeting does not exist." }, { status: 404 });
  }
  if (meeting.minutes_status === "certified") {
    return NextResponse.json(
      { error: "These minutes are certified and cannot be redrafted." },
      { status: 409 }
    );
  }
  if (!meeting.transcript_text) {
    return NextResponse.json({ error: "No transcript available" }, { status: 400 });
  }

  // Checked AFTER the cheap validations so a missing key is not reported for a
  // request that was going to fail anyway.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI minutes generation not configured — add ANTHROPIC_API_KEY to environment",
      },
      { status: 503 }
    );
  }

  const attendees = meeting.attendees ?? [];
  const votes = voteRows ?? [];

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Transcript:\n\n${meeting.transcript_text}\n\nVotes on record:\n${JSON.stringify(votes, null, 2)}\n\nAttendees: ${attendees.join(", ") || "not recorded"}\nMeeting date: ${meeting.meeting_date}\nMeeting type: ${meeting.type}`,
        },
      ],
    });

    const draft = completion.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!draft) {
      return NextResponse.json(
        { error: "The model returned nothing. Nothing was saved." },
        { status: 502 }
      );
    }

    const { error: saveError } = await session.supabase
      .from("board_meetings")
      .update({ ai_draft_minutes: draft, minutes_status: "under_review" })
      .eq("id", meetingId);

    if (saveError) {
      // Do not report a draft that is not on the record.
      return NextResponse.json(
        { error: `The draft could not be saved: ${saveError.message}` },
        { status: 500 }
      );
    }

    await writeAuditLog(session.supabase, {
      actorId: session.userId,
      action: "minutes.ai_drafted",
      entityType: "board_meetings",
      entityId: meetingId,
      newValue: { model: MODEL, length: draft.length },
    });

    // Notification is best effort. The draft is already saved, and a mail
    // failure must not turn a successful drafting into an error.
    if (MAIL_CONFIGURED) {
      try {
        const { data: boardProfiles } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .in("role", ["admin", "board"]);
        const recipients = ((boardProfiles ?? []) as { email: string }[])
          .map((p) => p.email)
          .filter(Boolean);
        if (recipients.length) {
          await sendEmail({
            to: recipients.join(","),
            subject: "Draft board minutes are ready for review",
            html: `<p>A draft of the minutes for the ${meeting.meeting_date} board meeting is ready for review.</p>
                   <p><a href="https://www.faithfoundationsf.org/admin/board/meetings/${meetingId}/minutes">Read and approve the minutes</a>.</p>
                   <p>The draft was produced from the meeting transcript and has not been reviewed by a person yet.</p>`,
          });
        }
      } catch (cause) {
        console.error("minutes notification failed:", cause);
      }
    } else {
      console.log(
        "[minutes] draft saved; board not notified because ZOHO_SMTP_PASS is unset"
      );
    }

    return NextResponse.json({ ok: true, draft });
  } catch (cause) {
    console.error("generate-minutes failed:", cause);
    return NextResponse.json(
      {
        error:
          "The drafting service could not be reached. Nothing was saved — the transcript is untouched.",
      },
      { status: 502 }
    );
  }
}
