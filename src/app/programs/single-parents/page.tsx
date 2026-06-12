import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Single Parent Stability — FAITH Foundation",
  description:
    "FAITH Foundation's Single Parent Stability program provides affordable housing, childcare navigation, and financial coaching to help Central Texas single-parent families build a secure future.",
};

const ELIGIBILITY = [
  "Single parent or sole legal guardian with at least one dependent child living in the household.",
  "Resident of Central Texas, including Burnet County and surrounding communities.",
  "Household income at or below 80% of the area median income, with housing costs that strain the family budget.",
  "Working, seeking work, or enrolled in education or job training, and willing to partner on a family stability plan.",
];

const SUPPORTS = [
  {
    title: "Affordable housing assistance",
    body: "Rental help and housing navigation that put a safe, stable home within reach — so a parent's income can stretch to cover food, childcare, and the future.",
  },
  {
    title: "Childcare & resource navigation",
    body: "Help finding and funding quality childcare, school resources, and benefits, removing the barriers that force impossible choices between work and parenting.",
  },
  {
    title: "Financial coaching",
    body: "One-on-one budgeting, credit, and savings support through our Financial Literacy program, building the foundation for long-term independence.",
  },
];

export default function SingleParentStabilityPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Families
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Single Parent Stability
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Raising a family on one income is one of the hardest jobs there is.
            Single Parent Stability helps Central Texas parents secure affordable
            housing and the support around it — so they can focus on what matters
            most: their children.
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
            One parent, doing the work of two
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              A single parent carries the full weight of a household on one set of
              shoulders. Every dollar, every hour, and every decision stretches to
              cover two roles at once — breadwinner and caregiver, provider and
              protector. When rent climbs faster than wages, the margin for error
              disappears. A sick child means missed work; missed work means a
              smaller paycheck; a smaller paycheck means falling behind on rent.
              For too many single-parent families, this is not a worst-case
              scenario but a monthly tightrope, and a single misstep can tip a
              hardworking household into housing instability or homelessness.
            </p>
            <p>
              Single Parent Stability is designed to widen that margin. We start
              with the foundation every family needs — safe, affordable housing —
              and then build outward to address the interlocking challenges that
              make stability so fragile. We help parents find and fund quality
              childcare so they can work or finish school. We connect families to
              benefits and school resources they may not know they qualify for.
              And through one-on-one financial coaching, we help parents budget,
              rebuild credit, and begin to save, turning a season of survival into
              a path toward independence. Our aim is not a one-time handout but a
              durable platform a family can grow from.
            </p>
            <p>
              Like all of FAITH Foundation&apos;s work, this program is funded in
              part by the Bright Box Homes partnership — where every home
              purchased generates a $2,500 donation that becomes direct housing
              assistance. When one family puts down roots, another single-parent
              family gets the support to keep their home.
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
            Who Single Parent Stability serves
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            This program is built for single parents and sole guardians working
            hard to keep their families housed and moving forward. You may be a
            strong fit if you meet the criteria below — and if you are unsure, we
            encourage you to apply so our team can help you explore your options.
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
            Documentation such as proof of income, a child&apos;s birth
            certificate, or a lease helps us serve you faster, but missing
            paperwork will never stop you from applying. Our team will help you
            gather what is needed.
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
            Wraparound support for the whole family
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
            Build a stable future for your family
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            You do not have to carry it all alone. If you are a single parent
            working to keep your family housed and thriving, reach out today.
            Applying is free, confidential, and the first step toward stability.
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
              Support a Family
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
