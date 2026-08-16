"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { endMeeting, startMeeting } from "./actions";

/**
 * The Jitsi iFrame API is loaded from a script tag at runtime and ships no
 * types, so the constructor is declared as `any` here rather than pretending to
 * a type we cannot verify.
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: any;
  }
}

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT = `https://${JITSI_DOMAIN}/external_api.js`;

type Participant = { id: string; name: string };

/**
 * FaithProof board meeting room.
 *
 * WHAT IS OURS AND WHAT IS JITSI'S — worth stating, because the phase spec
 * describes a per-participant tile grid built outside the iFrame.
 *
 * The Jitsi iFrame API hands over ONE iframe that renders every video feed
 * internally. It exposes participant events and commands, but it does not
 * expose individual media streams, so there is no way to paint one participant
 * per tile in our own DOM — a "hidden" iframe would show no video at all.
 *
 * So: Jitsi owns the video surface, and everything around it is ours. The
 * sidebar participant list is real (driven by participant events), the active
 * speaker highlight is real (driven by dominantSpeakerChanged) and lands on the
 * sidebar entry, the controls bar is ours and drives Jitsi by command, and
 * Jitsi's own toolbar and watermarks are switched off. The result is branded
 * FaithProof chrome around a video area, which is what the design asks for and
 * what the API can actually deliver.
 */
