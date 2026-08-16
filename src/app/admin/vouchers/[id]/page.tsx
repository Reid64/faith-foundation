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
import { VoucherStatusBadge } from "../../_components/badges";
import { Badge, QueryError } from "../../_components/ui";
import { BTN_SECONDARY } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatTimestamp } from "@/lib/faithproof/format";
import { FUND_LABELS, type Voucher } from "@/lib/faithproof/types";
import { approveVoucher, cancelVoucher, disburseVoucher } from "./actions";

export const metadata: Metadata = {
  title: "Voucher | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function VoucherDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("vouchers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Voucher>();

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/vouchers" label="Back to Vouchers" />
        <QueryError what="this voucher" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const v = data;
  const closed =
    v.status === "disbursed" ||
    v.status === "cancelled" ||
    v.status === "expired";

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/vouchers" label="Back to Vouchers" />
      <DetailHeading
        title={v.voucher_number}
        subtitle={`${formatCents(v.amount_cents)} · ${FUND_LABELS[v.fund] ?? v.fund}`}
      />

      <DetailCard>
        <DetailList>
          <Row label="Voucher number" value={v.voucher_number} />
          <Row label="Status" value={<VoucherStatusBadge status={v.status} />} />
          <Row
            label="Amount"
            value={
              <span style={{ fontWeight: 600 }}>
                {formatCents(v.amount_cents)}
              </span>
            }
          />
          <Row
            label="Fund"
            value={<Badge tone="gray">{FUND_LABELS[v.fund] ?? v.fund}</Badge>}
          />
          <Row
            label="Program"
            value={v.program || <span style={{ color: "#9ca3af" }}>—</span>}
          />
          <Row
            label="Recipient"
            value={
              v.recipient_anonymous ? (
                <span style={{ color: "#6b7280" }}>Anonymous</span>
              ) : (
                v.recipient_name || <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row
            label="Approved at"
            value={
              v.approved_at ? (
                formatTimestamp(v.approved_at)
              ) : (
                <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row
            label="Disbursed at"
            value={
              v.disbursed_at ? (
                formatTimestamp(v.disbursed_at)
              ) : (
                <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row
            label="Notes"
            value={v.notes || <span style={{ color: "#9ca3af" }}>—</span>}
          />
        </DetailList>
      </DetailCard>

      {closed ? (
        <NoActions reason={`this voucher is ${v.status}`} />
      ) : (
        <ActionRow>
          {v.status === "pending" ? (
            <ActionButton
              action={approveVoucher.bind(null, v.id)}
              label="Approve Voucher"
              variant="success"
            />
          ) : null}
          {v.status === "approved" ? (
            <ActionButton
              action={disburseVoucher.bind(null, v.id)}
              label="Mark Disbursed"
              variant="success"
              confirm="Mark this voucher disbursed? Disbursed anonymous vouchers become publicly visible."
            />
          ) : null}
          <ActionButton
            action={cancelVoucher.bind(null, v.id)}
            label="Cancel"
            variant="danger"
            confirm="Cancel this voucher?"
          />
        </ActionRow>
      )}

      {closed ? null : (
        <div className="mt-6">
          <Link href={`/admin/vouchers/${v.id}/edit`} className={BTN_SECONDARY}>
            Edit Voucher
          </Link>
        </div>
      )}
    </div>
  );
}
