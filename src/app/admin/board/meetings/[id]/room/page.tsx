import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  MEETING_TYPE_LABELS,
  formatMeetingTime,
  type BoardMeeting,
} from "@/lib/faithproof/board";
import { MeetingRoom } from "./MeetingRoom";

export const metadata: Metadata = {
  title: "Board Meeting Room | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Server shell for the meeting room.
 *
 * The room itself is a client component — it needs getUserMedia, WebRTC and a
 * websocket — but the participant's identity and their right to be here are
 * resolved HERE, on the server, behind RLS.
 *
 * The signalling channel is derived from the meeting id (private-meeting-<id>)
 * rather than passed in, and /api/pusher/auth re-checks the session, the role
 * and the meeting on every subscription. A client cannot talk its way into a
 * meeting by naming one.
 */
export default async function MeetingRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("board_meetings")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  // RLS already restricts this table to admin and board; a missing row here
  // means either no such meeting or no business being in it. Both are 404.
  if (error || !data) notFound();

  const meeting = data as BoardMeeting;

  // A meeting that has already been closed has no room to re-enter — send the
  // visitor to the minutes, which is what they actually want.
  if (meeting.actual_end) {
    redirect(`/admin/board/meetings/${meeting.id}/minutes`);
  }

  const profile = session.profile;

  return (
    <MeetingRoom
      meetingId={meeting.id}
      title={`${MEETING_TYPE_LABELS[meeting.type] ?? meeting.type} meeting`}
      subtitle={
        meeting.scheduled_start
          ? formatMeetingTime(meeting.scheduled_start)
          : formatDateOnly(meeting.meeting_date)
      }
      displayName={profile?.full_name || session.email || "Board member"}
      isAdmin={profile?.role === "admin"}
    />
  );
}
