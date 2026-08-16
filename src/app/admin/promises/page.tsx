import type { Metadata } from "next";
import { ExternalLinkIcon, InfoIcon } from "../_components/icons";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  PrimaryLinkButton,
  QueryError,
} from "../_components/ui";
import { PromiseStatusBadge } from "../_components/badges";
import { getSession } from "@/lib/faithproof/session";
import { formatDateOnly, truncate } from "@/lib/faithproof/format";
import type { Promise_ } from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "Promises | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function todayISODate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default async function PromisesPage() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await session.supabase
    .from("promises")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Promise_[];
  const today = todayISODate();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Promises"
        description="Public commitments FAITH Foundation has made, and whether they were kept."
        action={
          <PrimaryLinkButton href="/admin/promises/new">
            Add Promise
          </PrimaryLinkButton>
        }
      />

      {/* Non-admin roles have no SELECT policy for private promises — they see
          only is_public = true rows. Saying so prevents a staff user reading a
          filtered list as the complete one. */}
      {!error && session.profile && session.profile.role !== "admin" ? (
        <p className="mb-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2.5 text-xs text-[#2563eb]">
          You are signed in as <strong>{session.profile.role}</strong>. Row level
          security limits this list to public promises — private ones are
          visible to administrators only.
        </p>
      ) : null}

      {error ? (
        <QueryError what="promises" message={error.message} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<InfoIcon className="h-5 w-5" />}
            title="No promises recorded yet"
            detail="Add your first commitment."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((p) => {
            const overdue =
              p.status === "active" &&
              !!p.target_date &&
              p.target_date < today;

            return (
              <Panel key={p.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold leading-snug text-[#013e37]">
                    {p.title}
                  </h2>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <PromiseStatusBadge status={p.status} />
                    {overdue ? <Badge tone="red">Overdue</Badge> : null}
                  </div>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <div className="flex gap-1.5">
                    <dt className="text-[#9ca3af]">Target:</dt>
                    <dd
                      className={
                        overdue ? "text-[#dc2626]" : "text-[#6b7280]"
                      }
                    >
                      {formatDateOnly(p.target_date)}
                    </dd>
                  </div>
                  {p.fulfilled_date ? (
                    <div className="flex gap-1.5">
                      <dt className="text-[#9ca3af]">Fulfilled:</dt>
                      <dd className="text-[#16a34a]">
                        {formatDateOnly(p.fulfilled_date)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1.5">
                    <dt className="text-[#9ca3af]">Visibility:</dt>
                    <dd className="text-[#6b7280]">
                      {p.is_public ? "Public" : "Internal"}
                    </dd>
                  </div>
                </dl>

                {p.description ? (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#6b7280]">
                    {truncate(p.description, 200)}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}

                {p.proof_url ? (
                  <a
                    href={p.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-medium text-[#2563eb] transition hover:text-[#1d4ed8]"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    View proof
                  </a>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
