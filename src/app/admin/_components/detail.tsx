import Link from "next/link";
import { ArrowLeftIcon } from "./icons";
import { cardStyle } from "./theme";

/**
 * Shared building blocks for the `[id]` detail pages.
 *
 * Every detail page is the same shape: a back link, a green heading, a white
 * card of label/value pairs, and a row of status-transition buttons whose
 * availability depends on the record's current status.
 */

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition hover:underline"
      style={{ color: "#013e37" }}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function DetailHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1
        className="tracking-tight"
        style={{ color: "#013e37", fontSize: 24, fontWeight: 700 }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={cardStyle} className="p-8">
      {children}
    </div>
  );
}

/** A label/value pair. `value` may be a badge or any node. */
export function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid #f0f0ef" }}
    >
      <dt
        style={{
          color: "#6b7280",
          fontSize: 13,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </dt>
      <dd
        className="text-right"
        style={{ color: "#374151", fontSize: 14 }}
      >
        {value}
      </dd>
    </div>
  );
}

export function DetailList({ children }: { children: React.ReactNode }) {
  return <dl>{children}</dl>;
}

/** The action button row beneath a detail card. */
export function ActionRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>;
}

export function NoActions({ reason }: { reason: string }) {
  return (
    <p className="mt-6 text-sm" style={{ color: "#9ca3af" }}>
      No actions available — {reason}.
    </p>
  );
}
