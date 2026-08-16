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
import { createPromise } from "../actions";
import {
  PROMISE_STATUSES,
  PROMISE_STATUS_LABELS,
} from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Add Promise | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function NewPromisePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/promises"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[rgba(255,239,179,0.7)] transition hover:text-[#ffefb3]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Promises
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-[#ffefb3]">
        Add Promise
      </h1>
      <p className="mt-1 text-sm text-[rgba(255,239,179,0.7)]">
        A promise is a commitment the Foundation intends to be held to. Public
        promises are visible to anyone, kept or missed.
      </p>

      <Panel className="mt-6 p-6">
        <AdminForm
          action={createPromise}
          successHref="/admin/promises"
          submitLabel="Record Promise"
          cancelHref="/admin/promises"
        >
          <Field label="Title" htmlFor="title" required>
            <TextInput
              id="title"
              name="title"
              required
              placeholder="e.g. Publish the first annual impact summary"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="What exactly is being committed to, and how it will be judged"
              rows={5}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Status" htmlFor="status" required>
              <Select
                id="status"
                name="status"
                required
                defaultValue="active"
                options={PROMISE_STATUSES.map((s) => ({
                  value: s,
                  label: PROMISE_STATUS_LABELS[s],
                }))}
              />
            </Field>

            <Field
              label="Target date"
              htmlFor="target_date"
              hint="Active promises past this date are flagged as overdue."
            >
              <TextInput id="target_date" name="target_date" type="date" />
            </Field>
          </div>

          <Field
            label="Proof URL"
            htmlFor="proof_url"
            hint="A link to evidence this promise was kept. Must start with http:// or https://."
          >
            <TextInput
              id="proof_url"
              name="proof_url"
              type="url"
              placeholder="https://"
            />
          </Field>

          <Checkbox
            id="is_public"
            name="is_public"
            label="Show this promise publicly"
            hint="Default. Public promises are the point of FaithProof — a commitment nobody can see cannot hold anyone accountable."
            defaultChecked
          />
        </AdminForm>
      </Panel>
    </div>
  );
}
