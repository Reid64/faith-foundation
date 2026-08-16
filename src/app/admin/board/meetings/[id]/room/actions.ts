"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";

type Result = { error?: string; ok?: boolean; redirectTo?: string };

async function boardSession() {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." as const };
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return { error: "Only board members and administrators can do this." as const };
  }
  return { session };
}

/**
 * Stamp the moment the meeting actually started.
 *
 * `.is("actual_start", null)` makes this idempotent under a race: five
 * directors joining at once all issue this update, and only the first one
 * matches. Without the guard the last person through the door would rewrite the
 * start time, and the duration on the minutes would be wrong.
 */
export async function startMeeting(meetingId: string): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  const { data, error } = await session.supabase
    .from("board_meetings")
    .update({ actual_start: new Date().toISOString() })
    .eq("id", meetingId)
    .is("actual_start", null)
    .select("id");

  if (error) return { error: describeDbError(error, "start this meeting") };

  // Only the first joiner writes an audit line; the rest changed nothing.
  if (data && data.length > 0) {
    await writeAuditLog(session.supabase, {
      actorId: session.userId,
      action: "board_meeting.started",
      entityType: "board_meetings",
      entityId: meetingId,
    });
    revalidatePath(`/admin/board/meetings/${meetingId}`);
  }

  return { ok: true };
}

/**
 * End the meeting. Admin only — one person closes the room for everyone.
 *
 * Returns the path to the minutes rather than redirecting, so the client can
 * hang up the Jitsi call first. Redirecting from the action would tear the page
 * down mid-call and leave the conference thinking the participant is still in it.
 */
export async function endMeeting(meetingId: string): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  if (session.profile?.role !== "admin") {
    return { error: "Only an administrator can end the meeting for everyone." };
  }

  const { error } = await session.supabase
    .from("board_meetings")
    .update({ actual_end: new Date().toISOString() })
    .eq("id", meetingId);

  if (error) return { error: describeDbError(error, "end this meeting") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "board_meeting.ended",
    entityType: "board_meetings",
    entityId: meetingId,
  });

  revalidatePath(`/admin/board/meetings/${meetingId}`);
  revalidatePath(`/admin/board/meetings/${meetingId}/minutes`);
  revalidatePath("/admin/board");
  revalidatePath("/admin");

  return { ok: true, redirectTo: `/admin/board/meetings/${meetingId}/minutes` };
}
