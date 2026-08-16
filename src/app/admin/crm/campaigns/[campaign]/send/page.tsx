import type { Metadata } from "next";
import { BackLink, DetailHeading } from "../../../../_components/detail";
import { Panel, QueryError } from "../../../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { MAIL_CONFIGURED } from "@/lib/email";
import type { CampaignTag, Contact } from "@/lib/faithproof/crm";
import { CrmNav } from "../../../CrmNav";
import { SendForm } from "./SendForm";
import { sendCampaign } from "./actions";

export const metadata: Metadata = {
  title: "Send Campaign | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function SendCampaignPage({
  params,
}: {
  params: { campaign: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const campaign = decodeURIComponent(params.campaign);

  const [{ data: tags, error: tagErr }, { data: templates, error: tplErr }] =
    await Promise.all([
      session.supabase.from("campaign_tags").select("contact_id").eq("campaign", campaign),
      session.supabase.from("email_templates").select("*").order("name"),
    ]);

  if (tagErr || tplErr) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink href="/admin/crm/campaigns" label="Back to Campaigns" />
        <QueryError
          what="this campaign"
          message={(tagErr ?? tplErr)!.message}
        />
      </div>
    );
  }

  const ids = ((tags ?? []) as Pick<CampaignTag, "contact_id">[]).map(
    (t) => t.contact_id
  );

  const { data: contacts } = ids.length
    ? await session.supabase.from("contacts").select("*").in("id", ids).order("last_name")
    : { data: [] as Contact[] };

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/crm/campaigns" label="Back to Campaigns" />
      <CrmNav />
      <DetailHeading
        title={`Send Campaign: ${campaign}`}
        subtitle={`${ids.length} contact${ids.length === 1 ? "" : "s"} tagged into this campaign.`}
      />

      {!MAIL_CONFIGURED ? (
        <p
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#fffbeb",
            color: "#d97706",
            border: "1px solid #fde68a",
          }}
        >
          <strong>Email is not connected.</strong> ZOHO_SMTP_PASS is not set.
          You can still run this — every attempt will be recorded as failed with
          the reason, and nothing will be reported as sent.
        </p>
      ) : null}

      <Panel className="p-6">
        {ids.length === 0 ? (
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            No contacts are tagged into this campaign yet. Tag them from the
            Campaigns tab on any contact record.
          </p>
        ) : (
          <SendForm
            templates={(templates ?? []) as {
              id: string;
              name: string;
              subject: string;
              body_html: string;
            }[]}
            contacts={(contacts ?? []) as Contact[]}
            action={sendCampaign.bind(null, campaign)}
          />
        )}
      </Panel>
    </div>
  );
}
