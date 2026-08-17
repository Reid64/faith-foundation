"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { localWallTimeToISO, roomNameFor } from "@/lib/faithproof/board";

type Result = { error?: string; ok?: boolean; id?: string };

const VOTE_RESULTS = ["passed", "failed", "tabled", "withdrawn"] as const;
const MEETING_TYPES = ["regular", "special", "annual"] as const;

async function boardSession() {
  const session = await getSession();
  if (!session) return { error: "Your session has expired." as const };
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return { error: "Only board members and administrators can do this." as const };
  }
  return { session };
}

export async function createMeeting(formData: FormData): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  const meeting_date = String(formData.get("meeting_date") ?? "").trim();
  const type = String(formData.get("type") ?? "regular");
  const agenda = String(formData.get("agenda") ?? "").trim();
  const minutes = String(formData.get("minutes") ?? "").trim();
  const attendeesRaw = String(formData.get("attendees") ?? "").trim();

  if (!meeting_date) return { error: "Enter the meeting date." };
  if (!MEETING_TYPES.includes(type as (typeof MEETING_TYPES)[number])) {
    return { error: "Choose a valid meeting type." };
  }

  const attendees = attendeesRaw
    ? attendeesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const scheduledStart = String(formData.get("scheduled_start") ?? "").trim();
  const scheduledEnd = String(formData.get("scheduled_end") ?? "").trim();

  if (scheduledStart && scheduledEnd && scheduledEnd <= scheduledStart) {
    return { error: "The meeting end time has to be after the start time." };
  }

  // The form submits wall-clock text with no zone. It means Texas time — see
  // localWallTimeToISO. Parsing it with `new Date()` would resolve it in the
  // SERVER's zone (UTC on Vercel) and store the meeting hours off.
  const startISO = scheduledStart ? localWallTimeToISO(scheduledStart) : null;
  const endISO = scheduledEnd ? localWallTimeToISO(scheduledEnd) : null;

  if (scheduledStart && !startISO) {
    return { error: "That start time could not be read. Pick it again." };
  }
  if (scheduledEnd && !endISO) {
    return { error: "That end time could not be read. Pick it again." };
  }

  /**
   * The id is generated here rather than by the database so the room name can
   * be derived from it in the SAME insert. (Since Phase 21 the room name is
   * vestigial — signalling uses private-meeting-<id> — but generating the id
   * up front still avoids a second write, so it stays.)
   */
  const id = crypto.randomUUID();

  const { data, error } = await session.supabase
    .from("board_meetings")
    .insert({
      id,
      meeting_date,
      type,
      agenda: agenda || null,
      minutes: minutes || null,
      attendees,
      scheduled_start: startISO,
      scheduled_end: endISO,
      jitsi_room_name: roomNameFor(id),
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "record this meeting") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "board_meeting.created",
    entityType: "board_meetings",
    entityId: data.id,
    newValue: {
      meeting_date,
      type,
      attendees: attendees.length,
      scheduled_start: scheduledStart || null,
    },
  });

  revalidatePath("/admin/board");
  revalidatePath("/admin/board/meetings");
  return { ok: true, id: data.id };
}

export async function addVote(
  meetingId: string,
  formData: FormData
): Promise<Result> {
  const gate = await boardSession();
  if ("error" in gate) return { error: gate.error };
  const { session } = gate;

  const motion = String(formData.get("motion") ?? "").trim();
  const result = String(formData.get("result") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const num = (k: string) => {
    const v = Number(String(formData.get(k) ?? "0"));
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  };

  if (!motion) return { error: "Enter the motion text." };
  if (!VOTE_RESULTS.includes(result as (typeof VOTE_RESULTS)[number])) {
    return { error: "Choose a valid result." };
  }

  const { error } = await session.supabase.from("board_votes").insert({
    meeting_id: meetingId,
    motion,
    result,
    votes_for: num("votes_for"),
    votes_against: num("votes_against"),
    votes_abstain: num("votes_abstain"),
    notes: notes || null,
  });

  if (error) return { error: describeDbError(error, "record this vote") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "board_vote.recorded",
    entityType: "board_votes",
    entityId: meetingId,
    newValue: { motion, result },
  });

  revalidatePath(`/admin/board/meetings/${meetingId}`);
  revalidatePath("/admin/board/votes");
  revalidatePath("/admin/board");
  return { ok: true };
}
