"use client";

import { useState } from "react";
import { AdminForm } from "../../_components/AdminForm";
import { Checkbox, Field, Select, Textarea, TextInput } from "../../_components/fields";
import {
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  PIPELINE_STAGES,
  stageLabel,
  type Contact,
  type ContactType,
} from "@/lib/faithproof/crm";

/**
 * Contact form, shared by /new and /[id]/edit.
 *
 * A client component because the pipeline-stage options depend on the selected
 * contact type — the server actions reject a mismatch, so the picker has to
 * follow the type to avoid presenting choices that will be refused.
 */
export function ContactForm({
  action,
  successHref,
  cancelHref,
  submitLabel,
  contact,
  assignees,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  successHref: string;
  cancelHref: string;
  submitLabel: string;
  contact?: Contact;
  assignees: { id: string; label: string }[];
}) {
  const [type, setType] = useState<ContactType>(contact?.type ?? "donor");
  const stages = PIPELINE_STAGES[type] ?? [];

  return (
    <AdminForm
      action={action}
      successHref={successHref}
      cancelHref={cancelHref}
      submitLabel={submitLabel}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Contact type" htmlFor="type" required>
          <select
            id="type"
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value as ContactType)}
            className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#013e37] focus:ring-[3px] focus:ring-[rgba(1,62,55,0.08)]"
          >
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CONTACT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Pipeline stage"
          htmlFor="pipeline_stage"
          hint="Options follow the contact type."
        >
          <Select
            id="pipeline_stage"
            name="pipeline_stage"
            defaultValue={contact?.pipeline_stage ?? ""}
            options={[
              { value: "", label: "— none —" },
              ...stages.map((s) => ({ value: s, label: stageLabel(s) })),
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="First name" htmlFor="first_name" required>
          <TextInput
            id="first_name"
            name="first_name"
            required
            defaultValue={contact?.first_name ?? ""}
          />
        </Field>
        <Field label="Last name" htmlFor="last_name" required>
          <TextInput
            id="last_name"
            name="last_name"
            required
            defaultValue={contact?.last_name ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <TextInput id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
        </Field>
      </div>

      <Checkbox
        id="sms_consent"
        name="sms_consent"
        label="This contact has consented to receive SMS"
        hint="By checking this box you confirm this contact has provided written consent to receive SMS messages from FAITH Foundation as required by the TCPA. The date is recorded as evidence."
        defaultChecked={contact?.sms_consent ?? false}
      />

      <Field label="Address" htmlFor="address_line1">
        <TextInput
          id="address_line1"
          name="address_line1"
          defaultValue={contact?.address_line1 ?? ""}
        />
      </Field>
      <Field label="Address line 2" htmlFor="address_line2">
        <TextInput
          id="address_line2"
          name="address_line2"
          defaultValue={contact?.address_line2 ?? ""}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="City" htmlFor="city">
          <TextInput id="city" name="city" defaultValue={contact?.city ?? ""} />
        </Field>
        <Field label="State" htmlFor="state">
          <TextInput
            id="state"
            name="state"
            defaultValue={contact?.state ?? "TX"}
          />
        </Field>
        <Field label="ZIP" htmlFor="zip">
          <TextInput id="zip" name="zip" defaultValue={contact?.zip ?? ""} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Source" htmlFor="source" hint="How they found FAITH Foundation.">
          <TextInput id="source" name="source" defaultValue={contact?.source ?? ""} />
        </Field>
        <Field label="Assigned to" htmlFor="assigned_to">
          <Select
            id="assigned_to"
            name="assigned_to"
            defaultValue={contact?.assigned_to ?? ""}
            options={[
              { value: "", label: "— unassigned —" },
              ...assignees.map((a) => ({ value: a.id, label: a.label })),
            ]}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} />
      </Field>
    </AdminForm>
  );
}
