/**
 * CRM types, pipeline stages and label maps (Phase 10).
 *
 * Kept in step with supabase/migrations/007_crm_schema.sql by hand — a value
 * not in these unions is rejected by Postgres, not by TypeScript.
 */

export const CONTACT_TYPES = [
  "donor",
  "applicant",
  "volunteer",
  "board",
  "partner",
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const INTERACTION_TYPES = [
  "note",
  "call",
  "email",
  "meeting",
  "donation",
  "application",
  "volunteer_shift",
] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  donor: "Donor",
  applicant: "Applicant",
  volunteer: "Volunteer",
  board: "Board",
  partner: "Partner",
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  donation: "Donation",
  application: "Application",
  volunteer_shift: "Volunteer Shift",
};

/**
 * Pipeline stages per contact type.
 *
 * `pipeline_stage` is free TEXT in the database, so nothing stops a donor row
 * carrying an applicant stage. The server actions validate against this map —
 * that validation is the only thing keeping the pipeline summary meaningful.
 */
export const PIPELINE_STAGES: Record<ContactType, string[]> = {
  donor: ["prospect", "first_contact", "active_donor", "major_donor", "lapsed"],
  applicant: [
    "inquiry",
    "screened",
    "approved",
    "voucher_issued",
    "housed",
    "closed",
  ],
  volunteer: ["interested", "oriented", "active", "inactive"],
  board: ["nominee", "elected", "active", "emeritus"],
  partner: ["prospect", "engaged", "active", "inactive"],
};

export function stageLabel(stage: string | null): string {
  if (!stage) return "—";
  return stage
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function isValidStage(type: ContactType, stage: string): boolean {
  return PIPELINE_STAGES[type]?.includes(stage) ?? false;
}

export function contactName(c: {
  first_name?: string | null;
  last_name?: string | null;
}): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unnamed";
}

// ── Row shapes ──────────────────────────────────────────────────────────────

export type Contact = {
  id: string;
  type: ContactType;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  sms_consent: boolean;
  sms_consent_date: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  source: string | null;
  notes: string | null;
  pipeline_stage: string | null;
  assigned_to: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Interaction = {
  id: string;
  contact_id: string;
  type: InteractionType;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
  contact?: Pick<Contact, "first_name" | "last_name"> | null;
};

export type Task = {
  id: string;
  contact_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  contact?: Pick<Contact, "first_name" | "last_name"> | null;
};

export type CampaignTag = {
  id: string;
  contact_id: string;
  campaign: string;
  tagged_at: string;
  tagged_by: string | null;
};

// ── Badge tones ─────────────────────────────────────────────────────────────

import type { BadgeTone } from "@/app/admin/_components/ui";

export const CONTACT_TYPE_TONES: Record<ContactType, BadgeTone> = {
  donor: "green",
  applicant: "blue",
  volunteer: "purple",
  board: "amber",
  partner: "gray",
};

export const TASK_PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
  low: "gray",
  medium: "blue",
  high: "amber",
  urgent: "red",
};

export const TASK_STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  pending: "amber",
  in_progress: "blue",
  completed: "green",
  cancelled: "gray",
};

export const INTERACTION_TONES: Record<InteractionType, BadgeTone> = {
  note: "gray",
  call: "blue",
  email: "blue",
  meeting: "purple",
  donation: "green",
  application: "amber",
  volunteer_shift: "purple",
};
