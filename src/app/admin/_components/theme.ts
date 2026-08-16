import type { CSSProperties } from "react";

/**
 * FaithProof admin design system — light dashboard.
 *
 * The page is warm cream, cards are white and float on it, and deep green is an
 * ACCENT: it appears only on the sidebar, table header rows, primary buttons,
 * stat-card top borders, headings and numerals. Nothing else is filled green.
 *
 * SCOPE: used ONLY under src/app/admin/ and src/app/login/. Deliberately NOT
 * added to tailwind.config.ts, which the public marketing site shares — an
 * internal tool's tokens in that namespace is how a colour eventually leaks
 * onto a donor-facing page.
 *
 * Inline `style` objects carry shadows and composite borders (Tailwind cannot
 * express a two-layer box-shadow cleanly). Flat colours stay as Tailwind
 * arbitrary values, because `hover:` and `focus:` variants cannot be written
 * inline and those states are part of the spec.
 *
 * The class strings below must stay literal — Tailwind's scanner reads the
 * source text, so a class built by interpolation is never generated.
 */

// ── Palette ─────────────────────────────────────────────────────────────────

export const PAGE_BG = "#f8f7f4"; // warm cream — the dominant tone
export const SURFACE = "#ffffff";
export const DEEP_GREEN = "#013e37";
export const DEEP_GREEN_HOVER = "#025a50";
export const BUTTER = "#ffefb3";

/** Neutral text ramp. */
export const INK = "#111827"; // input text
export const BODY = "#374151"; // table cells, labels, activity text
export const SECONDARY = "#6b7280"; // subtext, secondary cells
export const MUTED = "#9ca3af"; // timestamps, dates, empty-state text
export const FAINT = "#d1d5db"; // empty-state icons, input borders

/** Panel accent rails. */
export const WARNING = "#f59e0b";
export const INFO = "#3b82f6";

// ── Surfaces (inline styles) ────────────────────────────────────────────────

/** The floating white card. The shadow is what makes it read as elevated. */
export const cardStyle: CSSProperties = {
  backgroundColor: SURFACE,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(1,62,55,0.08)",
};

/**
 * Deeper shadow for cards that respond to the pointer.
 *
 * Defined but currently applied to nothing: no card in the admin UI is
 * clickable yet. Adding a hover lift to a card that cannot be clicked would
 * promise an interaction that does not exist. Phase 4 introduces row and card
 * actions — apply it there.
 */
export const cardHoverStyle: CSSProperties = {
  boxShadow: "0 4px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.12)",
};

/** Stat card: white, with a deep green rail across the top. */
export const statCardStyle: CSSProperties = {
  backgroundColor: SURFACE,
  border: "1px solid rgba(0,0,0,0.06)",
  borderTop: `3px solid ${DEEP_GREEN}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(1,62,55,0.08)",
};

/** Table wrapper — flatter shadow, since the header row supplies the weight. */
export const tableStyle: CSSProperties = {
  backgroundColor: SURFACE,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

/** Panel with a coloured left rail (amber = attention, blue = activity). */
export const panelStyle = (rail?: string): CSSProperties => ({
  backgroundColor: SURFACE,
  border: "1px solid rgba(0,0,0,0.06)",
  ...(rail ? { borderLeft: `3px solid ${rail}` } : null),
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(1,62,55,0.08)",
});

/** Login card — larger radius and a deeper lift than a dashboard card. */
export const loginCardStyle: CSSProperties = {
  backgroundColor: SURFACE,
  borderRadius: 16,
  boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(1,62,55,0.1)",
};

// ── Controls ────────────────────────────────────────────────────────────────

/**
 * Input / select / textarea.
 *
 * Focus swaps the border to deep green and adds the 3px soft ring. `ring-offset-0`
 * keeps the ring hugging the control rather than punching a white gap through
 * it on cream.
 */
export const CONTROL =
  "w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition focus:border-[#013e37] focus:ring-[3px] focus:ring-[rgba(1,62,55,0.08)] focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:opacity-70";

/** Primary action — the only filled green control. */
export const BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-[#013e37] px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition hover:bg-[#025a50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

/** Same, sized for form submits. */
export const BTN_SUBMIT =
  "inline-flex items-center rounded-lg bg-[#013e37] px-5 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition hover:bg-[#025a50] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

/** Secondary / cancel — white with a neutral border, never a green competitor. */
export const BTN_SECONDARY =
  "inline-flex items-center rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm text-[#374151] transition hover:bg-[#f9fafb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2";

/** Back links above form headings. */
export const BACK_LINK =
  "mb-6 inline-flex items-center gap-2 text-sm text-[#6b7280] transition hover:text-[#013e37]";
