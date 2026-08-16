import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, DetailCard, DetailHeading, DetailList, Row } from "../../../_components/detail";
import { InfoIcon } from "../../../_components/icons";
import { Badge, EmptyState, Panel, QueryError } from "../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly, formatTimestamp } from "@/lib/faithproof/format";
import {
  MEETING_TYPE_LABELS,
  MEETING_TYPE_TONES,
  MINUTES_STATUS_LABELS,
  MINUTES_STATUS_TONES,
  VOTE_RESULT_LABELS,
  VOTE_TONES,
  formatMeetingTime,
  isJoinable,
  meetingDuration,
  type BoardMeeting,
  type BoardVote,
} from "@/lib/faithproof/board";
import { addVote } from "../../actions";
import { AddVoteForm } from "./AddVoteForm";

export const metadata: Metadata = {
  title: "Meeting | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const [{ data: meeting, error }, { data: voteRows, error: voteError }] =
    await Promise.all([
      session.supabase
        .from("board_meetings")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      session.supabase
        .from("board_votes")
        .select("*")
        .eq("meeting_id", params.id)
        .order("created_at", { ascending: true }),
    ]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink href="/admin/board/meetings" label="Back to Meetings" />
        <QueryError what="this meeting" message={error.message} />
      </div>
    );
  }
  if (!meeting) notFound();

  const m = meeting as BoardMeeting;
  const votes = (voteRows ?? []) as BoardVote[];
  const joinable = isJoinable(m);
  const finished = Boolean(m.actual_end);
  const duration = meetingDuration(m.actual_start, m.actual_end);

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/board/meetings" label="Back to Meetings" />
      <DetailHeading
        title={`${MEETING_TYPE_LABELS[m.type] ?? m.type} Meeting — ${formatDateOnly(m.meeting_date)}`}
        subtitle={`Recorded ${formatTimestamp(m.created_at)}.`}
      />

      {/* The meeting room, and the minutes it produces. Shown above everything
          else because during a meeting this is the only thing anyone wants. */}
      {joinable ? (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-4"
          style={{ backgroundColor: "#013e37" }}
        >
          <div>
            <p style={{ color: "#ffefb3", fontSize: 15, fontWeight: 600 }}>
              {m.actual_start ? "This meeting is in progress" : "The meeting room is open"}
            </p>
            <p className="mt-0.5 text-sm" style={{ color: "rgba(255,239,179,0.6)" }}>
              {m.scheduled_start
                ? `Scheduled for ${formatMeetingTime(m.scheduled_start)}`
                : "No scheduled time recorded"}
            </p>
          </div>
          <Link
            href={`/admin/board/meetings/${m.id}/room`}
            className="rounded-lg px-6 py-3 text-sm font-bold"
            style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
          >
            Join Meeting
          </Link>
        </div>
      ) : null}

      {finished ? (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-4"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
          }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="green">Meeting complete</Badge>
            <span className="text-sm" style={{ color: "#6b7280" }}>
              {duration ? `Ran ${duration}.` : "Ended."}
            </span>
            {m.minutes_status !== "draft" ? (
              <Badge tone={MINUTES_STATUS_TONES[m.minutes_status] ?? "gray"}>
                Minutes {MINUTES_STATUS_LABELS[m.minutes_status] ?? m.minutes_status}
              </Badge>
            ) : null}
          </div>
          <Link
            href={`/admin/board/meetings/${m.id}/minutes`}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
          >
            View Minutes
          </Link>
        </div>
      ) : null}

      <DetailCard>
        <DetailList>
          <Row label="Date" value={formatDateOnly(m.meeting_date)} />
          <Row
            label="Type"
            value={
              <Badge tone={MEETING_TYPE_TONES[m.type] ?? "gray"}>
                {MEETING_TYPE_LABELS[m.type] ?? m.type}
              </Badge>
            }
          />
          <Row
            label="Attendees"
            value={m.attendees?.length ? m.attendees.join(", ") : "—"}
          />
        </DetailList>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            ["Agenda", m.agenda],
            ["Minutes", m.minutes],
          ].map(([label, body]) => (
            <div key={label as string}>
              <h2
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#6b7280" }}
              >
                {label}
              </h2>
              <p
                className="whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: body ? "#374151" : "#9ca3af" }}
              >
                {body || "Not recorded."}
              </p>
            </div>
          ))}
        </div>
      </DetailCard>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}>
            Votes
          </h2>
          <AddVoteForm action={addVote.bind(null, params.id)} />
        </div>

        {voteError ? (
          <QueryError what="votes for this meeting" message={voteError.message} />
        ) : votes.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No votes recorded for this meeting"
              detail="Record each motion and its tally as it is taken."
            />
          </Panel>
        ) : (
          <div className="space-y-3">
            {votes.map((v) => (
              <Panel key={v.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p
                    className="max-w-2xl text-sm font-medium"
                    style={{ color: "#111827" }}
                  >
                    {v.motion}
                  </p>
                  <Badge tone={VOTE_TONES[v.result] ?? "gray"}>
                    {VOTE_RESULT_LABELS[v.result] ?? v.result}
                  </Badge>
                </div>
                <p className="mt-2 text-sm tabular-nums" style={{ color: "#6b7280" }}>
                  {v.votes_for ?? 0} for · {v.votes_against ?? 0} against ·{" "}
                  {v.votes_abstain ?? 0} abstaining
                </p>
                {v.notes ? (
                  <p
                    className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
                    style={{ color: "#374151" }}
                  >
                    {v.notes}
                  </p>
                ) : null}
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
