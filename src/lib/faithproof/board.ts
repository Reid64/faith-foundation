import type { BadgeTone } from "@/app/admin/_components/ui";

/**
 * Board portal vocabulary.
 *
 * Kept out of BoardNav.tsx deliberately — that file is "use client", and a
 * server component importing a plain value from a client module gets a client
 * reference, not the object.
 */

export const MEETING_TYPES = ["regular", "special", "annual"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const VOTE_RESULTS = ["passed", "failed", "tabled", "withdrawn"] as const;
export type VoteResult = (typeof VOTE_RESULTS)[number];

export const MEETING_TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  special: "Special",
  annual: "Annual",
};

export const VOTE_RESULT_LABELS: Record<string, string> = {
  passed: "Passed",
  failed: "Failed",
  tabled: "Tabled",
  withdrawn: "Withdrawn",
};

export const VOTE_TONES: Record<string, BadgeTone> = {
  passed: "green",
  failed: "red",
  tabled: "amber",
  withdrawn: "gray",
};

export const MEETING_TYPE_TONES: Record<string, BadgeTone> = {
  regular: "blue",
  special: "purple",
  annual: "green",
};

export const MINUTES_STATUSES = [
  "draft",
  "under_review",
  "approved",
  "certified",
] as const;
export type MinutesStatus = (typeof MINUTES_STATUSES)[number];

export const MINUTES_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  under_review: "Under review",
  approved: "Approved",
  certified: "Certified",
};

export const MINUTES_STATUS_TONES: Record<string, BadgeTone> = {
  draft: "gray",
  under_review: "blue",
  approved: "green",
  certified: "green",
};

export type BoardMeeting = {
  id: string;
  meeting_date: string;
  type: string;
  agenda: string | null;
  minutes: string | null;
  attendees: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Phase 19 — meeting room, transcript and minutes workflow.
  /** Vestigial since Phase 21 — see roomNameFor(). Nothing reads it. */
  jitsi_room_name: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  recording_url: string | null;
  transcript_text: string | null;
  ai_draft_minutes: string | null;
  minutes_status: MinutesStatus;
};

export type MeetingApproval = {
  id: string;
  meeting_id: string;
  profile_id: string;
  approved_at: string;
  signature_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
};

/**
 * Legacy room name for a meeting.
 *
 * Phase 21 replaced Jitsi with native WebRTC; signalling now happens on the
 * Pusher channel `private-meeting-<id>`, derived server-side, and nothing reads
 * this value any more. It is still written on create so the `jitsi_room_name`
 * column keeps its shape for the meetings recorded under Phase 19 — dropping a
 * populated column is a migration, and this phase deliberately ships none.
 */
export function roomNameFor(meetingId: string): string {
  return `faithproof-board-${meetingId}`;
}

/**
 * Is the meeting joinable right now?
 *
 * Joinable from 30 minutes before the scheduled start, and for as long as it is
 * actually running. A meeting with no scheduled time is joinable on its date —
 * meetings recorded before Phase 19 have no scheduled_start at all, and locking
 * them out of the room would be a regression for no benefit.
 */
export function isJoinable(meeting: {
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  meeting_date: string;
}): boolean {
  if (meeting.actual_end) return false;
  if (meeting.actual_start) return true;

  if (meeting.scheduled_start) {
    const start = Date.parse(meeting.scheduled_start);
    if (Number.isNaN(start)) return false;
    const opensAt = start - 30 * 60 * 1000;
    // Stays open until the scheduled end, or three hours past the start if no
    // end was given — a long meeting must not lock its own attendees out.
    const end = meeting.scheduled_end
      ? Date.parse(meeting.scheduled_end)
      : start + 3 * 60 * 60 * 1000;
    const now = Date.now();
    return now >= opensAt && now <= end;
  }

  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return meeting.meeting_date.slice(0, 10) === iso;
}

/**
 * FAITH Foundation's operating timezone.
 *
 * A `datetime-local` input submits wall-clock text with NO zone — "2026-08-16T18:00".
 * `new Date(...)` on that string resolves it in the SERVER's zone, which on
 * Vercel is UTC, so a 6pm meeting scheduled from Texas was being stored as 6pm
 * UTC: five hours early, which put the Join button and the Command Center alert
 * in the wrong place entirely. The board schedules in Texas time, so that is
 * what the string means, and that is what these two helpers encode.
 */
export const ORG_TIMEZONE = "America/Chicago";

/** Milliseconds a zone is ahead of UTC at a given instant. */
function zoneOffsetMs(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const asIfUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return asIfUTC - at.getTime();
}

/**
 * "YYYY-MM-DDTHH:mm" as Texas wall time → a UTC ISO instant.
 *
 * Returns null for anything that is not a well-formed datetime-local value, so
 * a malformed input is rejected rather than silently stored as an epoch date.
 */
export function localWallTimeToISO(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // The offset is evaluated at the guessed instant. Only a time inside a DST
  // transition hour could land an hour out, and board meetings are not
  // scheduled at 2am on the second Sunday in March.
  const offset = zoneOffsetMs(ORG_TIMEZONE, new Date(guess));
  return new Date(guess - offset).toISOString();
}

/** A stored instant rendered back in Texas time, where the board reads it. */
export function formatMeetingTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleString("en-US", {
    timeZone: ORG_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} CT`;
}

/** "1h 24m" from two timestamps; null when the meeting never ran. */
export function meetingDuration(
  start: string | null,
  end: string | null
): string | null {
  if (!start || !end) return null;
  const ms = Date.parse(end) - Date.parse(start);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export type BoardVote = {
  id: string;
  meeting_id: string;
  motion: string;
  result: string;
  votes_for: number | null;
  votes_against: number | null;
  votes_abstain: number | null;
  notes: string | null;
  created_at: string;
};
