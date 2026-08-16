"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { toCsv, type ExportResult } from "@/lib/faithproof/csv";
import { contactName } from "@/lib/faithproof/crm";
import {
  EVENT_STATUSES,
  hoursBetween,
  hoursOf,
  type EventStatus,
  type VolunteerShift,
} from "@/lib/faithproof/volunteers";

type Result = { error?: string; ok?: boolean; id?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v ? v : null);

export async function createVolunteerEvent(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const name = str(formData, "name");
  const date = str(formData, "date");
  const status = str(formData, "status") || "scheduled";
  const maxRaw = str(formData, "max_volunteers");

  if (!name) return { error: "Enter the event name." };
  if (!date) return { error: "Enter the event date." };
  if (!EVENT_STATUSES.includes(status as EventStatus)) {
    return { error: "Choose a valid status." };
  }

  let max_volunteers: number | null = null;
  if (maxRaw) {
    const n = Number(maxRaw);
    if (!Number.isInteger(n) || n <= 0) {
      return { error: "Maximum volunteers must be a whole number above zero, or blank." };
    }
    max_volunteers = n;
  }

  const start = str(formData, "start_time");
  const end = str(formData, "end_time");
  if (start && end && end <= start) {
    return { error: "The end time has to be after the start time." };
  }

  const { data, error } = await session.supabase
    .from("volunteer_events")
    .insert({
      name,
      description: orNull(str(formData, "description")),
      date,
      start_time: orNull(start),
      end_time: orNull(end),
      location: orNull(str(formData, "location")),
      max_volunteers,
      status,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "create this event") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_event.created",
    entityType: "volunteer_events",
    entityId: data.id,
    newValue: { name, date, max_volunteers },
  });

  revalidatePath("/admin/volunteers");
  revalidatePath("/admin/volunteers/events");
  return { ok: true, id: data.id };
}

