import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, DetailHeading } from "../../../../_components/detail";
import { formCardStyle } from "../../../../_components/theme";
import { QueryError } from "../../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { TemplateEditor } from "../../TemplateEditor";
import { updateTemplate } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Template | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("email_templates")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/crm/templates" label="Back to Templates" />
        <QueryError what="this template" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/crm/templates" label="Back to Templates" />
      <DetailHeading title="Edit Template" />
      <div style={formCardStyle}>
        <TemplateEditor
          action={updateTemplate.bind(null, data.id as string)}
          successHref="/admin/crm/templates"
          submitLabel="Save Changes"
          template={{
            id: data.id as string,
            name: data.name as string,
            subject: data.subject as string,
            body_html: data.body_html as string,
            type: data.type as string,
          }}
        />
      </div>
    </div>
  );
}
