import type { Metadata } from "next";
import Link from "next/link";
import BackgroundSwirls from "@/components/BackgroundSwirls";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Impact — FAITH Foundation",
  description:
    "How FAITH Foundation reports impact: our verified results to date, our Year One targets, and clearly labelled illustrative examples. A newly established Texas 501(c)(3) reporting honestly.",
  alternates: { canonical: "/impact" },
};

/**
 * IMPACT REPORTING RULE — read before editing this file.
 *
 * This page is deliberately split into three sections that must never blur:
 *   1. VERIFIED RESULTS TO DATE  — only outcomes that have actually occurred.
 *   2. YEAR ONE TARGETS & STANDARDS — goals and operating commitments.
 *   3. ILLUSTRATIVE EXAMPLES — scenarios the programs are designed to produce.
 *
 * FAITH Foundation is newly established and currently has NO completed
 * beneficiary outcomes. Do not move a figure into the results section, and do
 * not add a named beneficiary or a quotation attributed to a real person,
 * unless the outcome actually occurred and the person consented. The first
 * annual impact summary is committed for November 24, 2026 (see /events).
 */

/** Operating standards and Year One goals. NOT results. */
const METRICS = [
  { value: "100%", label: "Of every gift designated for down payment assistance is used for that program" },
  { value: "100%", label: "Of program-designated giving stays in Texas" },
  { value: "6", label: "Programs built and open to applicants" },
  { value: "501(c)(3)", label: "Tax-exempt nonprofit, accountable and transparent" },
];

/**
 * Illustrative scenarios ONLY — no named beneficiaries, no attributed quotes.
 * Each one describes what a program is designed to accomplish.
 */
const STORIES = [
  {
    name: "Illustrative — Veterans Path Home",
    lead: "What this program is designed to do",
    body: "A veteran leaving service struggles to navigate the benefits and housing systems at the same time. Veterans Path Home is designed to pair housing assistance with hands-on help understanding VA benefits, so that stable housing and the paperwork behind it are solved together rather than one at a time. This describes the intended outcome of the program, not a past case.",
  },
  {
    name: "Illustrative — Down payment assistance",
    lead: "How pooled community giving is meant to work",
    body: "A household can comfortably carry a monthly mortgage but has never been able to save the lump sum required to close. Pooled gifts designated for down payment assistance are meant to close exactly that gap, while gifts designated for operational support separately fund administration. This describes the funding model we are building, not assistance already delivered.",
  },
];

// Numeric stats parsed from METRICS for animated counters; non-numeric
// values (e.g. "501(c)(3)") are rendered as styled text instead.
const STAT_COUNTERS = [
  { prefix: "", value: 100, suffix: "%", label: METRICS[0].label },
  { prefix: "", value: 100, suffix: "%", label: METRICS[1].label },
  { prefix: "", value: 6, suffix: "", label: METRICS[2].label },
  { text: "501(c)(3)", label: METRICS[3].label },
];

const NARRATIVE = [
  {
    eyebrow: "Community-powered funding",
    title: "Generosity that grows the mission",
    body: "The generosity of donors and community partners funds our down payment assistance, so our capacity to help grows right alongside the community it serves.",
    image: "newKeys" as const,
    alt: "A new homeowner receiving the keys to their home",
  },
];

