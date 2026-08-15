import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  DollarIcon,
  InfoIcon,
  ShieldCheckIcon,
  TicketIcon,
  WarningIcon,
  CheckCircleIcon,
} from "./_components/icons";
import {
  CountBadge,
  EmptyState,
  Panel,
  PanelHeader,
  QueryError,
  StatCard,
} from "./_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  formatCentsCompact,
  formatRelative,
  humanizeEnum,
} from "@/lib/faithproof/format";
import type { AuditLogEntry } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Command Center | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** Today as YYYY-MM-DD, for comparing against DATE columns. */
function todayISODate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default async function CommandCenterPage() {
  const session = await getSession();
  if (!session) return null; // layout redirects; this satisfies the type checker
  const { supabase } = session;

  const today = todayISODate();

  const [
    pendingTx,
    pendingVouchers,
    overduePromises,
    donations,
    disbursed,
    fulfilled,
    verifiedDocs,
    activity,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("promises")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lt("target_date", today),
    // PostgREST cannot express SUM() without a view or RPC, so the confirmed
    // donation amounts are summed here. Fine at FAITH Foundation's volume;
    // if this table ever reaches tens of thousands of rows, move it to a
    // Postgres view and select a single aggregated row instead.
    supabase
      .from("transactions")
      .select("amount_cents")
      .eq("type", "donation")
      .eq("status", "confirmed"),
    supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true })
      .eq("status", "disbursed"),
    supabase
      .from("promises")
      .select("*", { count: "exact", head: true })
      .eq("status", "fulfilled"),
    supabase
      .from("proof_documents")
      .select("*", { count: "exact", head: true })
      .eq("verified", true),
    supabase
      .from("audit_log")
      .select("*, actor:profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalDonatedCents = (donations.data ?? []).reduce(
    (sum, row: { amount_cents: number }) => sum + (row.amount_cents ?? 0),
    0
  );

  const attentionError =
    pendingTx.error ?? pendingVouchers.error ?? overduePromises.error;

  const pendingTxCount = pendingTx.count ?? 0;
  const pendingVoucherCount = pendingVouchers.count ?? 0;
  const overduePromiseCount = overduePromises.count ?? 0;
  const nothingPending =
    pendingTxCount === 0 &&
    pendingVoucherCount === 0 &&
    overduePromiseCount === 0;

  const entries = (activity.data ?? []) as AuditLogEntry[];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#f1f5f9]">
          Command Center
        </h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Everything awaiting a decision on the left, everything already
          recorded on the right.
        </p>
      </header>

      {/* ── Summary stats ──────────────────────────────────────────── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total donations"
          value={
            donations.error ? "—" : formatCentsCompact(totalDonatedCents)
          }
          icon={<DollarIcon className="h-4 w-4" />}
          accent="text-[#22c55e]"
        />
        <StatCard
          label="Vouchers disbursed"
          value={disbursed.error ? "—" : (disbursed.count ?? 0)}
          icon={<TicketIcon className="h-4 w-4" />}
          accent="text-[#3b82f6]"
        />
        <StatCard
          label="Promises kept"
          value={fulfilled.error ? "—" : (fulfilled.count ?? 0)}
          icon={<CheckCircleIcon className="h-4 w-4" />}
          accent="text-[#22c55e]"
        />
        <StatCard
          label="Documents verified"
          value={verifiedDocs.error ? "—" : (verifiedDocs.count ?? 0)}
          icon={<ShieldCheckIcon className="h-4 w-4" />}
          accent="text-[#f59e0b]"
        />
      </div>

      {/* ── Two panels ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Requires Attention */}
        <Panel className="p-6">
          <PanelHeader
            icon={<WarningIcon className="h-5 w-5" />}
            iconClassName="text-[#f59e0b]"
            title="Requires Attention"
            subtext="Items needing review or action"
          />

          {attentionError ? (
            <QueryError
              what="the attention queue"
              message={attentionError.message}
            />
          ) : nothingPending ? (
            <EmptyState
              tone="success"
              icon={<CheckIcon className="h-5 w-5" />}
              title="Nothing requires attention"
              detail="No unconfirmed transactions, no pending vouchers, and no overdue promises."
            />
          ) : (
            <ul className="divide-y divide-[#2d3748]">
              {pendingTxCount > 0 ? (
                <AttentionRow
                  href="/admin/transactions"
                  tone="red"
                  count={pendingTxCount}
                  label="Unconfirmed transactions"
                  detail="Recorded but not yet confirmed"
                />
              ) : null}
              {pendingVoucherCount > 0 ? (
                <AttentionRow
                  href="/admin/vouchers"
                  tone="amber"
                  count={pendingVoucherCount}
                  label="Pending vouchers"
                  detail="Awaiting approval"
                />
              ) : null}
              {overduePromiseCount > 0 ? (
                <AttentionRow
                  href="/admin/promises"
                  tone="red"
                  count={overduePromiseCount}
                  label="Overdue promises"
                  detail="Still active past their target date"
                />
              ) : null}
            </ul>
          )}
        </Panel>

        {/* RIGHT — Recent Accountability Activity */}
        <Panel className="p-6">
          <PanelHeader
            icon={<ClockIcon className="h-5 w-5" />}
            iconClassName="text-[#3b82f6]"
            title="Recent Accountability Activity"
            subtext="Latest changes, newest first"
          />

          {activity.error ? (
            <QueryError
              what="recent activity"
              message={activity.error.message}
            />
          ) : entries.length === 0 ? (
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No activity recorded yet"
              detail="Add your first transaction to begin."
            />
          ) : (
            <ul className="divide-y divide-[#2d3748]">
              {entries.map((entry) => (
                <li key={entry.id} className="flex gap-3 py-3 first:pt-0">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4A7C59]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#f1f5f9]">
                      <span className="font-medium">
                        {entry.actor?.full_name ||
                          entry.actor?.email ||
                          "Unknown user"}
                      </span>{" "}
                      <span className="text-[#94a3b8]">
                        {humanizeEnum(entry.action).toLowerCase()}
                      </span>{" "}
                      <span className="text-[#94a3b8]">
                        {humanizeEnum(entry.entity_type).toLowerCase()}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#475569]">
                      {formatRelative(entry.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AttentionRow({
  href,
  tone,
  count,
  label,
  detail,
}: {
  href: string;
  tone: "red" | "amber";
  count: number;
  label: string;
  detail: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-[#111827]/60"
      >
        <CountBadge tone={tone} count={count} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-[#f1f5f9]">
            {label}
          </span>
          <span className="block text-xs text-[#94a3b8]">{detail}</span>
        </span>
        <span aria-hidden="true" className="text-[#475569]">
          ›
        </span>
      </Link>
    </li>
  );
}
