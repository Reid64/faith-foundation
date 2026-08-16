import Link from "next/link";
import { PlusIcon } from "./icons";
import {
  BTN_PRIMARY,
  cardStyle,
  panelStyle,
  statCardStyle,
  tableStyle,
} from "./theme";

/**
 * Presentational primitives for the FaithProof admin UI.
 *
 * Light dashboard: warm cream page (#f8f7f4), white floating cards, deep green
 * (#013e37) reserved for the sidebar, table header rows, primary buttons,
 * headings and numerals. Badges are light pastels.
 *
 * Colour values live in ./theme.ts.
 */

// ── Page header ─────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#013e37]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function PrimaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={BTN_PRIMARY}>
      <PlusIcon className="h-4 w-4" />
      {children}
    </Link>
  );
}

// ── Panels and cards ────────────────────────────────────────────────────────

export function Panel({
  children,
  className = "",
  rail,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional coloured left rail, e.g. the amber/blue dashboard panels. */
  rail?: string;
}) {
  return (
    <section
      style={rail ? panelStyle(rail) : cardStyle}
      className={`rounded-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  subtext,
  iconClassName = "text-[#9ca3af]",
}: {
  icon: React.ReactNode;
  title: string;
  subtext?: string;
  iconClassName?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className={`mt-0.5 shrink-0 ${iconClassName}`}>{icon}</span>
      <div>
        <h2 className="text-base font-semibold text-[#013e37]">{title}</h2>
        {subtext ? (
          <p className="mt-0.5 text-[13px] text-[#6b7280]">{subtext}</p>
        ) : null}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div style={statCardStyle} className="rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">
          {label}
        </p>
        {/* Decorative only — every icon sits beside its own text label, so it
            carries no information of its own. */}
        {icon ? (
          <span
            aria-hidden="true"
            className="text-[#013e37]"
            style={{ opacity: 0.25 }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[28px] font-bold leading-tight tabular-nums text-[#013e37]">
        {value}
      </p>
    </div>
  );
}

// ── Empty states ────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  detail,
  tone = "muted",
}: {
  icon: React.ReactNode;
  title: string;
  detail?: string;
  tone?: "muted" | "success";
}) {
  const ring =
    tone === "success"
      ? "bg-[#f0fdf4] text-[#16a34a]"
      : "bg-[#f9fafb] text-[#d1d5db]";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${ring}`}
      >
        {icon}
      </span>
      <p className="mt-4 text-sm font-medium text-[#6b7280]">{title}</p>
      {detail ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#9ca3af]">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

// ── Badges ──────────────────────────────────────────────────────────────────

export type BadgeTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "purple"
  | "gray";

/**
 * Light pastel badge system — a tinted fill, a saturated text colour and a
 * matching 1px border. No dark badges anywhere.
 *
 * These six tones cover every status and type map in badges.tsx:
 *   green  confirmed · fulfilled · donation · disbursed · verified
 *   amber  pending · in_progress
 *   red    missed · expense · cancelled
 *   blue   reconciled · active · grant · approved
 *   purple voucher_disbursement
 *   gray   voided · revised · operational · expired · unverified
 */
const BADGE_TONES: Record<BadgeTone, string> = {
  green: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
  amber: "bg-[#fffbeb] text-[#d97706] border-[#fde68a]",
  red: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
  blue: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
  purple: "bg-[#faf5ff] text-[#7c3aed] border-[#e9d5ff]",
  gray: "bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Count pill used in the Requires Attention panel. */
export function CountBadge({
  tone,
  count,
}: {
  tone: BadgeTone;
  count: number;
}) {
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-xs font-bold tabular-nums ${BADGE_TONES[tone]}`}
    >
      {count}
    </span>
  );
}

// ── Tables ──────────────────────────────────────────────────────────────────

export function TableWrap({ children }: { children: React.ReactNode }) {
  // The table scrolls inside its own container so the page body never scrolls
  // horizontally. `border-separate` (not collapse) is required for the header
  // cells' rounded top corners to render at all — border-collapse discards
  // border-radius on cells.
  return (
    <div style={tableStyle} className="overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-separate border-spacing-0 text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap bg-[#013e37] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#ffefb3] first:rounded-tl-xl last:rounded-tr-xl ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-[#f3f4f6] px-4 py-3 text-sm text-[#374151] ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Shared <tr> styling: zebra striping plus the green-tinted hover wash. */
export const TABLE_ROW =
  "bg-white transition-colors even:bg-[#f8f7f4] hover:bg-[#f0fdf4]";

// ── Data-access failure notice ──────────────────────────────────────────────

/**
 * Rendered when a Supabase query returns an error.
 *
 * This exists so a page can never present an RLS denial or a dropped
 * connection as "no records". An empty table and a forbidden table look
 * identical once you discard the error, and on an accountability product that
 * difference matters: "there are no unconfirmed transactions" and "you are not
 * allowed to see the unconfirmed transactions" must never render the same way.
 */
export function QueryError({
  message,
  what,
}: {
  message: string;
  what: string;
}) {
  return (
    <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
      <p className="text-sm font-semibold text-[#dc2626]">
        Could not load {what}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#b91c1c]">{message}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
        This is a data-access failure, not an empty result. Nothing is being
        hidden from you deliberately — if this persists, check your role and the
        row level security policies for this table.
      </p>
    </div>
  );
}
