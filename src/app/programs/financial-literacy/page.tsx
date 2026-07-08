import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Financial Literacy — FAITH Foundation",
  description:
    "FAITH Foundation's financial literacy is a supporting service that helps families across Texas prepare for and sustain homeownership through budgeting, credit, and debt guidance.",
};

const FOCUS_AREAS = [
  {
    title: "Budgeting",
    body: "We start where every stable financial life begins: a budget that reflects real income and real expenses. Families learn to track spending, separate needs from wants, build an emergency cushion, and plan ahead for the bills that derail so many households. The goal is not a spreadsheet that gathers dust, but a living plan that puts families back in control of their money — and their future.",
  },
  {
    title: "Credit Repair",
    body: "A credit score quietly decides what a family can rent, borrow, and afford. We help participants read their credit reports, dispute errors, understand what drives their score, and build a step-by-step plan to rebuild it. From breaking the cycle of high-interest debt to establishing positive payment history, we walk alongside families until a damaged score becomes a door that opens.",
  },
  {
    title: "Debt Management",
    body: "Debt can feel like a weight that never lifts. Our debt management instruction helps families inventory what they owe, prioritize payoff strategies, negotiate with creditors, and avoid the predatory products that deepen the hole. We focus on durable progress — turning overwhelming balances into a clear, achievable plan that frees up income for savings and stability.",
  },
];

export default function FinancialLiteracyPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-navy">
        <img
          src={img("classroom", 2000)}
          alt="An instructor teaching a small group in a bright classroom"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:px-8 sm:pt-44">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Supporting Service
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                Financial Literacy
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                A supporting service that helps families prepare for and sustain
                homeownership — practical guidance in budgeting, credit, and debt
                that complements our flagship housing mission.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== INTRO (alternating image + text) ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
                A supporting service
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Getting ready for a home of your own
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                Financial literacy is not FAITH Foundation&apos;s main purpose — our
                mission is helping families across Texas reach homeownership through
                down payment assistance. But many families need a little preparation
                before they are home-ready, and that is exactly where this supporting
                service comes in. A misunderstood loan or a credit score nobody ever
                explained can stand between a hardworking household and an affordable
                mortgage. This program helps clear those hurdles.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                The guidance is light, hands-on, and judgment-free, built around the
                practical steps that make homeownership achievable and sustainable:
                building a budget, strengthening credit, and reducing debt. We meet
                families where they are and walk a few steps alongside them — so that
                when the path to a home opens up, they are ready to walk through it.
              </p>
            </Reveal>
          </div>

          <Reveal delay={150} className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
              <img
                src={img("studying", 900)}
                alt="A person studying financial materials at a desk"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 hidden rounded-2xl border-l-4 border-green bg-navy px-7 py-6 text-white shadow-green sm:block">
              <p className="text-3xl font-extrabold text-green-light">Ready to Buy</p>
              <p className="mt-1 text-sm text-white/75">One step at a time</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CURRICULUM TIMELINE (dominant module) ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              What you&apos;ll learn
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Three steps toward home-readiness
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
              This supporting service focuses on the three areas that most directly
              prepare a family to qualify for and sustain a home of their own.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-4xl px-6 sm:px-8">
          <ol className="relative space-y-10 border-l-2 border-gold/30 pl-8 sm:pl-12">
            {FOCUS_AREAS.map((area, i) => (
              <Reveal as="li" key={area.title} delay={i * 100} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[2.55rem] top-0 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-gold shadow-card ring-4 ring-cream sm:-left-[3.55rem]"
                >
                  {i + 1}
                </span>
                <div className="rounded-2xl border-t-4 border-gold bg-cream p-8 shadow-card">
                  <h3 className="text-xl font-extrabold text-navy sm:text-2xl">
                    {area.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-charcoal/80">
                    {area.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== OUTCOMES STAT BAND ===== */}
      <section className="bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 shadow-card-lg sm:grid-cols-3">
            {[
              { value: 3, suffix: "", label: "Steps toward home-readiness, guided one at a time" },
              { value: 100, suffix: "%", label: "Hands-on, judgment-free guidance built around real life" },
              { value: 1, suffix: "", label: "Clear plan that helps every family get home-ready" },
            ].map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 90}
                className="bg-navy px-7 py-10 text-center"
              >
                <p className="text-5xl font-extrabold text-gold">
                  <StatCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm leading-snug text-white/75">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT CONNECTS (alternating image + text) ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
              <img
                src={img("newKeys", 900)}
                alt="A hand receiving the keys to a new home"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
                In service of the mission
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                A stepping stone to homeownership
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                This service exists to serve one goal: getting families into homes of
                their own. The budgeting skills, repaired credit, and reduced debt
                families achieve here are what make our flagship work reachable —
                qualifying for an affordable mortgage through Homeownership
                Counseling, or putting down payment and rental assistance from our
                Housing Voucher Program to its fullest use. It is the preparation
                that helps a family move from assistance today to ownership tomorrow.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                That is how FAITH Foundation works across Texas: homeownership through
                down payment assistance is the destination, and supporting services
                like this one help families get there ready and stay there secure.
                No matter where you are starting from, there is a path home — and we
                would be honored to walk a few steps of it with you.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Get ready for a home of your own
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Reach out for financial literacy guidance to help you prepare for
              homeownership, or support the service so the next family can get
              home-ready too.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-light hover:shadow-card-lg"
              >
                Ask About Getting Ready
              </Link>
              <Link
                href="/programs"
                className="rounded-full border-2 border-gold px-8 py-4 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Back to All Programs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


