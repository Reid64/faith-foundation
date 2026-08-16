import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "../../_components/ActionButton";
import {
  BackLink,
  DetailCard,
  DetailHeading,
  DetailList,
  Row,
} from "../../_components/detail";
import { Badge, QueryError } from "../../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import { formatCents, formatDateOnly, formatTimestamp } from "@/lib/faithproof/format";
import { FUND_LABELS, type FundDesignation } from "@/lib/faithproof/types";
import {
  GRANT_STATUS_LABELS,
  GRANT_STATUS_TONES,
  daysUntil,
  type Grant,
  type GrantStatus,
} from "@/lib/faithproof/grants";
import {
  recordGrantTransaction,
  updateGrantNotes,
  updateGrantStatus,
} from "../actions";
import { GrantActions, type Transition } from "./GrantActions";
import { NotesEditor } from "./NotesEditor";

export const metadata: Metadata = {
  title: "Grant | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** Which moves are offered from each status. */
const NEXT_STEPS: Record<
  GrantStatus,
  { next: GrantStatus; label: string; variant: Transition["variant"] }[]
> = {
  prospect: [{ next: "researching", label: "Begin Research", variant: "info" }],
  researching: [
    { next: "applied", label: "Mark Applied", variant: "primary" },
    { next: "declined", label: "Mark Declined", variant: "danger" },
  ],
  applied: [
    { next: "awarded", label: "Mark Awarded", variant: "success" },
    { next: "declined", label: "Mark Declined", variant: "danger" },
  ],
  awarded: [{ next: "reporting", label: "Begin Reporting", variant: "info" }],
  reporting: [{ next: "closed", label: "Mark Closed", variant: "primary" }],
  closed: [],
  declined: [],
};

export default async function GrantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("grants")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink href="/admin/grants" label="Back to Grants" />
        <QueryError what="this grant" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const g = data as Grant;
  const reportingDays = daysUntil(g.reporting_deadline);
  const applicationDays = daysUntil(g.application_deadline);

  const transitions: Transition[] = (NEXT_STEPS[g.status] ?? []).map((t) => ({
    ...t,
    action: updateGrantStatus.bind(null, g.id, t.next),
  }));

  const canRecord =
    !g.transaction_id &&
    (g.status === "awarded" || g.status === "reporting" || g.status === "closed") &&
    !!g.amount_cents;

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/grants" label="Back to Grants" />
      <DetailHeading
        title={g.name}
        subtitle={`${g.funder}${g.program ? ` · ${g.program}` : ""}`}
      />

      {/* Deadline banners — reporting first, since a missed report can cost the
          next award, then the application clock. */}
      {g.status === "reporting" && reportingDays !== null && reportingDays <= 30 ? (
        <p
          role="alert"
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#fffbeb",
            color: "#d97706",
            border: "1px solid #fde68a",
          }}
        >
          {reportingDays < 0
            ? `Reporting was due ${Math.abs(reportingDays)} day${Math.abs(reportingDays) === 1 ? "" : "s"} ago (${formatDateOnly(g.reporting_deadline)}).`
            : `Reporting due in ${reportingDays} day${reportingDays === 1 ? "" : "s"} (${formatDateOnly(g.reporting_deadline)}).`}
        </p>
      ) : null}

      {(g.status === "researching" || g.status === "applied") &&
      applicationDays !== null &&
      applicationDays <= 7 ? (
        <p
          role="alert"
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {applicationDays < 0
            ? `The application deadline passed ${Math.abs(applicationDays)} day${Math.abs(applicationDays) === 1 ? "" : "s"} ago (${formatDateOnly(g.application_deadline)}).`
            : `Application deadline in ${applicationDays} day${applicationDays === 1 ? "" : "s"} (${formatDateOnly(g.application_deadline)}).`}
        </p>
      ) : null}

      <DetailCard>
        <DetailList>
          <Row
            label="Status"
            value={
              <Badge tone={GRANT_STATUS_TONES[g.status] ?? "gray"}>
                {GRANT_STATUS_LABELS[g.status] ?? g.status}
              </Badge>
            }
          />
          <Row
            label="Amount"
            value={g.amount_cents ? formatCents(g.amount_cents) : "Not set"}
          />
          <Row
            label="Fund"
            value={g.fund ? (FUND_LABELS[g.fund as FundDesignation] ?? g.fund) : "—"}
          />
          <Row label="Program" value={g.program || "—"} />
          <Row
            label="Application deadline"
            value={formatDateOnly(g.application_deadline)}
          />
          <Row label="Award date" value={formatDateOnly(g.award_date)} />
          <Row
            label="Reporting deadline"
            value={formatDateOnly(g.reporting_deadline)}
          />
          <Row label="Reporting period" value={g.reporting_period || "—"} />
          <Row label="Program officer" value={g.contact_name || "—"} />
          <Row
            label="Contact email"
            value={
              g.contact_email ? (
                <a
                  href={`mailto:${g.contact_email}`}
                  className="hover:underline"
                  style={{ color: "#013e37" }}
                >
                  {g.contact_email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row label="Added" value={formatTimestamp(g.created_at)} />
        </DetailList>

        <GrantActions transitions={transitions} />

        <div className="mt-6 border-t pt-6" style={{ borderColor: "#f0f0ef" }}>
          {g.transaction_id ? (
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Recorded as revenue —{" "}
              <Link
                href={`/admin/transactions/${g.transaction_id}`}
                className="font-semibold hover:underline"
                style={{ color: "#013e37" }}
              >
                view the transaction
              </Link>
              . Recording it again is blocked so the same award cannot be
              counted twice.
            </p>
          ) : canRecord ? (
            <div>
              <ActionButton
                action={recordGrantTransaction.bind(null, g.id)}
                label="Add to Transactions"
                variant="primary"
                confirm={`Record ${formatCents(g.amount_cents ?? 0)} from ${g.funder} as a pending grant transaction?`}
              />
              <p className="mt-2 text-xs" style={{ color: "#9ca3af" }}>
                Creates a pending grant transaction. An administrator confirms it
                once the money has actually arrived.
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              {g.amount_cents
                ? "Revenue can be recorded once this grant is awarded."
                : "Set the awarded amount before recording this as revenue."}
            </p>
          )}
        </div>
      </DetailCard>

      <div className="mt-8 space-y-4">
        <NotesEditor
          title="Application Notes"
          field="application_notes"
          value={g.application_notes}
          action={updateGrantNotes.bind(null, g.id, "application_notes")}
        />
        <NotesEditor
          title="Award Notes"
          field="award_notes"
          value={g.award_notes}
          action={updateGrantNotes.bind(null, g.id, "award_notes")}
        />
        <NotesEditor
          title="Reporting Notes"
          field="reporting_notes"
          value={g.reporting_notes}
          action={updateGrantNotes.bind(null, g.id, "reporting_notes")}
        />
      </div>
    </div>
  );
}
