import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "../../_components/icons";
import { formCardStyle } from "../../_components/theme";
import { AdminForm } from "../../_components/AdminForm";
import {
  Checkbox,
  Field,
  Select,
  Textarea,
  TextInput,
} from "../../_components/fields";
import { createVoucher } from "../actions";
import { getSession } from "@/lib/faithproof/session";
import { suggestVoucherNumber } from "@/lib/faithproof/format";
import { FUND_LABELS, SELECTABLE_FUNDS } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Issue Voucher | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewVoucherPage() {
  const session = await getSession();

  // Suggest the next number in the FAITH-YYYY-NNNN series. This is a
  // convenience only — the column is UNIQUE, so the database, not this count,
  // is what actually prevents a duplicate.
  const year = new Date().getFullYear();
  let suggestion = suggestVoucherNumber(0, year);

  if (session) {
    const { count } = await session.supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true })
      .like("voucher_number", `FAITH-${year}-%`);
    suggestion = suggestVoucherNumber(count ?? 0, year);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/vouchers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition hover:underline" style={{ color: "#013e37" }}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Vouchers
      </Link>

      <h1 className="tracking-tight" style={{ color: "#013e37", fontSize: 24, fontWeight: 700 }}>
        Issue Voucher
      </h1>
      <p className="mt-1 text-sm text-[#6b7280]">
        New vouchers are recorded as <strong>pending</strong> and must be
        approved before disbursement.
      </p>

      <div style={formCardStyle} className="mt-6">
        <AdminForm
          action={createVoucher}
          successHref="/admin/vouchers"
          submitLabel="Issue Voucher"
          cancelHref="/admin/vouchers"
        >
          <Field
            label="Voucher number"
            htmlFor="voucher_number"
            required
            hint="Suggested from the current year's count. Must be unique."
          >
            <TextInput
              id="voucher_number"
              name="voucher_number"
              defaultValue={suggestion}
              required
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Amount (USD)" htmlFor="amount" required>
              <TextInput
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="0.00"
                required
              />
            </Field>

            <Field label="Fund" htmlFor="fund" required>
              <Select
                id="fund"
                name="fund"
                required
                defaultValue="housing_voucher"
                options={SELECTABLE_FUNDS.map((f) => ({
                  value: f,
                  label: FUND_LABELS[f],
                }))}
              />
            </Field>
          </div>

          <Field
            label="Program"
            htmlFor="program"
            hint="Which program this voucher was awarded through."
          >
            <TextInput
              id="program"
              name="program"
              placeholder="e.g. Down Payment Assistance"
            />
          </Field>

          <Field label="Recipient name" htmlFor="recipient_name">
            <TextInput
              id="recipient_name"
              name="recipient_name"
              placeholder="Leave blank if anonymous"
            />
          </Field>

          <Checkbox
            id="recipient_anonymous"
            name="recipient_anonymous"
            label="Keep this recipient anonymous"
            hint="Default. The name is discarded rather than hidden, so it is never stored. Disbursed anonymous vouchers are the only ones the public can see."
            defaultChecked
          />

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Internal notes about this award"
            />
          </Field>
        </AdminForm>
      </div>
    </div>
  );
}
