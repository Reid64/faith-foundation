import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "../../../_components/detail";
import { Badge, Panel, QueryError } from "../../../_components/ui";
import { BTN_SECONDARY, cardStyle } from "../../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import {
  formatCents,
  formatDateOnly,
  formatRelative,
  formatTimestamp,
} from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPE_TONES,
  INTERACTION_TONES,
  INTERACTION_TYPE_LABELS,
  TASK_PRIORITY_TONES,
  TASK_STATUS_TONES,
  contactName,
  stageLabel,
  type CampaignTag,
  type Contact,
  type ContactType,
  type Interaction,
  type Task,
} from "@/lib/faithproof/crm";
import { CrmNav } from "../../CrmNav";
import {
  AddCampaignTagForm,
  AddTaskForm,
  CompleteTaskButton,
  LinkTransactionForm,
  LogInteractionForm,
  StageSelector,
} from "./InlineForms";
import {
  addCampaignTag,
  completeTask,
  createTask,
  linkTransaction,
  logInteraction,
  updatePipelineStage,
} from "./actions";

export const metadata: Metadata = {
  title: "Contact | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const TABS = [
  { key: "interactions", label: "Interactions" },
  { key: "tasks", label: "Tasks" },
  { key: "donations", label: "Donations" },
  { key: "vouchers", label: "Vouchers" },
  { key: "campaigns", label: "Campaigns" },
];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-start justify-between gap-3 py-2.5"
      style={{ borderBottom: "1px solid #f0f0ef" }}
    >
      <dt style={{ color: "#6b7280", fontSize: 13 }}>{label}</dt>
      <dd className="text-right" style={{ color: "#374151", fontSize: 14 }}>
        {value}
      </dd>
    </div>
  );
}

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;
  const tab = searchParams?.tab ?? "interactions";

  const { data, error } = await sb
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Contact>();

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <BackLink href="/admin/crm/contacts" label="Back to Contacts" />
        <QueryError what="this contact" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();
  const c = data;

  const [interactions, tasks, links, voucherLinks, tags, profiles] =
    await Promise.all([
      sb.from("interactions").select("*").eq("contact_id", c.id).order("occurred_at", { ascending: false }),
      sb.from("tasks").select("*").eq("contact_id", c.id).order("due_date", { ascending: true }),
      sb.from("contact_transactions").select("transaction:transactions(*)").eq("contact_id", c.id),
      sb.from("contact_vouchers").select("voucher:vouchers(*)").eq("contact_id", c.id),
      sb.from("campaign_tags").select("*").eq("contact_id", c.id).order("tagged_at", { ascending: false }),
      sb.from("profiles").select("id, full_name, email").order("email"),
    ]);

  const assignees = (profiles.data ?? []).map(
    (p: { id: string; full_name: string | null; email: string }) => ({
      id: p.id,
      label: p.full_name || p.email,
    })
  );
  const assignedLabel =
    assignees.find((a) => a.id === c.assigned_to)?.label ?? "Unassigned";

  // PostgREST types an embedded relation as an array even when the join can
  // only produce one row, so flatten either shape rather than assuming.
  const flatten = (rows: unknown, key: string): Record<string, unknown>[] =>
    ((rows ?? []) as Record<string, unknown>[])
      .flatMap((r) => {
        const v = r[key];
        return Array.isArray(v) ? v : v ? [v] : [];
      })
      .filter(Boolean) as Record<string, unknown>[];

  const txRows = flatten(links.data, "transaction");
  const voucherRows = flatten(voucherLinks.data, "voucher");

  return (
    <div className="mx-auto max-w-7xl">
      <BackLink href="/admin/crm/contacts" label="Back to Contacts" />
      <CrmNav />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: the record ───────────────────────────────────── */}
        <div style={cardStyle} className="p-6 lg:col-span-1">
          {/* The contact's name IS this page's subject, so it is the h1. It was
              an h2 with no h1 above it anywhere on the page, which leaves a
              screen reader with no title for the record it is reading out.
              Styling is inline, so this is identical on screen. */}
          <h1 style={{ color: "#013e37", fontSize: 20, fontWeight: 700 }}>
            {contactName(c)}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={CONTACT_TYPE_TONES[c.type as ContactType] ?? "gray"}>
              {CONTACT_TYPE_LABELS[c.type as ContactType] ?? c.type}
            </Badge>
            <Badge tone="gray">{stageLabel(c.pipeline_stage)}</Badge>
            {!c.is_active ? <Badge tone="red">Inactive</Badge> : null}
          </div>

          <StageSelector
            contactType={c.type as ContactType}
            current={c.pipeline_stage}
            save={updatePipelineStage.bind(null, c.id)}
          />

          <dl className="mt-4">
            <Row label="Email" value={c.email || "—"} />
            <Row label="Phone" value={c.phone || "—"} />
            <Row
              label="SMS consent"
              value={
                c.sms_consent ? (
                  <Badge tone="green">
                    Yes · {formatDateOnly(c.sms_consent_date)}
                  </Badge>
                ) : (
                  <Badge tone="gray">Not given</Badge>
                )
              }
            />
            <Row
              label="Address"
              value={
                [c.address_line1, c.address_line2, c.city, c.state, c.zip]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <Row label="Source" value={c.source || "—"} />
            <Row label="Assigned to" value={assignedLabel} />
            <Row label="Added" value={formatDateOnly(c.created_at)} />
          </dl>

          {c.notes ? (
            <div className="mt-4">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#6b7280" }}
              >
                Notes
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "#374151" }}>
                {c.notes}
              </p>
            </div>
          ) : null}

          <div className="mt-5">
            <Link href={`/admin/crm/contacts/${c.id}/edit`} className={BTN_SECONDARY}>
              Edit Contact
            </Link>
          </div>
        </div>

        {/* ── Right: tabs ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <nav
            className="mb-4 flex flex-wrap gap-1 rounded-xl p-1"
            style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Link
                  key={t.key}
                  href={`/admin/crm/contacts/${c.id}?tab=${t.key}`}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition"
                  style={
                    active
                      ? { backgroundColor: "#013e37", color: "#ffefb3" }
                      : { color: "#6b7280" }
                  }
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <Panel className="p-6">
            {tab === "interactions" ? (
              <>
                <LogInteractionForm action={logInteraction.bind(null, c.id)} />
                {(interactions.data ?? []).length === 0 ? (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    No interactions logged yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f0f0ef]">
                    {((interactions.data ?? []) as Interaction[]).map((i) => (
                      <li key={i.id} className="py-3 first:pt-0">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-medium" style={{ color: "#374151" }}>
                            {i.subject || INTERACTION_TYPE_LABELS[i.type]}
                          </span>
                          <Badge tone={INTERACTION_TONES[i.type]}>
                            {INTERACTION_TYPE_LABELS[i.type]}
                          </Badge>
                        </div>
                        {i.body ? (
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                            {i.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>
                          {formatRelative(i.occurred_at)} · {formatTimestamp(i.occurred_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}

            {tab === "tasks" ? (
              <>
                <AddTaskForm action={createTask.bind(null, c.id)} assignees={assignees} />
                {(tasks.data ?? []).length === 0 ? (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    No tasks for this contact.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f0f0ef]">
                    {((tasks.data ?? []) as Task[]).map((t) => (
                      <li key={t.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: "#374151" }}>
                            {t.title}
                          </p>
                          {t.description ? (
                            <p className="mt-0.5 text-sm" style={{ color: "#6b7280" }}>
                              {t.description}
                            </p>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <Badge tone={TASK_PRIORITY_TONES[t.priority]}>{t.priority}</Badge>
                            <Badge tone={TASK_STATUS_TONES[t.status]}>{t.status}</Badge>
                            <span className="text-xs" style={{ color: "#9ca3af" }}>
                              Due {formatDateOnly(t.due_date)}
                            </span>
                          </div>
                        </div>
                        {t.status === "pending" || t.status === "in_progress" ? (
                          <CompleteTaskButton taskId={t.id} complete={completeTask} />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}

            {tab === "donations" ? (
              <>
                <LinkTransactionForm action={linkTransaction.bind(null, c.id)} />
                {txRows.length === 0 ? (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    No donations linked to this contact.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f0f0ef]">
                    {txRows.map((t) => (
                      <li key={String(t.id)} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                        <div>
                          <Link
                            href={`/admin/transactions/${String(t.id)}`}
                            className="text-sm font-medium hover:underline"
                            style={{ color: "#013e37" }}
                          >
                            {formatCents(Number(t.amount_cents))}
                          </Link>
                          <p className="text-xs" style={{ color: "#9ca3af" }}>
                            {formatDateOnly(String(t.transaction_date))} ·{" "}
                            {FUND_LABELS[t.fund as FundDesignation] ?? String(t.fund)}
                          </p>
                        </div>
                        <Badge tone={t.status === "confirmed" ? "green" : "amber"}>
                          {String(t.status)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}

            {tab === "vouchers" ? (
              voucherRows.length === 0 ? (
                <p className="text-sm" style={{ color: "#9ca3af" }}>
                  No vouchers linked to this contact.
                </p>
              ) : (
                <ul className="divide-y divide-[#f0f0ef]">
                  {voucherRows.map((v) => (
                    <li key={String(v.id)} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                      <div>
                        <Link
                          href={`/admin/vouchers/${String(v.id)}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: "#013e37" }}
                        >
                          {String(v.voucher_number)}
                        </Link>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>
                          {formatCents(Number(v.amount_cents))} ·{" "}
                          {FUND_LABELS[v.fund as FundDesignation] ?? String(v.fund)}
                        </p>
                      </div>
                      <Badge tone={v.status === "disbursed" ? "green" : "amber"}>
                        {String(v.status)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "campaigns" ? (
              <>
                <AddCampaignTagForm action={addCampaignTag.bind(null, c.id)} />
                {(tags.data ?? []).length === 0 ? (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    This contact is not tagged into any campaign.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f0f0ef]">
                    {((tags.data ?? []) as CampaignTag[]).map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                        <span className="text-sm font-medium" style={{ color: "#374151" }}>
                          {t.campaign}
                        </span>
                        <span className="text-xs" style={{ color: "#9ca3af" }}>
                          {formatDateOnly(t.tagged_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}
