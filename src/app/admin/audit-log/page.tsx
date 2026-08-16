import type { Metadata } from "next";
import { InfoIcon } from "../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  formatRelative,
  formatTimestamp,
  humanizeEnum,
  shortId,
} from "@/lib/faithproof/format";
import type { AuditLogEntry } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Audit Log | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("audit_log")
    .select("*, actor:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as AuditLogEntry[];
  const role = session.profile?.role;
  // SELECT on audit_log is granted to admin and board only. A staff user gets
  // an empty list rather than an error, which would otherwise read as "nothing
  // has ever happened" instead of "you cannot see this".
  const cannotRead = role !== "admin" && role !== "board";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Audit Log"
        description="Read-only record of every change. The 100 most recent entries."
      />

      {error ? (
        <QueryError what="the audit log" message={error.message} />
      ) : rows.length === 0 && cannotRead ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="You do not have access to the audit log"
            detail={`The audit log is readable by administrators and board members. Your role is "${role ?? "unknown"}", so this list will stay empty regardless of what has been recorded.`}
          />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No audit entries yet"
            detail="Entries appear here as records are created and changed."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Timestamp</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Entity ID</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-[rgba(255,239,179,0.05)]">
                <Td className="whitespace-nowrap">
                  <span className="block text-[#f1f5f9]">
                    {formatTimestamp(entry.created_at)}
                  </span>
                  <span className="block text-xs text-[rgba(255,239,179,0.5)]">
                    {formatRelative(entry.created_at)}
                  </span>
                </Td>
                <Td>
                  {entry.actor?.full_name || entry.actor?.email || (
                    <span className="text-[rgba(255,239,179,0.5)]">Unknown user</span>
                  )}
                </Td>
                <Td className="text-[rgba(255,239,179,0.7)]">
                  {humanizeEnum(entry.action)}
                </Td>
                <Td className="text-[rgba(255,239,179,0.7)]">
                  {humanizeEnum(entry.entity_type)}
                </Td>
                <Td className="font-mono text-xs text-[rgba(255,239,179,0.5)]">
                  {shortId(entry.entity_id)}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
