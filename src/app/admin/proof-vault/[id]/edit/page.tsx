import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminForm } from "../../../_components/AdminForm";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { Field, Select, Textarea, TextInput } from "../../../_components/fields";
import { formCardStyle } from "../../../_components/theme";
import { QueryError } from "../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type ProofDocument,
} from "@/lib/faithproof/types";
import { updateProofDocument } from "./actions";

export const metadata: Metadata = {
  title: "Edit Document | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditProofDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("proof_documents")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<ProofDocument>();

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink
          href={`/admin/proof-vault/${params.id}`}
          label="Back to document"
        />
        <QueryError what="this document" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const doc = data;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/admin/proof-vault/${doc.id}`} label="Back to document" />
      <DetailHeading
        title="Edit Document"
        subtitle="Verification and public visibility are changed with the action buttons on the document, so each change is audited on its own."
      />

      <div style={formCardStyle}>
        <AdminForm
          action={updateProofDocument.bind(null, doc.id)}
          successHref={`/admin/proof-vault/${doc.id}`}
          submitLabel="Save Changes"
          cancelHref={`/admin/proof-vault/${doc.id}`}
        >
          <Field label="Title" htmlFor="title" required>
            <TextInput
              id="title"
              name="title"
              defaultValue={doc.title}
              required
            />
          </Field>

          <Field label="Document type" htmlFor="type" required>
            <Select
              id="type"
              name="type"
              required
              defaultValue={doc.type}
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
              defaultValue={doc.description ?? ""}
            />
          </Field>

          <Field
            label="Document URL"
            htmlFor="external_url"
            hint="Required while the document is public."
          >
            <TextInput
              id="external_url"
              name="external_url"
              type="url"
              defaultValue={doc.external_url ?? ""}
              placeholder="https://"
            />
          </Field>
        </AdminForm>
      </div>
    </div>
  );
}
