import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "../_components/icons";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
  StatCard,
} from "../_components/ui";
import { getSession } from "@/lib/faithproof/session";
import {
  PHASE_STATUS_LABELS,
  PHASE_STATUS_TONES,
  homesProgress,
  phaseTitle,
  type CornerstoneProject,
} from "@/lib/faithproof/cornerstone";

export const metadata: Metadata = {
  title: "Cornerstone Communities | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CornerstoneAdminPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("cornerstone_projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as CornerstoneProject[];
  const homesPlaced = projects.reduce((n, p) => n + (p.homes_placed ?? 0), 0);
  const landAcquired = projects.filter((p) => p.land_acquired).length;
  const inDevelopment = projects.filter(
    (p) => p.phase_status === "in_progress"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Cornerstone Communities"
        description="The four-phase development roadmap, project by project. Public notes appear on faithfoundationsf.org/cornerstone."
        action={
          <PrimaryLinkButton href="/admin/cornerstone/new">
            Add Project
          </PrimaryLinkButton>
        }
      />

      <div
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ position: "relative", zIndex: 10 }}
      >
        <StatCard label="Total projects" value={projects.length} />
        <StatCard label="Homes placed" value={homesPlaced} />
        <StatCard label="Land acquired" value={landAcquired} />
        <StatCard label="In development" value={inDevelopment} />
      </div>

      {error ? (
        <QueryError what="Cornerstone projects" message={error.message} />
      ) : projects.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No projects tracked yet"
            detail="Add the first site. Nothing appears on the public page until a project leaves 'not started'."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const progress = homesProgress(p);
            return (
              <Link
                key={p.id}
                href={`/admin/cornerstone/${p.id}`}
                className="block rounded-xl p-5 transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                  {p.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#6b7280" }}>
                  {p.location || "Location not set"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="purple">
                    Phase {p.phase} — {phaseTitle(p.phase)}
                  </Badge>
                  <Badge tone={PHASE_STATUS_TONES[p.phase_status] ?? "gray"}>
                    {PHASE_STATUS_LABELS[p.phase_status] ?? p.phase_status}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs" style={{ color: "#6b7280" }}>
                    <span>Homes placed</span>
                    <span className="tabular-nums">
                      {p.homes_placed}
                      {p.target_homes ? ` / ${p.target_homes}` : ""}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "#f0f0ef" }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${p.name} homes placed`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: "#013e37" }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
