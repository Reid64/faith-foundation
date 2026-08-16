import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../../_components/ActionButton";
import {
  ActionRow,
  BackLink,
  DetailCard,
  DetailHeading,
  DetailList,
  NoActions,
  Row,
} from "../../_components/detail";
import {
  TransactionStatusBadge,
  TransactionTypeBadge,
} from "../../_components/badges";
import { Badge, QueryError } from "../../_components/ui";
import { BTN_SECONDARY } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import {
  formatCents,
  formatDateOnly,
  formatTimestamp,
} from "@/lib/faithproof/format";
import { FUND_LABELS, type Transaction } from "@/lib/faithproof/types";
import {
  confirmTransaction,
  reconcileTransaction,
  voidTransaction,
} from "./actions";

export const metadata: Metadata = {
  title: "Transaction | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("transactions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Transaction>();

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/transactions" label="Back to Transactions" />
        <QueryError what="this transaction" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const tx = data;
  const isPending = tx.status === "pending";
  const isConfirmed = tx.status === "confirmed";
  const isClosed = tx.status === "reconciled" || tx.status === "voided";

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/transactions" label="Back to Transactions" />
      <DetailHeading
        title={formatCents(tx.amount_cents)}
        subtitle={`Recorded ${formatDateOnly(tx.transaction_date)}`}
      />

      <DetailCard>
        <DetailList>
          <Row label="Date" value={formatDateOnly(tx.transaction_date)} />
          <Row label="Type" value={<TransactionTypeBadge type={tx.type} />} />
          <Row
            label="Fund"
            value={<Badge tone="gray">{FUND_LABELS[tx.fund] ?? tx.fund}</Badge>}
          />
          <Row
            label="Amount"
            value={
              <span style={{ fontWeight: 600 }}>
                {formatCents(tx.amount_cents)}
              </span>
            }
          />
          <Row
            label="Status"
            value={<TransactionStatusBadge status={tx.status} />}
          />
          <Row
            label="Donor"
            value={
              tx.donor_anonymous ? (
                <span style={{ color: "#6b7280" }}>Anonymous</span>
              ) : (
                tx.donor_name || <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row
            label="Description"
            value={tx.description || <span style={{ color: "#9ca3af" }}>—</span>}
          />
          <Row
            label="Reference"
            value={
              tx.reference_number || <span style={{ color: "#9ca3af" }}>—</span>
            }
          />
          <Row
            label="Publicly visible"
            value={
              <Badge tone={tx.is_public ? "blue" : "gray"}>
                {tx.is_public ? "Public" : "Internal"}
              </Badge>
            }
          />
          {tx.status === "confirmed" || tx.confirmed_at ? (
            <>
              <Row label="Confirmed at" value={formatTimestamp(tx.confirmed_at)} />
              <Row
                label="Confirmed by"
                value={
                  tx.confirmed_by || <span style={{ color: "#9ca3af" }}>—</span>
                }
              />
            </>
          ) : null}
        </DetailList>
      </DetailCard>

      {isClosed ? (
        <NoActions reason={`this transaction is ${tx.status}`} />
      ) : (
        <ActionRow>
          {isPending ? (
            <ActionButton
              action={confirmTransaction.bind(null, tx.id)}
              label="Confirm Transaction"
              variant="success"
            />
          ) : null}
          {isConfirmed ? (
            <ActionButton
              action={reconcileTransaction.bind(null, tx.id)}
              label="Mark Reconciled"
              variant="info"
            />
          ) : null}
          <ActionButton
            action={voidTransaction.bind(null, tx.id)}
            label="Void"
            variant="danger"
            confirm="Void this transaction? It will stop counting toward any total."
          />
        </ActionRow>
      )}

      {tx.status !== "voided" ? (
        <div className="mt-6">
          <Link
            href={`/admin/transactions/${tx.id}/edit`}
            className={BTN_SECONDARY}
          >
            Edit Transaction
          </Link>
        </div>
      ) : null}
    </div>
  );
}
