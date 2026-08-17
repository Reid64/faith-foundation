import Pusher from "pusher";

/**
 * Server-side Pusher client — signalling only.
 *
 * SERVER ONLY. `PUSHER_SECRET` carries no NEXT_PUBLIC_ prefix, so Next refuses
 * to inline it into a client bundle; importing this module from a "use client"
 * file fails the build rather than leaking the secret. Nothing here is ever
 * imported by a component.
 *
 * The browser gets `NEXT_PUBLIC_PUSHER_KEY`, which is public by design and
 * readable by anyone who views source. That is exactly why every channel is
 * PRIVATE: the key lets you connect, and channel authorisation — not the key —
 * is what decides whether you may listen to a board meeting.
 */

const APP_ID = process.env.PUSHER_APP_ID ?? "";
const KEY = process.env.PUSHER_KEY ?? "";
const SECRET = process.env.PUSHER_SECRET ?? "";
const CLUSTER = process.env.PUSHER_CLUSTER ?? "";

/** True when every server-side Pusher variable is present. */
export const PUSHER_CONFIGURED = Boolean(APP_ID && KEY && SECRET && CLUSTER);

let client: Pusher | null = null;

/**
 * Returns the shared client, or null when Pusher is not configured.
 *
 * Null rather than a throw: a missing variable is an environment problem, and
 * the routes turn it into a clear 503 instead of a stack trace.
 */
export function pusherServer(): Pusher | null {
  if (!PUSHER_CONFIGURED) return null;
  if (!client) {
    client = new Pusher({
      appId: APP_ID,
      key: KEY,
      secret: SECRET,
      cluster: CLUSTER,
      useTLS: true,
    });
  }
  return client;
}

/**
 * The one channel name shape in the system.
 *
 * `private-` is not decoration — Pusher only runs the auth endpoint for
 * channels whose name starts with `private-` or `presence-`. A channel named
 * anything else is public, and a public channel would hand every board meeting
 * to anyone holding the publishable key.
 */
export function meetingChannel(meetingId: string): string {
  return `private-meeting-${meetingId}`;
}

/** Extracts the meeting id from a channel name, or null if it is not ours. */
export function meetingIdFromChannel(channel: string): string | null {
  const match = /^private-meeting-([0-9a-fA-F-]{36})$/.exec(channel);
  return match ? match[1] : null;
}
