import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "About Us — FAITH Foundation",
  description:
    "Learn about FAITH Foundation's mission, vision, core values, history, and statement of faith. A 501(c)(3) nonprofit helping families across Texas achieve homeownership through down payment assistance vouchers.",
};

const CORE_VALUES = [
  {
    letter: "F",
    title: "Foundation",
    body: "We are the financial foundation beneath a family's first home — closing the down payment gap that keeps ownership out of reach.",
  },
  {
    letter: "A",
    title: "Affordable",
    body: "We keep the path to ownership affordable, directing assistance where it removes the single biggest barrier to buying a home.",
  },
  {
    letter: "I",
    title: "Instruction",
    body: "We pair every voucher with homebuyer instruction so families buy with confidence and keep their homes for good.",
  },
  {
    letter: "T",
    title: "Tenancy",
    body: "We protect housing stability and tenancy today so a setback never derails a family's road to ownership.",
  },
  {
    letter: "H",
    title: "Hope",
    body: "Hope is the heartbeat of our work — we turn the hope of a home of one's own into keys in hand.",
  },
];

const HISTORY = [
  {
    label: "The conviction",
    body: "FAITH Foundation was born out of a simple but persistent conviction: that the families working hardest for a home of their own should not be locked out of ownership by a down payment they cannot save. What began as a ministry-rooted response to the housing pressures facing families in Burnet grew into a formal 501(c)(3) nonprofit dedicated to closing the down payment gap for families across Texas.",
  },
  {
    label: "The insight",
    body: "Our founders saw firsthand how a steady, hardworking family could afford a monthly mortgage yet never break through the single barrier standing in their way: the cash needed to close. They also saw how the right voucher — paired with homebuyer instruction — could turn a renter into an owner for good. Rather than treat homeownership as out of reach, FAITH Foundation was created to make it attainable.",
  },
  {
    label: "The turning point",
    body: "A turning point came with our partnership with Bright Box Homes, through which every home purchased generates a $2,500 donation that funds down payment assistance vouchers for families pursuing ownership. This sustainable model turned the act of buying a home into a renewable source of community uplift — one purchase lifting another family into a home of their own. Today we continue to grow that mission across Texas, guided by faith and powered by neighbors who believe ownership should be within everyone's reach.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ===== HERO — editorial split ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-dark" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-36 sm:px-8 sm:pt-44 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                About FAITH Foundation
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Who we are and why we serve
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                FAITH Foundation is a faith-driven 501(c)(3) nonprofit based in
                Burnet, Texas, helping families across Texas achieve
                homeownership by closing the down payment gap with assistance
                vouchers.
              </p>
            </Reveal>
          </div>
          <Reveal delay={200} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-card-lg ring-1 ring-white/10">
              <img
                src={img("familyTogether", 1100, 1300)}
                alt="A family standing close together, smiling"
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== MISSION & VISION — overlapping offset cards ===== */}
      <section className="bg-cream bg-texture">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <Reveal>
              <div className="rounded-3xl border-t-4 border-green bg-white p-8 shadow-card-lg sm:p-10">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-green-dark">
                  Our Mission
                </h2>
                <p className="text-xl font-semibold leading-relaxed text-navy">
                  To help families across Texas achieve homeownership by closing
                  the down payment gap — the single biggest barrier standing
                  between hardworking neighbors and a home of their own.
                </p>
                <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                  Too many families can afford a monthly mortgage yet can never
                  save the cash needed to close. FAITH Foundation exists to change
                  that. Through down payment assistance vouchers — paired with
                  homebuyer instruction so families buy with confidence — we move
                  our neighbors from renting to owning and help them keep their
                  homes for good.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="rounded-3xl border-t-4 border-gold bg-white p-8 shadow-card-lg sm:p-10 lg:mt-16">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
                  Our Vision
                </h2>
                <p className="text-xl font-semibold leading-relaxed text-navy">
                  A Texas where every hardworking family can own a home of their
                  own, where a down payment is no longer the barrier that keeps
                  ownership out of reach.
                </p>
                <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                  We envision neighborhoods where renting gives way to ownership
                  and generational poverty gives way to generational stability —
                  where the gift of a single home purchase ripples outward to lift
                  another family into a home of their own. We believe this vision
                  is achievable when faith, generosity, and accountability work
                  hand in hand.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES — vertical alternating zigzag ===== */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Our Core Values
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy sm:text-4xl">
              The values behind our name
            </h3>
            <p className="text-lg leading-relaxed text-charcoal/80">
              FAITH stands for the Foundation for Affordable Instruction and
              Tenancy Hope — and each letter names a value that guides how we
              help families own a home: Foundation, Affordable, Instruction,
              Tenancy, and Hope.
            </p>
          </Reveal>

          <ol className="relative mt-16 space-y-12 sm:space-y-16">
            {/* center connector line on lg */}
            <span
              aria-hidden
              className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-green/0 via-green/40 to-green/0 lg:block"
            />
            {CORE_VALUES.map((value, i) => {
              const flip = i % 2 === 1;
              return (
                <li key={value.title} className="relative">
                  <Reveal>
                    <div
                      className={`flex flex-col items-center gap-6 sm:gap-10 lg:flex-row ${
                        flip ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Big gold letter badge */}
                      <div className="flex shrink-0 justify-center lg:w-1/2">
                        <span
                          aria-hidden
                          className={`flex h-28 w-28 items-center justify-center rounded-[2rem] bg-green text-6xl font-extrabold text-white shadow-green ring-1 ring-green/30 sm:h-36 sm:w-36 sm:text-7xl ${
                            flip ? "lg:mr-0" : ""
                          }`}
                        >
                          {value.letter}
                        </span>
                      </div>
                      {/* Text */}
                      <div
                        className={`lg:w-1/2 ${
                          flip ? "lg:text-right" : "lg:text-left"
                        } text-center lg:text-left`}
                      >
                        <h4 className="text-2xl font-extrabold text-navy sm:text-3xl">
                          {value.title}
                        </h4>
                        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
                          {value.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ===== HISTORY — vertical timeline ===== */}
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Our History
            </h2>
            <h3 className="mb-12 text-3xl font-extrabold text-navy sm:text-4xl">
              From a calling to a foundation
            </h3>
          </Reveal>
          <ol className="relative space-y-12 border-l-2 border-gold/30 pl-8 sm:pl-12">
            {HISTORY.map((node, i) => (
              <li key={node.label} className="relative">
                <Reveal delay={i * 100}>
                  <span
                    aria-hidden
                    className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold ring-4 ring-cream sm:-left-[3.6rem]"
                  >
                    <span className="h-2 w-2 rounded-full bg-navy" />
                  </span>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                    {node.label}
                  </h4>
                  <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
                    {node.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== STATEMENT OF FAITH — full-width dark over faint image ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("communityGathering", 1900)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-green-deep/40" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              Our Statement of Faith
            </h2>
            <h3 className="mb-8 text-3xl font-extrabold sm:text-4xl">
              Rooted in faith, open to all
            </h3>
          </Reveal>
          <div className="space-y-6 text-lg leading-relaxed text-white/85">
            <Reveal delay={80} as="p">
              FAITH Foundation is a faith-based organization. We believe that
              every person is created with inherent dignity and worth, and that
              we are called to love our neighbors through tangible acts of
              service — feeding the hungry, sheltering the vulnerable, and
              lifting up those in need. Our faith is the wellspring of our
              compassion and the reason we persevere when the work is hard.
            </Reveal>
            <Reveal delay={160} as="p">
              While our work is grounded in Christian conviction, our doors and
              our programs are open to all. We serve families of every
              background, belief, and circumstance without condition or
              preference. We do not require those we help to share our faith; we
              simply ask that we be allowed to express ours through the way we
              serve. Compassion, integrity, and respect for the dignity of every
              person guide every interaction.
            </Reveal>
            <Reveal delay={240} as="p">
              We hold ourselves to the highest standards of stewardship and
              accountability, believing that the resources entrusted to us are a
              sacred trust. In all things, we strive to reflect the love,
              humility, and hope that first called us to this mission.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Be part of the mission
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Whether you give, partner, or apply for assistance, you help close
              the down payment gap and put families into homes of their own.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-gold px-8 py-4 text-base font-bold text-navy shadow-card transition-all duration-300 hover:bg-gold-light hover:shadow-card-lg"
              >
                Donate Now
              </Link>
              <Link
                href="/team"
                className="rounded-full border-2 border-green px-8 py-4 text-base font-bold text-green-light transition-colors hover:bg-green hover:text-white"
              >
                Meet Our Team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


