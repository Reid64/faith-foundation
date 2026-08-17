import type { Metadata } from "next";
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

  /**
   * Admin AND board, matching the RLS policy and createMeeting itself.
   *
   * The previous rule was admin-only and, worse, enforced by a bare redirect:
   * a director who reached this page was bounced to the list with no
   * explanation, which reads as a broken page rather than a refusal. Anyone who
   * genuinely cannot create a meeting is now told so.
   */
  const role = session.profile?.role;
  const canCreate = role === "admin" || role === "board";

  if (!canCreate) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/board/meetings" label="Back to Meetings" />
        <DetailHeading
          title="Record Meeting"
          subtitle="Only board members and administrators can record a meeting."
        />
        <p
          role="alert"
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#fffbeb",
            color: "#d97706",
            border: "1px solid #fde68a",
          }}
        >
          Your account does not have permission to record board meetings. Ask an
          administrator if you believe that is wrong.
        </p>
      </div>
    );
  }

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
