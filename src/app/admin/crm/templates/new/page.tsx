import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { TemplateEditor } from "../TemplateEditor";
import { createTemplate } from "../actions";

export const metadata: Metadata = {
  title: "New Template | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/crm/templates" label="Back to Templates" />
      <DetailHeading
        title="New Template"
        subtitle="Merge tags are substituted per recipient when the campaign is sent. Values are HTML-escaped."
      />
      <div style={formCardStyle}>
        <TemplateEditor
          action={createTemplate}
          successHref="/admin/crm/templates"
          submitLabel="Create Template"
        />
      </div>
    </div>
  );
}
