import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, DetailHeading } from "../../../../_components/detail";
import { CheckIcon, ClockIcon, InfoIcon, ShieldCheckIcon } from "../../../../_components/icons";
import {
  Badge,
  DarkPanel,
  EmptyState,
  Panel,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly, formatRelative } from "@/lib/faithproof/format";
import {
  MEETING_TYPE_LABELS,
  MEETING_TYPE_TONES,
  MINUTES_STATUS_LABELS,
  MINUTES_STATUS_TONES,
  VOTE_RESULT_LABELS,
  formatMeetingTime,
  VOTE_TONES,
  meetingDuration,
  type BoardMeeting,
  type BoardVote,
  type MeetingApproval,
} from "@/lib/faithproof/board";
import { addVote } from "../../../actions";
import { AddVoteForm } from "../AddVoteForm";
import {
  ApproveButton,
  CertifyButton,
  GenerateMinutesButton,
  MinutesEditor,
  TranscriptEntry,
} from "./MinutesClient";
import {
  approveMinutes,
  certifyMinutes,
  updateMinutes,
  uploadTranscript,
} from "./actions";

export const metadata: Metadata = {
  title: "Meeting Minutes | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const BANNERS: Record<
  string,
  { bg: string; border: string; color: string; text: string }
> = {
  draft: {
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#d97706",
    text: "Draft — review and edit these minutes before sending them for approval.",
  },
  under_review: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#2563eb",
    text: "Minutes are under review — awaiting board approval.",
  },
  approved: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#16a34a",
    text: "All board members have approved these minutes.",
  },
  certified: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#16a34a",
    text: "Minutes certified by the Secretary — filed in the Proof Vault.",
  },
};

