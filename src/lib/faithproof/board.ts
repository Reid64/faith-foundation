import type { BadgeTone } from "@/app/admin/_components/ui";

/**
 * Board portal vocabulary.
 *
 * Kept out of BoardNav.tsx deliberately — that file is "use client", and a
 * server component importing a plain value from a client module gets a client
 * reference, not the object.
 */

export const MEETING_TYPES = ["regular", "special", "annual"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const VOTE_RESULTS = ["passed", "failed", "tabled", "withdrawn"] as const;
export type VoteResult = (typeof VOTE_RESULTS)[number];

export const MEETING_TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  special: "Special",
  annual: "Annual",
};

export const VOTE_RESULT_LABELS: Record<string, string> = {
  passed: "Passed",
  failed: "Failed",
  tabled: "Tabled",
  withdrawn: "Withdrawn",
};

export const VOTE_TONES: Record<string, BadgeTone> = {
  passed: "green",
  failed: "red",
  tabled: "amber",
  withdrawn: "gray",
};

export const MEETING_TYPE_TONES: Record<string, BadgeTone> = {
  regular: "blue",
  special: "purple",
  annual: "green",
};

export type BoardMeeting = {
  id: string;
  meeting_date: string;
  type: string;
  agenda: string | null;
  minutes: string | null;
  attendees: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BoardVote = {
  id: string;
  meeting_id: string;
  motion: string;
  result: string;
  votes_for: number | null;
  votes_against: number | null;
  votes_abstain: number | null;
  notes: string | null;
  created_at: string;
};
