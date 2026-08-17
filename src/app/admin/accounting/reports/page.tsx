import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel, QueryError } from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatDateOnly } from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import type { AccountType } from "@/lib/faithproof/accounting";
import { AccountingNav } from "../AccountingNav";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Financial Reports | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const REPORTS = [
  { key: "position", label: "Statement of Financial Position" },
  { key: "activities", label: "Statement of Activities" },
  { key: "funds", label: "Fund Balance Report" },
  { key: "cashflow", label: "Cash Flow Summary" },
] as const;

type ReportKey = (typeof REPORTS)[number]["key"];

type LineRow = {
  debit_cents: number;
  credit_cents: number;
  /** Added in migration 015 — the fund this line belongs to, set at write time. */
  fund: FundDesignation | null;
  journal_entries: { date: string } | { date: string }[] | null;
  accounts:
    | {
        code: string;
        name: string;
        type: AccountType;
        fund: FundDesignation | null;
        is_restricted: boolean;
      }
    | {
        code: string;
        name: string;
        type: AccountType;
        fund: FundDesignation | null;
        is_restricted: boolean;
      }[]
    | null;
};

type Flat = {
  date: string;
  debit: number;
  credit: number;
  code: string;
  name: string;
  type: AccountType;
  fund: FundDesignation | null;
  restricted: boolean;
};

/** PostgREST types an embed as an object or an array depending on how it
 *  resolves the relationship — normalise both rather than assuming one. */
function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** Natural balance: assets and expenses are debit-normal, the rest credit-normal. */
function natural(type: AccountType, debit: number, credit: number): number {
  return type === "asset" || type === "expense" ? debit - credit : credit - debit;
}

