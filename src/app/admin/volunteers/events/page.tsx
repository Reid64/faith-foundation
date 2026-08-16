import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
import { ClickableRow } from "../../_components/ClickableRow";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_TONES,
  formatTime,
  type VolunteerEvent,
} from "@/lib/faithproof/volunteers";
import { VolunteersNav } from "../VolunteersNav";

export const metadata: Metadata = {
  title: "Volunteer Events | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const status = searchParams?.status ?? "";

  let query = session.supabase
    .from("volunteer_events")
    .select("*", { count: "exact" })
    .order("date", { ascending: false });
  if (status) query = query.eq("status", status);

  const [{ data, error, count }, { data: shifts }] = await Promise.all([
    query,
    session.supabase.from("volunteer_shifts").select("event_id"),
  ]);

  const events = (data ?? []) as VolunteerEvent[];

  const counts = new Map<string, number>();
  for (const s of (shifts ?? []) as { event_id: string }[]) {
    counts.set(s.event_id, (counts.get(s.event_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Volunteer Events"
        description={`${count ?? 0} event${count === 1 ? "" : "s"} on record.`}
        action={
          <PrimaryLinkButton href="/admin/volunteers/events/new">
            Add Event
          </PrimaryLinkButton>
        }
      />
      <VolunteersNav />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/volunteers/events"
          className="rounded-lg px-3 py-1.5 text-sm font-medium"
          style={
            status
              ? { color: "#6b7280", border: "1px solid #d1d5db" }
              : { backgroundColor: "#013e37", color: "#ffefb3" }
          }
        >
          All
        </Link>
        {EVENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/volunteers/events?status=${s}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={
              status === s
                ? { backgroundColor: "#013e37", color: "#ffefb3" }
                : { color: "#6b7280", border: "1px solid #d1d5db" }
            }
          >
            {EVENT_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {error ? (
        <QueryError what="volunteer events" message={error.message} />
      ) : events.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No events match"
            detail="Add an event, or clear the filter above."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Event</Th>
              <Th>Time</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th>Signed up</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <ClickableRow key={e.id} href={`/admin/volunteers/events/${e.id}`}>
                <Td className="whitespace-nowrap font-medium">
                  <Link
                    href={`/admin/volunteers/events/${e.id}`}
                    className="hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    {formatDateOnly(e.date)}
                  </Link>
                </Td>
                <Td>{e.name}</Td>
                <Td muted className="whitespace-nowrap">
                  {e.start_time ? formatTime(e.start_time) : "—"}
                  {e.end_time ? ` – ${formatTime(e.end_time)}` : ""}
                </Td>
                <Td muted>{e.location || "—"}</Td>
                <Td>
                  <Badge tone={EVENT_STATUS_TONES[e.status] ?? "gray"}>
                    {EVENT_STATUS_LABELS[e.status] ?? e.status}
                  </Badge>
                </Td>
                <Td muted className="tabular-nums">
                  {counts.get(e.id) ?? 0}
                  {e.max_volunteers ? ` / ${e.max_volunteers}` : ""}
                </Td>
              </ClickableRow>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