export function MeetingRoom({
  meetingId,
  roomName,
  title,
  subtitle,
  displayName,
  email,
  isAdmin,
}: {
  meetingId: string;
  roomName: string;
  title: string;
  subtitle: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const previewStream = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);

  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [previewFailed, setPreviewFailed] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  // ── Camera preview on the pre-join screen ────────────────────────────────
  useEffect(() => {
    if (joined) return;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        previewStream.current = stream;
        if (previewRef.current) previewRef.current.srcObject = stream;
      })
      .catch(() => {
        // A blocked camera is not an error worth stopping for — the meeting can
        // still be joined audio-only. Say so instead of showing a dead box.
        if (!cancelled) {
          setPreviewFailed(
            "Camera preview unavailable — you can still join, and Jitsi will ask for permission."
          );
        }
      });

    return () => {
      cancelled = true;
      previewStream.current?.getTracks().forEach((t) => t.stop());
      previewStream.current = null;
    };
  }, [joined]);

  // ── Meeting timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return;
    const started = Date.now();
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000
    );
    return () => window.clearInterval(id);
  }, [joined]);

  // ── Tear the conference down if the page unmounts mid-call ───────────────
  useEffect(() => {
    return () => {
      try {
        apiRef.current?.dispose?.();
      } catch {
        /* the iframe is already gone */
      }
    };
  }, []);

  const loadScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${JITSI_SCRIPT}"]`
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Jitsi failed to load"))
        );
        return;
      }
      const script = document.createElement("script");
      script.src = JITSI_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Jitsi failed to load"));
      document.body.appendChild(script);
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refreshParticipants = useCallback((api: any) => {
    try {
      const info = api.getParticipantsInfo?.() ?? [];
      setParticipants(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        info.map((p: any) => ({
          id: String(p.participantId ?? p.id ?? ""),
          name: String(p.displayName ?? p.formattedDisplayName ?? "Guest"),
        }))
      );
    } catch {
      /* the call ended between the event and this read */
    }
  }, []);

  async function join() {
    if (joining) return;
    setJoining(true);
    setError(null);

    try {
      await loadScript();

      // Release the preview camera before Jitsi asks for it — some browsers
      // will not hand the same device to two consumers.
      previewStream.current?.getTracks().forEach((t) => t.stop());
      previewStream.current = null;

      setJoined(true);
      // Let React paint the container before Jitsi mounts into it.
      await new Promise((r) => window.setTimeout(r, 0));

      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName, email },
        configOverwrite: {
          startWithAudioMuted: !micOn,
          startWithVideoMuted: !camOn,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          // Room names are derived from the meeting UUID and are not secret.
          // Lobby mode means the first participant admits everyone else, so
          // knowing the URL is not enough to get into a board meeting.
          enableLobbyMode: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: "#0a0f1a",
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          filmStripOnly: false,
          VERTICAL_FILMSTRIP: false,
        },
      });

      apiRef.current = api;

      api.addListener("videoConferenceJoined", () => {
        refreshParticipants(api);
        // Stamp the start only once the conference is genuinely joined, not
        // when the button was clicked.
        void startMeeting(meetingId);
      });
      api.addListener("participantJoined", () => refreshParticipants(api));
      api.addListener("participantLeft", () => refreshParticipants(api));
      api.addListener("displayNameChange", () => refreshParticipants(api));
      api.addListener(
        "dominantSpeakerChanged",
        (e: { id?: string }) => setActiveSpeaker(e?.id ?? null)
      );
      api.addListener("audioMuteStatusChanged", (e: { muted: boolean }) =>
        setMicOn(!e.muted)
      );
      api.addListener("videoMuteStatusChanged", (e: { muted: boolean }) =>
        setCamOn(!e.muted)
      );
      api.addListener("screenSharingStatusChanged", (e: { on: boolean }) =>
        setSharing(Boolean(e?.on))
      );
      api.addListener("recordingStatusChanged", (e: { on: boolean }) =>
        setRecording(Boolean(e?.on))
      );
      api.addListener("readyToClose", () => {
        router.push(`/admin/board/meetings/${meetingId}`);
      });

      setJoining(false);
    } catch {
      setJoined(false);
      setJoining(false);
      setError(
        "The video service could not be reached. Check your connection, or dial in another way — the meeting record is unaffected."
      );
    }
  }

  function command(name: string, ...args: unknown[]) {
    try {
      apiRef.current?.executeCommand(name, ...args);
    } catch {
      setError("That control did not reach the meeting.");
    }
  }

  function leave() {
    command("hangup");
    router.push(`/admin/board/meetings/${meetingId}`);
  }

  async function finish() {
    if (ending) return;
    setEnding(true);
    setError(null);
    const result = await endMeeting(meetingId);
    if (result?.error) {
      setError(result.error);
      setEnding(false);
      return;
    }
    // Close the conference first, then navigate — the other way round leaves
    // the room thinking this participant is still connected.
    command("hangup");
    router.push(result.redirectTo ?? `/admin/board/meetings/${meetingId}/minutes`);
  }

  const timer = formatElapsed(elapsed);

  return (
    /* Fixed and full-viewport: the admin sidebar is a sibling in the layout
       above, and a meeting room with the CRM nav down one side is not a meeting
       room. Covering it is the honest fix — App Router cannot un-render a
       parent layout without moving every admin route into a route group. */
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      style={{ backgroundColor: "#0a0f1a" }}
    >
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
      <aside
        className="flex w-[220px] shrink-0 flex-col p-4"
        style={{ backgroundColor: "#013e37" }}
      >
        <p
          style={{
            color: "#ffefb3",
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
          Participants{participants.length ? ` (${participants.length + 1})` : ""}
        </p>

        <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
          <li className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: "#ffffff" }}
            />
            <span className="text-sm" style={{ color: "rgba(255,239,179,0.8)" }}>
              {displayName} (you)
            </span>
          </li>
          {participants.map((p) => {
            const active = activeSpeaker === p.id;
            return (
              <li key={p.id} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: active ? "#ffefb3" : "#ffffff" }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: active ? "#ffefb3" : "rgba(255,239,179,0.8)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {p.name}
                </span>
              </li>
            );
          })}
          {joined && participants.length === 0 ? (
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

      {/* ── CENTER ────────────────────────────────────────────────────── */}
      <main className="relative flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden p-4">
          {!joined ? (
            <div className="flex h-full items-center justify-center">
              <div
                className="w-full max-w-lg rounded-2xl p-8"
                style={{ backgroundColor: "#013e37" }}
              >
                <p
                  style={{
                    color: "#ffefb3",
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

                <div className="mt-6 flex justify-center">
                  <video
                    ref={previewRef}
                    autoPlay
                    muted
                    playsInline
                    className="rounded-xl"
                    style={{
                      width: 280,
                      height: 158,
                      objectFit: "cover",
                      border: "2px solid rgba(255,239,179,0.3)",
                      backgroundColor: "#0a0f1a",
                      transform: "scaleX(-1)",
                    }}
                  />
                </div>
                {previewFailed ? (
                  <p
                    className="mt-2 text-center text-xs"
                    style={{ color: "rgba(255,239,179,0.55)" }}
                  >
                    {previewFailed}
                  </p>
                ) : null}

                <p className="mt-4 text-center text-sm text-white">{displayName}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMicOn((v) => !v)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold"
                    style={
                      micOn
                        ? { backgroundColor: "#ffefb3", color: "#013e37" }
                        : { backgroundColor: "rgba(255,239,179,0.1)", color: "#ffefb3" }
                    }
                  >
                    {micOn ? "Mic On" : "Mic Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCamOn((v) => !v)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold"
                    style={
                      camOn
                        ? { backgroundColor: "#ffefb3", color: "#013e37" }
                        : { backgroundColor: "rgba(255,239,179,0.1)", color: "#ffefb3" }
                    }
                  >
                    {camOn ? "Camera On" : "Camera Off"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={join}
                  disabled={joining}
                  className="mt-6 w-full rounded-xl py-3 font-bold disabled:opacity-60"
                  style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
                >
                  {joining ? "Connecting..." : "Join Meeting"}
                </button>

                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg px-3 py-2 text-sm"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.15)",
                      color: "#fecaca",
                      border: "1px solid rgba(239,68,68,0.4)",
                    }}
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              className="relative h-full w-full overflow-hidden rounded-xl"
              style={{
                backgroundColor: "#1a2332",
                border: activeSpeaker
                  ? "2px solid #ffefb3"
                  : "2px solid rgba(255,239,179,0.1)",
                boxShadow: activeSpeaker
                  ? "0 0 20px rgba(255,239,179,0.3)"
                  : "none",
                transition: "border-color 200ms, box-shadow 200ms",
              }}
            >
              {/* Jitsi mounts its iframe here and renders every feed inside. */}
              <div ref={containerRef} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
              <span
                className="pointer-events-none absolute bottom-2 left-2 rounded px-2 py-1 text-xs"
                style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#ffefb3" }}
              >
                {activeSpeaker
                  ? participants.find((p) => p.id === activeSpeaker)?.name ??
                    "Speaking"
                  : "FaithProof Board Meeting"}
              </span>
            </div>
          )}
        </div>

        {/* ── BOTTOM CONTROLS ─────────────────────────────────────────── */}
        {joined ? (
          <div
            className="flex h-16 shrink-0 items-center gap-4 px-4"
            style={{
              backgroundColor: "#013e37",
              borderTop: "1px solid rgba(255,239,179,0.15)",
            }}
          >
            <div className="flex flex-1 items-center gap-3">
              <RoundButton
                label={micOn ? "Mute microphone" : "Unmute microphone"}
                danger={!micOn}
                onClick={() => command("toggleAudio")}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </RoundButton>
              <RoundButton
                label={camOn ? "Turn camera off" : "Turn camera on"}
                danger={!camOn}
                onClick={() => command("toggleVideo")}
              >
                {camOn ? <CamIcon /> : <CamOffIcon />}
              </RoundButton>
              <RoundButton
                label={sharing ? "Stop sharing your screen" : "Share your screen"}
                active={sharing}
                onClick={() => command("toggleShareScreen")}
              >
                <ScreenIcon />
              </RoundButton>
              {isAdmin ? (
                <RoundButton
                  label={recording ? "Stop recording" : "Start recording"}
                  danger={recording}
                  onClick={() =>
                    recording
                      ? command("stopRecording", "file")
                      : command("startRecording", { mode: "file" })
                  }
                >
                  <RecordIcon />
                </RoundButton>
              ) : null}
              <span
                className="ml-2 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,239,179,0.12)", color: "#ffefb3" }}
              >
                {participants.length + 1} in the room
              </span>
            </div>

            <span className="tabular-nums text-sm font-medium text-white">{timer}</span>

            <div className="flex flex-1 items-center justify-end gap-3">
              {error ? (
                <span className="max-w-xs truncate text-xs" style={{ color: "#fecaca" }}>
                  {error}
                </span>
              ) : null}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={finish}
                  disabled={ending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {ending ? "Ending..." : "End Meeting"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
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
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full transition"
      style={
        danger
          ? { backgroundColor: "#ef4444", color: "#ffffff" }
          : active
            ? { backgroundColor: "#ffefb3", color: "#013e37" }
            : { backgroundColor: "rgba(255,239,179,0.1)", color: "#ffefb3" }
      }
    >
      {children}
    </button>
  );
}

/* ── Icons: stroke-based, inheriting currentColor, same as the admin set ── */

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

function RecordIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Svg>
  );
}
