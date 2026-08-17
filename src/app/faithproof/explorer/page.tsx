import type { Metadata } from "next";
import Link from "next/link";
import {
  getFundTotals,
  getLedgerTotals,
  getPublicLedger,
} from "@/lib/faithproof/public";
import { formatCents, formatDateOnly, humanizeEnum } from "@/lib/faithproof/format";
import {
  FUND_LABELS,
  SELECTABLE_FUNDS,
  TRANSACTION_TYPE_LABELS,
  type FundDesignation,
  type TransactionType,
} from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Financial Explorer | FaithProof™ — FAITH Foundation",
  description:
    "Filter and drill into every category of public giving and spending at FAITH Foundation.",
  alternates: { canonical: "/faithproof/explorer" },
};

export const dynamic = "force-dynamic";

const RANGES = [
  { value: "", label: "All Time" },
  { value: "year", label: "This Year" },
  { value: "quarter", label: "This Quarter" },
  { value: "month", label: "This Month" },
];

const TYPES = [
  { value: "", label: "All Types" },
  { value: "donation", label: "Donations" },
  { value: "expense", label: "Expenses" },
  { value: "voucher_disbursement", label: "Voucher Disbursements" },
  { value: "grant", label: "Grants" },
];

/** Turn a range key into an inclusive start date. */
function rangeStart(range: string): string | undefined {
  const now = new Date();
  const y = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  if (range === "year") return `${y}-01-01`;
  if (range === "month") return `${y}-${pad(now.getMonth() + 1)}-01`;
  if (range === "quarter") {
    const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
    return `${y}-${pad(qStartMonth + 1)}-01`;
  }
  return undefined;
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams?: {
    fund?: string;
    type?: string;
    range?: string;
    page?: string;
  };
}) {
  const fund = searchParams?.fund ?? "";
  const type = searchParams?.type ?? "";
  const range = searchParams?.range ?? "";
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const from = rangeStart(range);

  const filters = { fund: fund || undefined, type: type || undefined, from };

  const [ledger, all, fundTotals] = await Promise.all([
    getPublicLedger({ ...filters, page }),
    getLedgerTotals(filters),
    getFundTotals(),
  ]);

  const totalCents = all.reduce((n, r) => n + (r.amount_cents ?? 0), 0);
  const avgCents = all.length ? Math.round(totalCents / all.length) : 0;
  const totalPages = Math.max(1, Math.ceil(ledger.total / ledger.perPage));

  const dates = all.map((r) => r.transaction_date).sort();
  const rangeLabel =
    dates.length > 0
      ? `${formatDateOnly(dates[0])} – ${formatDateOnly(dates[dates.length - 1])}`
      : "—";

  // Per-fund in/out. "In" is money arriving, "out" is money leaving.
  const byFund = new Map<string, { in: number; out: number }>();
  for (const row of all) {
    const entry = byFund.get(row.fund) ?? { in: 0, out: 0 };
    if (row.type === "donation" || row.type === "grant") {
      entry.in += row.amount_cents ?? 0;
    } else {
      entry.out += row.amount_cents ?? 0;
    }
    byFund.set(row.fund, entry);
  }
  const fundRows = Array.from(byFund.entries()).sort(
    (a, b) => b[1].in + b[1].out - (a[1].in + a[1].out)
  );
  const maxFundVolume = Math.max(
    1,
    ...fundRows.map(([, v]) => v.in + v.out)
  );

  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { fund, type, range, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/faithproof/explorer?${s}` : "/faithproof/explorer";
  };

  return (
    <>
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Link
            href="/faithproof"
            className="text-sm font-semibold text-navy hover:text-gold-dark"
          >
            ← Back to FaithProof
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
            Financial Explorer
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#6b7280]">
            Filter and drill into every category of public giving and spending.
          </p>

          {/* ── Raised by fund ─────────────────────────────────────── */}
          <section className="mt-8" data-testid="fund-totals">
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy">
              Total raised by fund
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Aggregate totals across all donors. Which fund an individual donor
              chose is never published — see our{" "}
              <Link href="/governance/donor-privacy" className="underline">
                donor privacy commitment
              </Link>
              .
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fundTotals.map((f) => (
                <div
                  key={f.fund}
                  className="flex items-baseline justify-between gap-3 rounded-lg bg-white px-4 py-3 shadow-sm"
                >
                  <dt className="text-sm font-medium text-navy">{f.label}</dt>
                  <dd className="text-base font-bold tabular-nums text-navy">
                    {formatCents(f.totalCents)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Filter bar ─────────────────────────────────────────── */}
          <form
            method="get"
            className="mt-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-end"
          >
            <FilterSelect
              id="fund"
              label="Fund"
              defaultValue={fund}
              options={[
                { value: "", label: "All Funds" },
                ...SELECTABLE_FUNDS.map((f) => ({
                  value: f,
                  label: FUND_LABELS[f],
                })),
              ]}
            />
            <FilterSelect
              id="range"
              label="Date range"
              defaultValue={range}
              options={RANGES}
            />
            <FilterSelect
              id="type"
              label="Type"
              defaultValue={type}
              options={TYPES}
            />
            <button
              type="submit"
              className="rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-gold transition hover:bg-navy-light"
            >
              Apply
            </button>
            {fund || type || range ? (
              <Link
                href="/faithproof/explorer"
                className="self-center text-sm font-semibold text-[#6b7280] hover:text-navy"
              >
                Reset
              </Link>
            ) : null}
          </form>

          {/* ── Summary pills ──────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Pill label="Matching records" value={String(all.length)} />
            <Pill label="Total amount" value={formatCents(totalCents)} />
            <Pill label="Average amount" value={formatCents(avgCents)} />
            <Pill label="Date range shown" value={rangeLabel} />
          </div>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          {ledger.rows.length === 0 ? (
            <div className="text-center">
              <div className="mx-auto h-1 w-24 bg-gold" aria-hidden />
              <p className="mt-6 text-base text-[#6b7280]">
                No public transactions match these filters yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-black/5 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr>
                        <ExTh>Date</ExTh>
                        <ExTh>Type</ExTh>
                        <ExTh>Fund</ExTh>
                        <ExTh align="right">Amount</ExTh>
                        <ExTh>Description</ExTh>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.rows.map((row) => (
                        <tr
                          key={row.id}
                          className="bg-white transition-colors even:bg-[#fafaf5] hover:bg-[#f0f9f4]"
                        >
                          <ExTd>{formatDateOnly(row.transaction_date)}</ExTd>
                          <ExTd>
                            {TRANSACTION_TYPE_LABELS[
                              row.type as TransactionType
                            ] ?? humanizeEnum(row.type)}
                          </ExTd>
                          <ExTd>
                            {FUND_LABELS[row.fund as FundDesignation] ??
                              humanizeEnum(row.fund)}
                          </ExTd>
                          <ExTd align="right">
                            {formatCents(row.amount_cents)}
                          </ExTd>
                          <ExTd>{row.description || "—"}</ExTd>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-between text-sm">
                  {page > 1 ? (
                    <Link
                      href={qs({ page: String(page - 1) })}
                      className="font-semibold text-navy hover:text-gold-dark"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="text-[#d1d5db]">← Previous</span>
                  )}
                  <span className="text-[#6b7280]">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={qs({ page: String(page + 1) })}
                      className="font-semibold text-navy hover:text-gold-dark"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="text-[#d1d5db]">Next →</span>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* ── By fund ────────────────────────────────────────────── */}
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-navy">By Fund</h2>
            {fundRows.length === 0 ? (
              <p className="mt-4 text-base text-[#6b7280]">
                Fund totals appear once public transactions are confirmed.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {fundRows.map(([f, v]) => {
                  const volume = v.in + v.out;
                  const net = v.in - v.out;
                  return (
                    <div
                      key={f}
                      className="rounded-xl border border-[#e5e7eb] bg-white p-5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="font-semibold text-navy">
                          {FUND_LABELS[f as FundDesignation] ?? humanizeEnum(f)}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          In {formatCents(v.in)} · Out {formatCents(v.out)} ·{" "}
                          <span
                            className="font-semibold"
                            style={{ color: net >= 0 ? "#16a34a" : "#dc2626" }}
                          >
                            Net {formatCents(net)}
                          </span>
                        </p>
                      </div>
                      <div
                        className="mt-3 h-2 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: "#f0f0ef" }}
                        role="img"
                        aria-label={`Share of activity: ${Math.round(
                          (volume / maxFundVolume) * 100
                        )} percent of the largest fund`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(volume / maxFundVolume) * 100}%`,
                            backgroundColor: "#C9A227",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FilterSelect({
  id,
  label,
  defaultValue,
  options,
}: {
  id: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-[#6b7280]"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-navy"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold tabular-nums text-navy">
        {value}
      </p>
    </div>
  );
}

function ExTh({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap bg-navy px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gold first:rounded-tl-xl last:rounded-tr-xl ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function ExTd({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`border-b border-[#f0f0ef] px-4 py-3 text-sm text-charcoal ${
        align === "right" ? "text-right tabular-nums" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