export async function setEventStatus(
  eventId: string,
  status: EventStatus
): Promise<Result> {
  if (!EVENT_STATUSES.includes(status)) return { error: "Invalid status." };

  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("volunteer_events")
    .update({ status })
    .eq("id", eventId);

  if (error) return { error: describeDbError(error, "update this event") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: `volunteer_event.${status}`,
    entityType: "volunteer_events",
    entityId: eventId,
    newValue: { status },
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  revalidatePath("/admin/volunteers/events");
  revalidatePath("/admin/volunteers");
  return { ok: true };
}

/**
 * Add a volunteer to an event.
 *
 * Two checks the database does not make on its own:
 *
 *   1. The contact must be type `volunteer`. A foreign key to contacts(id)
 *      happily accepts a donor or an applicant, and the hours report would then
 *      credit the wrong people. `type` is single-valued, so someone who both
 *      gives and volunteers has to be recorded as a volunteer to appear here —
 *      the error message says so rather than failing mysteriously.
 *
 *   2. Capacity. This counts existing shifts first, which is a check and not a
 *      guarantee: two simultaneous signups can both read the same count and
 *      both succeed. At this volume that is acceptable and visible on the
 *      roster; enforcing it properly needs a locking constraint trigger.
 */
export async function addVolunteerToEvent(
  eventId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const contactId = str(formData, "contact_id");
  if (!contactId) return { error: "Choose a volunteer." };

  const [{ data: contact }, { data: event }, { count }] = await Promise.all([
    session.supabase
      .from("contacts")
      .select("id, type, first_name, last_name, organization")
      .eq("id", contactId)
      .maybeSingle(),
    session.supabase
      .from("volunteer_events")
      .select("max_volunteers, name")
      .eq("id", eventId)
      .maybeSingle(),
    session.supabase
      .from("volunteer_shifts")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId),
  ]);

  if (!contact) return { error: "That contact no longer exists." };
  if ((contact as { type: string }).type !== "volunteer") {
    return {
      error:
        "That contact is not recorded as a volunteer. Change their contact type to Volunteer first, so volunteer hours are credited to the right people.",
    };
  }

  const max = (event as { max_volunteers: number | null } | null)?.max_volunteers;
  if (max && (count ?? 0) >= max) {
    return { error: `This event is full (${max} volunteers).` };
  }

  const { error } = await session.supabase.from("volunteer_shifts").insert({
    event_id: eventId,
    contact_id: contactId,
    notes: orNull(str(formData, "notes")),
  });

  if (error) {
    // UNIQUE (event_id, contact_id) — a second click, not a new signup.
    if (error.code === "23505") {
      return { error: "That volunteer is already on this event's roster." };
    }
    return { error: describeDbError(error, "add this volunteer") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_shift.created",
    entityType: "volunteer_shifts",
    entityId: eventId,
    newValue: { contact_id: contactId },
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  return { ok: true };
}

export async function removeShift(
  eventId: string,
  shiftId: string
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("volunteer_shifts")
    .delete()
    .eq("id", shiftId);

  if (error) return { error: describeDbError(error, "remove this volunteer") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_shift.removed",
    entityType: "volunteer_shifts",
    entityId: shiftId,
    oldValue: { event_id: eventId },
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  return { ok: true };
}

/**
 * Check in / check out.
 *
 * Checking out fills hours_logged from the timestamps ONLY if it is still
 * empty. hours_logged is what every report reads; a figure someone entered by
 * hand is never overwritten by the clock.
 */
export async function checkIn(eventId: string, shiftId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("volunteer_shifts")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", shiftId);

  if (error) return { error: describeDbError(error, "check this volunteer in") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_shift.checked_in",
    entityType: "volunteer_shifts",
    entityId: shiftId,
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  return { ok: true };
}

export async function checkOut(eventId: string, shiftId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { data: shift } = await session.supabase
    .from("volunteer_shifts")
    .select("*")
    .eq("id", shiftId)
    .maybeSingle();

  if (!shift) return { error: "That shift no longer exists." };
  const s = shift as VolunteerShift;
  if (!s.checked_in_at) {
    return { error: "Check this volunteer in before checking them out." };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { checked_out_at: now };
  if (s.hours_logged === null || s.hours_logged === undefined) {
    patch.hours_logged = hoursBetween(s.checked_in_at, now);
  }

  const { error } = await session.supabase
    .from("volunteer_shifts")
    .update(patch)
    .eq("id", shiftId);

  if (error) return { error: describeDbError(error, "check this volunteer out") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_shift.checked_out",
    entityType: "volunteer_shifts",
    entityId: shiftId,
    newValue: patch,
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  revalidatePath("/admin/volunteers/hours");
  return { ok: true };
}

export async function logHours(
  eventId: string,
  shiftId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const raw = str(formData, "hours_logged");
  let hours: number | null = null;
  if (raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 999.99) {
      return { error: "Enter hours between 0 and 999.99, or leave it blank." };
    }
    hours = Math.round(n * 100) / 100;
  }

  const { error } = await session.supabase
    .from("volunteer_shifts")
    .update({ hours_logged: hours, notes: orNull(str(formData, "notes")) })
    .eq("id", shiftId);

  if (error) return { error: describeDbError(error, "save these hours") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "volunteer_shift.hours_logged",
    entityType: "volunteer_shifts",
    entityId: shiftId,
    newValue: { hours_logged: hours },
  });

  revalidatePath(`/admin/volunteers/events/${eventId}`);
  revalidatePath("/admin/volunteers/hours");
  revalidatePath("/admin/volunteers");
  return { ok: true };
}

// ── CSV exports ─────────────────────────────────────────────────────────────

const CONTACT_COLUMNS = "id, first_name, last_name, organization, email";

/** Only the contact columns these exports actually select. */
type ContactLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  organization: string | null;
  email: string | null;
};

export async function exportEventRoster(eventId: string): Promise<ExportResult> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const [{ data: event }, { data: shifts, error }] = await Promise.all([
    session.supabase
      .from("volunteer_events")
      .select("name, date")
      .eq("id", eventId)
      .maybeSingle(),
    session.supabase
      .from("volunteer_shifts")
      .select(`*, contacts(${CONTACT_COLUMNS})`)
      .eq("event_id", eventId),
  ]);

  if (error) return { error: describeDbError(error, "export this roster") };

  const rows = ((shifts ?? []) as (VolunteerShift & {
    contacts?: ContactLite | ContactLite[] | null;
  })[]).map((s) => {
    const embed = s.contacts;
    const c = Array.isArray(embed) ? embed[0] : embed;
    return {
      volunteer: c ? contactName(c) : "(contact removed)",
      email: c?.email ?? "",
      checked_in_at: s.checked_in_at ?? "",
      checked_out_at: s.checked_out_at ?? "",
      hours_logged: hoursOf(s.hours_logged),
      notes: s.notes ?? "",
    };
  });

  const name = (event as { name?: string; date?: string } | null)?.name ?? "event";
  const date = (event as { date?: string } | null)?.date ?? "";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    filename: `faithproof-roster-${slug || "event"}-${date || "undated"}.csv`,
    csv: toCsv(rows, [
      "volunteer",
      "email",
      "checked_in_at",
      "checked_out_at",
      "hours_logged",
      "notes",
    ]),
    rows: rows.length,
  };
}

export async function exportHoursReport(month: string): Promise<ExportResult> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const summary = await hoursSummary(month);
  if ("error" in summary) return { error: summary.error };

  return {
    filename: `faithproof-volunteer-hours-${month}.csv`,
    csv: toCsv(
      summary.rows as unknown as Record<string, unknown>[],
      ["volunteer", "email", "events_attended", "hours_this_month", "hours_all_time"]
    ),
    rows: summary.rows.length,
  };
}

