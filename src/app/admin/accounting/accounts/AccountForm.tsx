"use client";

import { AdminForm } from "../../_components/AdminForm";
import { Checkbox, Field, Select, TextInput } from "../../_components/fields";
import { FUND_LABELS, SELECTABLE_FUNDS } from "@/lib/faithproof/types";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from "@/lib/faithproof/accounting";

export function AccountForm({
  action,
  parents,
}: {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; ok?: boolean; id?: string }>;
  parents: { id: string; label: string }[];
}) {
  return (
    <AdminForm
      action={action}
      successHref="/admin/accounting/accounts"
      cancelHref="/admin/accounting/accounts"
      submitLabel="Create Account"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Code"
          htmlFor="code"
          required
          hint="Four digits, grouped by type: 1xxx asset, 2xxx liability, 3xxx equity, 4xxx revenue, 5xxx expense."
        >
          <TextInput id="code" name="code" required placeholder="5500" />
        </Field>
        <Field label="Name" htmlFor="name" required>
          <TextInput id="name" name="name" required />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Type" htmlFor="type" required>
          <Select
            id="type"
            name="type"
            required
            defaultValue="expense"
            options={ACCOUNT_TYPES.map((t) => ({
              value: t,
              label: ACCOUNT_TYPE_LABELS[t],
            }))}
          />
        </Field>
        <Field label="Subtype" htmlFor="subtype" hint="Free text, e.g. cash, program.">
          <TextInput id="subtype" name="subtype" />
        </Field>
        <Field label="Fund" htmlFor="fund">
          <Select
            id="fund"
            name="fund"
            defaultValue=""
            options={[
              { value: "", label: "— none —" },
              ...SELECTABLE_FUNDS.map((f) => ({ value: f, label: FUND_LABELS[f] })),
            ]}
          />
        </Field>
      </div>

      <Field
        label="Parent account"
        htmlFor="parent_id"
        hint="Sub-accounts are indented beneath their parent in the chart."
      >
        <Select
          id="parent_id"
          name="parent_id"
          defaultValue=""
          options={[
            { value: "", label: "— none —" },
            ...parents.map((p) => ({ value: p.id, label: p.label })),
          ]}
        />
      </Field>

      <Checkbox
        id="is_restricted"
        name="is_restricted"
        label="Restricted"
        hint="Donor-restricted funds are reported separately from unrestricted net assets."
      />
      <Checkbox
        id="is_active"
        name="is_active"
        label="Active"
        hint="Inactive accounts stay in the ledger but are not offered for new entries."
        defaultChecked
      />
    </AdminForm>
  );
}
