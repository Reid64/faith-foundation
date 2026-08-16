"use client";

import { AdminForm } from "../_components/AdminForm";
import { Field, Select, Textarea, TextInput } from "../_components/fields";
import { FUND_LABELS, SELECTABLE_FUNDS } from "@/lib/faithproof/types";
import { GRANT_STATUSES, GRANT_STATUS_LABELS } from "@/lib/faithproof/grants";

export function GrantForm({
  action,
}: {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; ok?: boolean; id?: string }>;
}) {
  return (
    <AdminForm
      action={action}
      // Land on the new grant's detail page, where the status transitions live.
      successHref={(r) => (r.id ? `/admin/grants/${r.id}` : "/admin/grants")}
      cancelHref="/admin/grants"
      submitLabel="Create Grant"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Grant name" htmlFor="name" required>
          <TextInput id="name" name="name" required placeholder="Housing Stability Fund" />
        </Field>
        <Field label="Funder" htmlFor="funder" required>
          <TextInput id="funder" name="funder" required placeholder="Foundation or agency" />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Status" htmlFor="status" required>
          <Select
            id="status"
            name="status"
            required
            defaultValue="prospect"
            options={GRANT_STATUSES.map((s) => ({
              value: s,
              label: GRANT_STATUS_LABELS[s],
            }))}
          />
        </Field>
        <Field label="Amount" htmlFor="amount" hint="Dollars. Leave blank until awarded.">
          <TextInput id="amount" name="amount" inputMode="decimal" placeholder="25000" />
        </Field>
        <Field label="Fund" htmlFor="fund" hint="Where an award would be designated.">
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

      <Field label="Program" htmlFor="program" hint="Which FAITH Foundation program this supports.">
        <TextInput id="program" name="program" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Application deadline" htmlFor="application_deadline">
          <TextInput id="application_deadline" name="application_deadline" type="date" />
        </Field>
        <Field label="Award date" htmlFor="award_date">
          <TextInput id="award_date" name="award_date" type="date" />
        </Field>
        <Field label="Reporting deadline" htmlFor="reporting_deadline">
          <TextInput id="reporting_deadline" name="reporting_deadline" type="date" />
        </Field>
      </div>

      <Field label="Reporting period" htmlFor="reporting_period" hint="For example: Q1 2027, or Jan–Jun 2027.">
        <TextInput id="reporting_period" name="reporting_period" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Program officer" htmlFor="contact_name">
          <TextInput id="contact_name" name="contact_name" />
        </Field>
        <Field label="Contact email" htmlFor="contact_email">
          <TextInput id="contact_email" name="contact_email" type="email" />
        </Field>
      </div>

      <Field label="Application notes" htmlFor="application_notes">
        <Textarea id="application_notes" name="application_notes" rows={4} />
      </Field>
      <Field label="Award notes" htmlFor="award_notes">
        <Textarea id="award_notes" name="award_notes" rows={3} />
      </Field>
      <Field label="Reporting notes" htmlFor="reporting_notes">
        <Textarea id="reporting_notes" name="reporting_notes" rows={3} />
      </Field>
    </AdminForm>
  );
}
