import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  InfoIcon,
  UsersIcon,
  TicketIcon,
} from "../_components/icons";
import {
  Badge,
  DarkPanel,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  PrimaryLinkButton,
  StatCard,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatRelative, formatDateOnly } from "@/lib/faithproof/format";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPE_TONES,
  INTERACTION_TONES,
  INTERACTION_TYPE_LABELS,
  TASK_PRIORITY_TONES,
  contactName,
  stageLabel,
  type ContactType,
  type Interaction,
  type Task,
} from "@/lib/faithproof/crm";
import { CrmNav } from "./CrmNav";

export const metadata: Metadata = {
  title: "CRM | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISO(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export default async function CrmDashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;
  const today = todayISO();

  const [total, donors, applicants, volunteers, dueToday, recent, stages] =
    await Promise.all([
      sb.from("contacts").select("*", { count: "exact", head: true }).eq("is_active", true),
      sb.from("contacts").select("*", { count: "exact", head: true }).eq("type", "donor").eq("is_active", true),
      sb.from("contacts").select("*", { count: "exact", head: true }).eq("type", "applicant").eq("is_active", true),
      sb.from("contacts").select("*", { count: "exact", head: true }).eq("type", "volunteer").eq("is_active", true),
      sb
        .from("tasks")
        .select("*, contact:contacts(first_name,last_name)")
        .lte("due_date", today)
        .in("status", ["pending", "in_progress"])
        .order("due_date", { ascending: true })
        .limit(10),
      sb
        .from("interactions")
        .select("*, contact:contacts(first_name,last_name)")
        .order("occurred_at", { ascending: false })
        .limit(8),
      sb.from("contacts").select("type, pipeline_stage").eq("is_active", true),
    ]);

  const tasks = (dueToday.data ?? []) as Task[];
  const interactions = (recent.data ?? []) as Interaction[];

  // Group stage counts by contact type for the pipeline summary.
  const pipeline = new Map<string, Map<string, number>>();
  for (const row of (stages.data ?? []) as {
    type: ContactType;
    pipeline_stage: string | null;
  }[]) {
    const stage = row.pipeline_stage || "unassigned";
    if (!pipeline.has(row.type)) pipeline.set(row.type, new Map());
    const inner = pipeline.get(row.type)!;
    inner.set(stage, (inner.get(stage) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="CRM"
        description="Donors, applicants, volunteers and partners — with the history behind each one."
        action={
          <PrimaryLinkButton href="/admin/crm/contacts/new">
            Add Contact
          </PrimaryLinkButton>
        }
      />
      <CrmNav />

      <div
        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard
          label="Total contacts"
          value={total.error ? "—" : (total.count ?? 0)}
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Active donors"
          value={donors.error ? "—" : (donors.count ?? 0)}
          icon={<TicketIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Open applications"
          value={applicants.error ? "—" : (applicants.count ?? 0)}
          icon={<InfoIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Active volunteers"
          value={volunteers.error ? "—" : (volunteers.count ?? 0)}
          icon={<CheckCircleIcon className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks due — the only thing here that is genuinely urgent. */}
        <DarkPanel>
          <PanelHeader
            icon={<ClockIcon className="h-5 w-5" />}
            iconColor="#fbbf24"
            title="Tasks Due"
            subtext="Due today or overdue"
          />
          {tasks.length === 0 ? (
            <EmptyState
              onDarkPanel
              tone="success"
              icon={<CheckCircleIcon className="h-5 w-5" />}
              title="Nothing due"
              detail="No open tasks are due today."
            />
          ) : (
            <ul style={{ borderColor: "rgba(255,239,179,0.1)" }} className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="py-3 first:pt-0">
                  <Link
                    href={`/admin/crm/contacts/${t.contact_id}?tab=tasks`}
                    className="block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#ffefb3" }}
                      >
                        {t.title}
                      </span>
                      <Badge tone={TASK_PRIORITY_TONES[t.priority]}>
                        {t.priority}
                      </Badge>
                    </div>
                    <span
                      className="mt-0.5 block text-xs"
                      style={{ color: "rgba(255,239,179,0.6)" }}
                    >
                      {t.contact ? contactName(t.contact) : "Unknown contact"} ·{" "}
                      {formatDateOnly(t.due_date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DarkPanel>

        <Panel className="p-6">
          <h2
            className="mb-4"
            style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}
          >
            Recent Interactions
          </h2>
          {interactions.length === 0 ? (
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No interactions logged yet"
              detail="Log a call, note or meeting from any contact record."
            />
          ) : (
            <ul className="divide-y divide-[#f0f0ef]">
              {interactions.map((i) => (
                <li key={i.id} className="py-3 first:pt-0">
                  <Link href={`/admin/crm/contacts/${i.contact_id}`} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#374151" }}
                      >
                        {i.contact ? contactName(i.contact) : "Unknown"}
                      </span>
                      <Badge tone={INTERACTION_TONES[i.type]}>
                        {INTERACTION_TYPE_LABELS[i.type]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: "#6b7280" }}>
                      {i.subject || "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>
                      {formatRelative(i.occurred_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-6">
          <h2
            className="mb-4"
            style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}
          >
            Pipeline Summary
          </h2>
          {pipeline.size === 0 ? (
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No contacts yet"
              detail="Pipeline counts appear once contacts are added."
            />
          ) : (
            <div className="space-y-4">
              {Array.from(pipeline.entries()).map(([type, inner]) => (
                <div key={type}>
                  <Badge tone={CONTACT_TYPE_TONES[type as ContactType] ?? "gray"}>
                    {CONTACT_TYPE_LABELS[type as ContactType] ?? type}
                  </Badge>
                  <ul className="mt-2 space-y-1">
                    {Array.from(inner.entries()).map(([stage, count]) => (
                      <li
                        key={stage}
                        className="flex items-center justify-between text-sm"
                        style={{ color: "#6b7280" }}
                      >
                        <span>{stageLabel(stage)}</span>
                        <span
                          className="tabular-nums"
                          style={{ color: "#374151", fontWeight: 600 }}
                        >
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