function money(c: number) {
  return formatCents(c);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { report?: string; asOf?: string; from?: string; to?: string; year?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const thisYear = new Date().getFullYear();
  const report = (REPORTS.find((r) => r.key === searchParams?.report)?.key ??
    "position") as ReportKey;
  const year =
    Number.isInteger(Number(searchParams?.year)) && Number(searchParams?.year) > 2000
      ? Number(searchParams?.year)
      : thisYear;
  const asOf = searchParams?.asOf || `${thisYear}-12-31`;
  const from = searchParams?.from || `${year}-01-01`;
  const to = searchParams?.to || `${year}-12-31`;

  // One query serves every report; each one just slices the same ledger.
  let query = session.supabase
    .from("journal_lines")
    .select(
      "debit_cents, credit_cents, fund, journal_entries!inner(date), accounts!inner(code, name, type, fund, is_restricted)"
    );

  if (report === "position") {
    query = query.lte("journal_entries.date", asOf);
  } else if (report === "cashflow") {
    query = query
      .gte("journal_entries.date", `${year}-01-01`)
      .lte("journal_entries.date", `${year}-12-31`);
  } else if (report === "activities") {
    query = query.gte("journal_entries.date", from).lte("journal_entries.date", to);
  }
  // The fund balance report is cumulative — no date filter.

  const { data, error } = await query;

  const rows: Flat[] = ((data ?? []) as LineRow[]).flatMap((r) => {
    const entry = one(r.journal_entries);
    const account = one(r.accounts);
    if (!entry || !account) return [];
    return [
      {
        date: entry.date,
        debit: r.debit_cents ?? 0,
        credit: r.credit_cents ?? 0,
        code: account.code,
        name: account.name,
        type: account.type,
        // The LINE's fund wins. The account's is a fallback for entries posted
        // before migration 015 and for manual entries to shared accounts.
        // Reporting on the account alone was why Recovery, Reentry and
        // Cornerstone donations were indistinguishable — they shared one.
        fund: r.fund ?? account.fund,
        restricted: account.is_restricted,
      },
    ];
  });

  const byAccount = new Map<
    string,
    { name: string; type: AccountType; fund: FundDesignation | null; restricted: boolean; debit: number; credit: number }
  >();
  for (const r of rows) {
    const cur =
      byAccount.get(r.code) ??
      { name: r.name, type: r.type, fund: r.fund, restricted: r.restricted, debit: 0, credit: 0 };
    cur.debit += r.debit;
    cur.credit += r.credit;
    byAccount.set(r.code, cur);
  }

  const accountRows = Array.from(byAccount.entries())
    .map(([code, v]) => ({ code, ...v, balance: natural(v.type, v.debit, v.credit) }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const sumType = (t: AccountType) =>
    accountRows.filter((r) => r.type === t).reduce((n, r) => n + r.balance, 0);

  const params = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ report, asOf, from, to, year: String(year), ...over }))
      if (v) p.set(k, String(v));
    return `/admin/accounting/reports?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Financial Reports"
        description="Generated from the ledger on demand. Nothing here is stored."
        action={<PrintButton />}
      />
      <AccountingNav />

      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        {REPORTS.map((r) => (
          <Link
            key={r.key}
            href={params({ report: r.key })}
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={
              report === r.key
                ? { backgroundColor: "#013e37", color: "#ffefb3" }
                : { color: "#6b7280", border: "1px solid #d1d5db" }
            }
          >
            {r.label}
          </Link>
        ))}
      </div>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl p-4 print:hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
        }}
      >
        <input type="hidden" name="report" value={report} />
        {report === "position" ? (
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
            As of
            <input
              name="asOf"
              type="date"
              defaultValue={asOf}
              className="mt-1.5 block rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#111827]"
            />
          </label>
        ) : null}
        {report === "activities" ? (
          <>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
              From
              <input
                name="from"
                type="date"
                defaultValue={from}
                className="mt-1.5 block rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#111827]"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
              To
              <input
                name="to"
                type="date"
                defaultValue={to}
                className="mt-1.5 block rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#111827]"
              />
            </label>
          </>
        ) : null}
        {report === "cashflow" ? (
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
            Year
            <input
              name="year"
              type="number"
              min="2020"
              max={thisYear + 1}
              defaultValue={year}
              className="mt-1.5 block rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#111827]"
            />
          </label>
        ) : null}
        {report === "funds" ? (
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Cumulative across all dates — a fund balance is a running position,
            not a period figure.
          </p>
        ) : (
          <button
            type="submit"
            className="rounded-lg px-5 py-2 text-sm font-semibold"
            style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
          >
            Update
          </button>
        )}
      </form>

      {error ? (
        <QueryError what="this report" message={error.message} />
      ) : (
        <Panel className="p-8">
          {report === "position" ? (
            <PositionReport
              asOf={asOf}
              rows={accountRows}
              assets={sumType("asset")}
              liabilities={sumType("liability")}
              equity={sumType("equity")}
              revenue={sumType("revenue")}
              expenses={sumType("expense")}
            />
          ) : report === "activities" ? (
            <ActivitiesReport from={from} to={to} rows={accountRows} />
          ) : report === "funds" ? (
            <FundsReport rows={accountRows} />
          ) : (
            <CashFlowReport year={year} rows={rows} accountRows={accountRows} />
          )}
        </Panel>
      )}
    </div>
  );
}

// ── Report bodies ───────────────────────────────────────────────────────────

type AccountRow = {
  code: string;
  name: string;
  type: AccountType;
  fund: FundDesignation | null;
  restricted: boolean;
  balance: number;
};

function ReportHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <p className="text-sm" style={{ color: "#6b7280" }}>
        FAITH Foundation
      </p>
      <h2 style={{ color: "#013e37", fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <p className="text-sm" style={{ color: "#6b7280" }}>
        {subtitle}
      </p>
    </header>
  );
}

function Section({
  title,
  rows,
  total,
}: {
  title: string;
  rows: AccountRow[];
  total: number;
}) {
  return (
    <section className="mb-6">
      <h3
        className="mb-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#013e37" }}
      >
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          No activity.
        </p>
      ) : (
        <table className="w-full">
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} style={{ borderBottom: "1px solid #f0f0ef" }}>
                <td className="py-2 text-sm" style={{ color: "#374151" }}>
                  {r.code} — {r.name}
                </td>
                <td
                  className="py-2 text-right text-sm tabular-nums"
                  style={{ color: "#111827" }}
                >
                  {money(r.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div
        className="mt-2 flex items-center justify-between border-t pt-2"
        style={{ borderColor: "#013e37" }}
      >
        <span className="text-sm font-semibold" style={{ color: "#013e37" }}>
          Total {title}
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: "#013e37" }}
        >
          {money(total)}
        </span>
      </div>
    </section>
  );
}

function PositionReport({
  asOf,
  rows,
  assets,
  liabilities,
  equity,
  revenue,
  expenses,
}: {
  asOf: string;
  rows: AccountRow[];
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
}) {
  // Net assets include the current period's surplus, which has not been closed
  // into an equity account. Without this the statement would not balance and
  // the reader would have no way to tell why.
  const surplus = revenue - expenses;
  const netAssets = equity + surplus;

  return (
    <>
      <ReportHeading
        title="Statement of Financial Position"
        subtitle={`As of ${formatDateOnly(asOf)}`}
      />
      <Section
        title="Assets"
        rows={rows.filter((r) => r.type === "asset")}
        total={assets}
      />
      <Section
        title="Liabilities"
        rows={rows.filter((r) => r.type === "liability")}
        total={liabilities}
      />
      <Section
        title="Net Assets"
        rows={rows.filter((r) => r.type === "equity")}
        total={equity}
      />
      <div
        className="mt-6 rounded-xl px-4 py-3"
        style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm">Current period surplus (not yet closed)</span>
          <span className="text-sm font-semibold tabular-nums">{money(surplus)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold">
            Liabilities + net assets including surplus
          </span>
          <span className="text-base font-bold tabular-nums">
            {money(liabilities + netAssets)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold">Total assets</span>
          <span className="text-base font-bold tabular-nums">{money(assets)}</span>
        </div>
        {liabilities + netAssets !== assets ? (
          <p className="mt-2 text-xs">
            These two figures should match. A difference of{" "}
            {money(assets - (liabilities + netAssets))} means an entry was posted
            outside the double-entry path — check the journal.
          </p>
        ) : null}
      </div>
      <FundBreakout
        rows={rows}
        types={["asset"]}
        title="Assets by fund"
        note="Where the money sits. A restricted fund may only be spent on its purpose."
      />
    </>
  );
}

function ActivitiesReport({
  from,
  to,
  rows,
}: {
  from: string;
  to: string;
  rows: AccountRow[];
}) {
  const revenue = rows.filter((r) => r.type === "revenue");
  const expenses = rows.filter((r) => r.type === "expense");
  const totalRevenue = revenue.reduce((n, r) => n + r.balance, 0);
  const totalExpenses = expenses.reduce((n, r) => n + r.balance, 0);

  return (
    <>
      <ReportHeading
        title="Statement of Activities"
        subtitle={`${formatDateOnly(from)} to ${formatDateOnly(to)}`}
      />
      <Section title="Revenue" rows={revenue} total={totalRevenue} />
      <Section title="Expenses" rows={expenses} total={totalExpenses} />
      <FundBreakout
        rows={rows}
        types={["revenue"]}
        title="Revenue by fund"
        note="What was given to each fund in this period. Aggregate only — no donor is named."
      />
      <FundBreakout
        rows={rows}
        types={["expense"]}
        title="Expenses by fund"
        note="What each fund was spent on in this period."
      />
      <div
        className="mt-6 flex items-center justify-between rounded-xl px-4 py-3"
        style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
      >
        <span className="text-sm font-semibold">Change in net assets</span>
        <span className="text-base font-bold tabular-nums">
          {money(totalRevenue - totalExpenses)}
        </span>
      </div>
    </>
  );
}

/**
 * Per-fund breakout, shared by all four reports.
 *
 * Under FASB ASU 2016-14 a nonprofit reports net assets WITH and WITHOUT donor
 * restrictions, and a donor's designation is exactly what creates a
 * restriction. The restricted/unrestricted split was already right here; what
 * no report could show was WHICH restricted fund a figure belonged to, because
 * Recovery, Reentry and Cornerstone donations all posted to one shared revenue
 * account. Migration 015 gave every line its own fund, and this is what reads
 * it back.
 *
 * Aggregate only — a fund total never names a donor. See
 * /governance/donor-privacy.
 */
function FundBreakout({
  rows,
  types,
  title,
  note,
}: {
  rows: AccountRow[];
  types: AccountType[];
  title: string;
  note: string;
}) {
  const byFund = new Map<string, { restricted: boolean; total: number }>();
  for (const r of rows) {
    if (!types.includes(r.type)) continue;
    const key = r.fund ?? "unassigned";
    const cur = byFund.get(key) ?? { restricted: r.restricted, total: 0 };
    cur.total += r.balance;
    cur.restricted = cur.restricted || r.restricted;
    byFund.set(key, cur);
  }

  const entries = Array.from(byFund.entries())
    .filter(([, v]) => v.total !== 0)
    .sort((a, b) => b[1].total - a[1].total);

  if (entries.length === 0) return null;

  const restricted = entries.filter(([, v]) => v.restricted).reduce((n, [, v]) => n + v.total, 0);
  const unrestricted = entries.filter(([, v]) => !v.restricted).reduce((n, [, v]) => n + v.total, 0);

  return (
    <section className="mt-8" data-testid="fund-breakout">
      <h3 className="text-sm font-semibold" style={{ color: "#013e37" }}>
        {title}
      </h3>
      <p className="mt-1 text-xs" style={{ color: "#6b7280" }}>
        {note}
      </p>
      <table className="mt-3 w-full">
        <thead>
          <tr>
            {["Fund", "Restriction", "Amount"].map((h, i) => (
              <th
                key={h}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider ${
                  i === 2 ? "text-right" : "text-left"
                }`}
                style={{ color: "#6b7280" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(([fund, v]) => (
            <tr key={fund} style={{ borderTop: "1px solid #f0f0ef" }}>
              <td className="py-2 text-sm" style={{ color: "#111827" }}>
                {fund === "unassigned"
                  ? "Unassigned"
                  : (FUND_LABELS[fund as FundDesignation] ?? fund)}
              </td>
              <td className="py-2 text-sm" style={{ color: "#6b7280" }}>
                {v.restricted ? "With donor restrictions" : "Without donor restrictions"}
              </td>
              <td className="py-2 text-right text-sm tabular-nums" style={{ color: "#111827" }}>
                {money(v.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid #013e37" }}>
            <td className="pt-2 text-sm font-semibold" style={{ color: "#013e37" }} colSpan={2}>
              With donor restrictions
            </td>
            <td className="pt-2 text-right text-sm font-bold tabular-nums" style={{ color: "#013e37" }}>
              {money(restricted)}
            </td>
          </tr>
          <tr>
            <td className="pt-1 text-sm font-semibold" style={{ color: "#013e37" }} colSpan={2}>
              Without donor restrictions
            </td>
            <td className="pt-1 text-right text-sm font-bold tabular-nums" style={{ color: "#013e37" }}>
              {money(unrestricted)}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function FundsReport({ rows }: { rows: AccountRow[] }) {
  const funds = new Map<string, { restricted: boolean; balance: number }>();
  for (const r of rows) {
    if (r.type !== "asset") continue;
    const key = r.fund ?? "unassigned";
    const cur = funds.get(key) ?? { restricted: r.restricted, balance: 0 };
    cur.balance += r.balance;
    cur.restricted = cur.restricted || r.restricted;
    funds.set(key, cur);
  }

  const entries = Array.from(funds.entries()).sort((a, b) => b[1].balance - a[1].balance);
  const restricted = entries
    .filter(([, v]) => v.restricted)
    .reduce((n, [, v]) => n + v.balance, 0);
  const unrestricted = entries
    .filter(([, v]) => !v.restricted)
    .reduce((n, [, v]) => n + v.balance, 0);

  return (
    <>
      <ReportHeading
        title="Fund Balance Report"
        subtitle="Cash position by fund, restricted and unrestricted"
      />
      <table className="w-full">
        <thead>
          <tr>
            {["Fund", "Restriction", "Balance"].map((h, i) => (
              <th
                key={h}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider ${i === 2 ? "text-right" : "text-left"}`}
                style={{ color: "#6b7280" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-4 text-sm" style={{ color: "#9ca3af" }}>
                No fund activity recorded.
              </td>
            </tr>
          ) : (
            entries.map(([fund, v]) => (
              <tr key={fund} style={{ borderBottom: "1px solid #f0f0ef" }}>
                <td className="py-2 text-sm" style={{ color: "#374151" }}>
                  {fund === "unassigned"
                    ? "Unassigned"
                    : (FUND_LABELS[fund as FundDesignation] ?? fund)}
                </td>
                <td className="py-2 text-sm" style={{ color: "#6b7280" }}>
                  {v.restricted ? "Restricted" : "Unrestricted"}
                </td>
                <td
                  className="py-2 text-right text-sm tabular-nums"
                  style={{ color: "#111827" }}
                >
                  {money(v.balance)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div
        className="mt-6 rounded-xl px-4 py-3"
        style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Total restricted</span>
          <span className="text-sm font-bold tabular-nums">{money(restricted)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold">Total unrestricted</span>
          <span className="text-sm font-bold tabular-nums">{money(unrestricted)}</span>
        </div>
      </div>
    </>
  );
}

function CashFlowReport({
  year,
  rows,
  accountRows,
}: {
  year: number;
  rows: Flat[];
  accountRows: AccountRow[];
}) {
  // Cash movement only — the 1xxx cash accounts. A debit to cash is an inflow,
  // a credit is an outflow.
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(year, i, 1).toLocaleDateString("en-US", { month: "short" }),
    inflow: 0,
    outflow: 0,
  }));

  for (const r of rows) {
    if (r.type !== "asset" || !r.code.startsWith("10")) continue;
    const m = Number(r.date.slice(5, 7)) - 1;
    if (m < 0 || m > 11) continue;
    months[m].inflow += r.debit;
    months[m].outflow += r.credit;
  }

  const totalIn = months.reduce((n, m) => n + m.inflow, 0);
  const totalOut = months.reduce((n, m) => n + m.outflow, 0);

  return (
    <>
      <ReportHeading title="Cash Flow Summary" subtitle={`Calendar year ${year}`} />
      <table className="w-full">
        <thead>
          <tr>
            {["Month", "Inflows", "Outflows", "Net"].map((h, i) => (
              <th
                key={h}
                className={`pb-2 text-xs font-semibold uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                style={{ color: "#6b7280" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.label} style={{ borderBottom: "1px solid #f0f0ef" }}>
              <td className="py-2 text-sm" style={{ color: "#374151" }}>
                {m.label}
              </td>
              <td className="py-2 text-right text-sm tabular-nums" style={{ color: "#111827" }}>
                {money(m.inflow)}
              </td>
              <td className="py-2 text-right text-sm tabular-nums" style={{ color: "#111827" }}>
                {money(m.outflow)}
              </td>
              <td className="py-2 text-right text-sm tabular-nums" style={{ color: "#111827" }}>
                {money(m.inflow - m.outflow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        className="mt-6 flex items-center justify-between rounded-xl px-4 py-3"
        style={{ backgroundColor: "#ffefb3", color: "#013e37" }}
      >
        <span className="text-sm font-semibold">Net cash movement in {year}</span>
        <span className="text-base font-bold tabular-nums">
          {money(totalIn - totalOut)}
        </span>
      </div>
      <FundBreakout
        rows={accountRows}
        types={["asset"]}
        title="Cash movement by fund"
        note="Net change in each fund's cash position over the year."
      />
    </>
  );
}
