"use client";

import { AdminForm } from "../../_components/AdminForm";
import { Field, Select, Textarea, TextInput } from "../../_components/fields";
import { EVENT_STATUSES, EVENT_STATUS_LABELS } from "@/lib/faithproof/volunteers";

export function EventForm({
  action,
}: {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; ok?: boolean; id?: string }>;
}) {
  return (
    <AdminForm
      action={action}
      successHref={(r) =>
        r.id ? `/admin/volunteers/events/${r.id}` : "/admin/volunteers/events"
      }
      cancelHref="/admin/volunteers/events"
      submitLabel="Create Event"
    >
      <Field label="Event name" htmlFor="name" required>
        <TextInput id="name" name="name" required placeholder="Saturday build day" />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={4} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Date" htmlFor="date" required>
          <TextInput id="date" name="date" type="date" required />
        </Field>
        <Field label="Start time" htmlFor="start_time">
          <TextInput id="start_time" name="start_time" type="time" />
        </Field>
        <Field label="End time" htmlFor="end_time">
          <TextInput id="end_time" name="end_time" type="time" />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Location" htmlFor="location">
          <TextInput id="location" name="location" />
        </Field>
        <Field
          label="Maximum volunteers"
          htmlFor="max_volunteers"
          hint="Leave blank for no cap."
        >
          <TextInput
            id="max_volunteers"
            name="max_volunteers"
            type="number"
            min="1"
            inputMode="numeric"
          />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select
            id="status"
            name="status"
            required
            defaultValue="scheduled"
            options={EVENT_STATUSES.map((s) => ({
              value: s,
              label: EVENT_STATUS_LABELS[s],
            }))}
          />
        </Field>
      </div>
    </AdminForm>
  );
}
