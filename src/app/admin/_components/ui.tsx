import Link from "next/link";
import { PlusIcon } from "./icons";

/**
 * Presentational primitives for the FaithProof admin UI.
 *
 * The admin palette is expressed as arbitrary Tailwind values (`bg-[#1e293b]`)
 * ON PURPOSE. Adding these tokens to tailwind.config.ts would put an internal
 * tool's colours into the same namespace the public marketing site draws from,
 * where a future `text-slate` or `bg-card` could quietly leak onto a donor-
 * facing page. Admin colours stay local to admin files.
 *
 * Palette: sidebar #0f1623 · main #111827 · card #1e293b · border #2d3748
 * text #f1f5f9 / #94a3b8 / #475569 · green #4A7C59 · success #22c55e
 * warning #f59e0b · danger #ef4444 · info #3b82f6
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#f1f5f9]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[#94a3b8]">{description}</p>
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
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-[#4A7C59] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d6b4a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7C59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
    >
      <PlusIcon className="h-4 w-4" />
      {children}
    </Link>
  );
}

// ── Panels and cards ────────────────────────────────────────────────────────

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[#2d3748] bg-[#1e293b] ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  subtext,
  iconClassName = "text-[#94a3b8]",
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
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtext ? (
          <p className="mt-0.5 text-xs text-[#94a3b8]">{subtext}</p>
        ) : null}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "text-[#94a3b8]",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[#2d3748] bg-[#1e293b] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.7rem] font-medium uppercase tracking-wider text-[#94a3b8]">
          {label}
        </p>
        {icon ? <span className={accent}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[#f1f5f9]">
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
      ? "bg-[#22c55e]/10 text-[#22c55e]"
      : "bg-[#3b82f6]/10 text-[#3b82f6]";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${ring}`}
      >
        {icon}
      </span>
      <p className="mt-4 text-sm font-medium text-[#f1f5f9]">{title}</p>
      {detail ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#94a3b8]">
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

const BADGE_TONES: Record<BadgeTone, string> = {
  green: "bg-[#22c55e]/12 text-[#4ade80] ring-[#22c55e]/25",
  amber: "bg-[#f59e0b]/12 text-[#fbbf24] ring-[#f59e0b]/25",
  red: "bg-[#ef4444]/12 text-[#f87171] ring-[#ef4444]/25",
  blue: "bg-[#3b82f6]/12 text-[#60a5fa] ring-[#3b82f6]/25",
  purple: "bg-[#a855f7]/12 text-[#c084fc] ring-[#a855f7]/25",
  gray: "bg-[#475569]/20 text-[#94a3b8] ring-[#475569]/35",
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
    <div className="overflow-x-auto rounded-xl border border-[#2d3748] bg-[#1e293b]">
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
      className={`whitespace-nowrap border-b border-[#2d3748] px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wider text-[#94a3b8] ${
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
      className={`border-b border-[#2d3748]/60 px-4 py-3 text-[#f1f5f9] ${
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
    <div className="rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-4">
      <p className="text-sm font-semibold text-[#f87171]">
        Could not load {what}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#fca5a5]">{message}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
        This is a data-access failure, not an empty result. Nothing is being
        hidden from you deliberately — if this persists, check your role and the
        row level security policies for this table.
      </p>
    </div>
  );
}
