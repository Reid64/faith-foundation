import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Second Chance Reentry — FAITH Foundation",
  description:
    "FAITH Foundation's Second Chance Reentry program provides post-incarceration housing, case management, and employment support to help Central Texans returning home build a stable, lawful future.",
};

const ELIGIBILITY = [
  "Returning to the community after a period of incarceration, typically within the past twelve months.",
  "Resident of, or returning to, Central Texas, including Burnet County and surrounding communities.",
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

export default function SecondChanceReentryPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Reentry
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Second Chance Reentry
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            The hardest part of coming home is having somewhere to go. Second
            Chance Reentry provides post-incarceration housing and support so
            Central Texans returning to the community can rebuild on a foundation
            of stability — not setbacks.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Apply Now
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
            A second chance begins with a front door
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
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
            <p>
              This program is sustained in part by the Bright Box Homes
              partnership — every home purchased generates a $2,500 donation that
              funds direct housing assistance. As Central Texas grows, so does our
              capacity to welcome neighbors home and help them stay there.
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
            Who Second Chance Reentry serves
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            We serve people who are ready to build a stable, lawful future after
            incarceration. You may be a strong fit if you meet the criteria below.
            Applications are reviewed individually, and we welcome referrals from
            parole officers, reentry coordinators, and family members.
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
            Certain offenses may affect program placement to keep all residents
            and the surrounding community safe. Our team will review each
            situation with honesty and care, and help connect anyone we cannot
            serve to an appropriate alternative.
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
            Support that lowers the barriers to a fresh start
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
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Apply Now
            </Link>
            <Link
              href="/donate"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Support Reentry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
