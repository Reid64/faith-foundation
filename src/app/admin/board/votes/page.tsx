import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
import { ClickableRow } from "../../_components/ClickableRow";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  VOTE_RESULTS,
  VOTE_RESULT_LABELS,
  VOTE_TONES,
  type BoardVote,
} from "@/lib/faithproof/board";
import { BoardNav } from "../BoardNav";

export const metadata: Metadata = {
  title: "Board Votes | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function VotesPage({
  searchParams,
}: {
  searchParams?: { result?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const result = searchParams?.result ?? "";

  let query = session.supabase
    .from("board_votes")
    .select("*, board_meetings(meeting_date)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (result) query = query.eq("result", result);

  const { data, error, count } = await query;

  /**
   * PostgREST types an embedded row as an array or an object depending on how
   * it resolves the relationship, so normalise both shapes rather than assuming.
   */
  const rows = ((data ?? []) as (BoardVote & {
    board_meetings?: { meeting_date: string } | { meeting_date: string }[] | null;
  })[]).map((v) => {
    const embed = v.board_meetings;
    const meeting = Array.isArray(embed) ? embed[0] : embed;
    return { ...v, meeting_date: meeting?.meeting_date ?? null };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Board Votes"
        description={`${count ?? 0} motion${count === 1 ? "" : "s"} on record across all meetings.`}
      />
      <BoardNav />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/board/votes"
          className="rounded-lg px-3 py-1.5 text-sm font-medium"
          style={
            result
              ? { color: "#6b7280", border: "1px solid #d1d5db" }
              : { backgroundColor: "#013e37", color: "#ffefb3" }
          }
        >
          All
        </Link>
        {VOTE_RESULTS.map((r) => (
          <Link
            key={r}
            href={`/admin/board/votes?result=${r}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={
              result === r
                ? { backgroundColor: "#013e37", color: "#ffefb3" }
                : { color: "#6b7280", border: "1px solid #d1d5db" }
            }
          >
            {VOTE_RESULT_LABELS[r]}
          </Link>
        ))}
      </div>

      {error ? (
        <QueryError what="board votes" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No votes match"
            detail="Votes are recorded from a meeting record."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Meeting</Th>
              <Th>Motion</Th>
              <Th>Result</Th>
              <Th>For</Th>
              <Th>Against</Th>
              <Th>Abstain</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <ClickableRow key={v.id} href={`/admin/board/meetings/${v.meeting_id}`}>
                <Td className="whitespace-nowrap font-medium">
                  <Link
                    href={`/admin/board/meetings/${v.meeting_id}`}
                    className="hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    {v.meeting_date ? formatDateOnly(v.meeting_date) : "—"}
                  </Link>
                </Td>
                <Td>{v.motion}</Td>
                <Td>
                  <Badge tone={VOTE_TONES[v.result] ?? "gray"}>
                    {VOTE_RESULT_LABELS[v.result] ?? v.result}
                  </Badge>
                </Td>
                <Td muted>{v.votes_for ?? 0}</Td>
                <Td muted>{v.votes_against ?? 0}</Td>
                <Td muted>{v.votes_abstain ?? 0}</Td>
              </ClickableRow>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
