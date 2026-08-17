"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SUCCESS,
  CONTROL,
} from "../../../../_components/theme";

type Result = { error?: string; ok?: boolean; note?: string };
type FormAction = (fd: FormData) => Promise<Result>;

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-3 rounded-lg px-3 py-2 text-sm"
      style={{
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      }}
    >
      {message}
    </p>
  );
}

/* ── Minutes display + inline editing ─────────────────────────────────── */

export function MinutesEditor({
  text,
  action,
  locked,
}: {
  text: string;
  action: FormAction;
  locked: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await action(new FormData(e.currentTarget));
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      setEditing(false);
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not save.");
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div>
        <div
          className="whitespace-pre-wrap font-serif leading-relaxed"
          style={{ color: "#374151" }}
        >
          {text}
        </div>
        {locked ? (
          <p className="mt-4 text-xs" style={{ color: "#9ca3af" }}>
            These minutes are certified. A certified record cannot be edited —
            corrections are recorded at the next meeting.
          </p>
        ) : (
          <button
            type="button"
            disabled={!ready}
            onClick={() => setEditing(true)}
            className={`${BTN_SECONDARY} mt-4`}
          >
            Edit Minutes
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <textarea
        name="minutes_text"
        defaultValue={text}
        rows={24}
        aria-label="Meeting minutes"
        className={`${CONTROL} resize-y font-serif leading-relaxed`}
      />
      <ErrorNote message={error} />
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={pending || !ready} className={BTN_PRIMARY}>
          {pending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            setEditing(false);
            setError(null);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Generate from transcript ─────────────────────────────────────────── */

export function GenerateMinutesButton({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function run() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/board/generate-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_id: meetingId }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error ?? "The draft could not be produced.");
        setPending(false);
        return;
      }
      router.refresh();
      // Leave `pending` set: the refresh replaces this view with the draft.
    } catch {
      setError("The drafting service could not be reached. Nothing was saved.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending || !ready}
        className={BTN_PRIMARY}
      >
        {pending ? "Claude is reading the transcript..." : "Generate AI Minutes"}
      </button>
      {pending ? (
        <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>
          Claude is reading the transcript and drafting minutes. This takes a
          few seconds.
        </p>
      ) : null}
      <ErrorNote message={error} />
    </div>
  );
}

/* ── Transcript entry, or minutes typed by hand ───────────────────────── */

export function TranscriptEntry({
  transcriptAction,
  minutesAction,
}: {
  transcriptAction: FormAction;
  minutesAction: FormAction;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"transcript" | "manual">("transcript");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => setReady(true), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const action = mode === "transcript" ? transcriptAction : minutesAction;
    try {
      const res = await action(new FormData(e.currentTarget));
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not save.");
      setPending(false);
    }
  }

  async function readFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("That file is larger than 2 MB. Paste the text instead.");
      return;
    }
    const text = await file.text();
    if (textRef.current) textRef.current.value = text;
    setFileNote(`Loaded ${file.name} — review it below, then save.`);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("transcript")}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={
            mode === "transcript"
              ? { backgroundColor: "#013e37", color: "#ffefb3" }
              : { color: "#6b7280", border: "1px solid #d1d5db" }
          }
        >
          Upload Transcript
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={
            mode === "manual"
              ? { backgroundColor: "#013e37", color: "#ffefb3" }
              : { color: "#6b7280", border: "1px solid #d1d5db" }
          }
        >
          Enter Minutes Manually
        </button>
      </div>

      <form onSubmit={onSubmit}>
        {mode === "transcript" ? (
          <>
            <p className="mb-3 text-sm" style={{ color: "#6b7280" }}>
              Paste the meeting transcript, or load a .txt file. Once a
              transcript is on the record, Claude can draft the minutes from it.
            </p>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={readFile}
              aria-label="Load a transcript from a .txt file"
              className="mb-3 block text-sm"
              style={{ color: "#374151" }}
            />
            {fileNote ? (
              <p className="mb-2 text-xs" style={{ color: "#16a34a" }}>
                {fileNote}
              </p>
            ) : null}
            <textarea
              ref={textRef}
              name="transcript_text"
              rows={12}
              placeholder="Transcript text…"
              className={`${CONTROL} resize-y`}
            />
          </>
        ) : (
          <>
            <p className="mb-3 text-sm" style={{ color: "#6b7280" }}>
              No recording? Type the minutes directly. They go to the board for
              approval exactly like a drafted set.
            </p>
            <textarea
              name="minutes_text"
              rows={16}
              placeholder="Minutes of the meeting…"
              className={`${CONTROL} resize-y font-serif`}
            />
          </>
        )}

        <ErrorNote message={error} />

        <button
          type="submit"
          disabled={pending || !ready}
          className={`${BTN_PRIMARY} mt-3`}
        >
          {pending
            ? "Saving..."
            : mode === "transcript"
              ? "Save Transcript"
              : "Save Minutes"}
        </button>
      </form>
    </div>
  );
}

