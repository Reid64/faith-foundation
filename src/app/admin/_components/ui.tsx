import Link from "next/link";
import { PlusIcon } from "./icons";
import {
  BTN_PRIMARY,
  cardStyle,
  darkPanelStyle,
  onDark,
  statCardStyle,
  tableStyle,
} from "./theme";

/**
 * Presentational primitives for the FaithProof admin UI.
 *
 * Surfaces: page #f0f0ef · stat cards #ffefb3 butter · the two Command Center
 * panels #013e37 deep green · everything else white. Colour values live in
 * ./theme.ts.
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
        <h1
          className="tracking-tight"
          style={{ color: "#013e37", fontSize: 24, fontWeight: 700 }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
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

/** White card — tables, forms, list pages, detail pages. */
export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section style={cardStyle} className={className}>
      {children}
    </section>
  );
}

/** Deep green panel — the two Command Center panels only. */
export function DarkPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section style={darkPanelStyle} className={className}>
      {children}
    </section>
  );
}

export function PanelHeader({
  icon,
  title,
  subtext,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtext?: string;
  iconColor?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>
        {icon}
      </span>
      <div>
        <h2 style={onDark.heading}>{title}</h2>
        {subtext ? (
          <p className="mt-0.5" style={onDark.subtext}>
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
    <div style={statCardStyle}>
      <div className="flex items-center justify-between gap-2">
        <p
          style={{
            color: "#013e37",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </p>
        {/* Decorative only — each icon sits beside its own text label. */}
        {icon ? (
          <span aria-hidden="true" style={{ color: "#013e37", opacity: 0.3 }}>
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className="mt-2 tabular-nums"
        style={{ color: "#013e37", fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}
      >
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
  onDarkPanel = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail?: string;
  tone?: "muted" | "success";
  /** Set on the two deep green Command Center panels. */
  onDarkPanel?: boolean;
}) {
  const iconColor = onDarkPanel
    ? tone === "success"
      ? "rgba(255,239,179,0.4)"
      : "rgba(255,239,179,0.3)"
    : tone === "success"
      ? "#16a34a"
      : "#d1d5db";

  const bubble = onDarkPanel
    ? "rgba(255,239,179,0.08)"
    : tone === "success"
      ? "#f0fdf4"
      : "#f9fafb";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: bubble, color: iconColor }}
      >
        {icon}
      </span>
      <p
        className="mt-4"
        style={
          onDarkPanel
            ? onDark.emptyTitle
            : { color: "#6b7280", fontSize: 14, fontWeight: 500 }
        }
      >
        {title}
      </p>
      {detail ? (
        <p
          className="mt-1 max-w-sm leading-relaxed"
          style={
            onDarkPanel
              ? onDark.emptyDetail
              : { color: "#9ca3af", fontSize: 13 }
          }
        >
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

/** Light pastel badge system — a tinted fill, saturated text, matching border. */
const BADGE_TONES: Record<
  BadgeTone,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  green: { backgroundColor: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" },
  amber: { backgroundColor: "#fffbeb", color: "#d97706", borderColor: "#fde68a" },
  red: { backgroundColor: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
  blue: { backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" },
  purple: { backgroundColor: "#faf5ff", color: "#7c3aed", borderColor: "#e9d5ff" },
  gray: { backgroundColor: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" },
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
      className="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ ...BADGE_TONES[tone], borderWidth: 1, borderStyle: "solid" }}
    >
      {children}
    </span>
  );
}

/**
 * Count pill for the Requires Attention panel.
 *
 * This one sits on the DEEP GREEN panel, so it uses the darker translucent
 * variants from the spec rather than the light pastels — a #fef2f2 pill on
 * #013e37 would glare.
 */
const DARK_COUNT_TONES: Record<string, React.CSSProperties> = {
  red: {
    backgroundColor: "rgba(248,113,113,0.2)",
    color: "#fca5a5",
    border: "1px solid rgba(248,113,113,0.3)",
  },
  amber: {
    backgroundColor: "rgba(251,191,36,0.2)",
    color: "#fde68a",
    border: "1px solid rgba(251,191,36,0.3)",
  },
};

export function CountBadge({
  tone,
  count,
}: {
  tone: "red" | "amber";
  count: number;
}) {
  return (
    <span
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums"
      style={DARK_COUNT_TONES[tone]}
    >
      {count}
    </span>
  );
}

// ── Tables ──────────────────────────────────────────────────────────────────

export function TableWrap({ children }: { children: React.ReactNode }) {
  // `border-separate` (not collapse) is required for the header cells' rounded
  // top corners to render — border-collapse discards border-radius on cells.
  return (
    <div style={tableStyle} className="overflow-hidden">
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
      className={`whitespace-nowrap first:rounded-tl-[11px] last:rounded-tr-[11px] ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{
        backgroundColor: "#013e37",
        color: "#ffefb3",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "12px 16px",
      }}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
  muted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  /** Secondary columns (date, fund, reference) render one step down the ramp. */
  muted?: boolean;
}) {
  return (
    <td
      className={`${align === "right" ? "text-right" : "text-left"} ${className}`}
      style={{
        borderBottom: "1px solid #f0f0ef",
        padding: "12px 16px",
        color: muted ? "#6b7280" : "#374151",
        fontSize: 14,
      }}
    >
      {children}
    </td>
  );
}

/** Shared <tr> styling: zebra striping plus the green-tinted hover wash. */
export const TABLE_ROW =
  "bg-white transition-colors odd:bg-white even:bg-[#f8f8f7] hover:bg-[#f0fdf4]";

/** Same, for rows that navigate on click. */
export const TABLE_ROW_LINK = `${TABLE_ROW} cursor-pointer`;

// ── Data-access failure notice ──────────────────────────────────────────────

/**
 * Rendered when a Supabase query returns an error, so a page can never present
 * an RLS denial or a dropped connection as "no records". An empty table and a
 * forbidden table look identical once you discard the error, and on an
 * accountability product that difference matters.
 */
export function QueryError({
  message,
  what,
}: {
  message: string;
  what: string;
}) {
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 12,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
        Could not load {what}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "#b91c1c" }}>
        {message}
      </p>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "#6b7280" }}>
        This is a data-access failure, not an empty result. Nothing is being
        hidden from you deliberately — if this persists, check your role and the
        row level security policies for this table.
      </p>
    </div>
  );
}
