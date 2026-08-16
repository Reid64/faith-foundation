import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, DetailHeading } from "../../../_components/detail";
import { formCardStyle } from "../../../_components/theme";
import { QueryError } from "../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import type { CornerstoneProject } from "@/lib/faithproof/cornerstone";
import { ProjectForm } from "../../ProjectForm";
import { updateCornerstoneProject } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Cornerstone Project | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EditCornerstoneProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("cornerstone_projects")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/cornerstone" label="Back to Cornerstone" />
        <QueryError what="this project" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const project = data as CornerstoneProject;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink
        href={`/admin/cornerstone/${project.id}`}
        label="Back to project"
      />
      <DetailHeading title={`Edit ${project.name}`} />
      <div style={formCardStyle}>
        <ProjectForm
          action={updateCornerstoneProject.bind(null, project.id)}
          project={project}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
