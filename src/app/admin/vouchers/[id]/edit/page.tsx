import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminForm } from "../../../_components/AdminForm";
import { BackLink, DetailHeading } from "../../../_components/detail";
import {
  Checkbox,
  Field,
  Select,
  Textarea,
  TextInput,
} from "../../../_components/fields";
import { formCardStyle } from "../../../_components/theme";
import { QueryError } from "../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  FUND_LABELS,
  SELECTABLE_FUNDS,
  type Voucher,
} from "@/lib/faithproof/types";
import { updateVoucher } from "./actions";

export const metadata: Metadata = {
  title: "Edit Voucher | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditVoucherPage({
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
      <div className="mx-auto max-w-2xl">
        <BackLink href={`/admin/vouchers/${params.id}`} label="Back to voucher" />
        <QueryError what="this voucher" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const v = data;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/admin/vouchers/${v.id}`} label="Back to voucher" />
      <DetailHeading
        title="Edit Voucher"
        subtitle="Status changes through the action buttons on the voucher, not here."
      />

      <div style={formCardStyle}>
        <AdminForm
          action={updateVoucher.bind(null, v.id)}
          successHref={`/admin/vouchers/${v.id}`}
          submitLabel="Save Changes"
          cancelHref={`/admin/vouchers/${v.id}`}
        >
          <Field label="Voucher number" htmlFor="voucher_number" required>
            <TextInput
              id="voucher_number"
              name="voucher_number"
              defaultValue={v.voucher_number}
              required
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Amount (USD)" htmlFor="amount" required>
              <TextInput
                id="amount"
                name="amount"
                inputMode="decimal"
                defaultValue={(v.amount_cents / 100).toFixed(2)}
                required
              />
            </Field>

            <Field label="Fund" htmlFor="fund" required>
              <Select
                id="fund"
                name="fund"
                required
                defaultValue={v.fund}
                options={SELECTABLE_FUNDS.map((f) => ({
                  value: f,
                  label: FUND_LABELS[f],
                }))}
              />
            </Field>
          </div>

          <Field label="Program" htmlFor="program">
            <TextInput
              id="program"
              name="program"
              defaultValue={v.program ?? ""}
            />
          </Field>

          <Field label="Recipient name" htmlFor="recipient_name">
            <TextInput
              id="recipient_name"
              name="recipient_name"
              defaultValue={v.recipient_name ?? ""}
            />
          </Field>

          <Checkbox
            id="recipient_anonymous"
            name="recipient_anonymous"
            label="Keep this recipient anonymous"
            hint="The name is discarded rather than hidden, so it is never stored."
            defaultChecked={v.recipient_anonymous}
          />

          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={v.notes ?? ""} />
          </Field>
        </AdminForm>
      </div>
    </div>
  );
}
