"use client";

import { AdminForm } from "../_components/AdminForm";
import { Checkbox, Field, Select, Textarea, TextInput } from "../_components/fields";
import {
  PHASES,
  PHASE_STATUSES,
  PHASE_STATUS_LABELS,
  type CornerstoneProject,
} from "@/lib/faithproof/cornerstone";

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; ok?: boolean; id?: string }>;
  project?: CornerstoneProject;
  submitLabel: string;
}) {
  return (
    <AdminForm
      action={action}
      successHref={(r) =>
        r.id ? `/admin/cornerstone/${r.id}` : "/admin/cornerstone"
      }
      cancelHref={project ? `/admin/cornerstone/${project.id}` : "/admin/cornerstone"}
      submitLabel={submitLabel}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Project name" htmlFor="name" required>
          <TextInput id="name" name="name" required defaultValue={project?.name} />
        </Field>
        <Field label="Location" htmlFor="location" hint="City and county.">
          <TextInput
            id="location"
            name="location"
            defaultValue={project?.location ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Phase" htmlFor="phase" required>
          <Select
            id="phase"
            name="phase"
            required
            defaultValue={String(project?.phase ?? 1)}
            options={PHASES.map((p) => ({
              value: String(p.number),
              label: `Phase ${p.number} — ${p.title}`,
            }))}
          />
        </Field>
        <Field label="Phase status" htmlFor="phase_status" required>
          <Select
            id="phase_status"
            name="phase_status"
            required
            defaultValue={project?.phase_status ?? "not_started"}
            options={PHASE_STATUSES.map((s) => ({
              value: s,
              label: PHASE_STATUS_LABELS[s],
            }))}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Target homes" htmlFor="target_homes">
          <TextInput
            id="target_homes"
            name="target_homes"
            type="number"
            min="1"
            inputMode="numeric"
            defaultValue={project?.target_homes ? String(project.target_homes) : ""}
          />
        </Field>
        <Field
          label="Homes placed"
          htmlFor="homes_placed"
          hint="Only count homes actually placed on site."
        >
          <TextInput
            id="homes_placed"
            name="homes_placed"
            type="number"
            min="0"
            inputMode="numeric"
            defaultValue={String(project?.homes_placed ?? 0)}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Land source" htmlFor="land_source" hint="Land bank, donation, purchase.">
          <TextInput
            id="land_source"
            name="land_source"
            defaultValue={project?.land_source ?? ""}
          />
        </Field>
        <Field label="Site address" htmlFor="site_address">
          <TextInput
            id="site_address"
            name="site_address"
            defaultValue={project?.site_address ?? ""}
          />
        </Field>
      </div>

      <Checkbox
        id="land_acquired"
        name="land_acquired"
        label="Land acquired"
        defaultChecked={project?.land_acquired}
      />

      <Field
        label="Public notes"
        htmlFor="public_notes"
        hint="Shown on the public Cornerstone page. Do not name the modular home partner."
      >
        <Textarea
          id="public_notes"
          name="public_notes"
          rows={4}
          defaultValue={project?.public_notes ?? ""}
        />
      </Field>

      <Field
        label="Internal notes"
        htmlFor="internal_notes"
        hint="Admin only — never sent to the public page."
      >
        <Textarea
          id="internal_notes"
          name="internal_notes"
          rows={4}
          defaultValue={project?.internal_notes ?? ""}
        />
      </Field>
    </AdminForm>
  );
}
