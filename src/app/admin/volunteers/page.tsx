import type { Metadata } from "next";
import Link from "next/link";
import { ClockIcon, HandIcon, InfoIcon, UsersIcon } from "../_components/icons";
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
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_TONES,
  formatHours,
  formatTime,
  hoursOf,
  type VolunteerEvent,
} from "@/lib/faithproof/volunteers";
import { VolunteersNav } from "./VolunteersNav";

export const metadata: Metadata = {
  title: "Volunteers | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISO(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export default async function VolunteersPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;

  const today = todayISO();
  const monthStart = `${today.slice(0, 7)}-01`;

  const [volunteers, upcoming, skills, monthShifts, allShifts] = await Promise.all([
    sb
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("type", "volunteer"),
    sb
      .from("volunteer_events")
      .select("*")
      .gte("date", today)
      .eq("status", "scheduled")
      .order("date", { ascending: true })
      .limit(5),
    sb.from("volunteer_skills").select("skill"),
    // Hours this month are attributed by the EVENT's date, so hours entered a
    // week later still count in the month the work happened.
    sb
      .from("volunteer_shifts")
      .select("hours_logged, volunteer_events!inner(date)")
      .gte("volunteer_events.date", monthStart)
      .lte("volunteer_events.date", today),
    sb.from("volunteer_shifts").select("event_id"),
  ]);

  const events = (upcoming.data ?? []) as VolunteerEvent[];

  const monthHours = (
    (monthShifts.data ?? []) as { hours_logged: string | number | null }[]
  ).reduce((n, s) => n + hoursOf(s.hours_logged), 0);

  const distinctSkills = new Set(
    ((skills.data ?? []) as { skill: string }[]).map((s) => s.skill.toLowerCase())
  );

  // Signup counts per upcoming event, tallied from one query rather than one
  // per event.
  const counts = new Map<string, number>();
  for (const s of (allShifts.data ?? []) as { event_id: string }[]) {
    counts.set(s.event_id, (counts.get(s.event_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Volunteers"
        description="Events, rosters and hours — the record behind every volunteer impact figure."
        action={
          <PrimaryLinkButton href="/admin/volunteers/events/new">
            Add Event
          </PrimaryLinkButton>
        }
      />
      <VolunteersNav />

      <div
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard
          label="Total volunteers"
          value={volunteers.error ? "—" : (volunteers.count ?? 0)}
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Hours this month"
          value={monthShifts.error ? "—" : formatHours(monthHours)}
          icon={<ClockIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Upcoming events"
          value={upcoming.error ? "—" : events.length}
          icon={<HandIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Distinct skills"
          value={skills.error ? "—" : distinctSkills.size}
        />
      </div>

      <Panel className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
            Upcoming Events
          </h2>
          <Link
            href="/admin/volunteers/events"
            className="text-sm font-semibold"
            style={{ color: "#013e37" }}
          >
            All events →
          </Link>
        </div>

        {upcoming.error ? (
          <QueryError what="upcoming events" message={upcoming.error.message} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No events scheduled"
            detail="Add one and volunteers can be rostered onto it."
          />
        ) : (
          <ul className="divide-y divide-[#f0f0ef]">
            {events.map((e) => {
              const signed = counts.get(e.id) ?? 0;
              return (
                <li key={e.id} className="py-3 first:pt-0">
                  <Link
                    href={`/admin/volunteers/events/${e.id}`}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <span>
                      <span
                        className="block text-sm font-medium"
                        style={{ color: "#111827" }}
                      >
                        {e.name}
                      </span>
                      <span className="block text-xs" style={{ color: "#6b7280" }}>
                        {formatDateOnly(e.date)}
                        {e.start_time ? ` · ${formatTime(e.start_time)}` : ""}
                        {e.location ? ` · ${e.location}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className="text-sm tabular-nums"
                        style={{ color: "#374151" }}
                      >
                        {signed}
                        {e.max_volunteers ? ` / ${e.max_volunteers}` : ""} signed up
                      </span>
                      <Badge tone={EVENT_STATUS_TONES[e.status] ?? "gray"}>
                        {EVENT_STATUS_LABELS[e.status] ?? e.status}
                      </Badge>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
