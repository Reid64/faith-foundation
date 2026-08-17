import { NextResponse } from "next/server";
import { getSession } from "@/lib/faithproof/session";
import {
  meetingChannel,
  meetingIdFromChannel,
  pusherServer,
} from "@/lib/faithproof/pusherServer";

/**
 * POST /api/pusher/auth — channel authorisation for board meeting signalling.
 *
 * SECURITY CRITICAL. `NEXT_PUBLIC_PUSHER_KEY` is in the client bundle and can
 * be read by anyone. It is enough to open a connection to Pusher; it is NOT
 * enough to subscribe to a private channel. Pusher calls this endpoint for
 * every `private-` subscription and refuses the subscription unless this route
 * returns a signature. So this function is the entire boundary between "a board
 * meeting" and "a public broadcast".
 *
 * Three checks, in order, all server-side:
 *   1. A real Supabase session (the cookie is verified, not trusted).
 *   2. Role is `admin` or `board` — the same pair the board portal layout and
 *      the RLS policies on board_meetings use. Staff are refused here exactly
 *      as they are refused at /admin/board.
 *   3. The channel names a meeting this user can actually read. That read goes
 *      through the SESSION client, so row level security answers the question —
 *      the same authority that governs every other read of that table. A
 *      guessed meeting id therefore fails even for a board member if RLS would
 *      not show them the row.
 *
 * Pusher expects `socket_id` and `channel_name` as form-encoded fields, and a
 * plain JSON body containing `auth`. Anything other than a 200 with that body
 * is treated by the client as a refusal.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const pusher = pusherServer();
  if (!pusher) {
    return NextResponse.json(
      { error: "Video signalling is not configured on this deployment." },
      { status: 503 }
    );
  }

  // ── 1. Session ──
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // ── 2. Role ──
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return NextResponse.json(
      { error: "Board meetings are limited to directors and administrators." },
      { status: 403 }
    );
  }

  // Pusher posts this form-encoded, not as JSON.
  let socketId = "";
  let channelName = "";
  try {
    const form = await request.formData();
    socketId = String(form.get("socket_id") ?? "");
    channelName = String(form.get("channel_name") ?? "");
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Only our own channel shape is ever authorised. Anything else — including a
  // presence channel or someone else's namespace — is refused outright.
  const meetingId = meetingIdFromChannel(channelName);
  if (!meetingId || channelName !== meetingChannel(meetingId)) {
    return NextResponse.json(
      { error: "That channel is not a board meeting." },
      { status: 403 }
    );
  }

  // ── 3. This specific meeting, through RLS ──
  const { data: meeting, error } = await session.supabase
    .from("board_meetings")
    .select("id, actual_end")
    .eq("id", meetingId)
    .maybeSingle();

  if (error || !meeting) {
    return NextResponse.json(
      { error: "That meeting does not exist, or you cannot access it." },
      { status: 403 }
    );
  }

  // A meeting that has been closed has no live room. Refusing here means a
  // stale tab cannot keep signalling into a finished meeting.
  if ((meeting as { actual_end: string | null }).actual_end) {
    return NextResponse.json(
      { error: "This meeting has ended." },
      { status: 403 }
    );
  }

  const auth = pusher.authorizeChannel(socketId, channelName);
  return NextResponse.json(auth);
}
