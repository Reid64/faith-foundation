import type { Metadata } from "next";
import Link from "next/link";
import ImpactReceiptForm from "./ImpactReceiptForm";
import {
  getPublicDocuments,
  getPublicLedger,
  getPublicPromises,
  getPublicSettings,
  getPublicStats,
} from "@/lib/faithproof/public";
import { formatCents, formatDateOnly, humanizeEnum } from "@/lib/faithproof/format";
import {
  DOCUMENT_TYPE_LABELS,
  FUND_LABELS,
  PROMISE_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
  type FundDesignation,
  type DocumentType,
  type TransactionType,
} from "@/lib/faithproof/types";

export const metadata: Metadata = {
  title: "FaithProof™ — Financial Transparency | FAITH Foundation",
  description:
    "Real-time donor transparency. Every gift tracked, every dollar verified, every outcome published. FAITH Foundation's open accountability platform.",
  alternates: { canonical: "/faithproof" },
};

// Live figures — never cached, or the page would show yesterday's totals.
export const dynamic = "force-dynamic";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Foundation for Affordable Instruction and Tenancy Hope",
  alternateName: "FAITH Foundation",
  url: "https://faithfoundationsf.org",
  sameAs: ["https://faithfoundationsf.org/faithproof"],
  description:
    "FAITH Foundation provides down payment assistance vouchers to help Texas families achieve homeownership.",
  taxID: "33-2640449",
} as const;

const PROMISE_ACCENT: Record<string, string> = {
  fulfilled: "#16a34a",
  missed: "#dc2626",
  active: "#C9A227",
  in_progress: "#2563eb",
  revised: "#9ca3af",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
      {children}
    </span>
  );
}

