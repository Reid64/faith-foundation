import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command Center | FaithProof",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * FaithProof Command Center.
 *
 * PHASE 1: the two-panel structure is real; the contents are honest empty
 * states, not mock rows. Phase 2 replaces each panel body with live queries
 * (attention items from transactions/vouchers/promises awaiting action; the
 * activity feed from audit_log). The empty states below are what these panels
 * should genuinely show on a database with no records in it — so nothing here
 * has to be deleted later, only extended.
 */
export default function CommandCenterPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-black/10 pb-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold-dark">
          Command Center
        </p>
        <h1 className="mt-2 font-display text-3xl text-navy sm:text-4xl">
          Accountability at a glance
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/70">
          Everything awaiting a decision sits on the left. Everything already
          recorded sits on the right. If both are empty, there is nothing
          outstanding and nothing has been logged yet.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ── LEFT: Requires Attention ─────────────────────────────── */}
        <section
          aria-labelledby="requires-attention"
          className="rounded-xl border border-black/10 bg-white shadow-card"
        >
          <div className="border-b border-black/10 px-6 py-4">
            <h2
              id="requires-attention"
              className="font-display text-lg text-navy"
            >
              Requires Attention
            </h2>
            <p className="mt-1 text-xs text-charcoal/60">
              Unconfirmed transactions, pending vouchers, and promises past
              their target date.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#255527"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <p className="mt-4 text-sm font-medium text-charcoal">
              No items require attention
            </p>
            <p className="mt-1 text-xs text-charcoal/60">
              Nothing is pending review.
            </p>
          </div>
        </section>

        {/* ── RIGHT: Recent Accountability Activity ────────────────── */}
        <section
          aria-labelledby="recent-activity"
          className="rounded-xl border border-black/10 bg-white shadow-card"
        >
          <div className="border-b border-black/10 px-6 py-4">
            <h2 id="recent-activity" className="font-display text-lg text-navy">
              Recent Accountability Activity
            </h2>
            <p className="mt-1 text-xs text-charcoal/60">
              Every recorded change, newest first, drawn from the audit log.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16243F"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 8v4l2.5 2.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <p className="mt-4 text-sm font-medium text-charcoal">
              No activity recorded yet
            </p>
            <p className="mt-1 max-w-xs text-xs text-charcoal/60">
              Add your first transaction to begin.
            </p>
          </div>
        </section>
      </div>

      <p className="mt-8 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-xs leading-relaxed text-charcoal/70">
        <span className="font-semibold text-navy">Phase 1 — Foundation.</span>{" "}
        The data layer is installed and these panels are wired to their final
        layout. Live queries land in Phase 2; until then both panels show the
        genuine empty state of an unpopulated database.
      </p>
    </div>
  );
}
