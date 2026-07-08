import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Veterans Path Home — FAITH Foundation",
  description:
    "FAITH Foundation's Veterans Path Home program helps Texas veterans secure stable, affordable housing through rental assistance, case management, and connection to benefits they have earned.",
};

const ELIGIBILITY = [
  "Honorably or generally discharged veteran of any branch of the U.S. Armed Forces, including the National Guard and Reserves.",
  "Currently experiencing homelessness, housing instability, or at imminent risk of losing your home anywhere in Texas.",
  "Household income at or below 80% of the area median income for your community.",
  "Willing to partner with a FAITH Foundation case manager to build and follow a personal housing stability plan.",
];

const SUPPORTS = [
  {
    title: "Rapid rental assistance",
    body: "Short-term and bridge rental help that closes the gap between a veteran's income and the cost of safe housing — preventing eviction and ending homelessness fast.",
  },
  {
    title: "Benefits navigation",
    body: "Hands-on help claiming the VA housing, healthcare, and disability benefits you earned through service, including HUD-VASH and SSVF coordination.",
  },
  {
    title: "Wraparound case management",
    body: "A dedicated advocate who walks beside you — from the first application through move-in and beyond — connecting you to employment, counseling, and community.",
  },
];

const CASE_STEPS = [
  {
    number: "01",
    title: "Connect",
    body: "Reach out and meet your case manager. We assess your situation with respect and urgency — no red tape, no judgment.",
  },
  {
    number: "02",
    title: "Stabilize",
    body: "We move quickly to secure or protect safe housing, applying rental assistance where it closes the gap fastest.",
  },
  {
    number: "03",
    title: "Claim benefits",
    body: "Together we untangle the VA system and claim the housing, healthcare, and disability benefits you earned.",
  },
  {
    number: "04",
    title: "Build forward",
    body: "Employment, counseling, and community connections turn a set of keys into a lasting, stable home.",
  },
];

export default function VeteransPathHomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy">
        <img
          src={img("veteran", 2000)}
          alt="A veteran standing with quiet resolve"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 sm:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Programs / Veterans
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Veterans Path Home
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                No one who served our country should have to fight for a roof over
                their head. Veterans Path Home helps Texas veterans move from
                instability to a place of their own — with dignity, urgency, and the
                respect their service has earned.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-lg transition-all duration-300 hover:bg-gold-light hover:shadow-xl"
                >
                  Apply Now
                </Link>
                <Link
                  href="#how-we-help"
                  className="rounded-full border-2 border-white/40 px-8 py-3.5 text-base font-bold text-white transition-colors hover:border-green-light hover:text-green-light"
                >
                  See How We Help
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Why it matters
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Honoring service with stable housing
            </h3>
          </Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
            <Reveal delay={100}>
              <p>
                Veterans return home carrying skills, discipline, and sacrifice
                that few of us can imagine — yet too many find that the hardest
                battle comes after the uniform comes off. A lost job, a service
                connected disability, a marriage under strain, or simply the rising
                cost of rent can push a veteran from stability into a car, a couch,
                or the street. Across Texas, veterans are overrepresented among
                those facing homelessness, and every one of them represents a
                promise our community has a duty to keep.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p>
                Veterans Path Home exists to keep that promise. We meet veterans
                where they are — whether that is days from eviction or already
                without a home — and we move quickly to secure safe, affordable
                housing. But we do not stop at a set of keys. We pair every veteran
                with a case manager who helps untangle the benefits system, rebuild
                financial footing, and connect to the broader network of care that
                turns a temporary roof into a lasting home. Our goal is simple: a
                stable address, and the stability of life that grows from it.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p>
                This program is funded in part through the same renewable model
                that powers all of FAITH Foundation&apos;s work — the Bright Box
                Homes partnership, where every home purchased generates a $2,500
                donation that becomes direct housing assistance — helping neighbors
                move toward homeownership. When the community grows, so does our
                ability to bring veterans home.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SERVICE / BENEFITS GRID (dominant module) ===== */}
      <section id="how-we-help" className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              How we help
            </h2>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              Support at every step of the journey home
            </h3>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {SUPPORTS.map((support, i) => (
              <Reveal key={support.title} delay={i * 100}>
                <article className="group flex h-full flex-col rounded-2xl border-t-4 border-gold bg-navy-light/40 p-8 shadow-card-lg ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-gold/40">
                  <span
                    aria-hidden
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gold/15 text-2xl font-extrabold text-gold ring-1 ring-gold/30 transition-colors duration-300 group-hover:bg-gold group-hover:text-navy"
                  >
                    {i === 0 ? "★" : i === 1 ? "✓" : "♦"}
                  </span>
                  <h4 className="text-xl font-extrabold text-white">
                    {support.title}
                  </h4>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-white/75">
                    {support.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Stat band */}
          <Reveal>
            <div className="mt-16 grid gap-8 rounded-2xl bg-navy-dark/60 p-10 ring-1 ring-white/10 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-gold sm:text-5xl">
                  <StatCounter value={2500} prefix="$" />
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                  Donated per Bright Box home
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-gold sm:text-5xl">
                  <StatCounter value={100} suffix="%" />
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                  Confidential &amp; cost-free to apply
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-gold sm:text-5xl">
                  <StatCounter value={4} />
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                  Steps from connection to a home
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CASE-MANAGEMENT STEPS ROW ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Case management
            </h2>
            <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
              One advocate, walking beside you
            </h3>
          </Reveal>
          <ol className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {CASE_STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 100} as="li" className="relative">
                <div className="flex h-full flex-col rounded-2xl border border-navy/10 bg-cream p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                  <span className="text-4xl font-extrabold text-green/40">
                    {step.number}
                  </span>
                  <h4 className="mt-2 text-lg font-extrabold text-navy">
                    {step.title}
                  </h4>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-charcoal/80">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== ELIGIBILITY ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Eligibility
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Who Veterans Path Home serves
            </h3>
            <p className="mb-10 text-lg leading-relaxed text-charcoal/80">
              We aim to serve as many veterans as our funding allows. You may be a
              strong fit for the program if you meet the following criteria — and
              even if you are unsure, we encourage you to reach out so our team can
              help you understand your options.
            </p>
          </Reveal>
          <ul className="space-y-4">
            {ELIGIBILITY.map((item, i) => (
              <Reveal key={item} delay={i * 100} as="li">
                <div className="flex gap-4 rounded-xl border-l-4 border-gold bg-white p-5 shadow-card">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    ✓
                  </span>
                  <p className="text-lg leading-relaxed text-charcoal/80">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mt-8 text-base leading-relaxed text-charcoal/70">
              Documentation such as a DD-214, proof of income, or a VA benefits
              letter is helpful but not required to begin. If you do not have these
              on hand, our case managers will help you gather what you need.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-navy-dark py-24 text-white sm:py-28">
        <img
          src={img("flag", 1600)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-15"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-green-deep/40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Ready to come home? We are ready to help.
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              If you are a veteran facing a housing crisis — or you know one — take
              the first step today. There is no cost to apply, and every
              conversation is confidential and judgment-free.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-lg transition-all duration-300 hover:bg-gold-light hover:shadow-xl"
              >
                Apply Now
              </Link>
              <Link
                href="/donate"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Support a Veteran
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


