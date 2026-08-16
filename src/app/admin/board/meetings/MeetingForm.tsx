"use client";

import { AdminForm } from "../../_components/AdminForm";
import { Field, Select, Textarea, TextInput } from "../../_components/fields";
import { MEETING_TYPES, MEETING_TYPE_LABELS } from "@/lib/faithproof/board";

export function MeetingForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
}) {
  return (
    <AdminForm
      action={action}
      successHref="/admin/board/meetings"
      cancelHref="/admin/board/meetings"
      submitLabel="Record Meeting"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Meeting date" htmlFor="meeting_date" required>
          <TextInput id="meeting_date" name="meeting_date" type="date" required />
        </Field>
        <Field label="Type" htmlFor="type" required>
          <Select
            id="type"
            name="type"
            required
            defaultValue="regular"
            options={MEETING_TYPES.map((t) => ({
              value: t,
              label: MEETING_TYPE_LABELS[t],
            }))}
          />
        </Field>
      </div>

      {/* Scheduling is what opens the meeting room: the Join button appears 30
          minutes before the start time. A meeting with no start time is still
          joinable on its date, so these stay optional. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Meeting Start Time"
          htmlFor="scheduled_start"
          hint="The video room opens 30 minutes before this."
        >
          <TextInput
            id="scheduled_start"
            name="scheduled_start"
            type="datetime-local"
          />
        </Field>
        <Field label="Meeting End Time" htmlFor="scheduled_end">
          <TextInput
            id="scheduled_end"
            name="scheduled_end"
            type="datetime-local"
          />
        </Field>
      </div>

      <Field
        label="Attendees"
        htmlFor="attendees"
        hint="Comma separated — one name per director present."
      >
        <TextInput
          id="attendees"
          name="attendees"
          placeholder="Jane Doe, John Smith"
        />
      </Field>

      <Field label="Agenda" htmlFor="agenda">
        <Textarea id="agenda" name="agenda" rows={5} />
      </Field>

      <Field
        label="Minutes"
        htmlFor="minutes"
        hint="Can be left blank now and filled in after the meeting."
      >
        <Textarea id="minutes" name="minutes" rows={8} />
      </Field>
    </AdminForm>
  );
}
