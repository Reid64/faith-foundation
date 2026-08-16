import type { BadgeTone } from "@/app/admin/_components/ui";
import type { FundDesignation } from "./types";

export const GRANT_STATUSES = [
  "prospect",
  "researching",
  "applied",
  "awarded",
  "reporting",
  "closed",
  "declined",
] as const;
export type GrantStatus = (typeof GRANT_STATUSES)[number];

export const GRANT_STATUS_LABELS: Record<GrantStatus, string> = {
  prospect: "Prospect",
  researching: "Researching",
  applied: "Applied",
  awarded: "Awarded",
  reporting: "Reporting",
  closed: "Closed",
  declined: "Declined",
};

export const GRANT_STATUS_TONES: Record<GrantStatus, BadgeTone> = {
  prospect: "gray",
  researching: "blue",
  applied: "amber",
  awarded: "green",
  reporting: "purple",
  closed: "gray",
  declined: "red",
};

/** A grant still worth staff attention — everything except closed and declined. */
export const ACTIVE_GRANT_STATUSES: GrantStatus[] = [
  "prospect",
  "researching",
  "applied",
  "awarded",
  "reporting",
];

/**
 * Kanban columns.
 *
 * The enum has seven values and the board has five columns, so two of them
 * share: `researching` sits with `prospect` (both are pre-submission work) and
 * `declined` sits with `closed` (both are finished). Without this every
 * researching and declined grant would silently vanish from the board.
 */
export const GRANT_COLUMNS: {
  key: string;
  title: string;
  statuses: GrantStatus[];
}[] = [
  { key: "prospect", title: "Prospect", statuses: ["prospect", "researching"] },
  { key: "applied", title: "Applied", statuses: ["applied"] },
  { key: "awarded", title: "Awarded", statuses: ["awarded"] },
  { key: "reporting", title: "Reporting", statuses: ["reporting"] },
  { key: "closed", title: "Closed / Declined", statuses: ["closed", "declined"] },
];

export type Grant = {
  id: string;
  name: string;
  funder: string;
  amount_cents: number | null;
  status: GrantStatus;
  program: string | null;
  fund: FundDesignation | null;
  application_deadline: string | null;
  award_date: string | null;
  reporting_deadline: string | null;
  reporting_period: string | null;
  application_notes: string | null;
  award_notes: string | null;
  reporting_notes: string | null;
  contact_name: string | null;
  contact_email: string | null;
  transaction_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Whole days from today to a DATE column, negative when already past.
 *
 * Both sides are compared at UTC midnight — the column has no time component,
 * so anchoring the local clock to it avoids a deadline flipping a day early or
 * late depending on the viewer's timezone.
 */
export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target)) return null;
  const now = new Date();
  const todayUTC = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return Math.round((target - todayUTC) / 86_400_000);
}

export function deadlineTone(days: number | null): BadgeTone {
  if (days === null) return "gray";
  if (days < 0) return "red";
  if (days <= 7) return "red";
  if (days <= 30) return "amber";
  return "gray";
}

export function deadlinePhrase(days: number | null): string {
  if (days === null) return "No date set";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}