export default async function MinutesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;

  const [
    { data: meetingRow, error },
    { data: voteRows },
    { data: approvalRows, error: approvalError },
    { data: profileRows },
  ] = await Promise.all([
    sb.from("board_meetings").select("*").eq("id", params.id).maybeSingle(),
    sb
      .from("board_votes")
      .select("*")
      .eq("meeting_id", params.id)
      .order("created_at", { ascending: true }),
    sb.from("meeting_approvals").select("*").eq("meeting_id", params.id),
    // Everyone whose signature the certification waits on.
    sb.from("profiles").select("id, full_name, email, role").in("role", ["admin", "board"]),
  ]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink href="/admin/board/meetings" label="Back to Meetings" />
        <QueryError what="these minutes" message={error.message} />
      </div>
    );
  }
  if (!meetingRow) notFound();

  const m = meetingRow as BoardMeeting;
  const votes = (voteRows ?? []) as BoardVote[];
  const approvals = (approvalRows ?? []) as MeetingApproval[];
  const profiles = (profileRows ?? []) as {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
  }[];

  const approvalByProfile = new Map(approvals.map((a) => [a.profile_id, a]));
  const outstanding = profiles.filter((p) => !approvalByProfile.has(p.id));
  const everyoneApproved = profiles.length > 0 && outstanding.length === 0;
  const iApproved = approvalByProfile.has(session.userId);

  const minutesText = m.ai_draft_minutes ?? "";
  const certified = m.minutes_status === "certified";
  const banner = BANNERS[m.minutes_status] ?? BANNERS.draft;
  const duration = meetingDuration(m.actual_start, m.actual_end);
  const isAdmin = session.profile?.role === "admin";

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink
        href={`/admin/board/meetings/${m.id}`}
        label="Back to the meeting"
      />
      <DetailHeading
        title="Board Meeting Minutes"
        subtitle={`${MEETING_TYPE_LABELS[m.type] ?? m.type} meeting · ${formatDateOnly(m.meeting_date)}`}
      />

      {/* ── Summary ───────────────────────────────────────────────────── */}
      <Panel className="mb-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={MEETING_TYPE_TONES[m.type] ?? "gray"}>
            {MEETING_TYPE_LABELS[m.type] ?? m.type}
          </Badge>
          <Badge tone={MINUTES_STATUS_TONES[m.minutes_status] ?? "gray"}>
            {MINUTES_STATUS_LABELS[m.minutes_status] ?? m.minutes_status}
          </Badge>
          <span className="text-sm" style={{ color: "#6b7280" }}>
            {formatDateOnly(m.meeting_date)}
            {duration ? ` · ran ${duration}` : ""}
            {m.actual_start ? ` · started ${formatMeetingTime(m.actual_start)}` : ""}
          </span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "#374151" }}>
          <span className="font-medium">Attendees:</span>{" "}
          {m.attendees?.length ? m.attendees.join(", ") : "Not recorded"}
        </p>
      </Panel>

      <p
        className="mb-6 rounded-lg px-4 py-3 text-sm"
        style={{
          backgroundColor: banner.bg,
          color: banner.color,
          border: `1px solid ${banner.border}`,
        }}
      >
        {banner.text}
      </p>

      {/* ── Minutes ───────────────────────────────────────────────────── */}
      <Panel className="mb-6 p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}>
            Meeting Minutes
          </h2>
          <Badge tone={MINUTES_STATUS_TONES[m.minutes_status] ?? "gray"}>
            {MINUTES_STATUS_LABELS[m.minutes_status] ?? m.minutes_status}
          </Badge>
        </div>

        {minutesText ? (
          <MinutesEditor
            text={minutesText}
            action={updateMinutes.bind(null, m.id)}
            locked={certified}
          />
        ) : m.transcript_text ? (
          <div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "#374151" }}>
              A transcript is on the record. Claude can draft formal minutes from
              it — the draft goes to the board for review and signature, and
              nothing is certified without every director&rsquo;s approval.
            </p>
            <GenerateMinutesButton meetingId={m.id} />
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "#374151" }}>
              No recording available — add a transcript to draft the minutes
              automatically, or write them yourself.
            </p>
            <TranscriptEntry
              transcriptAction={uploadTranscript.bind(null, m.id)}
              minutesAction={updateMinutes.bind(null, m.id)}
            />
          </div>
        )}
      </Panel>

      {/* ── Votes ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}>
            Recorded Votes
          </h2>
          {certified ? null : <AddVoteForm action={addVote.bind(null, m.id)} />}
        </div>

        {votes.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No votes recorded for this meeting"
              detail="Motions and their tallies belong in the minutes — add them here."
            />
          </Panel>
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Motion</Th>
                <Th>Result</Th>
                <Th>For</Th>
                <Th>Against</Th>
                <Th>Abstain</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {votes.map((v) => (
                <tr key={v.id}>
                  <Td className="font-medium">{v.motion}</Td>
                  <Td>
                    <Badge tone={VOTE_TONES[v.result] ?? "gray"}>
                      {VOTE_RESULT_LABELS[v.result] ?? v.result}
                    </Badge>
                  </Td>
                  <Td muted className="tabular-nums">
                    {v.votes_for ?? 0}
                  </Td>
                  <Td muted className="tabular-nums">
                    {v.votes_against ?? 0}
                  </Td>
                  <Td muted className="tabular-nums">
                    {v.votes_abstain ?? 0}
                  </Td>
                  <Td muted>{v.notes || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </div>

      {/* ── Approval ──────────────────────────────────────────────────── */}
      <DarkPanel>
        <h2 style={{ color: "#ffefb3", fontSize: 17, fontWeight: 600 }}>
          Board Approval
        </h2>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,239,179,0.6)" }}>
          All board members must approve before minutes are certified.
        </p>

        {approvalError ? (
          <p className="mt-4 text-sm" style={{ color: "#fecaca" }}>
            The approval record could not be read: {approvalError.message}
          </p>
        ) : profiles.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "rgba(255,239,179,0.6)" }}>
            No board profiles exist yet, so there is nobody to approve these
            minutes.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {profiles.map((p) => {
              const approval = approvalByProfile.get(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: approval
                        ? "rgba(22,163,74,0.2)"
                        : "rgba(251,191,36,0.2)",
                      color: approval ? "#4ade80" : "#fbbf24",
                    }}
                  >
                    {approval ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ClockIcon className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span
                      className="block text-sm"
                      style={{
                        color: approval ? "#ffefb3" : "rgba(255,239,179,0.7)",
                        fontWeight: approval ? 600 : 400,
                      }}
                    >
                      {p.full_name || p.email}
                    </span>
                    <span
                      className="block text-xs"
                      style={{
                        color: approval
                          ? "rgba(255,239,179,0.5)"
                          : "rgba(255,239,179,0.4)",
                      }}
                    >
                      {approval
                        ? `Approved ${formatRelative(approval.approved_at)}`
                        : "Awaiting approval"}
                    </span>
                  </span>
                  {approval?.signature_data ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={approval.signature_data}
                      alt={`Signature of ${p.full_name || p.email}`}
                      style={{
                        width: 60,
                        height: 24,
                        objectFit: "contain",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 4,
                        padding: 2,
                      }}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {!iApproved && !certified && minutesText ? (
          <ApproveButton
            meetingId={m.id}
            minutesText={minutesText}
            meetingDate={formatDateOnly(m.meeting_date)}
            action={approveMinutes}
          />
        ) : null}

        {!minutesText && !certified ? (
          <p className="mt-4 text-sm" style={{ color: "rgba(255,239,179,0.5)" }}>
            There is nothing to approve until the minutes exist.
          </p>
        ) : null}

        {everyoneApproved && isAdmin && !certified ? (
          <CertifyButton meetingId={m.id} action={certifyMinutes} />
        ) : null}

        {certified ? (
          <p
            className="mt-4 flex items-center gap-2 text-sm"
            style={{ color: "#ffefb3" }}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Certified and filed. The signed PDF is in the Proof Vault.
          </p>
        ) : null}
      </DarkPanel>
    </div>
  );
}
