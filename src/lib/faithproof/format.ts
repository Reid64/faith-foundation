/**
 * Formatting helpers for the FaithProof admin UI.
 *
 * All money is stored as integer cents; nothing here ever does float maths on
 * a currency value beyond the final divide-for-display.
 */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCents(cents: number): string {
  return USD.format((cents ?? 0) / 100);
}

/** Whole-dollar form for stat tiles, where cents are noise. */
export function formatCentsCompact(cents: number): string {
  return USD_COMPACT.format((cents ?? 0) / 100);
}

/**
 * Parse a user-entered dollar amount into integer cents.
 *
 * Returns null for anything that is not a positive amount — the transactions
 * and vouchers tables both carry CHECK (amount_cents > 0), so a bad value here
 * would otherwise surface as a raw Postgres constraint error.
 */
export function dollarsToCents(input: string): number | null {
  const cleaned = (input ?? "").trim().replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  // Round rather than truncate: 19.99 * 100 is 1998.9999... in binary float.
  const cents = Math.round(value * 100);
  return cents > 0 ? cents : null;
}

/**
 * Format a DATE column (YYYY-MM-DD) without timezone drift.
 *
 * `new Date("2026-08-15")` parses as UTC midnight, which renders as 14 Aug in
 * any negative-offset timezone — including Texas. Splitting the string avoids
 * that entirely.
 */
export function formatDateOnly(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a TIMESTAMPTZ for display. */
export function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2 hours ago" / "just now" / "3 days ago". */
export function formatRelative(value: string | null): string {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2629800, "month"],
    [31557600, "year"],
  ];

  let chosen: Intl.RelativeTimeFormatUnit = "minute";
  let divisor = 60;
  for (let i = units.length - 1; i >= 0; i--) {
    if (seconds >= units[i][0]) {
      divisor = units[i][0];
      chosen = units[i][1];
      break;
    }
  }

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  return rtf.format(-Math.floor(seconds / divisor), chosen);
}

/** Turn an enum label such as `voucher_disbursement` into `Voucher disbursement`. */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** First 8 characters of a UUID, for dense tables. */
export function shortId(value: string | null): string {
  if (!value) return "—";
  return value.slice(0, 8);
}

export function truncate(value: string | null, max = 140): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
}

/** Suggested next voucher number, e.g. FAITH-2026-0007. */
export function suggestVoucherNumber(existingCount: number, year: number): string {
  return `FAITH-${year}-${String(existingCount + 1).padStart(4, "0")}`;
}