export type HoursRow = {
  contact_id: string;
  volunteer: string;
  email: string;
  events_attended: number;
  hours_this_month: number;
  hours_all_time: number;
};

/**
 * Per-volunteer hours for a month, plus their all-time total.
 *
 * Aggregated here rather than in SQL because PostgREST cannot express GROUP BY.
 * A shift counts toward a month by its event's date — not by when the row was
 * created, and not by check-in time, so hours logged after the fact still land
 * in the month the work actually happened.
 */
export async function hoursSummary(
  month: string
): Promise<{ rows: HoursRow[]; totalHours: number } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "Pick a valid month." };
  const start = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const endDate = new Date(Date.UTC(y, m, 0)); // day 0 of next month = last day
  const end = endDate.toISOString().slice(0, 10);

  const { data, error } = await session.supabase
    .from("volunteer_shifts")
    .select(`*, contacts(${CONTACT_COLUMNS}), volunteer_events(date)`);

  if (error) return { error: describeDbError(error, "build the hours report") };

  const byContact = new Map<string, HoursRow>();

  for (const raw of (data ?? []) as (VolunteerShift & {
    contacts?: ContactLite | ContactLite[] | null;
    volunteer_events?: { date: string } | { date: string }[] | null;
  })[]) {
    const cEmbed = raw.contacts;
    const c = Array.isArray(cEmbed) ? cEmbed[0] : cEmbed;
    const eEmbed = raw.volunteer_events;
    const event = Array.isArray(eEmbed) ? eEmbed[0] : eEmbed;

    const key = raw.contact_id;
    const row =
      byContact.get(key) ??
      ({
        contact_id: key,
        volunteer: c ? contactName(c) : "(contact removed)",
        email: c?.email ?? "",
        events_attended: 0,
        hours_this_month: 0,
        hours_all_time: 0,
      } satisfies HoursRow);

    const hours = hoursOf(raw.hours_logged);
    row.hours_all_time += hours;

    const date = event?.date ?? null;
    if (date && date >= start && date <= end) {
      row.events_attended += 1;
      row.hours_this_month += hours;
    }

    byContact.set(key, row);
  }

  const rows = Array.from(byContact.values())
    .map((r) => ({
      ...r,
      hours_this_month: Math.round(r.hours_this_month * 100) / 100,
      hours_all_time: Math.round(r.hours_all_time * 100) / 100,
    }))
    .filter((r) => r.hours_all_time > 0 || r.events_attended > 0)
    .sort((a, b) => b.hours_this_month - a.hours_this_month);

  const totalHours =
    Math.round(rows.reduce((n, r) => n + r.hours_this_month, 0) * 100) / 100;

  return { rows, totalHours };
}
