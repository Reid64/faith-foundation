"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import type { Channel } from "pusher-js";

/**
 * Mesh WebRTC for the board meeting room.
 *
 * TOPOLOGY. Full mesh: every participant holds one RTCPeerConnection to every
 * other participant and uploads their own camera once per peer. That is why the
 * cap is six — a seventh participant means six simultaneous uploads each, which
 * a domestic connection will not carry. An SFU is what lifts that limit, and it
 * is a server, not a setting.
 *
 * SIGNALLING. A Pusher PRIVATE channel, relayed through /api/pusher/signal so
 * the sender's identity is stamped server-side. Messages arrive chunked (Pusher
 * caps an event at 10 KB and an SDP offer can exceed it) and are reassembled
 * here before use.
 *
 * WHO CALLS WHOM. Both peers learn about each other at the same moment, so
 * without a rule both would send an offer and collide ("glare"). The rule is
 * lexicographic: the smaller peerId sends the offer, the larger one waits.
 * Deterministic, needs no coordination, and cannot deadlock.
 */

export const MAX_PARTICIPANTS = 6;

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "";
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "";

/** Whether signalling can run at all in this environment. */
export const SIGNALLING_CONFIGURED = Boolean(PUSHER_KEY && PUSHER_CLUSTER);

export type RemotePeer = {
  peerId: string;
  displayName: string;
  stream: MediaStream | null;
  /** Set when ICE has failed and the automatic restarts did not recover it. */
  failed: boolean;
  audioMuted: boolean;
  videoOff: boolean;
};

type SignalEnvelope = {
  from: string;
  to: string | null;
  kind: "join" | "here" | "leave" | "offer" | "answer" | "ice" | "state";
  userId: string;
  displayName: string;
  messageId: string;
  i: number;
  n: number;
  chunk: string;
};

type PeerRecord = {
  pc: RTCPeerConnection;
  displayName: string;
  restarts: number;
  /** Candidates that arrived before the remote description was set. */
  pending: RTCIceCandidateInit[];
};

export type MeshState = {
  peers: RemotePeer[];
  roomFull: boolean;
  status: string | null;
  error: string | null;
};

