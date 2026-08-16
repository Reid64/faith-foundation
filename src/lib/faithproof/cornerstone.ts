import type { BadgeTone } from "@/app/admin/_components/ui";

/**
 * Cornerstone Communities — the four-phase development roadmap.
 *
 * These titles match the roadmap already published on
 * /programs/cornerstone-communities. The two pages must not disagree: that page
 * is the narrative, this tracker is the live state of it.
 *
 * NAMING RULE: the modular home partner is never named here or in anything
 * this feeds — public or admin. "Modular home partner" / "housing partner".
 */

export const PHASES = [
  {
    number: 1,
    title: "Land Acquisition",
    blurb:
      "Securing land through donation, land bank transfer, or partnership with a willing landowner.",
  },
  {
    number: 2,
    title: "Site Development",
    blurb:
      "Infrastructure, permits, utilities — everything that makes a parcel livable.",
  },
  {
    number: 3,
    title: "First Home Placement",
    blurb:
      "One modular home placed on developed land, fully permitted and documented from groundbreaking to move-in.",
  },
  {
    number: 4,
    title: "Community Replication",
    blurb:
      "Repeating the proven model site by site, each placement documented and each donor acknowledged.",
  },
] as const;

export const PHASE_STATUSES = ["not_started", "in_progress", "complete"] as const;
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

export const PHASE_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

export const PHASE_STATUS_TONES: Record<string, BadgeTone> = {
  not_started: "gray",
  in_progress: "blue",
  complete: "green",
};

export function phaseTitle(phase: number): string {
  return PHASES.find((p) => p.number === phase)?.title ?? `Phase ${phase}`;
}

export type CornerstoneProject = {
  id: string;
  name: string;
  location: string | null;
  phase: number;
  phase_status: PhaseStatus;
  land_acquired: boolean;
  land_source: string | null;
  site_address: string | null;
  target_homes: number | null;
  homes_placed: number;
  public_notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** What the public views expose — internal_notes is absent by construction. */
export type PublicProject = {
  id: string;
  name: string;
  location: string | null;
  phase: number;
  phase_status: PhaseStatus;
  land_acquired: boolean;
  target_homes: number | null;
  homes_placed: number;
  public_notes: string | null;
  updated_at: string;
};

export type PublicMilestone = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed_date: string | null;
};

export type CornerstoneMilestone = PublicMilestone & {
  is_public: boolean;
  created_at: string;
};

/**
 * Progress toward the home target, as a percentage.
 *
 * Returns 0 when no target is set — a project with no target has not made
 * measurable progress, and showing a full bar would be a lie.
 */
export function homesProgress(project: {
  homes_placed: number;
  target_homes: number | null;
}): number {
  if (!project.target_homes || project.target_homes <= 0) return 0;
  return Math.min(100, Math.round((project.homes_placed / project.target_homes) * 100));
}

/** Phase progress as a percentage of the four-step roadmap. */
export function phaseProgress(phase: number, status: PhaseStatus): number {
  const completedPhases = phase - 1 + (status === "complete" ? 1 : 0);
  return Math.max(0, Math.min(100, Math.round((completedPhases / 4) * 100)));
}
