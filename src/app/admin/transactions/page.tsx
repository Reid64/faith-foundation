import type { Metadata } from "next";
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
import { FUND_LABELS, type Transaction } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Transactions | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

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

      {error ? (
        <QueryError what="transactions" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No transactions recorded yet"
            detail="Use Add Transaction to record the first donation, grant or expense."
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
              <tr key={tx.id} className="transition hover:bg-[#111827]/40">
                <Td className="whitespace-nowrap text-[#94a3b8]">
                  {formatDateOnly(tx.transaction_date)}
                </Td>
                <Td>
                  <TransactionTypeBadge type={tx.type} />
                </Td>
                <Td className="text-[#94a3b8]">
                  {FUND_LABELS[tx.fund] ?? tx.fund}
                </Td>
                <Td align="right" className="whitespace-nowrap tabular-nums">
                  {formatCents(tx.amount_cents)}
                </Td>
                <Td>
                  {tx.donor_anonymous ? (
                    <span className="text-[#475569]">Anonymous</span>
                  ) : (
                    tx.donor_name || <span className="text-[#475569]">—</span>
                  )}
                </Td>
                <Td>
                  <TransactionStatusBadge status={tx.status} />
                </Td>
                <Td className="text-[#94a3b8]">
                  {tx.reference_number || (
                    <span className="text-[#475569]">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
