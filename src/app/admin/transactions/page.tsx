import type { Metadata } from "next";
import Link from "next/link";
import { ClickableRow } from "../_components/ClickableRow";
import { InfoIcon } from "../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../_components/ui";
import {
  TransactionStatusBadge,
  TransactionTypeBadge,
} from "../_components/badges";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatDateOnly } from "@/lib/faithproof/format";
import {
  DONOR_FUNDS,
  FUND_LABELS,
  SELECTABLE_FUNDS,
  type FundDesignation,
  type Transaction,
} from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Transactions | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: { fund?: string };
}) {
  const session = await getSession();
  if (!session) return null;

  // Only a real fund filters. An unknown value is ignored rather than returning
  // an empty table that looks like "there are no transactions".
  const requested = searchParams?.fund ?? "";
  const activeFund = (SELECTABLE_FUNDS as string[]).includes(requested)
    ? (requested as FundDesignation)
    : null;

  let query = session.supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });
  if (activeFund) query = query.eq("fund", activeFund);

  const { data, error } = await query;

  const rows = (data ?? []) as Transaction[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Transactions"
        description="Every donation, grant, expense and disbursement on record."
        action={
          <PrimaryLinkButton href="/admin/transactions/new">
            Add Transaction
          </PrimaryLinkButton>
        }
      />

      {/* ── Fund filter ────────────────────────────────────────────────
          Links, not a form: a filtered list is a place you can send someone,
          and the URL is what makes that possible. */}
      <div className="mb-5 flex flex-wrap gap-2" data-testid="fund-filter">
        <FundChip href="/admin/transactions" label="All funds" active={!activeFund} />
        {DONOR_FUNDS.map((f) => (
          <FundChip
            key={f}
            href={`/admin/transactions?fund=${f}`}
            label={FUND_LABELS[f]}
            active={activeFund === f}
          />
        ))}
      </div>

      {error ? (
        <QueryError what="transactions" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title={
              activeFund
                ? `No transactions in ${FUND_LABELS[activeFund]}`
                : "No transactions recorded yet"
            }
            detail={
              activeFund
                ? "Nothing has been recorded against this fund. Choose All funds to see everything."
                : "Use Add Transaction to record the first donation, grant or expense."
            }
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Fund</Th>
              <Th align="right">Amount</Th>
              <Th>Donor</Th>
              <Th>Status</Th>
              <Th>Reference</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <ClickableRow key={tx.id} href={`/admin/transactions/${tx.id}`}>
                <Td muted className="whitespace-nowrap">
                  <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="font-medium hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    {formatDateOnly(tx.transaction_date)}
                  </Link>
                </Td>
                <Td>
                  <TransactionTypeBadge type={tx.type} />
                </Td>
                <Td muted>
                  <span data-testid="tx-fund">{FUND_LABELS[tx.fund] ?? tx.fund}</span>
                  {tx.fund_backfilled ? (
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                      title="This fund was inferred, not stated by the donor."
                    >
                      unverified
                    </span>
                  ) : null}
                </Td>
                <Td align="right" className="whitespace-nowrap tabular-nums">
                  {formatCents(tx.amount_cents)}
                </Td>
                <Td>
                  {tx.donor_anonymous ? (
                    <span className="text-[#9ca3af]">Anonymous</span>
                  ) : (
                    tx.donor_name || <span className="text-[#9ca3af]">—</span>
                  )}
                </Td>
                <Td>
                  <TransactionStatusBadge status={tx.status} />
                </Td>
                <Td muted>
                  {tx.reference_number || (
                    <span className="text-[#9ca3af]">—</span>
                  )}
                </Td>
              </ClickableRow>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

/** One filter chip. Admin palette: selected is the deep green on butter. */
function FundChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
      style={
        active
          ? { backgroundColor: "#013e37", color: "#ffefb3" }
          : { backgroundColor: "#ffffff", color: "#013e37", border: "1px solid #d9d5cc" }
      }
    >
      {label}
    </Link>
  );
}