/* ── Signature modal ──────────────────────────────────────────────────── */

export function ApproveButton({
  meetingId,
  minutesText,
  meetingDate,
  action,
}: {
  meetingId: string;
  minutesText: string;
  meetingDate: string;
  action: (meetingId: string, signature: string) => Promise<Result>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  useEffect(() => setReady(true), []);

  /**
   * Size the canvas backing store to its rendered size and to the device pixel
   * ratio. Without this the drawn line lands at the wrong coordinates on any
   * non-1x display, which on a signature is not a cosmetic problem.
   */
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = "#013e37";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasInk(false);
  }, [open]);

  function pointFrom(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const source =
      "touches" in e ? e.touches[0] ?? e.changedTouches[0] : (e as React.MouseEvent);
    if (!source) return null;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    const ctx = canvasRef.current?.getContext("2d");
    const point = pointFrom(e);
    if (!ctx || !point) return;
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    // Stop the page scrolling under a finger that is trying to sign.
    if ("touches" in e) e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    const point = pointFrom(e);
    if (!ctx || !point) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasInk(true);
  }

  function stop() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function approve() {
    if (pending || !hasInk) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPending(true);
    setError(null);
    try {
      const signature = canvas.toDataURL("image/png");
      const res = await action(meetingId, signature);
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      setOpen(false);
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Your approval was not recorded."
      );
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-lg py-3 font-bold"
        style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
      >
        Review &amp; Sign Minutes
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Approve meeting minutes"
    >
      <div
        className="mx-auto mt-16 max-w-2xl rounded-2xl p-8"
        style={{ backgroundColor: "#ffffff" }}
      >
        <h2 style={{ color: "#013e37", fontSize: 20, fontWeight: 700 }}>
          Approve Meeting Minutes
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#374151" }}>
          I have read and approve these minutes as an accurate record of the{" "}
          {meetingDate} board meeting of Foundation for Affordable Instruction
          and Tenancy Hope.
        </p>

        <div
          className="mt-4 max-h-48 overflow-y-auto rounded-xl p-4 text-sm"
          style={{ backgroundColor: "#f8f7f4", color: "#374151" }}
        >
          <div className="whitespace-pre-wrap font-serif leading-relaxed">
            {minutesText}
          </div>
        </div>

        <p className="mt-5 text-sm" style={{ color: "#6b7280" }}>
          Sign below using your mouse or finger
        </p>
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={stop}
          className="mt-2 w-full rounded-xl"
          style={{
            height: 150,
            border: "2px solid #d1d5db",
            backgroundColor: "#ffffff",
            cursor: "crosshair",
            touchAction: "none",
          }}
        />
        <button
          type="button"
          onClick={clear}
          className="mt-2 text-sm font-medium"
          style={{ color: "#6b7280" }}
        >
          Clear Signature
        </button>

        <ErrorNote message={error} />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={approve}
            disabled={pending || !hasInk}
            className="rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
          >
            {pending ? "Recording..." : "Approve Minutes"}
          </button>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
          >
            Cancel
          </button>
          {!hasInk ? (
            <span className="self-center text-xs" style={{ color: "#9ca3af" }}>
              Sign above to enable approval.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Certification ────────────────────────────────────────────────────── */

export function CertifyButton({
  meetingId,
  action,
}: {
  meetingId: string;
  action: (meetingId: string) => Promise<Result>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function run() {
    if (pending) return;
    if (
      !window.confirm(
        "Certify these minutes? This files a signed PDF in the Proof Vault and the minutes can no longer be edited."
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await action(meetingId);
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Certification did not complete."
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending || !ready}
        className={`${BTN_SUCCESS} mt-4 w-full justify-center`}
      >
        {pending ? "Certifying and filing the PDF..." : "Certify Minutes"}
      </button>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg px-3 py-2 text-sm"
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
  );
}
