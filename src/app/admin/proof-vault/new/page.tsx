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
import { createProofDocument } from "../actions";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Add Document | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function NewProofDocumentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/proof-vault"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[rgba(255,239,179,0.7)] transition hover:text-[#ffefb3]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Proof Vault
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-[#ffefb3]">
        Add Document
      </h1>
      <p className="mt-1 text-sm text-[rgba(255,239,179,0.7)]">
        Documents become publicly visible only when they are both public and
        verified.
      </p>

      <Panel className="mt-6 p-6">
        <AdminForm
          action={createProofDocument}
          successHref="/admin/proof-vault"
          submitLabel="Add Document"
          cancelHref="/admin/proof-vault"
        >
          <Field label="Title" htmlFor="title" required>
            <TextInput
              id="title"
              name="title"
              required
              placeholder="e.g. IRS 501(c)(3) Determination Letter"
            />
          </Field>

          <Field label="Document type" htmlFor="type" required>
            <Select
              id="type"
              name="type"
              required
              defaultValue="other"
              options={DOCUMENT_TYPES.map((t) => ({
                value: t,
                label: DOCUMENT_TYPE_LABELS[t],
              }))}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="What this document shows and what period it covers"
            />
          </Field>

          <Field
            label="Document URL"
            htmlFor="external_url"
            hint="Where the document can be read. Required if it is public."
          >
            <TextInput
              id="external_url"
              name="external_url"
              type="url"
              placeholder="https://"
            />
          </Field>

          <Checkbox
            id="verified"
            name="verified"
            label="I have verified this document is authentic and current"
            hint="Records who verified it and when. Leave unticked if it still needs review."
          />

          <Checkbox
            id="is_public"
            name="is_public"
            label="Show this document publicly"
            hint="Only takes effect once the document is also verified — that is what the public read policy requires."
          />
        </AdminForm>
      </Panel>
    </div>
  );
}
