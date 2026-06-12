import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Emergency Bridge Housing — FAITH Foundation",
  description:
    "FAITH Foundation's Emergency Bridge Housing provides fast, short-term rental assistance that keeps Central Texas families housed during a sudden crisis — preventing eviction and homelessness before they start.",
};

const ELIGIBILITY = [
  "Facing a sudden, documentable housing emergency — an eviction notice, a job loss, a medical crisis, domestic violence, a natural disaster, or another shock that threatens your home.",
  "Living in Burnet County or the surrounding Central Texas communities we serve.",
  "Household income at or below 80% of the area median income, with a realistic path to resuming rent on your own within a short bridge period.",
  "Willing to work with a FAITH Foundation case manager to build a short stabilization plan and connect to longer-term resources.",
];

const SUPPORTS = [
  {
    title: "Short-term rental assistance",
    body: "Direct help with one to three months of rent or a past-due balance — enough to stop an eviction in its tracks and keep a family in the home they already have while they regain their footing.",
  },
  {
    title: "Move-in and deposit help",
    body: "When staying put is not possible, we help with the security deposit, first month's rent, and application fees that so often stand between a family and a safe new place to live.",
  },
  {
    title: "Rapid case management",
    body: "A dedicated advocate who responds quickly, helps gather documentation, negotiates with landlords, and connects you to food, utilities, employment, and the longer-term programs that prevent the next crisis.",
  },
];

export default function EmergencyBridgeHousingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Emergency
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Emergency Bridge Housing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            A crisis should not cost a family their home. Emergency Bridge
            Housing delivers fast, short-term rental assistance that carries
            Central Texas neighbors across a sudden hardship — and keeps a roof
            overhead until stability returns.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Get Help Now
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why it matters
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            A short bridge over a sudden gap
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              For most families facing homelessness, the cause is not a lifetime
              of instability — it is a single, sudden shock. A car repair that
              swallows the rent. A layoff with no warning. A hospital stay, a
              fleeing from violence, a fire or a flood. In the span of one month,
              a household that was managing can fall behind, and once an eviction
              begins, the slide toward the street is swift and brutally hard to
              reverse. The tragedy is that the gap is often small — a few hundred
              dollars, a single deposit, one month of breathing room.
            </p>
            <p>
              Emergency Bridge Housing exists to close that gap before it
              becomes a catastrophe. We move quickly, because in a housing crisis
              time is everything: a phone call answered today can mean the
              difference between a family that stays housed and a family that
              loses everything it would take years to rebuild. We provide
              targeted, short-term rental assistance — paying a past-due balance,
              covering a security deposit, or bridging a month or two of rent —
              paired with hands-on case management that addresses the underlying
              emergency and steadies the household for what comes next.
            </p>
            <p>
              This is intentionally a bridge, not a permanent subsidy. Our goal
              is to stabilize a family fast and then connect them to longer-term
              support — our Housing Voucher Program, Financial Literacy
              coaching, employment resources, and the other FAITH Foundation
              programs that turn a moment of rescue into lasting security. Like
              all of our work, Emergency Bridge Housing is powered by the
              renewable Bright Box Homes partnership, where every home purchased
              generates a $2,500 donation that becomes direct housing assistance
              for a neighbor in need. When the community grows, our ability to
              respond to emergencies grows with it.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Eligibility
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Who Emergency Bridge Housing serves
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            Emergency assistance is limited and need is great, so we prioritize
            households facing an immediate loss of housing. You may be a strong
            fit if you meet the following criteria — and if you are unsure, reach
            out anyway so our team can help you understand your options.
          </p>
          <ul className="space-y-4">
            {ELIGIBILITY.map((item) => (
              <li
                key={item}
                className="flex gap-4 rounded-lg border-l-4 border-gold bg-white p-5 shadow-sm"
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                  ✓
                </span>
                <p className="text-lg leading-relaxed text-foreground/80">
                  {item}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base leading-relaxed text-foreground/70">
            Documentation such as an eviction or late-rent notice, proof of
            income, or a record of the emergency is helpful but not required to
            begin. If you do not have it on hand, our case managers will help you
            gather what you need — and they will move as fast as your situation
            demands.
          </p>
        </div>
      </section>

      {/* How we help */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-gold-dark">
            How we help
          </h2>
          <h3 className="mb-12 text-center text-3xl font-extrabold text-navy">
            Fast help, aimed at keeping you housed
          </h3>
          <ul className="grid gap-8 lg:grid-cols-3">
            {SUPPORTS.map((support) => (
              <li
                key={support.title}
                className="flex flex-col rounded-xl border-t-4 border-gold bg-white p-8 shadow-md ring-1 ring-navy/5"
              >
                <h4 className="text-xl font-extrabold text-navy">
                  {support.title}
                </h4>
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/80">
                  {support.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            In a housing emergency? Reach out today.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            If you have received an eviction notice or you are days from losing
            your home, do not wait. There is no cost to ask for help, and every
            conversation is confidential and judgment-free.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Get Help Now
            </Link>
            <Link
              href="/donate"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Fund Emergency Help
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
