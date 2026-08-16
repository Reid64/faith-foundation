import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  StatCard,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatCentsCompact, formatDateOnly } from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import {
  cents,
  describeReference,
  type AccountBalance,
  type JournalEntry,
} from "@/lib/faithproof/accounting";
import { AccountingNav } from "./AccountingNav";

export const metadata: Metadata = {
  title: "Accounting | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;

  const year = new Date().getFullYear();

  const [balances, entries] = await Promise.all([
    sb.from("account_balances").select("*").order("code"),
    sb.from("journal_entries").select("*").order("date", { ascending: false }).limit(10),
  ]);

  if (balances.error) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Accounting" />
        <AccountingNav />
        <QueryError what="account balances" message={balances.error.message} />
      </div>
    );
  }

  const rows = (balances.data ?? []) as AccountBalance[];

  // Fund cash position: the cash accounts are the ones a reader means by
  // "how much does this fund have".
  const cashByFund = rows
    .filter((r) => r.type === "asset" && r.code.startsWith("10"))
    .map((r) => ({
      code: r.code,
      label: r.fund ? (FUND_LABELS[r.fund as FundDesignation] ?? r.name) : r.name,
      balance: cents(r.balance_cents),
      restricted: r.is_restricted,
    }));

  const totalRevenue = rows
    .filter((r) => r.type === "revenue")
    .reduce((n, r) => n + cents(r.balance_cents), 0);
  const totalExpense = rows
    .filter((r) => r.type === "expense")
    .reduce((n, r) => n + cents(r.balance_cents), 0);

  const recent = (entries.data ?? []) as JournalEntry[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Accounting"
        description="Double-entry ledger. Confirming a transaction or disbursing a voucher posts here automatically."
        action={
          <PrimaryLinkButton href="/admin/accounting/journal/new">
            New Journal Entry
          </PrimaryLinkButton>
        }
      />
      <AccountingNav />

      <h2
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#013e37" }}
      >
        Fund cash balances
      </h2>
      <div
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        {cashByFund.map((f) => (
          <StatCard
            key={f.code}
            label={`${f.label}${f.restricted ? " (restricted)" : ""}`}
            value={formatCentsCompact(f.balance)}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="p-6">
          <h2 className="mb-1" style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
            Income vs Expense
          </h2>
          <p className="mb-4 text-xs" style={{ color: "#9ca3af" }}>
            Ledger totals to date, all years.
          </p>
          <dl>
            {[
              ["Revenue", formatCents(totalRevenue)],
              ["Expenses", formatCents(totalExpense)],
              ["Net", formatCents(totalRevenue - totalExpense)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid #f0f0ef" }}
              >
                <dt style={{ color: "#6b7280", fontSize: 13 }}>{label}</dt>
                <dd
                  className="tabular-nums"
                  style={{ color: "#013e37", fontSize: 16, fontWeight: 700 }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={`/admin/accounting/reports?report=activities&year=${year}`}
            className="mt-3 inline-block text-sm font-semibold"
            style={{ color: "#013e37" }}
          >
            Statement of Activities →
          </Link>
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
              Recent Journal Entries
            </h2>
            <Link
              href="/admin/accounting/journal"
              className="text-sm font-semibold"
              style={{ color: "#013e37" }}
            >
              Full journal →
            </Link>
          </div>

          {entries.error ? (
            <QueryError what="journal entries" message={entries.error.message} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No entries yet"
              detail="Confirm a transaction, disburse a voucher, or write a manual entry."
            />
          ) : (
            <ul className="divide-y divide-[#f0f0ef]">
              {recent.map((e) => {
                const ref = describeReference(e.reference);
                return (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <span>
                      <span className="block text-sm" style={{ color: "#111827" }}>
                        {e.description}
                      </span>
                      <span className="block text-xs" style={{ color: "#9ca3af" }}>
                        {formatDateOnly(e.date)} · {ref.label}
                      </span>
                    </span>
                    <Link
                      href={`/admin/accounting/journal?entry=${e.id}`}
                      className="text-sm font-semibold"
                      style={{ color: "#013e37" }}
                    >
                      View
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
