import type { BadgeTone } from "@/app/admin/_components/ui";

export const EVENT_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const EVENT_STATUS_TONES: Record<string, BadgeTone> = {
  scheduled: "blue",
  completed: "green",
  cancelled: "gray",
};

export type VolunteerEvent = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  max_volunteers: number | null;
  status: string;
  created_by: string | null;
  created_at: string;
};

export type VolunteerShift = {
  id: string;
  event_id: string;
  contact_id: string;
  /** NUMERIC arrives from PostgREST as a string — parse before doing maths. */
  hours_logged: string | number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  notes: string | null;
  created_at: string;
};

/**
 * NUMERIC(5,2) comes back as a string over PostgREST, so `+row.hours_logged`
 * silently becomes NaN if you forget. One place to forget instead of many.
 */
export function hoursOf(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatHours(value: number): string {
  return `${value.toFixed(2).replace(/\.00$/, "")} h`;
}

/** "14:30:00" → "2:30 PM". Postgres TIME has no timezone, so no conversion. */
export function formatTime(value: string | null): string {
  if (!value) return "—";
  const [hRaw, m] = value.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m ?? "00"} ${suffix}`;
}

/** Hours between two timestamps, rounded to two decimals. Never negative. */
export function hoursBetween(start: string, end: string): number {
  const a = Date.parse(start);
  const b = Date.parse(end);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round(((b - a) / 3_600_000) * 100) / 100;
}
