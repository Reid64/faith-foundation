import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import {
  PHASES,
  PHASE_STATUS_LABELS,
  homesProgress,
  phaseTitle,
  type PublicMilestone,
  type PublicProject,
} from "@/lib/faithproof/cornerstone";
import { formatDateOnly } from "@/lib/faithproof/format";

export const metadata: Metadata = {
  title: "Cornerstone Communities — FAITH Foundation",
  description:
    "Our vision for creating permanent, affordable homeownership communities across Texas — and the honest, phase-by-phase state of the work.",
  alternates: { canonical: "/cornerstone" },
};

// Live project state — never cached, or the page shows last week's progress.
export const dynamic = "force-dynamic";

/**
 * PUBLIC CORNERSTONE TRACKER.
 *
 * Two rules govern this page, both load-bearing:
 *
 *   1. NAMING. The modular home partner is never named here. "Modular home
 *      partner" or "housing partner" only — the named homebuilder was removed
 *      from every public surface on 2026-08-14 to reduce private-benefit
 *      exposure, and this page must not reintroduce it.
 *
 *   2. HONESTY AT ZERO. FAITH Foundation is not yet operating a Cornerstone
 *      Community. The narrative roadmap at /programs/cornerstone-communities
 *      says exactly that, and this page must agree with it: when there are no
 *      active projects it reads as "not yet", not as "coming soon".
 *
 * Data comes from two definer views that expose public columns only, so
 * internal notes cannot reach this page even by mistake.
 */
