import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Second Chance Reentry — FAITH Foundation",
  description:
    "FAITH Foundation's Second Chance Reentry program provides post-incarceration housing, case management, and employment support to help Texans returning home build a stable, lawful future.",
};

const ELIGIBILITY = [
  "Returning to the community after a period of incarceration, typically within the past twelve months.",
  "Resident of, or returning to, Texas.",
  "Committed to compliance with the terms of parole, probation, or community supervision where applicable.",
  "Ready to pursue employment, education, or job training and to follow a reentry stability plan with a case manager.",
];

const SUPPORTS = [
  {
    title: "Transitional housing",
    body: "A safe, stable place to land on day one — removing the single biggest barrier to successful reentry and the leading driver of recidivism.",
  },
  {
    title: "Employment & training",
    body: "Help with resumes, interview readiness, fair-chance employers, and job training so a record becomes a chapter, not a life sentence to unemployment.",
  },
  {
    title: "Case management",
    body: "A dedicated advocate to coordinate ID recovery, benefits, counseling, supervision requirements, and family reunification — all in one plan.",
  },
];

const MILESTONES = [
  {
    label: "Day one",
    title: "Returning home",
    body: "Walk out to a safe address, not uncertainty. Transitional housing is ready the moment it is needed.",
  },
  {
    label: "First weeks",
    title: "Documents & basics",
    body: "Recover ID, navigate supervision requirements, and connect to benefits and counseling with a case manager at your side.",
  },
  {
    label: "First months",
    title: "Work & income",
    body: "Build a resume, prepare for interviews, and connect to fair-chance employers and job training that open real doors.",
  },
  {
    label: "Ongoing",
    title: "Lasting stability",
    body: "Reunite with family where it is safe and welcome, and step into independent housing on a foundation built to hold.",
  },
];

const FAQS = [
  {
    q: "Does my offense disqualify me?",
    a: "Not automatically. Certain offenses may affect program placement to keep all residents and the community safe, but our team reviews every situation individually and will help connect anyone we cannot serve to an appropriate alternative.",
  },
  {
    q: "How soon should I reach out?",
    a: "The first weeks after release are decisive, so the earlier the better. We welcome referrals from parole officers, reentry coordinators, and family members before a release date arrives.",
  },
  {
    q: "What does it cost?",
    a: "Applying is always free and confidential. There is no cost to start a conversation or to see whether the program is a fit.",
  },
];

export default function SecondChanceReentryPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy">
        <img
          src={img("handshake", 2000)}
          alt="A welcoming handshake — a fresh start"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 sm:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Programs / Reentry
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Second Chance Reentry
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                The hardest part of coming home is having somewhere to go. Second
                Chance Reentry provides post-incarceration housing and support so
                Texans returning to the community can rebuild on a foundation
                of stability — not setbacks.
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
                  href="#the-path"
                  className="rounded-full border-2 border-white/40 px-8 py-3.5 text-base font-bold text-white transition-colors hover:border-green-light hover:text-green-light"
                >
                  The Path Home
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
              A second chance begins with a front door
            </h3>
          </Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
            <Reveal delay={100}>
              <p>
                The first weeks after release are decisive. A person leaving
                incarceration often walks out with little more than the clothes they
                wore in — no stable address, no job, sometimes not even a valid ID.
                Doors close fast: landlords turn away applicants with records,
                employers screen them out, and the clock on parole or probation
                starts ticking immediately. Without a safe place to sleep, every
                other goal becomes nearly impossible, and the risk of returning to
                prison climbs. Studies consistently show that stable housing is one
                of the strongest protections against recidivism — and one of the
                hardest things for a returning citizen to secure alone.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p>
                Second Chance Reentry exists to change that first chapter. We
                provide transitional housing the moment it is needed, then surround
                residents with the support that turns a release date into a genuine
                new beginning. Our case managers help recover identification,
                navigate supervision requirements, connect to fair-chance employers
                and job training, and reunite families where it is safe and welcome.
                We believe that people are more than the worst thing they have done,
                and that a community is stronger when those who have paid their debt
                are given a real path to contribute.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p>
                This program is sustained in part by the Bright Box Homes
                partnership — every home purchased generates a $2,500 donation that
                funds direct housing assistance that helps families move toward
                homeownership. As Texas grows, so does our capacity to welcome
                neighbors home and help them stay there.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== MILESTONE PATH (dominant module) ===== */}
      <section id="the-path" className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              The path home
            </h2>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              From returning home to lasting stability
            </h3>
          </Reveal>

          <ol className="relative mt-16 grid gap-8 lg:grid-cols-4">
            {/* Horizontal connector for large screens */}
            <span
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-gold/30 via-gold/60 to-gold lg:block"
            />
            {MILESTONES.map((m, i) => (
              <Reveal key={m.title} delay={i * 120} as="li" className="relative">
                <span
                  aria-hidden
                  className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-base font-extrabold text-navy shadow-lg ring-4 ring-navy"
                >
                  {i + 1}
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-gold">
                  {m.label}
                </p>
                <h4 className="mt-1 text-xl font-extrabold text-white">
                  {m.title}
                </h4>
                <p className="mt-3 text-base leading-relaxed text-white/75">
                  {m.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== SUPPORT-SERVICE CARDS ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              How we help
            </h2>
            <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
              Support that lowers the barriers to a fresh start
            </h3>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {SUPPORTS.map((support, i) => (
              <Reveal key={support.title} delay={i * 100}>
                <article className="group flex h-full flex-col rounded-2xl border-t-4 border-green bg-cream p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                  <span
                    aria-hidden
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-2xl font-extrabold text-green-light transition-colors duration-300 group-hover:bg-green group-hover:text-white"
                  >
                    {i === 0 ? "☂" : i === 1 ? "✦" : "◆"}
                  </span>
                  <h4 className="text-xl font-extrabold text-navy">
                    {support.title}
                  </h4>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-charcoal/80">
                    {support.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
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
              Who Second Chance Reentry serves
            </h3>
            <p className="mb-10 text-lg leading-relaxed text-charcoal/80">
              We serve people who are ready to build a stable, lawful future after
              incarceration. You may be a strong fit if you meet the criteria below.
              Applications are reviewed individually, and we welcome referrals from
              parole officers, reentry coordinators, and family members.
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
              Certain offenses may affect program placement to keep all residents
              and the surrounding community safe. Our team will review each
              situation with honesty and care, and help connect anyone we cannot
              serve to an appropriate alternative.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal className="text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Common questions
            </h2>
            <h3 className="mb-12 text-3xl font-extrabold text-navy sm:text-4xl">
              What returning citizens ask us
            </h3>
          </Reveal>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 100}>
                <details className="group rounded-2xl border border-navy/10 bg-cream p-6 shadow-card [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-extrabold text-navy">
                    {faq.q}
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-navy transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-charcoal/80">
                    {faq.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Everyone deserves a real second chance
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              If you or someone you love is returning home from incarceration, do
              not wait until the crisis hits. Reach out today — applying is free,
              confidential, and the first step toward lasting stability.
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
                Support Reentry
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


