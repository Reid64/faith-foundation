"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { endMeeting, startMeeting } from "./actions";
import {
  MAX_PARTICIPANTS,
  SIGNALLING_CONFIGURED,
  useMeshCall,
} from "./useMeshCall";
import { useActiveSpeaker } from "./useActiveSpeaker";

/**
 * FaithProof board meeting room — native WebRTC mesh.
 *
 * Replaces the Jitsi iframe. The reason for the rebuild is this file: with the
 * iframe, every participant's video lived inside a surface we did not control,
 * so a per-participant tile grid was impossible. Here each remote stream is our
 * own <video> element in our own CSS grid, and the active-speaker border is
 * drawn on the tile it belongs to.
 *
 * Colours follow the admin design system: page #e8e6e1, panels and bars
 * #013e37, butter #ffefb3 — all inline, never as Tailwind bg- classes.
 *
 * WHY A PORTAL. The room is a full-viewport overlay, but it renders inside the
 * admin layout's content wrapper, which carries `relative z-10`. That wrapper
 * is a stacking context, so a `z-50` inside it still loses to the admin
 * sidebar's `z-40` in the ROOT context: the sidebar painted over the left
 * 240px of the room and swallowed clicks on the Leave button. Playwright found
 * it ("<aside> subtree intercepts pointer events"); a portal to document.body
 * takes the room out of that stacking context entirely. Raising the z-index
 * would not have worked — the cap is the parent, not the value.
 */

const BUTTER = "#ffefb3";
const GREEN = "#013e37";
const PAGE = "#e8e6e1";

type Device = { deviceId: string; label: string };

