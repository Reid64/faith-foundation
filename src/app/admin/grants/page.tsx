import type { Metadata } from "next";
import Link from "next/link";
import { ClockIcon, DollarIcon, InfoIcon, TrophyIcon } from "../_components/icons";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  StatCard,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatCentsCompact, formatDateOnly } from "@/lib/faithproof/format";
import {
  ACTIVE_GRANT_STATUSES,
  GRANT_COLUMNS,
  GRANT_STATUS_LABELS,
  GRANT_STATUS_TONES,
  daysUntil,
  deadlinePhrase,
  deadlineTone,
  type Grant,
} from "@/lib/faithproof/grants";

export const metadata: Metadata = {
  title: "Grants | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function GrantsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("grants")
    .select("*")
    .order("application_deadline", { ascending: true, nullsFirst: false });

  const grants = (data ?? []) as Grant[];

  const totalAwarded = grants
    .filter((g) => g.status === "awarded")
    .reduce((n, g) => n + (g.amount_cents ?? 0), 0);
  const active = grants.filter((g) =>
    ACTIVE_GRANT_STATUSES.includes(g.status)
  ).length;
  const reportingSoon = grants.filter((g) => {
    if (g.status !== "reporting") return false;
    const d = daysUntil(g.reporting_deadline);
    return d !== null && d <= 30;
  }).length;
  const prospects = grants.filter((g) => g.status === "prospect").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Grants"
        description="Every prospect, application, award and report in one pipeline."
        action={<PrimaryLinkButton href="/admin/grants/new">Add Grant</PrimaryLinkButton>}
      />

      <div
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard
          label="Total awarded"
          value={formatCentsCompact(totalAwarded)}
          icon={<DollarIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Active grants"
          value={active}
          icon={<TrophyIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Reporting due soon"
          value={reportingSoon}
          icon={<ClockIcon className="h-4 w-4" />}
        />
        <StatCard label="Prospects" value={prospects} />
      </div>

      {error ? (
        <QueryError what="grants" message={error.message} />
      ) : grants.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No grants tracked yet"
            detail="Add the first prospect and the pipeline fills in from there."
          />
        </Panel>
      ) : (
        <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-4">
          {GRANT_COLUMNS.map((col) => {
            const items = grants.filter((g) => col.statuses.includes(g.status));
            return (
              <section
                key={col.key}
                className="w-72 shrink-0"
                aria-label={`${col.title} — ${items.length} grant${items.length === 1 ? "" : "s"}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#013e37" }}
                  >
                    {col.title}
                  </h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                    style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
                  >
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p
                      className="rounded-xl px-3 py-6 text-center text-xs"
                      style={{
                        color: "#9ca3af",
                        border: "1px dashed #d1d5db",
                      }}
                    >
                      Nothing here
                    </p>
                  ) : (
                    items.map((g) => {
                      const deadline =
                        g.status === "reporting"
                          ? g.reporting_deadline
                          : g.application_deadline;
                      const days = daysUntil(deadline);
                      return (
                        <Link
                          key={g.id}
                          href={`/admin/grants/${g.id}`}
                          className="block rounded-xl p-4 transition hover:-translate-y-0.5"
                          style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid rgba(0,0,0,0.08)",
                            boxShadow:
                              "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
                          }}
                        >
                          <p
                            className="text-sm font-semibold leading-snug"
                            style={{ color: "#111827" }}
                          >
                            {g.name}
                          </p>
                          <p className="mt-0.5 text-xs" style={{ color: "#6b7280" }}>
                            {g.funder}
                          </p>
                          {g.amount_cents ? (
                            <p
                              className="mt-2 text-sm font-semibold tabular-nums"
                              style={{ color: "#013e37" }}
                            >
                              {formatCents(g.amount_cents)}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge tone={GRANT_STATUS_TONES[g.status] ?? "gray"}>
                              {GRANT_STATUS_LABELS[g.status] ?? g.status}
                            </Badge>
                            {deadline ? (
                              <Badge tone={deadlineTone(days)}>
                                {formatDateOnly(deadline)} · {deadlinePhrase(days)}
                              </Badge>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
