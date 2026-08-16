import type { CSSProperties } from "react";

/**
 * FaithProof admin colour system — butter + deep green.
 *
 * SCOPE: these values are used ONLY under src/app/admin/ and src/app/login/.
 * They are deliberately NOT added to tailwind.config.ts, which is shared with
 * the public marketing site — putting an internal tool's palette into that
 * namespace is how a colour eventually leaks onto a donor-facing page.
 *
 * WHY BOTH TAILWIND STRINGS AND STYLE OBJECTS:
 * gradients, layered box-shadows and the card top-edge highlight are awkward or
 * ambiguous as Tailwind arbitrary values (comma-separated shadows in particular),
 * so those are inline `style` objects. Flat rgba colours stay as Tailwind
 * arbitrary values because `hover:` and `focus:` variants are impossible inline,
 * and the hover/focus states are part of the spec.
 *
 * The literal class strings below are what Tailwind's JIT scanner sees. They
 * must stay literal — never build one by interpolation, or the class will not
 * be generated.
 */

// ── Raw palette ─────────────────────────────────────────────────────────────

export const BUTTER = "#ffefb3";
export const BUTTER_HOVER = "#fff5cc";
export const DEEP_GREEN = "#013e37";
export const DEEP_GREEN_DARK = "#012e28";
export const PAGE_BG = "#1e293b";
export const TEXT_PRIMARY = "#f1f5f9";

export const SUCCESS = "#4ade80";
export const WARNING = "#fbbf24";
export const DANGER = "#f87171";
export const INFO = "#60a5fa";

// ── Surfaces (inline styles) ────────────────────────────────────────────────

/** Card / panel: deep green with a butter top-edge highlight and depth shadow. */
export const cardStyle: CSSProperties = {
  backgroundColor: DEEP_GREEN,
  borderTop: "1px solid rgba(255,239,179,0.2)",
  boxShadow:
    "0 4px 24px rgba(1,62,55,0.4), 0 1px 4px rgba(0,0,0,0.3)",
};

/** Stat card: same, on a gradient and with a slightly deeper shadow. */
export const statCardStyle: CSSProperties = {
  backgroundImage: `linear-gradient(135deg, ${DEEP_GREEN} 0%, ${DEEP_GREEN_DARK} 100%)`,
  borderTop: "1px solid rgba(255,239,179,0.2)",
  boxShadow:
    "0 4px 24px rgba(1,62,55,0.5), 0 1px 4px rgba(0,0,0,0.4)",
};

/** Promise / proof-vault cards: lighter shadow, same surface. */
export const softCardStyle: CSSProperties = {
  backgroundColor: DEEP_GREEN,
  borderTop: "1px solid rgba(255,239,179,0.2)",
  boxShadow: "0 4px 16px rgba(1,62,55,0.4)",
};

/** Tables share the card surface but sit flush, so no top highlight. */
export const tableStyle: CSSProperties = {
  backgroundColor: DEEP_GREEN,
  boxShadow: "0 4px 24px rgba(1,62,55,0.4)",
};

// ── Text (Tailwind literals) ────────────────────────────────────────────────

export const TEXT_BUTTER = "text-[#ffefb3]";
export const TEXT_BUTTER_80 = "text-[rgba(255,239,179,0.8)]";
export const TEXT_BUTTER_70 = "text-[rgba(255,239,179,0.7)]";
export const TEXT_BUTTER_60 = "text-[rgba(255,239,179,0.6)]";
export const TEXT_BUTTER_55 = "text-[rgba(255,239,179,0.55)]";
export const TEXT_BUTTER_50 = "text-[rgba(255,239,179,0.5)]";
export const TEXT_BODY = "text-[#f1f5f9]";

// ── Borders (Tailwind literals) ─────────────────────────────────────────────

export const BORDER_BUTTER_20 = "border-[rgba(255,239,179,0.2)]";
export const BORDER_BUTTER_15 = "border-[rgba(255,239,179,0.15)]";
export const BORDER_BUTTER_10 = "border-[rgba(255,239,179,0.1)]";
export const BORDER_BUTTER_08 = "border-[rgba(255,239,179,0.08)]";

/** Row hover wash used by every table. */
export const ROW_HOVER = "hover:bg-[rgba(255,239,179,0.05)]";

// ── Controls ────────────────────────────────────────────────────────────────

/**
 * Shared input/select/textarea styling. Focus moves the border to solid butter
 * and drops the default outline, per the brief.
 */
export const CONTROL =
  "w-full rounded-lg border border-[rgba(255,239,179,0.2)] bg-[rgba(1,62,55,0.6)] px-3 py-2 text-sm text-[#f1f5f9] placeholder-[rgba(255,239,179,0.35)] outline-none transition focus:border-[#ffefb3] focus:ring-1 focus:ring-[#ffefb3] disabled:opacity-60";

/** Primary action: butter fill, deep green label. */
export const BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-[#ffefb3] px-4 py-2 text-sm font-semibold text-[#013e37] transition hover:bg-[#fff5cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffefb3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]";

/** Same, sized for form submits, and offset against the deep green card. */
export const BTN_SUBMIT =
  "inline-flex items-center rounded-lg bg-[#ffefb3] px-5 py-2.5 text-sm font-semibold text-[#013e37] transition hover:bg-[#fff5cc] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffefb3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#013e37]";

/** Secondary/cancel: outlined, never a filled competitor to the primary. */
export const BTN_SECONDARY =
  "inline-flex items-center rounded-lg border border-[rgba(255,239,179,0.3)] px-4 py-2 text-sm text-[rgba(255,239,179,0.7)] transition hover:border-[#ffefb3] hover:text-[#ffefb3]";

/** Back links above form headings. */
export const BACK_LINK =
  "mb-6 inline-flex items-center gap-2 text-sm text-[rgba(255,239,179,0.7)] transition hover:text-[#ffefb3]";
