import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Single Parent Stability — FAITH Foundation",
  description:
    "FAITH Foundation's Single Parent Stability program provides affordable housing, childcare navigation, and financial coaching to help Texas single-parent families build a secure future.",
};

const ELIGIBILITY = [
  "Single parent or sole legal guardian with at least one dependent child living in the household.",
  "Resident of Texas.",
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

const RESOURCES = [
  {
    title: "Housing navigation",
    body: "Find safe, affordable units and apply rental assistance where it closes the gap fastest.",
  },
  {
    title: "Childcare connections",
    body: "Locate and fund quality childcare so work and school stay possible.",
  },
  {
    title: "Benefits screening",
    body: "Discover school resources and benefits your family may already qualify for.",
  },
  {
    title: "Financial coaching",
    body: "Budget, rebuild credit, and start saving through our Financial Literacy program.",
  },
];

export default function SingleParentStabilityPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy">
        <img
          src={img("parentChild", 2000)}
          alt="A parent and child sharing a quiet moment together"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 sm:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Programs / Families
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Single Parent Stability
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                Raising a family on one income is one of the hardest jobs there is.
                Single Parent Stability helps Texas parents secure affordable
                housing and the support around it — so they can focus on what matters
                most: their children.
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
                  href="#supports"
                  className="rounded-full border-2 border-white/40 px-8 py-3.5 text-base font-bold text-white transition-colors hover:border-green-light hover:text-green-light"
                >
                  How We Help
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
              One parent, doing the work of two
            </h3>
          </Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
            <Reveal delay={100}>
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
            </Reveal>
            <Reveal delay={150}>
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
            </Reveal>
            <Reveal delay={200}>
              <p>
                Like all of FAITH Foundation&apos;s work, this program is funded in
                part by the Bright Box Homes partnership — where every home
                purchased generates a $2,500 donation that becomes direct housing
                assistance on the path toward homeownership. When one family puts
                down roots, another single-parent family gets the support to keep
                their home.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FAMILY SUPPORTS GRID (dominant module) ===== */}
      <section id="supports" className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              How we help
            </h2>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              Wraparound support for the whole family
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
                    {i === 0 ? "☂" : i === 1 ? "♥" : "$"}
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
        </div>
      </section>

      {/* ===== PULL-QUOTE / TESTIMONIAL CARD ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl bg-cream p-10 shadow-card-lg ring-1 ring-navy/5 sm:p-14">
              <span
                aria-hidden
                className="pointer-events-none absolute -left-2 top-2 select-none font-serif text-[8rem] leading-none text-gold/20 sm:text-[10rem]"
              >
                &ldquo;
              </span>
              <blockquote className="relative text-2xl font-bold leading-snug text-navy sm:text-3xl">
                When one family puts down roots, another single-parent family gets
                the support to keep their home.
              </blockquote>
              <figcaption className="relative mt-6 text-sm font-bold uppercase tracking-widest text-gold-dark">
                The Single Parent Stability promise
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ===== RESOURCE NAVIGATION BLOCK ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Resource navigation
            </h2>
            <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
              One team to help you find every door
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
              We help families connect the pieces — so no resource you qualify for
              slips through the cracks.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map((r, i) => (
              <Reveal key={r.title} delay={i * 100}>
                <div className="flex h-full flex-col rounded-2xl border border-navy/10 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                  <span className="text-3xl font-extrabold text-green/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="mt-2 text-lg font-extrabold text-navy">
                    {r.title}
                  </h4>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/80">
                    {r.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ELIGIBILITY ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Eligibility
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Who Single Parent Stability serves
            </h3>
            <p className="mb-10 text-lg leading-relaxed text-charcoal/80">
              This program is built for single parents and sole guardians working
              hard to keep their families housed and moving forward. You may be a
              strong fit if you meet the criteria below — and if you are unsure, we
              encourage you to apply so our team can help you explore your options.
            </p>
          </Reveal>
          <ul className="space-y-4">
            {ELIGIBILITY.map((item, i) => (
              <Reveal key={item} delay={i * 100} as="li">
                <div className="flex gap-4 rounded-xl border-l-4 border-gold bg-cream p-5 shadow-card">
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
              Documentation such as proof of income, a child&apos;s birth
              certificate, or a lease helps us serve you faster, but missing
              paperwork will never stop you from applying. Our team will help you
              gather what is needed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
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
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-lg transition-all duration-300 hover:bg-gold-light hover:shadow-xl"
              >
                Apply Now
              </Link>
              <Link
                href="/donate"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Support a Family
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


