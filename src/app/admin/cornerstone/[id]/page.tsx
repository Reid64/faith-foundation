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
import { InfoIcon } from "../../_components/icons";
import { Badge, EmptyState, Panel, QueryError } from "../../_components/ui";
import { BTN_SECONDARY } from "../../_components/theme";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly } from "@/lib/faithproof/format";
import {
  PHASES,
  PHASE_STATUS_LABELS,
  PHASE_STATUS_TONES,
  homesProgress,
  phaseTitle,
  type CornerstoneMilestone,
  type CornerstoneProject,
} from "@/lib/faithproof/cornerstone";
import {
  addMilestone,
  completeMilestone,
  setPhaseStatus,
  setProjectPhase,
} from "../actions";
import { MilestoneForm } from "./MilestoneForm";

export const metadata: Metadata = {
  title: "Cornerstone Project | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CornerstoneProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) return null;

  const [{ data, error }, { data: milestoneRows, error: milestoneError }] =
    await Promise.all([
      session.supabase
        .from("cornerstone_projects")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      session.supabase
        .from("cornerstone_milestones")
        .select("*")
        .eq("project_id", params.id)
        .order("target_date", { ascending: true, nullsFirst: false }),
    ]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink href="/admin/cornerstone" label="Back to Cornerstone" />
        <QueryError what="this project" message={error.message} />
      </div>
    );
  }
  if (!data) notFound();

  const p = data as CornerstoneProject;
  const milestones = (milestoneRows ?? []) as CornerstoneMilestone[];
  const progress = homesProgress(p);
  const onPublicPage = p.phase_status !== "not_started" || p.homes_placed > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/cornerstone" label="Back to Cornerstone" />
      <DetailHeading
        title={p.name}
        subtitle={p.location || "Location not set"}
      />

      {/* Four-step stepper — the same roadmap published on
          /programs/cornerstone-communities, so the two never disagree. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {PHASES.map((phase) => {
          const done =
            phase.number < p.phase ||
            (phase.number === p.phase && p.phase_status === "complete");
          const current = phase.number === p.phase;
          return (
            <div
              key={phase.number}
              className="rounded-xl p-4"
              style={{
                backgroundColor: current ? "#013e37" : done ? "#ffefb3" : "#ffffff",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  color: current ? "rgba(255,239,179,0.7)" : "#6b7280",
                }}
              >
                Phase {phase.number}
                {done ? " · complete" : current ? " · current" : ""}
              </p>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ color: current ? "#ffefb3" : "#013e37" }}
              >
                {phase.title}
              </p>
            </div>
          );
        })}
      </div>

      <DetailCard>
        <DetailList>
          <Row
            label="Current phase"
            value={`Phase ${p.phase} — ${phaseTitle(p.phase)}`}
          />
          <Row
            label="Phase status"
            value={
              <Badge tone={PHASE_STATUS_TONES[p.phase_status] ?? "gray"}>
                {PHASE_STATUS_LABELS[p.phase_status] ?? p.phase_status}
              </Badge>
            }
          />
          <Row
            label="Homes placed"
            value={`${p.homes_placed}${p.target_homes ? ` of ${p.target_homes} (${progress}%)` : ""}`}
          />
          <Row label="Land acquired" value={p.land_acquired ? "Yes" : "Not yet"} />
          <Row label="Land source" value={p.land_source || "—"} />
          <Row label="Site address" value={p.site_address || "—"} />
          <Row
            label="On the public page"
            value={
              onPublicPage ? (
                <Link
                  href="/cornerstone"
                  className="font-semibold hover:underline"
                  style={{ color: "#013e37" }}
                >
                  Yes — view it
                </Link>
              ) : (
                "No — still 'not started' with no homes placed"
              )
            }
          />
        </DetailList>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {p.phase < 4 ? (
            <ActionButton
              action={setProjectPhase.bind(null, p.id, p.phase + 1)}
              label={`Advance to Phase ${p.phase + 1}`}
              variant="primary"
              confirm={`Advance to Phase ${p.phase + 1} — ${phaseTitle(p.phase + 1)}? The status resets to in progress.`}
            />
          ) : null}
          {p.phase_status !== "complete" ? (
            <ActionButton
              action={setPhaseStatus.bind(null, p.id, "complete")}
              label="Mark Phase Complete"
              variant="success"
            />
          ) : null}
          {p.phase_status === "not_started" ? (
            <ActionButton
              action={setPhaseStatus.bind(null, p.id, "in_progress")}
              label="Mark In Progress"
              variant="info"
            />
          ) : null}
          <Link href={`/admin/cornerstone/${p.id}/edit`} className={BTN_SECONDARY}>
            Edit Project
          </Link>
        </div>
      </DetailCard>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Panel className="p-5">
          <h2 className="mb-2" style={{ color: "#013e37", fontSize: 15, fontWeight: 600 }}>
            Public Notes
          </h2>
          <p className="mb-3 text-xs" style={{ color: "#9ca3af" }}>
            Published on /cornerstone. Never name the modular home partner here.
          </p>
          <p
            className="whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: p.public_notes ? "#374151" : "#9ca3af" }}
          >
            {p.public_notes || "Nothing published yet."}
          </p>
        </Panel>

        <Panel className="p-5">
          <h2 className="mb-2" style={{ color: "#013e37", fontSize: 15, fontWeight: 600 }}>
            Internal Notes
          </h2>
          <p className="mb-3 text-xs" style={{ color: "#9ca3af" }}>
            Admin only. Excluded from the public view by construction.
          </p>
          <p
            className="whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: p.internal_notes ? "#374151" : "#9ca3af" }}
          >
            {p.internal_notes || "Nothing recorded."}
          </p>
        </Panel>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ color: "#013e37", fontSize: 18, fontWeight: 700 }}>
            Milestones
          </h2>
          <MilestoneForm action={addMilestone.bind(null, p.id)} />
        </div>

        {milestoneError ? (
          <QueryError what="milestones" message={milestoneError.message} />
        ) : milestones.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<InfoIcon className="h-5 w-5" />}
              title="No milestones yet"
              detail="Record what has to happen, then mark each one as it lands."
            />
          </Panel>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <Panel key={m.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                      {m.title}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "#6b7280" }}>
                      {m.target_date ? `Target ${formatDateOnly(m.target_date)}` : "No target date"}
                      {m.completed_date
                        ? ` · Completed ${formatDateOnly(m.completed_date)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={m.is_public ? "blue" : "gray"}>
                      {m.is_public ? "public" : "internal"}
                    </Badge>
                    {m.completed_date ? (
                      <Badge tone="green">complete</Badge>
                    ) : (
                      <ActionButton
                        action={completeMilestone.bind(null, p.id, m.id)}
                        label="Mark Complete"
                        variant="success"
                      />
                    )}
                  </div>
                </div>
                {m.description ? (
                  <p
                    className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
                    style={{ color: "#374151" }}
                  >
                    {m.description}
                  </p>
                ) : null}
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
