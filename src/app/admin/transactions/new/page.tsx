import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "../../_components/icons";
import { Panel } from "../../_components/ui";
import { AdminForm } from "../../_components/AdminForm";
import {
  Checkbox,
  Field,
  Select,
  Textarea,
  TextInput,
} from "../../_components/fields";
import { createTransaction } from "../actions";
import {
  FUND_LABELS,
  SELECTABLE_FUNDS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Add Transaction | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISODate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function NewTransactionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/transactions"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#6b7280] transition hover:text-[#013e37]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Transactions
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-[#013e37]">
        Add Transaction
      </h1>
      <p className="mt-1 text-sm text-[#6b7280]">
        New transactions are recorded as <strong>pending</strong> and must be
        confirmed before they count toward public totals.
      </p>

      <Panel className="mt-6 p-6">
        <AdminForm
          action={createTransaction}
          successHref="/admin/transactions"
          submitLabel="Record Transaction"
          cancelHref="/admin/transactions"
        >
          <Field label="Transaction date" htmlFor="transaction_date" required>
            <TextInput
              id="transaction_date"
              name="transaction_date"
              type="date"
              defaultValue={todayISODate()}
              required
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Type" htmlFor="type" required>
              <Select
                id="type"
                name="type"
                required
                defaultValue="donation"
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
                defaultValue="unrestricted"
                options={SELECTABLE_FUNDS.map((f) => ({
                  value: f,
                  label: FUND_LABELS[f],
                }))}
              />
            </Field>
          </div>

          <Field
            label="Amount (USD)"
            htmlFor="amount"
            required
            hint="Enter dollars, e.g. 250 or 250.00. Stored to the cent."
          >
            <TextInput
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              required
            />
          </Field>

          <Field label="Donor name" htmlFor="donor_name">
            <TextInput
              id="donor_name"
              name="donor_name"
              placeholder="Leave blank if not applicable"
            />
          </Field>

          <Checkbox
            id="donor_anonymous"
            name="donor_anonymous"
            label="Record this gift as anonymous"
            hint="The donor name is discarded rather than merely hidden, so it never appears in the database or an export."
          />

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="What this transaction was for"
            />
          </Field>

          <Field
            label="Reference number"
            htmlFor="reference_number"
            hint="Cheque number, bank reference or receipt ID."
          >
            <TextInput id="reference_number" name="reference_number" />
          </Field>
        </AdminForm>
      </Panel>
    </div>
  );
}
