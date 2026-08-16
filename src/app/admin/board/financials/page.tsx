import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  QueryError,
  StatCard,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatCentsCompact } from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import { BoardNav } from "../BoardNav";

export const metadata: Metadata = {
  title: "Board Financials | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const INCOME = new Set(["donation", "grant"]);
const SPEND = new Set(["voucher_disbursement", "expense", "operational"]);

type Row = {
  type: string;
  status: string;
  amount_cents: number;
  fund: string;
  transaction_date: string;
};

export default async function BoardFinancialsPage({
  searchParams,
}: {
  searchParams?: { year?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const thisYear = new Date().getFullYear();
  const requested = Number(searchParams?.year);
  const year =
    Number.isInteger(requested) && requested >= 2020 && requested <= thisYear + 1
      ? requested
      : thisYear;
  const years = Array.from({ length: 4 }, (_, i) => thisYear - i);

  /**
   * Counted here: confirmed and reconciled only. Pending rows are unverified
   * (the Zeffy webhook writes every row as pending), and voided rows are
   * reversals — including either would misstate the figures the board reviews.
   */
  const [{ data, error }, vouchers] = await Promise.all([
    session.supabase
      .from("transactions")
      .select("type, status, amount_cents, fund, transaction_date")
      .in("status", ["confirmed", "reconciled"])
      .gte("transaction_date", `${year}-01-01`)
      .lte("transaction_date", `${year}-12-31`),
    session.supabase
      .from("vouchers")
      .select("status, amount_cents, created_at")
      .gte("created_at", `${year}-01-01`)
      .lte("created_at", `${year}-12-31T23:59:59Z`),
  ]);

  const rows = (data ?? []) as Row[];
  const sum = (pred: (r: Row) => boolean) =>
    rows.filter(pred).reduce((n, r) => n + (r.amount_cents ?? 0), 0);

  const received = sum((r) => INCOME.has(r.type));
  const donations = sum((r) => r.type === "donation");
  const grants = sum((r) => r.type === "grant");
  const spent = sum((r) => SPEND.has(r.type));
  const disbursements = sum((r) => r.type === "voucher_disbursement");
  const operational = sum((r) => r.type === "operational");
  const net = received - spent;
  const overheadPct = spent > 0 ? (operational / spent) * 100 : 0;

  const voucherRows = (vouchers.data ?? []) as {
    status: string;
    amount_cents: number;
  }[];
  const disbursedVouchers = voucherRows.filter((v) => v.status === "disbursed");

  // Per-fund breakdown, built in JS: PostgREST cannot express GROUP BY.
  const byFund = new Map<string, { received: number; spent: number }>();
  for (const r of rows) {
    const entry = byFund.get(r.fund) ?? { received: 0, spent: 0 };
    if (INCOME.has(r.type)) entry.received += r.amount_cents ?? 0;
    if (SPEND.has(r.type)) entry.spent += r.amount_cents ?? 0;
    byFund.set(r.fund, entry);
  }
  const funds = Array.from(byFund.entries()).sort(
    (a, b) => b[1].received + b[1].spent - (a[1].received + a[1].spent)
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Financials"
        description={`Confirmed and reconciled activity for calendar year ${year}.`}
      />
      <BoardNav />

      <div className="mb-6 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link
            key={y}
            href={`/admin/board/financials?year=${y}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums"
            style={
              y === year
                ? { backgroundColor: "#013e37", color: "#ffefb3" }
                : { color: "#6b7280", border: "1px solid #d1d5db" }
            }
          >
            {y}
          </Link>
        ))}
      </div>

      {error ? (
        <QueryError what="financials" message={error.message} />
      ) : (
        <>
          <div
            className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            style={{ position: "relative", zIndex: 10 }}
          >
            <StatCard label="Total received" value={formatCentsCompact(received)} />
            <StatCard label="Donations" value={formatCentsCompact(donations)} />
            <StatCard label="Grants" value={formatCentsCompact(grants)} />
            <StatCard label="Total spent" value={formatCentsCompact(spent)} />
            <StatCard
              label="Voucher disbursements"
              value={formatCentsCompact(disbursements)}
            />
            <StatCard label="Operational" value={formatCentsCompact(operational)} />
            <StatCard label="Overhead rate" value={`${overheadPct.toFixed(1)}%`} />
            <StatCard label="Net position" value={formatCentsCompact(net)} />
          </div>

          <Panel className="mb-6 p-6">
            <h2
              className="mb-2"
              style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}
            >
              Vouchers issued in {year}
            </h2>
            <p className="text-sm" style={{ color: "#374151" }}>
              {voucherRows.length} issued ·{" "}
              {disbursedVouchers.length} disbursed ·{" "}
              {formatCents(
                disbursedVouchers.reduce((n, v) => n + (v.amount_cents ?? 0), 0)
              )}{" "}
              placed in recipients&rsquo; hands.
            </p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
              Voucher totals are counted from the voucher records themselves and
              will not always equal the disbursement transactions above — a
              voucher issued in December can be disbursed in January.
            </p>
          </Panel>

          <h2
            className="mb-3"
            style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}
          >
            By fund
          </h2>
          {funds.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<InfoIcon className="h-5 w-5" />}
                title={`No confirmed activity in ${year}`}
                detail="Pending and voided transactions are deliberately excluded."
              />
            </Panel>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Fund</Th>
                  <Th>Received</Th>
                  <Th>Spent</Th>
                  <Th>Net</Th>
                </tr>
              </thead>
              <tbody>
                {funds.map(([fund, v]) => (
                  <tr key={fund}>
                    <Td className="font-medium">
                      {FUND_LABELS[fund as FundDesignation] ?? fund}
                    </Td>
                    <Td className="tabular-nums">{formatCents(v.received)}</Td>
                    <Td className="tabular-nums">{formatCents(v.spent)}</Td>
                    <Td className="tabular-nums">
                      {formatCents(v.received - v.spent)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </>
      )}
    </div>
  );
}