export default function ImpactPage() {
  return (
    <>
      {/* ===== HERO — dark photo + overlay ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy text-white">
        <img
          src={img("communityGathering", 2000)}
          alt="A community gathering of Texas neighbors supporting one another"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40 sm:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Our Impact
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Real change, <span className="text-gold">measured honestly</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                We are a newly established 501(c)(3), and this page is organised
                so you can tell at a glance what is a completed result, what is a
                goal, and what is an illustration. Nothing here is blurred
                together. The families and donors who make this mission possible
                deserve to know exactly which is which.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SECTION 1 — VERIFIED RESULTS TO DATE =====
          This section exists so a reader never has to infer whether a figure is
          a result or a goal. When real outcomes exist, they belong HERE and
          nowhere else on the site. */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-28">
        <BackgroundSwirls variant="diagonal" />
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center rounded-full border border-navy/20 bg-navy/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-navy">
              Section 1 of 3 — Verified Results To Date
            </span>
            <h2 className="heading-underline-center mt-6 text-3xl font-extrabold text-navy sm:text-4xl">
              What we have completed so far
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="card-surface mt-10 rounded-3xl border-l-[5px] border-navy p-8 sm:p-10">
              <p className="text-lg leading-relaxed text-charcoal/85">
                <strong className="text-navy">
                  FAITH Foundation is in its initial program implementation
                  stage and has no completed beneficiary outcomes to report yet.
                </strong>{" "}
                We are a 501(c)(3) recognized by the IRS under EIN 33-2640449,
                our programs are built and open to applicants, and our governing
                board is seated. What we have not yet done is complete a cycle of
                assistance with a family — so there are no families-served
                figures, no dollars-distributed figures, and no beneficiary
                testimonials on this website.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-charcoal/85">
                We could fill this space with projections. We would rather leave
                it accurate. Verified results will be published here and in our
                first annual impact summary, committed for{" "}
                <Link
                  href="/events"
                  className="font-semibold text-gold-dark underline underline-offset-2 hover:text-navy"
                >
                  November 24, 2026
                </Link>
                , including any target we miss.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== SECTION 2 — YEAR ONE TARGETS & STANDARDS (not results) ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Section 2 of 3 — Targets &amp; Standards
            </span>
            <p className="mt-6 text-3xl font-extrabold sm:text-4xl">
              The goals and standards we hold ourselves to
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              The figures below are our operating standards and our Year One
              targets — commitments about how we will handle money and run
              programs. They are <strong className="text-white">not</strong> a
              claim of results already delivered.
            </p>
          </Reveal>
          <dl className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_COUNTERS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 100}
                as="div"
                className="card-stat rounded-3xl px-6 py-10 text-center"
              >
                <dt className="card-stat-figure text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {"text" in stat ? (
                    stat.text
                  ) : (
                    <StatCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  )}
                </dt>
                <dd className="mt-4 text-sm leading-snug text-white/80">
                  {stat.label}
                </dd>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={200}>
            <p className="mx-auto mt-14 max-w-3xl text-center text-base leading-relaxed text-white/75">
              As a young and growing 501(c)(3), our most important metric is
              trust. 100% of every gift designated for down payment assistance is
              used to support the program for which it was designated; gifts
              designated for operational support fund the administration that
              keeps the organization running.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IMPACT HAPPENS — alternating image-text blocks ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              How Impact Happens
            </h2>
            <p className="heading-underline-center mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              How your support changes lives
            </p>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
              Our model is simple and sustainable: fund down payment assistance
              vouchers through the generosity of donors and community partners, so
              our capacity to move families into homes of their own keeps growing.
            </p>
          </Reveal>

          <div className="mt-20 space-y-20 lg:space-y-28">
            {NARRATIVE.map((block, i) => (
              <div
                key={block.title}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <Reveal
                  className={i % 2 === 1 ? "lg:order-2" : ""}
                  delay={i % 2 === 1 ? 120 : 0}
                >
                  <div className="overflow-hidden rounded-3xl shadow-card-lg">
                    <img
                      src={img(block.image, 1200, 900)}
                      alt={block.alt}
                      className="h-72 w-full object-cover sm:h-96"
                      loading="lazy"
                    />
                  </div>
                </Reveal>
                <Reveal
                  className={i % 2 === 1 ? "lg:order-1" : ""}
                  delay={i % 2 === 1 ? 0 : 120}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
                    {block.eyebrow}
                  </span>
                  <h3 className="mt-4 text-3xl font-extrabold text-navy">
                    {block.title}
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                    {block.body}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STORIES OF HOPE — testimonial / impact-story cards ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <BackgroundSwirls variant="bottom-right" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-navy/20 bg-navy/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-navy">
              Section 3 of 3 — Illustrative Examples
            </span>
            <p className="mt-6 text-3xl font-extrabold text-navy sm:text-4xl">
              What our programs are designed to do
            </p>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
              The scenarios below are illustrative. They are not testimonials,
              they are not based on named individuals, and they do not describe
              assistance already delivered. They exist so you can see precisely
              what each program is built to accomplish before we have completed
              outcomes to report.
            </p>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
            {STORIES.map((story, i) => (
              <Reveal
                key={story.name}
                delay={i * 100}
                as="article"
                className="card-surface flex h-full flex-col rounded-3xl p-8"
              >
                <span className="self-start rounded-full bg-navy/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy/70">
                  Illustrative scenario
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-navy">
                  {story.lead}
                </h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-charcoal/80">
                  {story.body}
                </p>
                <p className="mt-6 border-t border-navy/10 pt-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
                  {story.name}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHT BAND ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <img
          src={img("texasHills", 1800, 600)}
          alt="The Texas hills at golden hour"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-green-deep/40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-2xl font-bold leading-relaxed sm:text-3xl">
              Community generosity funding charitable housing, so more
              neighbors can reach a home of their own.{" "}
              <span className="text-gold">That is the model we are building.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Be the next chapter in someone&apos;s story
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Your gift becomes a down payment assistance voucher, a key in a
              neighbor&apos;s hand, a family rooted in a home of their own. Join us
              in making homeownership possible.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-green px-8 py-3.5 text-base font-bold text-white shadow-green transition-colors hover:bg-green-dark"
              >
                Donate Now
              </Link>
              <Link
                href="/financial-transparency"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                See Our Transparency
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