export function MeetingRoom({
  meetingId,
  title,
  subtitle,
  displayName,
  isAdmin,
}: {
  meetingId: string;
  title: string;
  subtitle: string;
  displayName: string;
  isAdmin: boolean;
}) {
  const router = useRouter();

  // The portal target only exists in the browser, so the first render is null
  // and the room mounts immediately after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [cameras, setCameras] = useState<Device[]>([]);
  const [mics, setMics] = useState<Device[]>([]);
  const [cameraId, setCameraId] = useState<string>("");
  const [micId, setMicId] = useState<string>("");

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraTrack = useRef<MediaStreamTrack | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
    peers,
    roomFull,
    status,
    error: meshError,
    setError: setMeshError,
    replaceVideoTrack,
    leave: leaveMesh,
  } = useMeshCall({
    meetingId,
    localStream,
    enabled: joined,
  });

  const activeSpeaker = useActiveSpeaker(
    useMemo(
      () => [
        { id: "local", stream: localStream },
        ...peers.map((p) => ({ id: p.peerId, stream: p.stream })),
      ],
      [localStream, peers]
    )
  );

  // ── Media acquisition ────────────────────────────────────────────────────
  const openMedia = useCallback(
    async (video: string | undefined, audio: string | undefined) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { deviceId: { exact: video } } : true,
        audio: audio ? { deviceId: { exact: audio } } : true,
      });
      return stream;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await openMedia(undefined, undefined);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        cameraTrack.current = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);

        // Labels are only populated once permission has been granted, which is
        // why enumeration happens after getUserMedia rather than before.
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setCameras(
          devices
            .filter((d) => d.kind === "videoinput")
            .map((d, i) => ({
              deviceId: d.deviceId,
              label: d.label || `Camera ${i + 1}`,
            }))
        );
        setMics(
          devices
            .filter((d) => d.kind === "audioinput")
            .map((d, i) => ({
              deviceId: d.deviceId,
              label: d.label || `Microphone ${i + 1}`,
            }))
        );
        setCameraId(stream.getVideoTracks()[0]?.getSettings().deviceId ?? "");
        setMicId(stream.getAudioTracks()[0]?.getSettings().deviceId ?? "");
      } catch {
        if (!cancelled) {
          setMediaError(
            "Camera and microphone are unavailable. Check the browser permission for this site, then reload."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openMedia]);

  // Stop every track when the component goes away, on any path out.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Bind the stream to whichever <video> is on screen.
  useEffect(() => {
    if (!localStream) return;
    if (!joined && previewRef.current) previewRef.current.srcObject = localStream;
    if (joined && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, joined]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return;
    const started = Date.now();
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000
    );
    return () => window.clearInterval(id);
  }, [joined]);

  // ── Device switching ─────────────────────────────────────────────────────
  async function switchDevice(nextCamera: string, nextMic: string) {
    try {
      const stream = await openMedia(nextCamera || undefined, nextMic || undefined);
      const old = streamRef.current;
      streamRef.current = stream;
      cameraTrack.current = stream.getVideoTracks()[0] ?? null;
      setLocalStream(stream);

      // Apply the current mute state to the new tracks, or switching a device
      // would silently unmute someone.
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      stream.getVideoTracks().forEach((t) => (t.enabled = camOn));

      if (joined && !sharing) {
        await replaceVideoTrack(stream.getVideoTracks()[0] ?? null);
      }
      old?.getTracks().forEach((t) => t.stop());
    } catch {
      setMediaError("That device could not be opened. The previous one is still in use.");
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  function toggleMic() {
    const next = !micOn;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
  }

  function toggleCam() {
    const next = !camOn;
    setCamOn(next);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
  }

  async function toggleShare() {
    if (sharing) {
      await replaceVideoTrack(cameraTrack.current);
      setSharing(false);
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = display.getVideoTracks()[0];
      if (!track) return;
      // Swapping a track of the same kind needs no renegotiation.
      await replaceVideoTrack(track);
      setSharing(true);
      track.onended = () => {
        void replaceVideoTrack(cameraTrack.current);
        setSharing(false);
      };
    } catch {
      // The user dismissed the picker. Not an error worth showing.
    }
  }

  async function join() {
    if (joining || !localStream) return;
    setJoining(true);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = micOn));
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = camOn));
    setJoined(true);
    setJoining(false);
    // Stamp the start only once someone is actually in the room. The action is
    // idempotent — only the first joiner writes.
    void startMeeting(meetingId);
  }

  function leave() {
    leaveMesh();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    router.push(`/admin/board/meetings/${meetingId}`);
  }

  async function finish() {
    if (ending) return;
    setEnding(true);
    const result = await endMeeting(meetingId);
    if (result?.error) {
      setMeshError(result.error);
      setEnding(false);
      return;
    }
    leaveMesh();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    router.push(result.redirectTo ?? `/admin/board/meetings/${meetingId}/minutes`);
  }

  const total = peers.length + 1;
  const full = roomFull || total > MAX_PARTICIPANTS;

  /**
   * Grid shape. One column on a phone; two columns up to four participants;
   * three columns up to six. Driven by participant count, not by breakpoint
   * alone, so two people get two big tiles rather than two small ones.
   */
  const columns = total <= 1 ? 1 : total <= 4 ? 2 : 3;

  if (!mounted) return null;

  // ── Pre-join ─────────────────────────────────────────────────────────────
  if (!joined) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ backgroundColor: PAGE }}
        data-testid="room-prejoin"
      >
        <div className="mx-auto flex min-h-full max-w-lg items-center px-4 py-10">
          <div
            className="w-full rounded-2xl p-8"
            style={{
              backgroundColor: GREEN,
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
            }}
          >
            <p
              style={{
                color: BUTTER,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              FAITH Foundation
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">Board Meeting</h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,239,179,0.6)" }}>
              {title} · {subtitle}
            </p>

            <div className="mt-6 overflow-hidden rounded-xl">
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                data-testid="room-preview"
                className="w-full"
                style={{
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  backgroundColor: "#0a0f1a",
                  border: "2px solid rgba(255,239,179,0.3)",
                  transform: "scaleX(-1)",
                }}
              />
            </div>

            {mediaError ? (
              <p
                role="alert"
                className="mt-3 rounded-lg px-3 py-2 text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.15)",
                  color: "#fecaca",
                  border: "1px solid rgba(239,68,68,0.4)",
                }}
              >
                {mediaError}
              </p>
            ) : null}

            <div className="mt-5 space-y-3">
              <label className="block text-xs" style={{ color: "rgba(255,239,179,0.7)" }}>
                Camera
                <select
                  value={cameraId}
                  onChange={(e) => {
                    setCameraId(e.target.value);
                    void switchDevice(e.target.value, micId);
                  }}
                  data-testid="room-camera-select"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                >
                  {cameras.length === 0 ? <option value="">Default camera</option> : null}
                  {cameras.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs" style={{ color: "rgba(255,239,179,0.7)" }}>
                Microphone
                <select
                  value={micId}
                  onChange={(e) => {
                    setMicId(e.target.value);
                    void switchDevice(cameraId, e.target.value);
                  }}
                  data-testid="room-mic-select"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                >
                  {mics.length === 0 ? <option value="">Default microphone</option> : null}
                  {mics.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-4 text-center text-sm text-white">{displayName}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={
                  micOn
                    ? { backgroundColor: BUTTER, color: GREEN }
                    : { backgroundColor: "rgba(255,239,179,0.1)", color: BUTTER }
                }
              >
                {micOn ? "Mic On" : "Mic Off"}
              </button>
              <button
                type="button"
                onClick={toggleCam}
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={
                  camOn
                    ? { backgroundColor: BUTTER, color: GREEN }
                    : { backgroundColor: "rgba(255,239,179,0.1)", color: BUTTER }
                }
              >
                {camOn ? "Camera On" : "Camera Off"}
              </button>
            </div>

            {!SIGNALLING_CONFIGURED ? (
              <p className="mt-4 text-xs" style={{ color: "rgba(255,239,179,0.6)" }}>
                Signalling is not configured in this environment. You can open the
                room and see yourself, but nobody can join you.
              </p>
            ) : null}

            <button
              type="button"
              onClick={join}
              disabled={joining || !localStream}
              data-testid="room-join"
              className="mt-6 w-full rounded-xl py-3 font-bold disabled:opacity-60"
              style={{ backgroundColor: BUTTER, color: GREEN }}
            >
              {joining ? "Connecting…" : "Join Meeting"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/admin/board/meetings/${meetingId}`)}
              className="mt-3 w-full rounded-xl py-2 text-sm"
              style={{ color: "rgba(255,239,179,0.7)" }}
            >
              Back to the meeting record
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ── In the room ──────────────────────────────────────────────────────────
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ backgroundColor: PAGE }}
      data-testid="room-shell"
    >
      {/* Sidebar */}
      <aside
        className="hidden w-[220px] shrink-0 flex-col p-4 sm:flex"
        style={{ backgroundColor: GREEN }}
        data-testid="room-sidebar"
      >
        <p
          style={{
            color: BUTTER,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          FAITH Foundation
        </p>
        <p className="mt-2 text-base font-semibold text-white">Board Meeting</p>
        <p className="mt-1 text-xs" style={{ color: "rgba(255,239,179,0.6)" }}>
          {title}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "rgba(255,239,179,0.6)" }}>
          {subtitle}
        </p>

        <div
          className="my-4 h-px w-full"
          style={{ backgroundColor: "rgba(255,239,179,0.15)" }}
        />

        <p
          style={{
            color: "rgba(255,239,179,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Participants ({total} of {MAX_PARTICIPANTS})
        </p>

        <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
          <li className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: activeSpeaker === "local" ? BUTTER : "#ffffff",
              }}
            />
            <span
              className="text-sm"
              style={{
                color: activeSpeaker === "local" ? BUTTER : "rgba(255,239,179,0.8)",
              }}
            >
              {displayName} (you)
            </span>
          </li>
          {peers.map((p) => (
            <li key={p.peerId} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    activeSpeaker === p.peerId
                      ? BUTTER
                      : p.failed
                        ? "#ef4444"
                        : "#ffffff",
                }}
              />
              <span
                className="text-sm"
                style={{
                  color:
                    activeSpeaker === p.peerId ? BUTTER : "rgba(255,239,179,0.8)",
                }}
              >
                {p.displayName}
              </span>
            </li>
          ))}
          {peers.length === 0 ? (
            <li className="text-xs" style={{ color: "rgba(255,239,179,0.45)" }}>
              Nobody else has joined yet.
            </li>
          ) : null}
        </ul>

        <button
          type="button"
          onClick={leave}
          className="mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#ef4444" }}
        >
          Leave Meeting
        </button>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {full ? (
          <p
            role="alert"
            className="px-4 py-3 text-sm"
            style={{ backgroundColor: "#fffbeb", color: "#d97706" }}
            data-testid="room-full"
          >
            This room is full. A mesh call carries {MAX_PARTICIPANTS} participants;
            a seventh would mean six simultaneous uploads each. Ask someone to
            leave, or dial in by phone.
          </p>
        ) : null}

        {(meshError || status) && !full ? (
          <p
            role="status"
            className="px-4 py-2 text-sm"
            style={{
              backgroundColor: meshError ? "#fef2f2" : "#eff6ff",
              color: meshError ? "#dc2626" : "#2563eb",
            }}
          >
            {meshError ?? status}
          </p>
        ) : null}

        <div
          className="grid flex-1 gap-3 overflow-y-auto p-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          data-testid="room-grid"
        >
          <Tile
            label={`${displayName} (you)`}
            muted={!micOn}
            videoOff={!camOn}
            active={activeSpeaker === "local"}
            mirrored={!sharing}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full"
              style={{
                objectFit: "cover",
                transform: sharing ? undefined : "scaleX(-1)",
              }}
            />
          </Tile>

          {peers.map((p) => (
            <Tile
              key={p.peerId}
              label={p.displayName}
              muted={p.audioMuted}
              videoOff={p.videoOff}
              active={activeSpeaker === p.peerId}
              failed={p.failed}
            >
              <RemoteVideo stream={p.stream} />
            </Tile>
          ))}
        </div>

        {/* Controls */}
        <div
          className="flex h-16 shrink-0 items-center gap-3 px-4"
          style={{
            backgroundColor: GREEN,
            borderTop: "1px solid rgba(255,239,179,0.15)",
          }}
          data-testid="room-controls"
        >
          <div className="flex flex-1 items-center gap-3">
            <RoundButton
              label={micOn ? "Mute microphone" : "Unmute microphone"}
              danger={!micOn}
              onClick={toggleMic}
              testId="room-mic"
            >
              {micOn ? <MicIcon /> : <MicOffIcon />}
            </RoundButton>
            <RoundButton
              label={camOn ? "Turn camera off" : "Turn camera on"}
              danger={!camOn}
              onClick={toggleCam}
              testId="room-cam"
            >
              {camOn ? <CamIcon /> : <CamOffIcon />}
            </RoundButton>
            <RoundButton
              label={sharing ? "Stop sharing your screen" : "Share your screen"}
              active={sharing}
              onClick={() => void toggleShare()}
              testId="room-share"
            >
              <ScreenIcon />
            </RoundButton>
            <span
              className="ml-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(255,239,179,0.12)", color: BUTTER }}
            >
              {total} in the room
            </span>
          </div>

          <span className="tabular-nums text-sm font-medium text-white">
            {formatElapsed(elapsed)}
          </span>

          <div className="flex flex-1 items-center justify-end gap-3">
            <button
              type="button"
              onClick={leave}
              className="rounded-lg px-4 py-2 text-sm font-semibold sm:hidden"
              style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
            >
              Leave
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={finish}
                disabled={ending}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
                data-testid="room-end"
              >
                {ending ? "Ending…" : "End Meeting"}
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>,
    document.body
  );
}

/** One participant tile. The butter border is the active-speaker indicator. */
function Tile({
  label,
  muted,
  videoOff,
  active,
  failed = false,
  mirrored = false,
  children,
}: {
  label: string;
  muted: boolean;
  videoOff: boolean;
  active: boolean;
  failed?: boolean;
  mirrored?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-[140px] overflow-hidden rounded-xl"
      style={{
        backgroundColor: GREEN,
        border: active
          ? `2px solid ${BUTTER}`
          : "2px solid rgba(1,62,55,0.25)",
        boxShadow: active ? "0 0 20px rgba(255,239,179,0.35)" : "none",
        transition: "border-color 150ms, box-shadow 150ms",
      }}
      data-testid="room-tile"
      data-active={active ? "true" : "false"}
      data-mirrored={mirrored ? "true" : "false"}
    >
      {failed ? (
        <div className="flex h-full w-full items-center justify-center px-3 text-center">
          <span className="text-sm" style={{ color: "rgba(255,239,179,0.7)" }}>
            Lost the connection to {label}. Reconnection was attempted twice.
          </span>
        </div>
      ) : (
        children
      )}

      {videoOff && !failed ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: GREEN }}
        >
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
            style={{ backgroundColor: "rgba(255,239,179,0.15)", color: BUTTER }}
          >
            {label.trim().charAt(0).toUpperCase()}
          </span>
        </div>
      ) : null}

      <span
        className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded px-2 py-1 text-xs"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: BUTTER }}
      >
        {muted ? <MutedGlyph /> : null}
        {label}
      </span>
    </div>
  );
}

function RemoteVideo({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="h-full w-full"
      style={{ objectFit: "cover" }}
    />
  );
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function RoundButton({
  label,
  onClick,
  children,
  danger = false,
  active = false,
  testId,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      data-testid={testId}
      className="flex h-11 w-11 items-center justify-center rounded-full transition"
      style={
        danger
          ? { backgroundColor: "#ef4444", color: "#ffffff" }
          : active
            ? { backgroundColor: BUTTER, color: GREEN }
            : { backgroundColor: "rgba(255,239,179,0.1)", color: BUTTER }
      }
    >
      {children}
    </button>
  );
}

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {children}
    </svg>
  );
}

function MicIcon() {
  return (
    <Svg>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </Svg>
  );
}

function MicOffIcon() {
  return (
    <Svg>
      <path d="M9 9V6a3 3 0 0 1 6 0v5" />
      <path d="M5 11a7 7 0 0 0 10.5 6" />
      <path d="M12 18v3" />
      <path d="M4 4l16 16" />
    </Svg>
  );
}

function CamIcon() {
  return (
    <Svg>
      <rect x="3" y="6" width="12" height="12" rx="2.5" />
      <path d="M15 10.5 21 7v10l-6-3.5" />
    </Svg>
  );
}

function CamOffIcon() {
  return (
    <Svg>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H12" />
      <path d="M15 10.5 21 7v10" />
      <path d="M3 9v7a2 2 0 0 0 2 2h9" />
      <path d="M4 4l16 16" />
    </Svg>
  );
}

function ScreenIcon() {
  return (
    <Svg>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </Svg>
  );
}

function MutedGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden="true"
      className="h-3 w-3"
    >
      <path d="M9 9V6a3 3 0 0 1 6 0v5" />
      <path d="M5 11a7 7 0 0 0 10.5 6" />
      <path d="M4 4l16 16" />
    </svg>
  );
}
