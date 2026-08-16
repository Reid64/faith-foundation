import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatDateOnly } from "@/lib/faithproof/format";
import {
  describeReference,
  type Account,
  type JournalEntry,
  type JournalLine,
} from "@/lib/faithproof/accounting";
import { AccountingNav } from "../AccountingNav";

export const metadata: Metadata = {
  title: "Journal | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

export default async function JournalPage({
  searchParams,
}: {
  searchParams?: {
    from?: string;
    to?: string;
    account?: string;
    entry?: string;
    page?: string;
  };
}) {
  const session = await getSession();
  if (!session) return null;
  const sb = session.supabase;

  const from = searchParams?.from ?? "";
  const to = searchParams?.to ?? "";
  const account = searchParams?.account ?? "";
  const openEntry = searchParams?.entry ?? "";
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const offset = (page - 1) * PER_PAGE;

  const { data: accountRows } = await sb
    .from("accounts")
    .select("id, code, name")
    .order("code");
  const accounts = (accountRows ?? []) as Pick<Account, "id" | "code" | "name">[];
  const accountName = new Map(
    accounts.map((a) => [a.id, `${a.code} — ${a.name}`])
  );

  /**
   * Filtering by account means filtering by the entries that touch it, which
   * PostgREST cannot express as a join filter on the parent. So the matching
   * entry ids are fetched first and used as an `in` filter.
   */
  let entryIds: string[] | null = null;
  if (account) {
    const { data: lineRows } = await sb
      .from("journal_lines")
      .select("entry_id")
      .eq("account_id", account);
    entryIds = Array.from(
      new Set(((lineRows ?? []) as { entry_id: string }[]).map((l) => l.entry_id))
    );
  }

  let query = sb
    .from("journal_entries")
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + PER_PAGE - 1);

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (entryIds) {
    // An account with no lines matches nothing — say so rather than showing all.
    query = query.in("id", entryIds.length ? entryIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data, error, count } = await query;
  const entries = (data ?? []) as JournalEntry[];

  const { data: lineRows } = entries.length
    ? await sb
        .from("journal_lines")
        .select("*")
        .in("entry_id", entries.map((e) => e.id))
    : { data: [] as JournalLine[] };

  const linesByEntry = new Map<string, JournalLine[]>();
  for (const l of (lineRows ?? []) as JournalLine[]) {
    linesByEntry.set(l.entry_id, [...(linesByEntry.get(l.entry_id) ?? []), l]);
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { from, to, account, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/accounting/journal?${s}` : "/admin/accounting/journal";
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Journal"
        description={`${count ?? 0} entr${count === 1 ? "y" : "ies"}. Every line is a debit or a credit; every entry balances.`}
        action={
          <PrimaryLinkButton href="/admin/accounting/journal/new">
            New Entry
          </PrimaryLinkButton>
        }
      />
      <AccountingNav />

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
        }}
      >
        <div>
          <label
            htmlFor="from"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="mt-1.5 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <div>
          <label
            htmlFor="to"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="mt-1.5 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          />
        </div>
        <div className="min-w-[14rem] flex-1">
          <label
            htmlFor="account"
            className="block text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6b7280" }}
          >
            Account
          </label>
          <select
            id="account"
            name="account"
            defaultValue={account}
            className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827]"
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
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
        {from || to || account ? (
          <Link
            href="/admin/accounting/journal"
            className="self-center text-sm font-medium"
            style={{ color: "#6b7280" }}
          >
            Reset
          </Link>
        ) : null}
      </form>

      {error ? (
        <QueryError what="the journal" message={error.message} />
      ) : entries.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No entries match"
            detail="Clear the filters, or write the first entry."
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const lines = linesByEntry.get(e.id) ?? [];
            const debits = lines.reduce((n, l) => n + (l.debit_cents ?? 0), 0);
            const ref = describeReference(e.reference);
            return (
              <Panel key={e.id} className="p-0">
                <details open={openEntry === e.id}>
                  <summary
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4"
                    style={{ color: "#111827" }}
                  >
                    <span>
                      <span className="text-sm font-semibold">{e.description}</span>
                      <span className="ml-3 text-xs" style={{ color: "#9ca3af" }}>
                        {formatDateOnly(e.date)} · {lines.length} line
                        {lines.length === 1 ? "" : "s"} ·{" "}
                        {ref.href ? (
                          <Link
                            href={ref.href}
                            className="hover:underline"
                            style={{ color: "#013e37" }}
                          >
                            {ref.label}
                          </Link>
                        ) : (
                          ref.label
                        )}
                      </span>
                    </span>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: "#013e37" }}
                    >
                      {formatCents(debits)}
                    </span>
                  </summary>

                  <table className="w-full" style={{ borderTop: "1px solid #f0f0ef" }}>
                    <thead>
                      <tr>
                        {["Account", "Memo", "Debit", "Credit"].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#6b7280" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.id} style={{ borderTop: "1px solid #f7f7f6" }}>
                          <td className="px-5 py-2 text-sm" style={{ color: "#374151" }}>
                            {accountName.get(l.account_id) ?? "(account removed)"}
                          </td>
                          <td className="px-5 py-2 text-sm" style={{ color: "#9ca3af" }}>
                            {l.memo || "—"}
                          </td>
                          <td className="px-5 py-2 text-sm tabular-nums" style={{ color: "#111827" }}>
                            {l.debit_cents ? formatCents(l.debit_cents) : ""}
                          </td>
                          <td className="px-5 py-2 text-sm tabular-nums" style={{ color: "#111827" }}>
                            {l.credit_cents ? formatCents(l.credit_cents) : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </Panel>
            );
          })}

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between text-sm">
              {page > 1 ? (
                <Link href={qs({ page: String(page - 1) })} style={{ color: "#013e37", fontWeight: 600 }}>
                  ← Previous
                </Link>
              ) : (
                <span style={{ color: "#d1d5db" }}>← Previous</span>
              )}
              <span style={{ color: "#6b7280" }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={qs({ page: String(page + 1) })} style={{ color: "#013e37", fontWeight: 600 }}>
                  Next →
                </Link>
              ) : (
                <span style={{ color: "#d1d5db" }}>Next →</span>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
