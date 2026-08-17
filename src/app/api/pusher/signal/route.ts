import { NextResponse } from "next/server";
import { getSession } from "@/lib/faithproof/session";
import { meetingChannel, pusherServer } from "@/lib/faithproof/pusherServer";

/**
 * POST /api/pusher/signal — relays one WebRTC signalling message.
 *
 * WHY A SERVER RELAY RATHER THAN PUSHER CLIENT EVENTS.
 *
 * Peers could publish to each other directly with `client-*` events, which is
 * the usual shortcut for WebRTC signalling. Two reasons not to:
 *
 *   1. Client events are OFF by default and are enabled per app in the Pusher
 *      dashboard. A build that depends on a dashboard toggle nobody remembers
 *      flipping fails silently and looks like a broken call.
 *   2. A client event is whatever the client says it is. Relaying through here
 *      means the SENDER'S IDENTITY IS STAMPED SERVER-SIDE from the verified
 *      session, so a peer cannot announce itself into the roster as somebody
 *      else. The display name on a tile is asserted by the server, not by the
 *      browser that drew it.
 *
 * CHUNKING. Pusher caps an event payload at 10 KB. A WebRTC offer carrying two
 * m-lines and a full codec list runs to several KB and occasionally past that
 * ceiling, and a silently dropped offer is a call that never connects. So the
 * body is split here into sub-10 KB pieces which the client reassembles. Small
 * messages — ICE candidates, join/leave — take exactly one chunk and are
 * unaffected.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Comfortably inside Pusher's 10 KB event limit, leaving room for envelope. */
const CHUNK_CHARS = 7000;

const KINDS = new Set(["join", "here", "leave", "offer", "answer", "ice"]);

export async function POST(request: Request) {
  const pusher = pusherServer();
  if (!pusher) {
    return NextResponse.json(
      { error: "Video signalling is not configured on this deployment." },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return NextResponse.json(
      { error: "Board meetings are limited to directors and administrators." },
      { status: 403 }
    );
  }

  let body: {
    meetingId?: string;
    kind?: string;
    from?: string;
    to?: string | null;
    data?: unknown;
    socketId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const meetingId = String(body.meetingId ?? "");
  const kind = String(body.kind ?? "");
  const from = String(body.from ?? "");

  if (!meetingId || !KINDS.has(kind) || !from) {
    return NextResponse.json({ error: "Malformed signal." }, { status: 400 });
  }

  // The same RLS-backed check the channel auth performs: this user must be
  // able to read this meeting, and the meeting must still be open.
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
  if ((meeting as { actual_end: string | null }).actual_end) {
    return NextResponse.json({ error: "This meeting has ended." }, { status: 403 });
  }

  const channel = meetingChannel(meetingId);

  // Identity comes from the session, never from the request body.
  const envelope = {
    from,
    to: body.to ? String(body.to) : null,
    kind,
    userId: session.userId,
    displayName: session.profile?.full_name || session.email || "Board member",
  };

  const serialised = JSON.stringify(body.data ?? null);
  const total = Math.max(1, Math.ceil(serialised.length / CHUNK_CHARS));

  // A single id ties the pieces of one message together on the far side.
  const messageId = `${from}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    for (let i = 0; i < total; i++) {
      await pusher.trigger(
        channel,
        "signal",
        {
          ...envelope,
          messageId,
          i,
          n: total,
          chunk: serialised.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS),
        },
        // Do not echo the message back to the sender's own socket.
        body.socketId ? { socket_id: String(body.socketId) } : undefined
      );
    }
  } catch (cause) {
    console.error("[signal] pusher trigger failed:", cause);
    return NextResponse.json(
      { error: "Signal could not be delivered." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, chunks: total });
}
