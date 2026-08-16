import type { CSSProperties } from "react";

/**
 * FaithProof admin design system — FINAL (Phase 3D).
 *
 * Three surface families, deliberately different from each other:
 *   page          #e8e6e1  medium warm gray
 *   stat cards    #ffefb3  butter
 *   dashboard     #013e37  deep green (the two Command Center panels only)
 *   everything    #ffffff  white cards — tables, forms, list pages, detail pages
 *
 * SCOPE: used ONLY under src/app/admin/ and src/app/login/. Deliberately NOT in
 * tailwind.config.ts, which the public marketing site shares.
 *
 * Colours are inline `style` objects wherever a value is rgba, layered, or not
 * in Tailwind's default palette. Tailwind arbitrary values are used only where a
 * `hover:` / `focus:` / `even:` variant is required, since those cannot be
 * expressed inline at all.
 */

// ── Palette ─────────────────────────────────────────────────────────────────

export const PAGE_BG = "#e8e6e1";
export const SURFACE = "#ffffff";
export const DEEP_GREEN = "#013e37";
export const DEEP_GREEN_HOVER = "#025a50";
export const BUTTER = "#ffefb3";

export const INK = "#111827";
export const BODY = "#374151";
export const SECONDARY = "#6b7280";
export const MUTED = "#9ca3af";
export const FAINT = "#d1d5db";

export const DANGER = "#dc2626";

// ── Surfaces ────────────────────────────────────────────────────────────────

/** White card — tables, forms, list pages, detail pages. */
export const cardStyle: CSSProperties = {
  backgroundColor: SURFACE,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  // Stronger than a typical card shadow on purpose: the page is #e8e6e1, a
  // medium warm gray, and a light shadow simply disappears against it.
  boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
};

/** Butter stat card — the four counters at the top of the Command Center. */
export const statCardStyle: CSSProperties = {
  backgroundColor: BUTTER,
  borderRadius: 12,
  border: "none",
  borderTop: "3px solid #013e37",
  boxShadow: "0 2px 8px rgba(1,62,55,0.15), 0 1px 3px rgba(0,0,0,0.1)",
  padding: 24,
};

/** Deep green panel — the two large Command Center panels only. */
export const darkPanelStyle: CSSProperties = {
  backgroundColor: DEEP_GREEN,
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 16px rgba(1,62,55,0.25), 0 1px 4px rgba(0,0,0,0.15)",
  padding: 28,
};

/** Table wrapper — white card; the green header row supplies the weight. */
export const tableStyle: CSSProperties = {
  backgroundColor: SURFACE,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
};

/** Form wrapper — white card with 32px padding. */
export const formCardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: 32,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
  border: "1px solid rgba(0,0,0,0.08)",
};

/** Login card. */
export const loginCardStyle: CSSProperties = {
  backgroundColor: SURFACE,
  borderRadius: 16,
  boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(1,62,55,0.1)",
  padding: 40,
};

// ── Text styles used on the dark panels ─────────────────────────────────────

export const onDark = {
  heading: { color: BUTTER, fontSize: 17, fontWeight: 600 } as CSSProperties,
  subtext: {
    color: "rgba(255,239,179,0.6)",
    fontSize: 13,
  } as CSSProperties,
  body: { color: BUTTER } as CSSProperties,
  entry: { color: "#f1f5f9" } as CSSProperties,
  timestamp: {
    color: "rgba(255,239,179,0.45)",
    fontSize: 12,
  } as CSSProperties,
  emptyTitle: {
    color: "rgba(255,239,179,0.7)",
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,
  emptyDetail: {
    color: "rgba(255,239,179,0.45)",
    fontSize: 13,
  } as CSSProperties,
  divider: "1px solid rgba(255,239,179,0.1)",
};

// ── Controls ────────────────────────────────────────────────────────────────

export const CONTROL =
  "w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition focus:border-[#013e37] focus:ring-[3px] focus:ring-[rgba(1,62,55,0.08)] focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:opacity-70";

/** Primary action — deep green with butter label. */
export const BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-[#013e37] px-4 py-2 text-sm font-semibold text-[#ffefb3] transition hover:bg-[#025a50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

export const BTN_SUBMIT =
  "inline-flex items-center rounded-lg bg-[#013e37] px-5 py-2.5 text-sm font-semibold text-[#ffefb3] transition hover:bg-[#025a50] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

export const BTN_SECONDARY =
  "inline-flex items-center rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm text-[#374151] transition hover:bg-[#f9fafb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

/** Destructive action — void, cancel, mark missed. */
export const BTN_DANGER =
  "inline-flex items-center rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2";

/** Affirmative non-primary action — approve, disburse, mark fulfilled. */
export const BTN_SUCCESS =
  "inline-flex items-center rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2";

/** Informational action — mark reconciled, mark in progress. */
export const BTN_INFO =
  "inline-flex items-center rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2";

export const BACK_LINK =
  "mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#013e37] transition hover:underline";
