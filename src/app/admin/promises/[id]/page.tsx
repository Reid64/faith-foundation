import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../../_components/ActionButton";
import { AdminForm } from "../../_components/AdminForm";
import {
  ActionRow,
  BackLink,
  DetailCard,
  DetailHeading,
  DetailList,
  Row,
} from "../../_components/detail";
import { Field, TextInput } from "../../_components/fields";
import { PromiseStatusBadge } from "../../_components/badges";
import { Badge, QueryError } from "../../_components/ui";
import { BTN_SECONDARY, cardStyle } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly } from "@/lib/faithproof/format";
import type { Promise_ } from "@/lib/faithproof/types";
import {
  fulfillPromise,
  markInProgress,
  markMissed,
  updateProofUrl,
} from "./actions";

export const metadata: Metadata = {
  title: "Promise | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function PromiseDetailPage({
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
      <div className="mx-auto max-w-3xl">
        <BackLink href="/admin/promises" label="Back to Promises" />
        <QueryError what="this promise" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const p = data;
  const canFulfil = p.status !== "fulfilled" && p.status !== "missed";
  const canProgress = p.status === "active";
  const canMiss = p.status === "active" || p.status === "in_progress";

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/admin/promises" label="Back to Promises" />
      <DetailHeading title={p.title} />

      <DetailCard>
        <DetailList>
          <Row label="Status" value={<PromiseStatusBadge status={p.status} />} />
          <Row
            label="Description"
            value={p.description || <span style={{ color: "#9ca3af" }}>—</span>}
          />
          <Row label="Target date" value={formatDateOnly(p.target_date)} />
          <Row
            label="Fulfilled date"
            value={
              p.fulfilled_date ? (
                formatDateOnly(p.fulfilled_date)
              ) : (
                <span style={{ color: "#9ca3af" }}>—</span>
              )
            }
          />
          <Row
            label="Visibility"
            value={
              <Badge tone={p.is_public ? "blue" : "gray"}>
                {p.is_public ? "Public" : "Internal"}
              </Badge>
            }
          />
          <Row
            label="Proof"
            value={
              p.proof_url ? (
                <a
                  href={p.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: "#2563eb" }}
                >
                  View proof
                </a>
              ) : (
                <span style={{ color: "#9ca3af" }}>Not provided</span>
              )
            }
          />
        </DetailList>
      </DetailCard>

      <ActionRow>
        {canFulfil ? (
          <ActionButton
            action={fulfillPromise.bind(null, p.id)}
            label="Mark Fulfilled"
            variant="success"
          />
        ) : null}
        {canProgress ? (
          <ActionButton
            action={markInProgress.bind(null, p.id)}
            label="Mark In Progress"
            variant="info"
          />
        ) : null}
        {canMiss ? (
          <ActionButton
            action={markMissed.bind(null, p.id)}
            label="Mark Missed"
            variant="danger"
            confirm="Mark this promise missed? If it is public, that is what visitors will see."
          />
        ) : null}
        <Link href={`/admin/promises/${p.id}/edit`} className={BTN_SECONDARY}>
          Edit Promise
        </Link>
      </ActionRow>

      {/* Proof URL is edited in place — it is the field most likely to be added
          after the fact, when the evidence finally exists. */}
      <div style={cardStyle} className="mt-6 p-6">
        <h2 style={{ color: "#013e37", fontSize: 16, fontWeight: 600 }}>
          {p.proof_url ? "Update Proof URL" : "Add Proof URL"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
          A public link to the evidence that this commitment was kept.
        </p>
        <div className="mt-4">
          <AdminForm
            action={updateProofUrl.bind(null, p.id)}
            successHref={`/admin/promises/${p.id}`}
            submitLabel="Save Proof URL"
            cancelHref={`/admin/promises/${p.id}`}
          >
            <Field
              label="Proof URL"
              htmlFor="proof_url"
              hint="Must start with http:// or https://. Leave blank to remove."
            >
              <TextInput
                id="proof_url"
                name="proof_url"
                type="url"
                defaultValue={p.proof_url ?? ""}
                placeholder="https://"
              />
            </Field>
          </AdminForm>
        </div>
      </div>
    </div>
  );
}
