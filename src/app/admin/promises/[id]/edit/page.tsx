import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminForm } from "../../../_components/AdminForm";
import { BackLink, DetailHeading } from "../../../_components/detail";
import {
  Checkbox,
  Field,
  Textarea,
  TextInput,
} from "../../../_components/fields";
import { formCardStyle } from "../../../_components/theme";
import { QueryError } from "../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import type { Promise_ } from "@/lib/faithproof/types";
import { updatePromise } from "./actions";

export const metadata: Metadata = {
  title: "Edit Promise | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditPromisePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("promises")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Promise_>();

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink href={`/admin/promises/${params.id}`} label="Back to promise" />
        <QueryError what="this promise" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const p = data;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/admin/promises/${p.id}`} label="Back to promise" />
      <DetailHeading
        title="Edit Promise"
        subtitle="Status changes through the action buttons on the promise, not here."
      />

      <div style={formCardStyle}>
        <AdminForm
          action={updatePromise.bind(null, p.id)}
          successHref={`/admin/promises/${p.id}`}
          submitLabel="Save Changes"
          cancelHref={`/admin/promises/${p.id}`}
        >
          <Field label="Title" htmlFor="title" required>
            <TextInput
              id="title"
              name="title"
              defaultValue={p.title}
              required
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={p.description ?? ""}
            />
          </Field>

          <Field label="Target date" htmlFor="target_date">
            <TextInput
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={p.target_date?.slice(0, 10) ?? ""}
            />
          </Field>

          <Field label="Proof URL" htmlFor="proof_url">
            <TextInput
              id="proof_url"
              name="proof_url"
              type="url"
              defaultValue={p.proof_url ?? ""}
              placeholder="https://"
            />
          </Field>

          <Checkbox
            id="is_public"
            name="is_public"
            label="Show this promise publicly"
            hint="A commitment nobody can see cannot hold anyone accountable."
            defaultChecked={p.is_public}
          />
        </AdminForm>
      </div>
    </div>
  );
}
