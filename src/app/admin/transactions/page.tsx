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
                  {FUND_LABELS[tx.fund] ?? tx.fund}
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
