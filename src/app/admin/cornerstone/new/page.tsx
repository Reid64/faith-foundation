import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../_components/detail";
import { formCardStyle } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { ProjectForm } from "../ProjectForm";
import { createCornerstoneProject } from "../actions";

export const metadata: Metadata = {
  title: "Add Cornerstone Project | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewCornerstoneProjectPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/cornerstone" label="Back to Cornerstone" />
      <DetailHeading
        title="Add Cornerstone Project"
        subtitle="A project stays off the public page until its phase status leaves 'not started'."
      />
      <div style={formCardStyle}>
        <ProjectForm action={createCornerstoneProject} submitLabel="Create Project" />
      </div>
    </div>
  );
}
