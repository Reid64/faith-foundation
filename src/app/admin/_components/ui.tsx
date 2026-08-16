import Link from "next/link";
import { PlusIcon } from "./icons";
import {
  BTN_PRIMARY,
  cardStyle,
  softCardStyle,
  statCardStyle,
  tableStyle,
} from "./theme";

/**
 * Presentational primitives for the FaithProof admin UI.
 *
 * Palette (admin + login only — never the public site):
 *   page #1e293b · card/sidebar #013e37 deep green · accent #ffefb3 butter
 *   card border rgba(255,239,179,0.15) · top highlight rgba(255,239,179,0.2)
 *   success #4ade80 · warning #fbbf24 · danger #f87171 · info #60a5fa
 *
 * Colour values live in ./theme.ts. See the note there on why they are not in
 * tailwind.config.ts and why some are inline styles and others Tailwind
 * arbitrary values.
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
        <h1 className="text-2xl font-bold tracking-tight text-[#ffefb3]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[rgba(255,239,179,0.6)]">
            {description}
          </p>
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
  soft = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Lighter shadow, for dense card grids (promises, proof vault). */
  soft?: boolean;
}) {
  return (
    <section
      style={soft ? softCardStyle : cardStyle}
      className={`rounded-xl border border-[rgba(255,239,179,0.15)] ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  subtext,
  iconClassName = "text-[rgba(255,239,179,0.6)]",
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
        <h2 className="text-base font-semibold text-[#ffefb3]">{title}</h2>
        {subtext ? (
          <p className="mt-0.5 text-xs text-[rgba(255,239,179,0.55)]">
            {subtext}
          </p>
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
    <div
      style={statCardStyle}
      className="rounded-xl border border-[rgba(255,239,179,0.15)] p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[rgba(255,239,179,0.6)]">
          {label}
        </p>
        {/* Decorative only — every icon sits beside its own text label, so it
            carries no information of its own. */}
        {icon ? (
          <span aria-hidden="true" className="text-[rgba(255,239,179,0.35)]">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#ffefb3]">
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
      ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
      : "bg-[rgba(255,239,179,0.1)] text-[rgba(255,239,179,0.3)]";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${ring}`}
      >
        {icon}
      </span>
      <p className="mt-4 text-sm font-medium text-[#ffefb3]">{title}</p>
      {detail ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[rgba(255,239,179,0.6)]">
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
 * Badge tones, retuned for the deep green surface.
 *
 * The status colours are the brief's indicator set (#4ade80 / #fbbf24 /
 * #f87171 / #60a5fa) used directly as the text colour, over a 15% wash of
 * themselves. `gray` is butter-tinted rather than slate: a neutral borrowed
 * from the old blue-grey palette reads as a foreign object on deep green.
 */
const BADGE_TONES: Record<BadgeTone, string> = {
  green: "bg-[rgba(74,222,128,0.15)] text-[#4ade80] ring-[rgba(74,222,128,0.3)]",
  amber: "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] ring-[rgba(251,191,36,0.3)]",
  red: "bg-[rgba(248,113,113,0.15)] text-[#f87171] ring-[rgba(248,113,113,0.3)]",
  blue: "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] ring-[rgba(96,165,250,0.3)]",
  purple:
    "bg-[rgba(192,132,252,0.15)] text-[#c084fc] ring-[rgba(192,132,252,0.3)]",
  gray: "bg-[rgba(255,239,179,0.12)] text-[rgba(255,239,179,0.75)] ring-[rgba(255,239,179,0.25)]",
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
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-medium ring-1 ring-inset ${BADGE_TONES[tone]}`}
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
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums ring-1 ring-inset ${BADGE_TONES[tone]}`}
    >
      {count}
    </span>
  );
}

// ── Tables ──────────────────────────────────────────────────────────────────

export function TableWrap({ children }: { children: React.ReactNode }) {
  // Tables must scroll inside their own container so the page body never
  // scrolls horizontally on a narrow viewport.
  return (
    <div
      style={tableStyle}
      className="overflow-x-auto rounded-xl border border-[rgba(255,239,179,0.1)]"
    >
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        {children}
      </table>
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
      className={`whitespace-nowrap border-b border-[rgba(255,239,179,0.15)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[rgba(255,239,179,0.6)] ${
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
      className={`border-b border-[rgba(255,239,179,0.08)] px-4 py-3 text-[#f1f5f9] ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

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
    <div className="rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.12)] p-4">
      <p className="text-sm font-semibold text-[#f87171]">
        Could not load {what}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#fca5a5]">{message}</p>
      <p className="mt-2 text-xs leading-relaxed text-[rgba(255,239,179,0.7)]">
        This is a data-access failure, not an empty result. Nothing is being
        hidden from you deliberately — if this persists, check your role and the
        row level security policies for this table.
      </p>
    </div>
  );
}
