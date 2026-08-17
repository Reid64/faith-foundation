"use client";

/**
 * Independent camera and microphone acquisition.
 *
 * THE BUG THIS EXISTS TO PREVENT (found in live testing, 2026-08-16).
 *
 * `getUserMedia({ video: true, audio: true })` is ALL OR NOTHING: if either
 * kind cannot be satisfied the whole promise rejects and you get no tracks at
 * all. On a laptop whose webcam has no microphone — an ordinary HP TrueVision —
 * the camera worked everywhere else, permission was granted for both, and the
 * board meeting room still showed a black preview, a banner blaming
 * permissions, and a Join button that never enabled. A director could not enter
 * their own meeting.
 *
 * So each kind is requested SEPARATELY and the results combined. One missing
 * device costs you that device, and nothing else.
 *
 * The DOMException name is kept rather than swallowed, because the remedy is
 * completely different per case and the old single `catch {}` threw it away:
 *   NotFoundError       there is no such device — nothing to fix, join without it
 *   NotAllowedError     the browser blocked it — the site permission needs changing
 *   NotReadableError    the OS or another app holds it — close Teams/Zoom and retry
 *   OverconstrainedError the remembered device is gone — fall back to the default
 */

export type DeviceKind = "video" | "audio";

export type DeviceState = {
  ok: boolean;
  /** DOMException name when acquisition failed. */
  error?: string;
};

export type Acquired = {
  track: MediaStreamTrack | null;
  state: DeviceState;
};

/** Request exactly one kind of track. Never throws. */
export async function acquireTrack(
  kind: DeviceKind,
  deviceId?: string
): Promise<Acquired> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { track: null, state: { ok: false, error: "NotSupportedError" } };
  }

  const constraint = deviceId ? { deviceId: { exact: deviceId } } : true;
  const constraints: MediaStreamConstraints =
    kind === "video" ? { video: constraint } : { audio: constraint };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const track =
      kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
    if (!track) {
      // A resolved promise with no track of the kind we asked for.
      stream.getTracks().forEach((t) => t.stop());
      return { track: null, state: { ok: false, error: "NotFoundError" } };
    }
    // Drop anything extra the browser threw in, so we own exactly one track.
    stream.getTracks().forEach((t) => {
      if (t !== track) t.stop();
    });
    return { track, state: { ok: true } };
  } catch (cause) {
    const name =
      cause instanceof DOMException ? cause.name : "UnknownError";

    // A remembered device that has since been unplugged fails as
    // OverconstrainedError. Retry once with no deviceId rather than reporting a
    // dead camera the user can plainly see is present.
    if (deviceId && (name === "OverconstrainedError" || name === "NotFoundError")) {
      return acquireTrack(kind);
    }

    return { track: null, state: { ok: false, error: name } };
  }
}

/** Human sentence for one device's failure. Names the device, not "media". */
export function deviceMessage(kind: DeviceKind, state: DeviceState): string | null {
  if (state.ok || !state.error) return null;

  const noun = kind === "video" ? "camera" : "microphone";
  const other = kind === "video" ? "audio only" : "video only";

  switch (state.error) {
    case "NotFoundError":
      return `No ${noun} was found on this computer. You can still join with ${other}.`;
    case "NotAllowedError":
      return `The ${noun} is blocked for this site. Open the padlock in the address bar, set ${noun} to Allow, then reload. You can join with ${other} in the meantime.`;
    case "NotReadableError":
      return `The ${noun} is already in use by another application. Close anything else using it (Teams, Zoom, Camera) and reload. You can join with ${other} in the meantime.`;
    case "OverconstrainedError":
      return `The selected ${noun} is no longer available. Pick another from the list, or join with ${other}.`;
    case "NotSupportedError":
      return `This browser will not provide ${noun} access on an insecure connection.`;
    default:
      return `The ${noun} could not be started (${state.error}). You can still join with ${other}.`;
  }
}