export default async function CornerstonePublicPage() {
  const supabase = await createServerClient();

  const [{ data: projectRows }, { data: milestoneRows }] = await Promise.all([
    supabase
      .from("cornerstone_projects_public")
      .select("*")
      .order("phase", { ascending: false }),
    supabase
      .from("cornerstone_milestones_public")
      .select("*")
      .order("completed_date", { ascending: false, nullsFirst: false }),
  ]);

  const projects = (projectRows ?? []) as PublicProject[];
  const milestones = (milestoneRows ?? []) as PublicMilestone[];

  const milestonesByProject = new Map<string, PublicMilestone[]>();
  for (const m of milestones) {
    milestonesByProject.set(m.project_id, [
      ...(milestonesByProject.get(m.project_id) ?? []),
      m,
    ]);
  }

  const homesPlaced = projects.reduce((n, p) => n + (p.homes_placed ?? 0), 0);

  return (
    <main className="bg-[#FAF8F1]">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-12 pt-24 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            The Long Work
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#16243F] sm:text-5xl">
            Cornerstone Communities
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#16243F]/75">
            Our vision for creating permanent, affordable homeownership
            communities across Texas.
          </p>
        </div>
      </section>

      {/* ── The four phases ───────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#16243F] sm:text-3xl">
            How a Cornerstone Community Gets Built
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-[#16243F]/70">
            Four phases, in order. Land first, then the infrastructure that
            makes land livable, then one modular home placed and documented, then
            the model repeated.
          </p>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((phase) => (
              <li
                key={phase.number}
                className="rounded-2xl border border-[#16243F]/10 bg-[#FAF8F1] p-6"
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A227]">
                  Phase {phase.number}
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#16243F]">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#16243F]/70">
                  {phase.blurb}
                </p>
              </li>
            ))}
          </ol>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-[#16243F]/60">
            Homes are placed through modular housing solutions supplied by a
            corporate construction partner. The full narrative — including how
            land, services, and construction partnerships work — is on the{" "}
            <Link
              href="/programs/cornerstone-communities"
              className="font-semibold text-[#16243F] underline underline-offset-4"
            >
              Cornerstone Communities program page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Live project state ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#16243F] sm:text-3xl">
            Where the work stands today
          </h2>

          {projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#16243F]/10 bg-white p-8">
              <p className="text-lg leading-relaxed text-[#16243F]/80">
                Our first Cornerstone Community site is in the land acquisition
                phase. Updates will appear here as milestones are reached.
              </p>
              <p className="mt-4 leading-relaxed text-[#16243F]/70">
                FAITH Foundation is not yet operating a Cornerstone Community.
                We would rather show you an empty page than a hopeful one — when
                land is secured, it will be posted here with the date it
                happened.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-[#16243F] px-5 py-2.5 text-sm font-semibold text-[#FAF8F1] transition hover:bg-[#16243F]/90"
                >
                  Talk to us about donating land
                </Link>
                <Link
                  href="/faithproof"
                  className="rounded-lg border border-[#16243F]/20 px-5 py-2.5 text-sm font-semibold text-[#16243F] transition hover:bg-white"
                >
                  See how we report everything else
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 leading-relaxed text-[#16243F]/70">
                {projects.length} site{projects.length === 1 ? "" : "s"} in
                progress · {homesPlaced} home{homesPlaced === 1 ? "" : "s"}{" "}
                placed to date.
              </p>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {projects.map((p) => {
                  const progress = homesProgress(p);
                  const items = milestonesByProject.get(p.id) ?? [];
                  return (
                    <article
                      key={p.id}
                      className="rounded-2xl border border-[#16243F]/10 bg-white p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#16243F]">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-sm text-[#16243F]/60">
                            {p.location || "Location to be announced"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#C9A227]/15 px-3 py-1 text-xs font-semibold text-[#8a6f16]">
                          Phase {p.phase} — {phaseTitle(p.phase)}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-[#16243F]/70">
                        {PHASE_STATUS_LABELS[p.phase_status] ?? p.phase_status}
                        {p.land_acquired ? " · Land acquired" : ""}
                      </p>

                      {p.target_homes ? (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-[#16243F]/70">
                            <span>Homes placed</span>
                            <span className="tabular-nums">
                              {p.homes_placed} of {p.target_homes}
                            </span>
                          </div>
                          <div
                            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#16243F]/10"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${p.name} homes placed`}
                          >
                            <div
                              className="h-full rounded-full bg-[#C9A227]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {p.public_notes ? (
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#16243F]/80">
                          {p.public_notes}
                        </p>
                      ) : null}

                      {items.length > 0 ? (
                        <div className="mt-5 border-t border-[#16243F]/10 pt-4">
                          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#16243F]/50">
                            Milestones
                          </h4>
                          <ul className="mt-3 space-y-3">
                            {items.map((m) => (
                              <li key={m.id} className="flex gap-3">
                                <span
                                  aria-hidden="true"
                                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: m.completed_date
                                      ? "#C9A227"
                                      : "#16243F33",
                                  }}
                                />
                                <span>
                                  <span className="block text-sm font-medium text-[#16243F]">
                                    {m.title}
                                  </span>
                                  <span className="block text-xs text-[#16243F]/55">
                                    {m.completed_date
                                      ? `Completed ${formatDateOnly(m.completed_date)}`
                                      : m.target_date
                                        ? `Target ${formatDateOnly(m.target_date)}`
                                        : "Date to be confirmed"}
                                  </span>
                                  {m.description ? (
                                    <span className="mt-1 block text-sm leading-relaxed text-[#16243F]/70">
                                      {m.description}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <p className="mt-5 text-xs text-[#16243F]/45">
                        Updated {formatDateOnly(p.updated_at.slice(0, 10))}
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────────── */}
      <section className="bg-[#16243F] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-[#FAF8F1] sm:text-3xl">
            Land, services, or a home
          </h2>
          <p className="mt-4 leading-relaxed text-[#FAF8F1]/80">
            Cornerstone Communities are built from donated land, discounted site
            work, and modular homes supplied by partners who want their
            contribution to last. If that is you, we would like to hear from
            you.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block rounded-lg bg-[#C9A227] px-6 py-3 font-semibold text-[#16243F] transition hover:bg-[#b8931f]"
          >
            Start the conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
