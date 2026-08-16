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
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type Transaction,
} from "@/lib/faithproof/types";
import { updateTransaction } from "./actions";

export const metadata: Metadata = {
  title: "Edit Transaction | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({
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
      <div className="mx-auto max-w-2xl">
        <BackLink
          href={`/admin/transactions/${params.id}`}
          label="Back to transaction"
        />
        <QueryError what="this transaction" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const tx = data;
  const dollars = (tx.amount_cents / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink
        href={`/admin/transactions/${tx.id}`}
        label="Back to transaction"
      />
      <DetailHeading
        title="Edit Transaction"
        subtitle="Status is changed with the action buttons on the transaction, not here — each transition writes its own audit entry."
      />

      <div style={formCardStyle}>
        <AdminForm
          action={updateTransaction.bind(null, tx.id)}
          successHref={`/admin/transactions/${tx.id}`}
          submitLabel="Save Changes"
          cancelHref={`/admin/transactions/${tx.id}`}
        >
          <Field label="Transaction date" htmlFor="transaction_date" required>
            <TextInput
              id="transaction_date"
              name="transaction_date"
              type="date"
              defaultValue={tx.transaction_date?.slice(0, 10)}
              required
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Type" htmlFor="type" required>
              <Select
                id="type"
                name="type"
                required
                defaultValue={tx.type}
                options={TRANSACTION_TYPES.map((t) => ({
                  value: t,
                  label: TRANSACTION_TYPE_LABELS[t],
                }))}
              />
            </Field>

            <Field label="Fund" htmlFor="fund" required>
              <Select
                id="fund"
                name="fund"
                required
                defaultValue={tx.fund}
                options={SELECTABLE_FUNDS.map((f) => ({
                  value: f,
                  label: FUND_LABELS[f],
                }))}
              />
            </Field>
          </div>

          <Field label="Amount (USD)" htmlFor="amount" required>
            <TextInput
              id="amount"
              name="amount"
              inputMode="decimal"
              defaultValue={dollars}
              required
            />
          </Field>

          <Field label="Donor name" htmlFor="donor_name">
            <TextInput
              id="donor_name"
              name="donor_name"
              defaultValue={tx.donor_name ?? ""}
            />
          </Field>

          <Checkbox
            id="donor_anonymous"
            name="donor_anonymous"
            label="Record this gift as anonymous"
            hint="The donor name is discarded rather than merely hidden, so it never appears in the database or an export."
            defaultChecked={tx.donor_anonymous}
          />

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={tx.description ?? ""}
            />
          </Field>

          <Field label="Reference number" htmlFor="reference_number">
            <TextInput
              id="reference_number"
              name="reference_number"
              defaultValue={tx.reference_number ?? ""}
            />
          </Field>

          <Checkbox
            id="is_public"
            name="is_public"
            label="Show this transaction on the public transparency page"
            hint="Only confirmed public transactions appear in the Open Mission Ledger. Donor names are never shown publicly."
            defaultChecked={tx.is_public}
          />
        </AdminForm>
      </div>
    </div>
  );
}
