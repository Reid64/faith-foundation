import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
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
  TASK_PRIORITIES,
  TASK_PRIORITY_TONES,
  TASK_STATUSES,
  TASK_STATUS_TONES,
  contactName,
  type Task,
} from "@/lib/faithproof/crm";
import { CrmNav } from "../CrmNav";
import { CompleteTaskButton } from "../contacts/[id]/InlineForms";
import { completeTask } from "../contacts/[id]/actions";

export const metadata: Metadata = {
  title: "Tasks | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISO(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: { status?: string; priority?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const status = searchParams?.status ?? "";
  const priority = searchParams?.priority ?? "";

  let query = session.supabase
    .from("tasks")
    .select("*, contact:contacts(first_name,last_name)")
    .order("due_date", { ascending: true })
    .limit(200);

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data, error } = await query;
  const rows = (data ?? []) as Task[];
  const today = todayISO();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Tasks"
        description="Every follow-up across all contacts. Overdue items are flagged."
      />
      <CrmNav />

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
        }}
      >
        <div className="min-w-[10rem] flex-1">
          <label
            htmlFor="status"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[10rem] flex-1">
          <label
            htmlFor="priority"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority}
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
        >
          Filter
        </button>
      </form>

      {error ? (
        <QueryError what="tasks" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No tasks match"
            detail="Tasks are created from a contact record."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Contact</Th>
              <Th>Task</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Due</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const overdue =
                !!t.due_date &&
                t.due_date < today &&
                t.status !== "completed" &&
                t.status !== "cancelled";
              return (
                <tr
                  key={t.id}
                  className="bg-white transition-colors even:bg-[#f8f8f7] hover:bg-[#f0fdf4]"
                  style={
                    overdue ? { borderLeft: "3px solid #dc2626" } : undefined
                  }
                >
                  <Td>
                    <Link
                      href={`/admin/crm/contacts/${t.contact_id}?tab=tasks`}
                      className="font-medium hover:underline"
                      style={{ color: "#013e37" }}
                    >
                      {t.contact ? contactName(t.contact) : "Unknown"}
                    </Link>
                  </Td>
                  <Td>{t.title}</Td>
                  <Td>
                    <Badge tone={TASK_PRIORITY_TONES[t.priority]}>
                      {t.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={TASK_STATUS_TONES[t.status]}>{t.status}</Badge>
                  </Td>
                  <Td muted className="whitespace-nowrap">
                    {formatDateOnly(t.due_date)}
                    {overdue ? (
                      <span
                        className="ml-2 text-xs font-semibold"
                        style={{ color: "#dc2626" }}
                      >
                        overdue
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    {t.status === "pending" || t.status === "in_progress" ? (
                      <CompleteTaskButton taskId={t.id} complete={completeTask} />
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
