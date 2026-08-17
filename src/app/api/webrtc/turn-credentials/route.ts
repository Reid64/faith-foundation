import { NextResponse } from "next/server";
import { getSession } from "@/lib/faithproof/session";

/**
 * POST /api/webrtc/turn-credentials — short-lived ICE servers for the browser.
 *
 * `CLOUDFLARE_TURN_API_TOKEN` is a long-lived account credential and MUST NOT
 * reach the browser. What the browser gets instead is what Cloudflare mints
 * from it: a username/credential pair that expires. This route is the only
 * place the token is used, and it is server-only by construction — no
 * NEXT_PUBLIC_ prefix, never imported by a component.
 *
 * Cloudflare returns Cloudflare's own STUN entry plus TURN over UDP, TCP and
 * TLS in one `iceServers` array, which is exactly the shape RTCPeerConnection
 * wants, so it is passed straight through without reshaping.
 *
 * Authenticated users only. The credentials cost money to use and would
 * otherwise be a free relay for anyone who found the URL.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TTL_SECONDS = 7200;

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Same pair as the board portal and the Pusher channel auth. A staff account
  // has no business holding relay credentials for a board meeting.
  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    return NextResponse.json(
      { error: "Board meetings are limited to directors and administrators." },
      { status: 403 }
    );
  }

  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const token = process.env.CLOUDFLARE_TURN_API_TOKEN;

  if (!keyId || !token) {
    // Not fatal to the call: a peer connection can still work over STUN alone
    // on forgiving networks. The client is told plainly so it can say so.
    return NextResponse.json(
      {
        error:
          "TURN relay is not configured on this deployment. Calls may fail on restrictive networks.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: TTL_SECONDS }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        "[turn] Cloudflare refused:",
        response.status,
        detail.slice(0, 300)
      );
      return NextResponse.json(
        { error: "Could not obtain relay credentials." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      iceServers?: IceServer | IceServer[];
    };

    // Cloudflare has returned both a single object and an array across API
    // revisions. Normalise, so the client always receives an array.
    const raw = payload.iceServers;
    const iceServers: IceServer[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    if (iceServers.length === 0) {
      console.error("[turn] Cloudflare returned no iceServers");
      return NextResponse.json(
        { error: "Relay credentials came back empty." },
        { status: 502 }
      );
    }

    return NextResponse.json({ iceServers, ttl: TTL_SECONDS });
  } catch (cause) {
    console.error("[turn] unreachable:", cause);
    return NextResponse.json(
      { error: "Could not reach the relay service." },
      { status: 502 }
    );
  }
}
