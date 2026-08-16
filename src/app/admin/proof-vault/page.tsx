import type { Metadata } from "next";
import {
  ExternalLinkIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "../_components/icons";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
} from "../_components/ui";
import { DocumentTypeBadge } from "../_components/badges";
import { getSession } from "@/lib/faithproof/session";
import { formatTimestamp, truncate } from "@/lib/faithproof/format";
import type { ProofDocument } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Proof Vault | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function ProofVaultPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("proof_documents")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as ProofDocument[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Proof Vault"
        description="Determination letters, audits, filings and board records that back up what the Foundation claims."
        action={
          <PrimaryLinkButton href="/admin/proof-vault/new">
            Add Document
          </PrimaryLinkButton>
        }
      />

      {error ? (
        <QueryError what="the proof vault" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No documents in the vault yet"
            detail="Add the IRS determination letter or a financial statement to begin."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((doc) => (
            <Panel key={doc.id} soft className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold leading-snug text-[#ffefb3]">
                  {doc.title}
                </h2>
                {doc.verified ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[rgba(74,222,128,0.15)] px-2 py-0.5 text-[0.7rem] font-medium text-[#4ade80] ring-1 ring-inset ring-[rgba(74,222,128,0.3)]"
                    title={
                      doc.verified_at
                        ? `Verified ${formatTimestamp(doc.verified_at)}`
                        : "Verified"
                    }
                  >
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <Badge tone="gray">Unverified</Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DocumentTypeBadge type={doc.type} />
                <Badge tone={doc.is_public ? "blue" : "gray"}>
                  {doc.is_public ? "Public" : "Internal"}
                </Badge>
              </div>

              {doc.description ? (
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(255,239,179,0.7)]">
                  {truncate(doc.description, 200)}
                </p>
              ) : (
                <div className="flex-1" />
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(255,239,179,0.15)] pt-3">
                <span className="text-xs text-[rgba(255,239,179,0.5)]">
                  Added {formatTimestamp(doc.created_at)}
                </span>
                {doc.external_url ? (
                  <a
                    href={doc.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#60a5fa] transition hover:text-[#93c5fd]"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    Open document
                  </a>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
