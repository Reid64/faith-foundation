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
import { VoucherStatusBadge } from "../_components/badges";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatTimestamp } from "@/lib/faithproof/format";
import { FUND_LABELS, type Voucher } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Vouchers | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Voucher[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Vouchers"
        description="Down payment and housing assistance vouchers issued to families."
        action={
          <PrimaryLinkButton href="/admin/vouchers/new">
            Issue Voucher
          </PrimaryLinkButton>
        }
      />

      {error ? (
        <QueryError what="vouchers" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No vouchers issued yet"
            detail="Use Issue Voucher to record the first award."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Voucher</Th>
              <Th>Fund</Th>
              <Th align="right">Amount</Th>
              <Th>Status</Th>
              <Th>Recipient</Th>
              <Th>Program</Th>
              <Th>Disbursed</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="transition hover:bg-[rgba(255,239,179,0.05)]">
                <Td className="whitespace-nowrap font-medium">
                  {v.voucher_number}
                </Td>
                <Td className="text-[rgba(255,239,179,0.7)]">
                  {FUND_LABELS[v.fund] ?? v.fund}
                </Td>
                <Td align="right" className="whitespace-nowrap tabular-nums">
                  {formatCents(v.amount_cents)}
                </Td>
                <Td>
                  <VoucherStatusBadge status={v.status} />
                </Td>
                <Td>
                  {v.recipient_anonymous ? (
                    <span className="text-[rgba(255,239,179,0.5)]">Anonymous</span>
                  ) : (
                    v.recipient_name || (
                      <span className="text-[rgba(255,239,179,0.5)]">—</span>
                    )
                  )}
                </Td>
                <Td className="text-[rgba(255,239,179,0.7)]">
                  {v.program || <span className="text-[rgba(255,239,179,0.5)]">—</span>}
                </Td>
                <Td className="whitespace-nowrap text-[rgba(255,239,179,0.7)]">
                  {v.disbursed_at ? (
                    formatTimestamp(v.disbursed_at)
                  ) : (
                    <span className="text-[rgba(255,239,179,0.5)]">—</span>
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
