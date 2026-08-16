"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { MAIL_CONFIGURED, sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/service";
import { generateAndSaveMinutesPDF } from "@/lib/faithproof/generateMinutesPDF";

type Result = { error?: string; ok?: boolean; note?: string };

async function boardSession() {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." as const };
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return { error: "Only board members and administrators can do this." as const };
  }
  return { session };
}

/** Everyone whose approval the certification waits on. */
async function boardProfileIds(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .in("role", ["admin", "board"]);
  return ((data ?? []) as { id: string }[]).map((p) => p.id);
}

export async function updateMinutes(
  meetingId: string,
  formData: FormData
): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  const text = String(formData.get("minutes_text") ?? "").trim();
  if (!text) return { error: "Enter the minutes before saving." };

  // Editing after certification would change a document the board has already
  // signed. Refuse rather than silently versioning it.
  const { data: current } = await session.supabase
    .from("board_meetings")
    .select("minutes_status")
    .eq("id", meetingId)
    .maybeSingle();

  if ((current as { minutes_status?: string } | null)?.minutes_status === "certified") {
    return {
      error:
        "These minutes are certified. A certified record cannot be edited — record a correction at the next meeting instead.",
    };
  }

  const { error } = await session.supabase
    .from("board_meetings")
    .update({ ai_draft_minutes: text, minutes_status: "under_review" })
    .eq("id", meetingId);

  if (error) return { error: describeDbError(error, "save these minutes") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "minutes.updated",
    entityType: "board_meetings",
    entityId: meetingId,
    newValue: { length: text.length },
  });

  revalidatePath(`/admin/board/meetings/${meetingId}/minutes`);
  revalidatePath(`/admin/board/meetings/${meetingId}`);
  return { ok: true };
}

export async function uploadTranscript(
  meetingId: string,
  formData: FormData
): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  const text = String(formData.get("transcript_text") ?? "").trim();
  if (!text) return { error: "Paste or upload a transcript first." };

  const { error } = await session.supabase
    .from("board_meetings")
    .update({ transcript_text: text })
    .eq("id", meetingId);

  if (error) return { error: describeDbError(error, "save this transcript") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "minutes.transcript_uploaded",
    entityType: "board_meetings",
    entityId: meetingId,
    newValue: { length: text.length },
  });

  revalidatePath(`/admin/board/meetings/${meetingId}/minutes`);
  return { ok: true };
}

/**
 * Sign and approve the minutes.
 *
 * The row IS the signature record: who, when, from where, and the drawn mark.
 * UNIQUE (meeting_id, profile_id) makes a double submit a database refusal
 * rather than two approvals, so the count that gates certification cannot be
 * inflated by a slow click.
 */
