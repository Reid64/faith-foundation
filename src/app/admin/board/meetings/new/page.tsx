import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { createMeeting } from "../../actions";
import { MeetingForm } from "../MeetingForm";

export const metadata: Metadata = {
  title: "Record Meeting | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewMeetingPage() {
  const session = await getSession();
  if (!session) return null;

  // Board members read the minute book; only an administrator writes to it.
  if (session.profile?.role !== "admin") redirect("/admin/board/meetings");

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/board/meetings" label="Back to Meetings" />
      <DetailHeading
        title="Record Meeting"
        subtitle="Minutes and votes together form the legal record of the corporation."
      />
      <div style={formCardStyle}>
        <MeetingForm action={createMeeting} />
      </div>
    </div>
  );
}
