import type { Metadata } from "next";
import { InfoIcon } from "../../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  QueryError,
  StatCard,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { ExportButton } from "../../_components/ExportButton";
import { getSession } from "@/lib/faithproof/session";
import { formatHours } from "@/lib/faithproof/volunteers";
import { exportHoursReport, hoursSummary } from "../actions";
import { VolunteersNav } from "../VolunteersNav";

export const metadata: Metadata = {
  title: "Volunteer Hours | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function currentMonth(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function HoursPage({
  searchParams,
}: {
  searchParams?: { month?: string; q?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const month = /^\d{4}-\d{2}$/.test(searchParams?.month ?? "")
    ? (searchParams!.month as string)
    : currentMonth();
  const q = (searchParams?.q ?? "").trim().toLowerCase();

  const summary = await hoursSummary(month);

  if ("error" in summary) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Volunteer Hours" />
        <VolunteersNav />
        <QueryError what="the hours report" message={summary.error} />
      </div>
    );
  }

  const rows = q
    ? summary.rows.filter((r) => r.volunteer.toLowerCase().includes(q))
    : summary.rows;

  const shownHours =
    Math.round(rows.reduce((n, r) => n + r.hours_this_month, 0) * 100) / 100;
  const activeCount = rows.filter((r) => r.events_attended > 0).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Volunteer Hours"
        description={`Hours are credited to the month the event took place, not the day they were entered.`}
        action={
          <ExportButton
            label="Export CSV"
            run={exportHoursReport.bind(null, month)}
          />
        }
      />
      <VolunteersNav />

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
        }}
      >
        <div className="min-w-[10rem]">
          <label
            htmlFor="month"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Month
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={month}
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor="q"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Volunteer
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams?.q ?? ""}
            placeholder="Name"
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
        >
          Filter
        </button>
      </form>

      <div
        className="mb-6 grid gap-4 sm:grid-cols-3"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard label={`Hours in ${monthLabel(month)}`} value={formatHours(shownHours)} />
        <StatCard label="Volunteers active this month" value={activeCount} />
        <StatCard label="Volunteers with any hours" value={rows.length} />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No hours recorded"
            detail="Hours appear here once they are logged against a shift."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Volunteer</Th>
              <Th>Email</Th>
              <Th>Events this month</Th>
              <Th>Hours this month</Th>
              <Th>Hours all time</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.contact_id}>
                <Td className="font-medium">{r.volunteer}</Td>
                <Td muted>{r.email || "—"}</Td>
                <Td muted className="tabular-nums">
                  {r.events_attended}
                </Td>
                <Td className="tabular-nums">{formatHours(r.hours_this_month)}</Td>
                <Td muted className="tabular-nums">
                  {formatHours(r.hours_all_time)}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