export default async function FaithProofPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);

  const [settings, stats, ledger, promises, documents] = await Promise.all([
    getPublicSettings(),
    getPublicStats(),
    getPublicLedger({ page }),
    getPublicPromises(),
    getPublicDocuments(),
  ]);

  const totalPages = Math.max(1, Math.ceil(ledger.total / ledger.perPage));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="bg-navy py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Eyebrow>FaithProof™</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Nothing Hidden. Everything Proven.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">
            FAITH Foundation doesn&apos;t ask you to trust us. We give you the
            tools to verify us.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <HeroStat
              value={formatCents(stats.confirmedGiftsCents)}
              label="Total Confirmed Gifts"
            />
            <HeroStat
              value={String(stats.vouchersDisbursed)}
              label="Vouchers Disbursed"
            />
            <HeroStat
              value={String(stats.promisesKept)}
              label="Promises Kept"
            />
          </div>

          <a
            href="#accountability-pulse"
            className="mt-10 inline-block rounded-lg bg-gold px-8 py-3 font-bold text-navy transition hover:bg-gold-light"
          >
            Explore the Data
          </a>
        </div>
      </section>

      {/* ═══ 1 — ACCOUNTABILITY PULSE ═══ */}
      {settings.show_accountability_pulse ? (
        <section id="accountability-pulse" className="bg-cream py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Eyebrow>Accountability Pulse</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Live Stewardship Snapshot
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#6b7280]">
              Updated every time a transaction is confirmed or a voucher is
              disbursed.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <PulseCard
                value={formatCents(stats.confirmedGiftsCents)}
                label="Total Funds Received"
              />
              <PulseCard
                value={formatCents(stats.programSpendCents)}
                label="Directed to Programs"
              />
              <PulseCard
                value={`${stats.overheadPct.toFixed(1)}%`}
                label="Overhead Rate"
              />
              <PulseCard
                value={`${Math.round(stats.promisesOnTrackPct)}%`}
                label="Promises on Track"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══ 2 — OPEN MISSION LEDGER ═══ */}
      {settings.show_open_ledger ? (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Eyebrow>Open Mission Ledger</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Every Dollar, Publicly Recorded
            </h2>
            <p className="mt-3 max-w-3xl text-base text-[#6b7280]">
              Every confirmed donation and disbursement we have recorded is
              listed here. No private ledger. No hidden accounts.
            </p>

            {ledger.rows.length === 0 ? (
              <div className="mt-12 text-center">
                <div className="mx-auto h-1 w-24 bg-gold" aria-hidden />
                <p className="mt-6 text-base text-[#6b7280]">
                  No public transactions have been recorded yet. Check back
                  after our first reporting period.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-10 overflow-hidden rounded-xl border border-black/5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left text-sm">
                      <thead>
                        <tr>
                          <LedgerTh>Date</LedgerTh>
                          <LedgerTh>Type</LedgerTh>
                          <LedgerTh>Fund</LedgerTh>
                          <LedgerTh align="right">Amount</LedgerTh>
                          <LedgerTh>Description</LedgerTh>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.rows.map((row) => (
                          <tr
                            key={row.id}
                            className="bg-white transition-colors even:bg-[#fafaf5] hover:bg-[#f0f9f4]"
                          >
                            <LedgerTd>
                              {formatDateOnly(row.transaction_date)}
                            </LedgerTd>
                            <LedgerTd>
                              {TRANSACTION_TYPE_LABELS[
                                row.type as TransactionType
                              ] ?? humanizeEnum(row.type)}
                            </LedgerTd>
                            <LedgerTd>
                              {FUND_LABELS[row.fund as FundDesignation] ??
                                humanizeEnum(row.fund)}
                            </LedgerTd>
                            <LedgerTd align="right">
                              {formatCents(row.amount_cents)}
                            </LedgerTd>
                            <LedgerTd>{row.description || "—"}</LedgerTd>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 ? (
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <PagerLink
                      href={`/faithproof?page=${page - 1}#open-ledger`}
                      disabled={page <= 1}
                    >
                      ← Previous
                    </PagerLink>
                    <span className="text-[#6b7280]">
                      Page {page} of {totalPages}
                    </span>
                    <PagerLink
                      href={`/faithproof?page=${page + 1}#open-ledger`}
                      disabled={page >= totalPages}
                    >
                      Next →
                    </PagerLink>
                  </div>
                ) : null}
              </>
            )}

            <Link
              href="/faithproof/explorer"
              className="mt-8 inline-block font-bold text-gold-dark underline underline-offset-4 transition hover:text-navy"
            >
              Financial Explorer →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ═══ 3 — PROMISES VS PERFORMANCE ═══ */}
      {settings.show_promises ? (
        <section className="bg-cream py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Eyebrow>Promises vs. Performance</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Commitments We Have Made
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#6b7280]">
              We publish every commitment publicly and report on whether we kept
              it.
            </p>

            {promises.length === 0 ? (
              <p className="mt-10 text-base text-[#6b7280]">
                Our first public commitments will be published here.
              </p>
            ) : (
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {promises.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm"
                  >
                    <div
                      style={{
                        height: 4,
                        backgroundColor:
                          PROMISE_ACCENT[p.status] ?? "#9ca3af",
                      }}
                    />
                    <div className="px-6 py-5">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={promiseBadge(p.status)}
                      >
                        {PROMISE_STATUS_LABELS[p.status] ??
                          humanizeEnum(p.status)}
                      </span>
                      <h3 className="mt-3 text-base font-semibold text-navy">
                        {p.title}
                      </h3>
                      {p.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                          {p.description}
                        </p>
                      ) : null}

                      {p.status === "fulfilled" ? (
                        <p className="mt-3 text-sm font-semibold text-[#16a34a]">
                          ✓ Kept — {formatDateOnly(p.fulfilled_date)}
                          {p.proof_url ? (
                            <>
                              {" · "}
                              <a
                                href={p.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2"
                              >
                                View proof
                              </a>
                            </>
                          ) : null}
                        </p>
                      ) : p.status === "missed" ? (
                        <p className="mt-3 text-sm font-semibold text-[#dc2626]">
                          ✗ Missed
                        </p>
                      ) : (
                        <p className="mt-3 text-[13px] text-[#9ca3af]">
                          Target: {formatDateOnly(p.target_date)}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ═══ 4 — PROOF VAULT ═══ */}
      {settings.show_proof_vault ? (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Eyebrow>Proof Vault</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Verified. Downloadable. Public.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#6b7280]">
              Every document listed here has been reviewed and verified by our
              board.
            </p>

            {documents.length === 0 ? (
              <p className="mt-10 text-base text-[#6b7280]">
                Documents are added as they are reviewed and verified by our
                board.
              </p>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <article
                    key={doc.id}
                    className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm"
                  >
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: "#FFF8E1",
                        color: "#92680A",
                        borderColor: "#F0D060",
                      }}
                    >
                      {DOCUMENT_TYPE_LABELS[doc.type as DocumentType] ??
                        humanizeEnum(doc.type)}
                    </span>
                    <h3 className="mt-3 text-[15px] font-semibold text-navy">
                      {doc.title}
                    </h3>
                    {doc.description ? (
                      <p className="mt-2 text-[13px] leading-relaxed text-[#6b7280]">
                        {doc.description}
                      </p>
                    ) : null}
                    <p className="mt-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          borderColor: "#bbf7d0",
                        }}
                      >
                        ✓ Verified
                      </span>
                    </p>
                    {doc.external_url ? (
                      <a
                        href={doc.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-bold text-gold-dark underline underline-offset-4"
                      >
                        View Document
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ═══ 5 — NOTHING HIDDEN ═══ */}
      {settings.show_nothing_hidden ? (
        <section className="bg-navy py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Eyebrow>Nothing Hidden</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              How Every Dollar Is Used
            </h2>
            <p className="mt-3 max-w-2xl text-base text-white/70">
              Our goal is to keep administrative overhead below 15% of total
              funds received.
            </p>

            <div
              className="mt-10 flex overflow-hidden rounded-lg"
              style={{ height: 48 }}
              role="img"
              aria-label={`Programs ${Math.round(stats.programPct)} percent, overhead ${Math.round(stats.overheadPct)} percent`}
            >
              <div
                className="flex items-center justify-center text-sm font-bold text-navy"
                style={{
                  width: `${stats.programPct}%`,
                  backgroundColor: "#C9A227",
                  minWidth: stats.programPct > 0 ? 90 : 0,
                }}
              >
                {stats.programPct > 0
                  ? `Programs ${Math.round(stats.programPct)}%`
                  : ""}
              </div>
              <div
                className="flex flex-1 items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                {stats.overheadPct > 0
                  ? `Overhead ${Math.round(stats.overheadPct)}%`
                  : "No spending recorded yet"}
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-2xl font-extrabold">
                  {formatCents(stats.programSpendCents)}
                </p>
                <p className="mt-1 text-sm text-white/60">Program Spend</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">
                  {formatCents(stats.overheadCents)}
                </p>
                <p className="mt-1 text-sm text-white/60">Administrative</p>
              </div>
            </div>

            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/70">
              When no program spend has been recorded, this bar will update
              automatically as transactions are confirmed. Our commitment to
              sub-15% overhead is a permanent policy, not a target we revise
              when we fall short.
            </p>
          </div>
        </section>
      ) : null}

      {/* ═══ 6 — DONOR IMPACT RECEIPTS ═══ */}
      <section className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <Eyebrow>Your Impact</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
            Your Gift. Your Proof.
          </h2>
          <p className="mt-3 text-base text-[#6b7280]">
            Every donor receives a personal impact receipt showing exactly how
            their designated gift was used. Receipts are issued quarterly.
          </p>

          <div className="mt-8">
            <ImpactReceiptForm />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "Quarterly Reporting",
              "Verified Transactions Only",
              "No Spam — Ever",
            ].map((t) => (
              <p
                key={t}
                className="flex items-center gap-2 text-sm font-semibold text-navy"
              >
                <span aria-hidden className="text-gold">
                  ✓
                </span>
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── small presentational helpers ────────────────────────────────────────────

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl px-8 py-6"
      style={{
        backgroundColor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <p className="text-4xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-[13px] uppercase tracking-wider text-white/65">
        {label}
      </p>
    </div>
  );
}

function PulseCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl bg-white px-6 py-8"
      style={{
        borderTop: "3px solid #C9A227",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <p className="text-3xl font-extrabold tabular-nums text-navy">{value}</p>
      <p className="mt-2 text-[13px] uppercase tracking-wider text-[#6b7280]">
        {label}
      </p>
    </div>
  );
}

function LedgerTh({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap bg-navy px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gold first:rounded-tl-xl last:rounded-tr-xl ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function LedgerTd({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`border-b border-[#f0f0ef] px-4 py-3 text-sm text-charcoal ${
        align === "right" ? "text-right tabular-nums" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="text-[#d1d5db]">{children}</span>;
  }
  return (
    <Link href={href} className="font-semibold text-navy hover:text-gold-dark">
      {children}
    </Link>
  );
}

function promiseBadge(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    fulfilled: { backgroundColor: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" },
    missed: { backgroundColor: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
    active: { backgroundColor: "#FFF8E1", color: "#92680A", borderColor: "#F0D060" },
    in_progress: { backgroundColor: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe" },
    revised: { backgroundColor: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" },
  };
  return map[status] ?? map.revised;
}