export function useMeshCall({
  meetingId,
  localStream,
  enabled,
}: {
  meetingId: string;
  /**
   * No displayName parameter on purpose: the name shown on a remote tile comes
   * from the SERVER, stamped onto each signal from the verified session in
   * /api/pusher/signal. Taking it from the client here would let a browser
   * label itself as somebody else.
   */
  localStream: MediaStream | null;
  /** Flips true when the user presses Join. Nothing connects before that. */
  enabled: boolean;
}) {
  const [peers, setPeers] = useState<RemotePeer[]>([]);
  const [roomFull, setRoomFull] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerId = useRef<string>("");
  if (!peerId.current && typeof window !== "undefined") {
    peerId.current = crypto.randomUUID();
  }

  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const socketId = useRef<string | null>(null);
  const connections = useRef<Map<string, PeerRecord>>(new Map());
  const iceServers = useRef<RTCIceServer[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Map<string, { n: number; parts: string[] }>>(new Map());
  const teardown = useRef<() => void>(() => {});

  useEffect(() => {
    streamRef.current = localStream;
  }, [localStream]);

  /** Publish the peer list to React without tearing the connection map. */
  const publish = useCallback(() => {
    const list: RemotePeer[] = [];
    connections.current.forEach((record, id) => {
      const remote = record.pc
        .getReceivers()
        .map((r) => r.track)
        .filter(Boolean);
      const stream = remote.length ? new MediaStream(remote) : null;
      list.push({
        peerId: id,
        displayName: record.displayName,
        stream,
        failed: record.pc.iceConnectionState === "failed" && record.restarts >= 2,
        audioMuted: false,
        videoOff: false,
      });
    });
    setPeers(list);
  }, []);

  const send = useCallback(
    async (kind: string, to: string | null, data: unknown) => {
      try {
        const response = await fetch("/api/pusher/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId,
            kind,
            from: peerId.current,
            to,
            data,
            socketId: socketId.current,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setError(payload?.error ?? "A signalling message did not go through.");
        }
      } catch {
        setError("Signalling is unreachable. Others may not see you join.");
      }
    },
    [meetingId]
  );

  /** Build (or fetch) a peer connection for a remote participant. */
  const connectionFor = useCallback(
    (remoteId: string, remoteName: string): PeerRecord => {
      const existing = connections.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({
        iceServers: iceServers.current,
        // Mesh calls do not need more than one candidate pool per peer.
        iceCandidatePoolSize: 1,
      });

      const record: PeerRecord = {
        pc,
        displayName: remoteName,
        restarts: 0,
        pending: [],
      };
      connections.current.set(remoteId, record);

      // Our media, one copy per peer — this is the mesh upload cost.
      streamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current as MediaStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void send("ice", remoteId, event.candidate.toJSON());
        }
      };

      pc.ontrack = () => publish();

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;

        if (state === "failed" || state === "disconnected") {
          // Try an ICE restart BEFORE telling anyone anything is wrong. A
          // disconnect is often a network blip that recovers in seconds, and a
          // red tile that clears itself is worse than no tile at all.
          if (record.restarts < 2 && peerId.current < remoteId) {
            record.restarts += 1;
            setStatus(`Reconnecting to ${record.displayName}…`);
            window.setTimeout(() => {
              if (connections.current.get(remoteId) !== record) return;
              void (async () => {
                try {
                  const offer = await pc.createOffer({ iceRestart: true });
                  await pc.setLocalDescription(offer);
                  await send("offer", remoteId, offer);
                } catch {
                  publish();
                }
              })();
            }, 500 * record.restarts);
          }
          publish();
        }

        if (state === "connected" || state === "completed") {
          record.restarts = 0;
          setStatus(null);
          publish();
        }
      };

      return record;
    },
    [publish, send]
  );

  const makeOffer = useCallback(
    async (remoteId: string, remoteName: string) => {
      const record = connectionFor(remoteId, remoteName);
      try {
        const offer = await record.pc.createOffer();
        await record.pc.setLocalDescription(offer);
        await send("offer", remoteId, offer);
      } catch {
        setError("Could not start a connection to another participant.");
      }
    },
    [connectionFor, send]
  );

  const dropPeer = useCallback(
    (remoteId: string) => {
      const record = connections.current.get(remoteId);
      if (!record) return;
      try {
        record.pc.close();
      } catch {
        /* already closed */
      }
      connections.current.delete(remoteId);
      publish();
    },
    [publish]
  );

  /** One reassembled signal. */
  const handleSignal = useCallback(
    async (envelope: SignalEnvelope, data: unknown) => {
      const { from, kind, displayName: remoteName } = envelope;
      if (from === peerId.current) return;

      switch (kind) {
        case "join": {
          // Someone arrived. Tell them we are here, then let the id rule decide
          // which side sends the offer.
          if (connections.current.size + 1 >= MAX_PARTICIPANTS) {
            // We are already at capacity; do not answer, so they see the room
            // as full rather than half-joining.
            return;
          }
          await send("here", from, null);
          connectionFor(from, remoteName);
          publish();
          if (peerId.current < from) await makeOffer(from, remoteName);
          break;
        }

        case "here": {
          if (connections.current.size + 1 >= MAX_PARTICIPANTS) {
            setRoomFull(true);
            return;
          }
          connectionFor(from, remoteName);
          publish();
          if (peerId.current < from) await makeOffer(from, remoteName);
          break;
        }

        case "offer": {
          const record = connectionFor(from, remoteName);
          try {
            await record.pc.setRemoteDescription(
              new RTCSessionDescription(data as RTCSessionDescriptionInit)
            );
            for (const candidate of record.pending.splice(0)) {
              await record.pc.addIceCandidate(candidate).catch(() => {});
            }
            const answer = await record.pc.createAnswer();
            await record.pc.setLocalDescription(answer);
            await send("answer", from, answer);
          } catch {
            setError("Could not answer another participant.");
          }
          break;
        }

        case "answer": {
          const record = connections.current.get(from);
          if (!record) return;
          try {
            await record.pc.setRemoteDescription(
              new RTCSessionDescription(data as RTCSessionDescriptionInit)
            );
            for (const candidate of record.pending.splice(0)) {
              await record.pc.addIceCandidate(candidate).catch(() => {});
            }
          } catch {
            /* a late answer for a connection we already replaced */
          }
          break;
        }

        case "ice": {
          const record = connections.current.get(from);
          if (!record) return;
          const candidate = data as RTCIceCandidateInit;
          // Candidates routinely arrive before the description they belong to.
          if (!record.pc.remoteDescription) {
            record.pending.push(candidate);
            return;
          }
          await record.pc.addIceCandidate(candidate).catch(() => {});
          break;
        }

        case "leave": {
          dropPeer(from);
          break;
        }
      }
    },
    [connectionFor, dropPeer, makeOffer, publish, send]
  );

  // ── Connect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !localStream) return;

    let cancelled = false;

    async function connect() {
      // TURN first: a peer connection created without relay servers cannot be
      // given them later without renegotiating every candidate.
      try {
        const response = await fetch("/api/webrtc/turn-credentials", {
          method: "POST",
        });
        if (response.ok) {
          const payload = await response.json();
          iceServers.current = payload.iceServers ?? [];
        } else {
          const payload = await response.json().catch(() => ({}));
          // Not fatal — STUN-only works on permissive networks, and saying so
          // is better than a call that fails with no explanation.
          setStatus(
            payload?.error ??
              "Relay credentials unavailable; the call may fail on restrictive networks."
          );
        }
      } catch {
        setStatus("Relay credentials unavailable; attempting a direct connection.");
      }

      if (cancelled) return;

      if (!SIGNALLING_CONFIGURED) {
        setError(
          "Video signalling is not configured in this environment. You can see yourself, but nobody can join you."
        );
        return;
      }

      const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        // Every channel here is private, so Pusher will call our endpoint and
        // refuse the subscription unless it signs.
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
      });
      pusherRef.current = pusher;

      pusher.connection.bind("connected", () => {
        socketId.current = pusher.connection.socket_id;
      });
      pusher.connection.bind("error", () => {
        setError("The signalling connection dropped.");
      });

      const channel = pusher.subscribe(`private-meeting-${meetingId}`);
      channelRef.current = channel;

      channel.bind("pusher:subscription_error", (payload: { status?: number }) => {
        setError(
          payload?.status === 403
            ? "You are not authorised to join this meeting."
            : "Could not join the meeting channel."
        );
      });

      channel.bind("signal", (raw: SignalEnvelope) => {
        // Reassemble before acting: a partial SDP is worse than none.
        if (raw.to && raw.to !== peerId.current) return;

        if (raw.n === 1) {
          void handleSignal(raw, raw.chunk ? JSON.parse(raw.chunk) : null);
          return;
        }

        const entry = chunks.current.get(raw.messageId) ?? {
          n: raw.n,
          parts: new Array<string>(raw.n).fill(""),
        };
        entry.parts[raw.i] = raw.chunk;
        chunks.current.set(raw.messageId, entry);

        if (entry.parts.every((p) => p !== "")) {
          chunks.current.delete(raw.messageId);
          const joined = entry.parts.join("");
          void handleSignal(raw, joined ? JSON.parse(joined) : null);
        }
      });

      channel.bind("pusher:subscription_succeeded", () => {
        void send("join", null, null);
      });
    }

    void connect();

    teardown.current = () => {
      void send("leave", null, null);
      connections.current.forEach((record) => {
        try {
          record.pc.close();
        } catch {
          /* already closed */
        }
      });
      connections.current.clear();
      try {
        channelRef.current?.unbind_all();
        pusherRef.current?.unsubscribe(`private-meeting-${meetingId}`);
        pusherRef.current?.disconnect();
      } catch {
        /* already gone */
      }
      channelRef.current = null;
      pusherRef.current = null;
    };

    return () => {
      cancelled = true;
      teardown.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, localStream, meetingId]);

  /** Swap the outgoing video track on every peer (device change, screen share). */
  const replaceVideoTrack = useCallback(async (track: MediaStreamTrack | null) => {
    const swaps: Promise<void>[] = [];
    connections.current.forEach((record) => {
      record.pc.getSenders().forEach((sender) => {
        if (sender.track?.kind === "video" || (!sender.track && track)) {
          swaps.push(sender.replaceTrack(track).catch(() => {}));
        }
      });
    });
    await Promise.all(swaps);
  }, []);

  return {
    peerId: peerId.current,
    peers,
    roomFull,
    status,
    error,
    setError,
    replaceVideoTrack,
    leave: () => teardown.current(),
  };
}
