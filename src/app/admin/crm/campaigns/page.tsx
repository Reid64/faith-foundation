import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../../_components/icons";
import {
  EmptyState,
  PageHeader,
  Panel,
  QueryError,
  TableWrap,
  Td,
  Th,
} from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import type { CampaignTag } from "@/lib/faithproof/crm";
import { CrmNav } from "../CrmNav";

export const metadata: Metadata = {
  title: "Campaigns | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await getSession();
  if (!session) return null;

  // PostgREST cannot GROUP BY, so tags are aggregated here. Fine at this
  // volume; move to a Postgres view if the tag table ever gets large.
  const { data, error } = await session.supabase
    .from("campaign_tags")
    .select("*")
    .order("tagged_at", { ascending: false })
    .limit(5000);

  const counts = new Map<string, number>();
  for (const t of (data ?? []) as CampaignTag[]) {
    counts.set(t.campaign, (counts.get(t.campaign) ?? 0) + 1);
  }
  const campaigns = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Campaigns"
        description="Contacts are tagged into a campaign from their record, then mailed from here."
      />
      <CrmNav />

      {error ? (
        <QueryError what="campaigns" message={error.message} />
      ) : campaigns.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No campaigns yet"
            detail="Open any contact, go to the Campaigns tab, and add a tag to start one."
          />
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Contacts tagged</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(([name, count]) => (
              <tr
                key={name}
                className="bg-white transition-colors even:bg-[#f8f8f7] hover:bg-[#f0fdf4]"
              >
                <Td className="font-medium">{name}</Td>
                <Td muted>{count}</Td>
                <Td>
                  <Link
                    href={`/admin/crm/campaigns/${encodeURIComponent(name)}/send`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: "#013e37" }}
                  >
                    Send campaign →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
