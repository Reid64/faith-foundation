import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Emergency Bridge Housing — FAITH Foundation",
  description:
    "FAITH Foundation's Emergency Bridge Housing provides fast, short-term rental assistance that keeps families across Texas housed during a sudden crisis — preventing eviction and homelessness before they start.",
};

const ELIGIBILITY = [
  "Facing a sudden, documentable housing emergency — an eviction notice, a job loss, a medical crisis, domestic violence, a natural disaster, or another shock that threatens your home.",
  "Living in one of the communities we serve across Texas.",
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
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-navy">
        <img
          src={img("familyOutdoors", 2000)}
          alt="A family standing together outside their home"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:px-8 sm:pt-44">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Programs / Emergency
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                Emergency Bridge Housing
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                A crisis should not cost a family their home. Emergency Bridge
                Housing delivers fast, short-term rental assistance that carries
                neighbors across Texas through a sudden hardship — and keeps a roof
                overhead until stability returns.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-full bg-gold px-8 py-4 text-center text-base font-bold text-navy shadow-card transition-all duration-300 hover:bg-gold-light hover:shadow-card-lg"
                >
                  Get Help Now
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== RAPID-RESPONSE CALLOUT BAND ===== */}
      <section className="relative bg-cream">
        <div className="mx-auto -mt-12 max-w-7xl px-6 sm:px-8">
          <div className="overflow-hidden rounded-3xl bg-navy shadow-card-lg">
            <div className="grid items-center gap-6 px-8 py-10 sm:px-12 lg:grid-cols-[auto,1fr]">
              <Reveal className="flex items-center gap-5">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold text-3xl font-extrabold uppercase text-navy shadow-card">
                  Fast
                </span>
                <div>
                  <p className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                    We move at the speed of your crisis.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <p className="text-lg leading-relaxed text-white/80">
                  In a housing emergency, time is everything. A phone call answered
                  today can be the difference between a family that stays housed and
                  a family that loses everything. Reach out the moment you sense
                  trouble — you do not need every document in hand to begin.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Why it matters
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              A short bridge over a sudden gap
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/80">
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
                support — our Housing Voucher Program and its down payment and rental
                assistance, employment resources, supporting financial literacy
                guidance, and the other FAITH Foundation programs that turn a moment
                of rescue into a path toward a home of their own. Like
                all of our work, Emergency Bridge Housing is powered by the
                renewable Bright Box Homes partnership, where every home purchased
                generates a $2,500 donation that becomes direct housing assistance
                for a neighbor in need. When the community grows, our ability to
                respond to emergencies grows with it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== WHAT'S COVERED — CHECKLIST (dominant module) ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
              How we help
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Fast help, aimed at keeping you housed
            </h2>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 max-w-3xl px-6 sm:px-8">
          <ul className="space-y-5">
            {SUPPORTS.map((support, i) => (
              <Reveal
                as="li"
                key={support.title}
                delay={i * 100}
                className="flex gap-5 rounded-2xl border-l-4 border-gold bg-cream p-7 shadow-card"
              >
                <span
                  aria-hidden
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-navy"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-navy">
                    {support.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-charcoal/80">
                    {support.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== ELIGIBILITY CARDS ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Eligibility
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Who Emergency Bridge Housing serves
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
              Emergency assistance is limited and need is great, so we prioritize
              households facing an immediate loss of housing. You may be a strong
              fit if you meet the following criteria — and if you are unsure, reach
              out anyway so our team can help you understand your options.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {ELIGIBILITY.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={i * 90}
                className="flex gap-4 rounded-2xl border-t-4 border-green bg-white p-7 shadow-card"
              >
                <span
                  aria-hidden
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green text-white"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                </span>
                <p className="text-base leading-relaxed text-charcoal/80">
                  {item}
                </p>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <p className="mt-8 text-base leading-relaxed text-charcoal/70">
              Documentation such as an eviction or late-rent notice, proof of
              income, or a record of the emergency is helpful but not required to
              begin. If you do not have it on hand, our case managers will help you
              gather what you need — and they will move as fast as your situation
              demands.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
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
                className="rounded-full bg-gold px-8 py-4 text-base font-bold text-navy shadow-card transition-all duration-300 hover:bg-gold-light hover:shadow-card-lg"
              >
                Get Help Now
              </Link>
              <Link
                href="/donate"
                className="rounded-full border-2 border-green px-8 py-4 text-base font-bold text-green-light transition-colors hover:bg-green hover:text-white"
              >
                Fund Emergency Help
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