export async function approveMinutes(
  meetingId: string,
  signatureData: string
): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  if (!signatureData || !signatureData.startsWith("data:image/png;base64,")) {
    return { error: "Sign in the box before approving." };
  }
  // A drawn signature is a few KB. Anything much larger is not a signature.
  if (signatureData.length > 400_000) {
    return { error: "That signature image is too large to store." };
  }

  const { data: meeting } = await session.supabase
    .from("board_meetings")
    .select("minutes_status, ai_draft_minutes")
    .eq("id", meetingId)
    .maybeSingle();

  const state = meeting as
    | { minutes_status: string; ai_draft_minutes: string | null }
    | null;

  if (!state) return { error: "That meeting no longer exists." };
  if (!state.ai_draft_minutes) {
    return { error: "There are no minutes to approve yet." };
  }
  if (state.minutes_status === "certified") {
    return { error: "These minutes are already certified." };
  }

  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");

  const { error } = await session.supabase.from("meeting_approvals").insert({
    meeting_id: meetingId,
    profile_id: session.userId,
    signature_data: signatureData,
    ip_address: forwarded ? forwarded.split(",")[0].trim() : null,
    user_agent: headerList.get("user-agent"),
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already approved these minutes." };
    }
    return { error: describeDbError(error, "record your approval") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "minutes.approved",
    entityType: "board_meetings",
    entityId: meetingId,
  });

  // Does that complete the board?
  const required = await boardProfileIds();
  const { data: approvals } = await session.supabase
    .from("meeting_approvals")
    .select("profile_id")
    .eq("meeting_id", meetingId);

  const approvedIds = new Set(
    ((approvals ?? []) as { profile_id: string }[]).map((a) => a.profile_id)
  );
  const complete =
    required.length > 0 && required.every((id) => approvedIds.has(id));

  let note: string | undefined;

  if (complete) {
    await session.supabase
      .from("board_meetings")
      .update({ minutes_status: "approved" })
      .eq("id", meetingId);

    if (MAIL_CONFIGURED) {
      try {
        const { data: admins } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("role", "admin");
        const recipients = ((admins ?? []) as { email: string }[])
          .map((a) => a.email)
          .filter(Boolean);
        if (recipients.length) {
          await sendEmail({
            to: recipients.join(","),
            subject: "Board minutes are fully approved and ready to certify",
            html: `<p>All board members have approved the minutes for this meeting.</p>
                   <p><a href="https://www.faithfoundationsf.org/admin/board/meetings/${meetingId}/minutes">Open the minutes to certify them</a>.</p>`,
          });
        }
      } catch (cause) {
        // Never let a mail failure roll back a recorded approval — the
        // signature is the thing that matters and it is already committed.
        console.error("approval notification failed:", cause);
        note =
          "Your approval is recorded. The notification email to the administrator could not be sent.";
      }
    } else {
      note =
        "Your approval is recorded. Email is not configured, so the administrator was not notified.";
    }
  }

  revalidatePath(`/admin/board/meetings/${meetingId}/minutes`);
  revalidatePath(`/admin/board/meetings/${meetingId}`);
  return { ok: true, note };
}

/**
 * Certify the minutes and file the PDF in the Proof Vault.
 *
 * Order matters: the PDF is generated FIRST and the status is only moved to
 * `certified` once the document exists. A record marked certified with no
 * certified document behind it is exactly the kind of claim this system exists
 * to prevent.
 */
export async function certifyMinutes(meetingId: string): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  if (session.profile?.role !== "admin") {
    return { error: "Only an administrator can certify minutes." };
  }

  const { data: meeting } = await session.supabase
    .from("board_meetings")
    .select("minutes_status, ai_draft_minutes")
    .eq("id", meetingId)
    .maybeSingle();

  const state = meeting as
    | { minutes_status: string; ai_draft_minutes: string | null }
    | null;

  if (!state) return { error: "That meeting no longer exists." };
  if (state.minutes_status === "certified") {
    return { error: "These minutes are already certified." };
  }
  if (!state.ai_draft_minutes) {
    return { error: "There are no minutes to certify." };
  }

  const required = await boardProfileIds();
  const { data: approvals } = await session.supabase
    .from("meeting_approvals")
    .select("profile_id")
    .eq("meeting_id", meetingId);

  const approvedIds = new Set(
    ((approvals ?? []) as { profile_id: string }[]).map((a) => a.profile_id)
  );
  const missing = required.filter((id) => !approvedIds.has(id));

  if (missing.length > 0) {
    return {
      error: `${missing.length} board member${missing.length === 1 ? " has" : "s have"} not approved these minutes yet.`,
    };
  }

  let note: string | undefined;
  try {
    await generateAndSaveMinutesPDF(meetingId, session.userId);
  } catch (cause) {
    console.error("certified minutes PDF failed:", cause);
    return {
      error:
        cause instanceof Error
          ? `The certified PDF could not be produced, so nothing was certified: ${cause.message}`
          : "The certified PDF could not be produced, so nothing was certified.",
    };
  }

  const { error } = await session.supabase
    .from("board_meetings")
    .update({ minutes_status: "certified" })
    .eq("id", meetingId);

  if (error) return { error: describeDbError(error, "certify these minutes") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "minutes.certified",
    entityType: "board_meetings",
    entityId: meetingId,
  });

  revalidatePath(`/admin/board/meetings/${meetingId}/minutes`);
  revalidatePath(`/admin/board/meetings/${meetingId}`);
  revalidatePath("/admin/proof-vault");
  return { ok: true, note };
}
