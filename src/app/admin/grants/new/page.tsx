import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../_components/detail";
import { formCardStyle } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { GrantForm } from "../GrantForm";
import { createGrant } from "../actions";

export const metadata: Metadata = {
  title: "Add Grant | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function NewGrantPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/grants" label="Back to Grants" />
      <DetailHeading
        title="Add Grant"
        subtitle="Start at whatever stage the grant is really at — a prospect you have only heard about is worth tracking."
      />
      <div style={formCardStyle}>
        <GrantForm action={createGrant} />
      </div>
    </div>
  );
}
