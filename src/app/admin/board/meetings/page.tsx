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
  MEETING_TYPE_LABELS,
  MEETING_TYPE_TONES,
  type BoardMeeting,
} from "@/lib/faithproof/board";
import { BoardNav } from "../BoardNav";

export const metadata: Metadata = {
  title: "Board Meetings | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error, count } = await session.supabase
    .from("board_meetings")
    .select("*", { count: "exact" })
    .order("meeting_date", { ascending: false });

  const rows = (data ?? []) as BoardMeeting[];
  const isAdmin = session.profile?.role === "admin";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Board Meetings"
        description={`${count ?? 0} meeting${count === 1 ? "" : "s"} on record.`}
        action={
          isAdmin ? (
            <PrimaryLinkButton href="/admin/board/meetings/new">
              Record Meeting
            </PrimaryLinkButton>
          ) : undefined
        }
      />
      <BoardNav />

      {error ? (
        <QueryError what="board meetings" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No meetings recorded"
            detail={
              isAdmin
                ? "Record the first meeting to start the minute book."
                : "An administrator records meetings here."
            }
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Attendees</Th>
              <Th>Agenda</Th>
              <Th>Minutes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <ClickableRow key={m.id} href={`/admin/board/meetings/${m.id}`}>
                <Td className="whitespace-nowrap font-medium">
                  <Link
                    href={`/admin/board/meetings/${m.id}`}
                    className="hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    {formatDateOnly(m.meeting_date)}
                  </Link>
                </Td>
                <Td>
                  <Badge tone={MEETING_TYPE_TONES[m.type] ?? "gray"}>
                    {MEETING_TYPE_LABELS[m.type] ?? m.type}
                  </Badge>
                </Td>
                <Td muted>{m.attendees?.length ?? 0}</Td>
                <Td muted>{m.agenda ? `${m.agenda.slice(0, 60)}…` : "—"}</Td>
                <Td muted>{m.minutes ? "Recorded" : "Not yet recorded"}</Td>
              </ClickableRow>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
