import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../../../_components/ActionButton";
import {
  BackLink,
  DetailCard,
  DetailHeading,
  DetailList,
  Row,
} from "../../../_components/detail";
import { InfoIcon } from "../../../_components/icons";
import {
  Badge,
  EmptyState,
  Panel,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../../_components/ui";
import { ExportButton } from "../../../_components/ExportButton";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly, formatTimestamp } from "@/lib/faithproof/format";
import { contactName } from "@/lib/faithproof/crm";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_TONES,
  formatHours,
  formatTime,
  hoursOf,
  type VolunteerEvent,
  type VolunteerShift,
} from "@/lib/faithproof/volunteers";
import {
  addVolunteerToEvent,
  checkIn,
  checkOut,
  exportEventRoster,
  logHours,
  removeShift,
  setEventStatus,
} from "../../actions";
import { AddVolunteerForm, LogHoursForm } from "./RosterControls";

export const metadata: Metadata = {
  title: "Volunteer Event | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type ContactLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  organization: string | null;
  email: string | null;
};

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const [{ data: event, error }, { data: shiftRows, error: shiftError }, { data: contacts }] =
    await Promise.all([
      session.supabase
        .from("volunteer_events")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      session.supabase
        .from("volunteer_shifts")
        .select("*, contacts(id, first_name, last_name, organization, email)")
        .eq("event_id", params.id)
        .order("created_at", { ascending: true }),
      session.supabase
        .from("contacts")
        .select("id, first_name, last_name, organization")
        .eq("type", "volunteer")
        .order("last_name"),
    ]);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink href="/admin/volunteers/events" label="Back to Events" />
        <QueryError what="this event" message={error.message} />
      </div>
    );
  }
  if (!event) notFound();

  const e = event as VolunteerEvent;

  const shifts = ((shiftRows ?? []) as (VolunteerShift & {
    contacts?: ContactLite | ContactLite[] | null;
  })[]).map((s) => {
    const embed = s.contacts;
    const c = Array.isArray(embed) ? embed[0] : embed;
    return { ...s, contact: c ?? null };
  });

  const totalHours = shifts.reduce((n, s) => n + hoursOf(s.hours_logged), 0);
  const rostered = new Set(shifts.map((s) => s.contact_id));

  // Anyone already on the roster is filtered out — the UNIQUE constraint would
  // reject them anyway, and offering the name invites a pointless error.
  const available = ((contacts ?? []) as ContactLite[])
    .filter((c) => !rostered.has(c.id))
    .map((c) => ({
      id: c.id,
      label: c.organization
        ? `${contactName(c)} — ${c.organization}`
        : contactName(c),
    }));

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink href="/admin/volunteers/events" label="Back to Events" />
      <DetailHeading
        title={e.name}
        subtitle={`${formatDateOnly(e.date)}${e.location ? ` · ${e.location}` : ""}`}
      />

      <DetailCard>
        <DetailList>
          <Row
            label="Status"
            value={
              <Badge tone={EVENT_STATUS_TONES[e.status] ?? "gray"}>
                {EVENT_STATUS_LABELS[e.status] ?? e.status}
              </Badge>
            }
          />
          <Row label="Date" value={formatDateOnly(e.date)} />
          <Row
            label="Time"
            value={
              e.start_time
                ? `${formatTime(e.start_time)}${e.end_time ? ` – ${formatTime(e.end_time)}` : ""}`
                : "—"
            }
          />
          <Row label="Location" value={e.location || "—"} />
          <Row
            label="Capacity"
            value={
              e.max_volunteers
                ? `${shifts.length} of ${e.max_volunteers} filled`
                : `${shifts.length} rostered — no cap set`
            }
          />
          <Row label="Hours logged" value={formatHours(totalHours)} />
        </DetailList>

        {e.description ? (
          <p
            className="mt-6 whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: "#374151" }}
          >
            {e.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {e.status === "scheduled" ? (
            <>
              <ActionButton
                action={setEventStatus.bind(null, e.id, "completed")}
                label="Mark Complete"
                variant="success"
              />
              <ActionButton
                action={setEventStatus.bind(null, e.id, "cancelled")}
                label="Cancel Event"
                variant="danger"
                confirm="Cancel this event? The roster and any logged hours are kept."
              />
            </>
          ) : (
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              This event is {EVENT_STATUS_LABELS[e.status]?.toLowerCase() ?? e.status}.
              Hours can still be corrected below.
            </p>
          )}
          <ExportButton
            label="Export Roster CSV"
            run={exportEventRoster.bind(null, e.id)}
          />
        </div>
      </DetailCard>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}>
            Roster
          </h2>
          <AddVolunteerForm
            action={addVolunteerToEvent.bind(null, e.id)}
            volunteers={available}
          />
        </div>

        {shiftError ? (
          <QueryError what="this roster" message={shiftError.message} />
        ) : shifts.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="Nobody rostered yet"
              detail="Add volunteers and check them in on the day."
            />
          </Panel>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Volunteer</Th>
                <Th>Checked in</Th>
                <Th>Checked out</Th>
                <Th>Hours</Th>
                <Th>Notes</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <Td className="font-medium">
                    {s.contact ? (
                      <Link
                        href={`/admin/crm/contacts/${s.contact_id}`}
                        className="hover:underline"
                        style={{ color: "#013e37" }}
                      >
                        {contactName(s.contact)}
                      </Link>
                    ) : (
                      "(contact removed)"
                    )}
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {s.checked_in_at ? formatTimestamp(s.checked_in_at) : "—"}
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {s.checked_out_at ? formatTimestamp(s.checked_out_at) : "—"}
                  </Td>
                  <Td className="tabular-nums">
                    {s.hours_logged === null || s.hours_logged === undefined
                      ? "—"
                      : formatHours(hoursOf(s.hours_logged))}
                  </Td>
                  <Td muted>{s.notes || "—"}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-3">
                      {!s.checked_in_at ? (
                        <ActionButton
                          action={checkIn.bind(null, e.id, s.id)}
                          label="Check In"
                          variant="info"
                        />
                      ) : !s.checked_out_at ? (
                        <ActionButton
                          action={checkOut.bind(null, e.id, s.id)}
                          label="Check Out"
                          variant="success"
                        />
                      ) : null}
                      <LogHoursForm
                        action={logHours.bind(null, e.id, s.id)}
                        hours={
                          s.hours_logged === null || s.hours_logged === undefined
                            ? null
                            : hoursOf(s.hours_logged)
                        }
                        notes={s.notes}
                      />
                      <ActionButton
                        action={removeShift.bind(null, e.id, s.id)}
                        label="Remove"
                        variant="danger"
                        confirm="Remove this volunteer from the roster? Their logged hours for this event go with them."
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </div>
    </div>
  );
}
