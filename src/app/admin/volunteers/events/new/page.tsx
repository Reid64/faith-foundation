import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { EventForm } from "../EventForm";
import { createVolunteerEvent } from "../../actions";

export const metadata: Metadata = {
  title: "Add Event | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/volunteers/events" label="Back to Events" />
      <DetailHeading
        title="Add Volunteer Event"
        subtitle="Volunteers are rostered onto the event once it exists."
      />
      <div style={formCardStyle}>
        <EventForm action={createVolunteerEvent} />
      </div>
    </div>
  );
}
