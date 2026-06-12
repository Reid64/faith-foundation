import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Veterans Path Home — FAITH Foundation",
  description:
    "FAITH Foundation's Veterans Path Home program helps Central Texas veterans secure stable, affordable housing through rental assistance, case management, and connection to benefits they have earned.",
};

const ELIGIBILITY = [
  "Honorably or generally discharged veteran of any branch of the U.S. Armed Forces, including the National Guard and Reserves.",
  "Currently experiencing homelessness, housing instability, or at imminent risk of losing your home in Central Texas.",
  "Household income at or below 80% of the area median income for Burnet County and surrounding communities.",
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

export default function VeteransPathHomePage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Veterans
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Veterans Path Home
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            No one who served our country should have to fight for a roof over
            their head. Veterans Path Home helps Central Texas veterans move from
            instability to a place of their own — with dignity, urgency, and the
            respect their service has earned.
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
            Honoring service with stable housing
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Veterans return home carrying skills, discipline, and sacrifice
              that few of us can imagine — yet too many find that the hardest
              battle comes after the uniform comes off. A lost job, a service
              connected disability, a marriage under strain, or simply the rising
              cost of rent can push a veteran from stability into a car, a couch,
              or the street. In Central Texas, veterans are overrepresented among
              those facing homelessness, and every one of them represents a
              promise our community has a duty to keep.
            </p>
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
            <p>
              This program is funded in part through the same renewable model
              that powers all of FAITH Foundation&apos;s work — the Bright Box
              Homes partnership, where every home purchased generates a $2,500
              donation that becomes direct housing assistance for a neighbor in
              need. When the community grows, so does our ability to bring
              veterans home.
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
            Who Veterans Path Home serves
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            We aim to serve as many veterans as our funding allows. You may be a
            strong fit for the program if you meet the following criteria — and
            even if you are unsure, we encourage you to reach out so our team can
            help you understand your options.
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
            Documentation such as a DD-214, proof of income, or a VA benefits
            letter is helpful but not required to begin. If you do not have these
            on hand, our case managers will help you gather what you need.
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
            Support at every step of the journey home
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
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Apply Now
            </Link>
            <Link
              href="/donate"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Support a Veteran
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
