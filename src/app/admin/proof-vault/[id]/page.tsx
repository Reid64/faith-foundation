import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../../_components/ActionButton";
import {
  ActionRow,
  BackLink,
  DetailCard,
  DetailHeading,
  DetailList,
  Row,
} from "../../_components/detail";
import { DocumentTypeBadge } from "../../_components/badges";
import { Badge, QueryError } from "../../_components/ui";
import { BTN_SECONDARY } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { formatTimestamp } from "@/lib/faithproof/format";
import type { ProofDocument } from "@/lib/faithproof/types";
import { togglePublic, unverifyDocument, verifyDocument } from "./actions";

export const metadata: Metadata = {
  title: "Document | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function ProofDocumentDetailPage({
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
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/proof-vault" label="Back to Proof Vault" />
        <QueryError what="this document" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const doc = data;

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/proof-vault" label="Back to Proof Vault" />
      <DetailHeading title={doc.title} />

      <DetailCard>
        <DetailList>
          <Row label="Type" value={<DocumentTypeBadge type={doc.type} />} />
          <Row
            label="Verified"
            value={
              <Badge tone={doc.verified ? "green" : "gray"}>
                {doc.verified ? "Verified" : "Unverified"}
              </Badge>
            }
          />
          <Row
            label="Visibility"
            value={
              <Badge tone={doc.is_public ? "blue" : "gray"}>
                {doc.is_public ? "Public" : "Internal"}
              </Badge>
            }
          />
          <Row
            label="Description"
            value={
              doc.description || <span style={{ color: "#9ca3af" }}>—</span>
            }
          />
          <Row
            label="Document link"
            value={
              doc.external_url ? (
                <a
                  href={doc.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: "#2563eb" }}
                >
                  View Document
                </a>
              ) : (
                <span style={{ color: "#9ca3af" }}>Not provided</span>
              )
            }
          />
          <Row
            label="Verified at"
            value={
              doc.verified_at ? (
                formatTimestamp(doc.verified_at)
              ) : (
                <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row label="Added" value={formatTimestamp(doc.created_at)} />
        </DetailList>
      </DetailCard>

      {/* The public read policy requires is_public AND verified, so making a
          document public while it is unverified changes nothing a visitor can
          see. Say so rather than letting the toggle look inert. */}
      {doc.is_public && !doc.verified ? (
        <p
          className="mt-4 rounded-lg px-4 py-2.5 text-xs"
          style={{
            backgroundColor: "#fffbeb",
            color: "#d97706",
            border: "1px solid #fde68a",
          }}
        >
          This document is marked public but is not verified, so it does not
          appear on the public transparency page. Verify it to publish it.
        </p>
      ) : null}

      <ActionRow>
        {doc.verified ? (
          <ActionButton
            action={unverifyDocument.bind(null, doc.id)}
            label="Unverify"
            variant="secondary"
            confirm="Remove verification? If this document is public it will stop appearing."
          />
        ) : (
          <ActionButton
            action={verifyDocument.bind(null, doc.id)}
            label="Mark Verified"
            variant="success"
          />
        )}
        <ActionButton
          action={togglePublic.bind(null, doc.id, !doc.is_public)}
          label={doc.is_public ? "Make Private" : "Make Public"}
          variant={doc.is_public ? "secondary" : "primary"}
        />
        <Link
          href={`/admin/proof-vault/${doc.id}/edit`}
          className={BTN_SECONDARY}
        >
          Edit Document
        </Link>
      </ActionRow>
    </div>
  );
}
