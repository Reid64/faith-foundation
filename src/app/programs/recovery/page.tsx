import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Recovery Housing — FAITH Foundation",
  description:
    "FAITH Foundation's Recovery Housing program guides Texas residents from sober living into permanent, independent housing with structure, accountability, and long-term support.",
};

const ELIGIBILITY = [
  "Currently in recovery from substance use and committed to a sober lifestyle, with a minimum period of demonstrated sobriety as assessed during intake.",
  "Resident of, or relocating to, Texas and able to participate in a local recovery community.",
  "Willing to abide by a sober living agreement, including drug and alcohol testing and participation in recovery support meetings.",
  "Ready to work toward employment, education, or vocational goals as part of a path to permanent, independent housing.",
];

const STAGES = [
  {
    number: "1",
    title: "Sober living entry",
    body: "A safe, substance-free home with peers who share your commitment. Structure, accountability, and routine create the foundation early recovery depends on.",
  },
  {
    number: "2",
    title: "Stabilization & growth",
    body: "With housing secured, residents focus on employment, counseling, financial literacy, and rebuilding relationships — supported by house leadership and case management.",
  },
  {
    number: "3",
    title: "Transitional housing",
    body: "As independence grows, residents move into housing with greater autonomy while keeping the supports and accountability that protect long-term sobriety.",
  },
  {
    number: "4",
    title: "Permanent housing",
    body: "The goal of the journey: a stable home of your own. We help with deposits, references, and the rental assistance that makes a lasting address possible.",
  },
];

export default function RecoveryHousingPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy">
        <img
          src={img("sunrise", 2000)}
          alt="Sunrise breaking over the hills — a new day"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 sm:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Programs / Recovery
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Recovery Housing
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                A clear path from sober living to permanent housing. Recovery Housing
                gives Texans in recovery the stable, substance-free home and
                the steady support they need to rebuild a life — one milestone at a
                time.
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
                  See the Path
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== INTRO (image + text) ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="overflow-hidden rounded-3xl shadow-card-lg">
              <img
                src={img("cozyHome", 1100, 900)}
                alt="A warm, welcoming home where recovery can take root"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
                Why it matters
              </h2>
              <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
                Recovery needs a stable place to stand
              </h3>
            </Reveal>
            <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
              <Reveal delay={100}>
                <p>
                  Recovery is hard enough without wondering where you will sleep
                  tonight. Research and lived experience agree: stable, substance-free
                  housing is one of the strongest predictors of lasting recovery.
                  When a person leaving treatment returns to chaos, couch-surfing, or
                  the same environment that fed their addiction, relapse is far more
                  likely. But when they step into a sober home — surrounded by peers
                  who understand the journey and held by gentle accountability — they
                  gain the footing that makes every other kind of progress possible.
                </p>
              </Reveal>
              <Reveal delay={150}>
                <p>
                  FAITH Foundation&apos;s Recovery Housing program is built around a
                  simple truth: recovery is a journey, not a single leap. We do not
                  hand someone keys and wish them luck. We walk a deliberate path with
                  them — from the structure of sober living, through stabilization and
                  growth, into transitional housing with increasing independence, and
                  finally into permanent housing they can call their own. At every
                  stage, the level of support adjusts to meet the person where they
                  are, so that independence is earned and protected rather than
                  rushed.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p>
                  Like all of our programs, Recovery Housing is sustained in part by
                  the Bright Box Homes partnership, where every home purchased
                  generates a $2,500 donation that funds direct housing assistance
                  on the path toward homeownership. That renewable model lets us help
                  neighbors reclaim their lives while strengthening communities
                  across Texas.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STAGES PROGRESSION (dominant module) ===== */}
      <section id="the-path" className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              The path
            </h2>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              From sober living to a home of your own
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              Four ascending stages — each one building on the last, each one moving
              forward toward lasting independence.
            </p>
          </Reveal>

          <ol className="relative mt-16 space-y-10">
            {/* Connecting ascending line */}
            <span
              aria-hidden
              className="absolute left-7 top-4 bottom-4 hidden w-0.5 bg-gradient-to-t from-gold/20 via-gold/50 to-gold sm:block"
            />
            {STAGES.map((stage, i) => (
              <Reveal
                key={stage.number}
                delay={i * 120}
                as="li"
                className="relative sm:pl-24"
              >
                {/* Node */}
                <span
                  aria-hidden
                  className="absolute left-0 top-0 hidden h-14 w-14 items-center justify-center rounded-full bg-gold text-xl font-extrabold text-navy shadow-lg ring-4 ring-navy sm:flex"
                >
                  {stage.number}
                </span>
                <div
                  className="rounded-2xl border-l-4 border-gold bg-navy-light/40 p-7 shadow-card-lg ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1"
                  style={{ marginRight: `${(STAGES.length - 1 - i) * 8}px` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-base font-extrabold text-navy sm:hidden">
                      {stage.number}
                    </span>
                    <h4 className="text-xl font-extrabold text-white">
                      {stage.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-lg leading-relaxed text-white/80">
                    {stage.body}
                  </p>
                  {i < STAGES.length - 1 && (
                    <span
                      aria-hidden
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold/80"
                    >
                      Forward to stage {Number(stage.number) + 1}
                      <span aria-hidden>↑</span>
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== ELIGIBILITY ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Eligibility
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Who Recovery Housing serves
            </h3>
            <p className="mb-10 text-lg leading-relaxed text-charcoal/80">
              Recovery Housing is for people who are ready to commit to sobriety and
              to the structure that protects it. You may be a strong fit if you meet
              the following criteria — and our intake team is here to talk through
              any questions before you apply.
            </p>
          </Reveal>
          <ul className="space-y-4">
            {ELIGIBILITY.map((item, i) => (
              <Reveal key={item} delay={i * 100} as="li">
                <div className="flex gap-4 rounded-xl border-l-4 border-green bg-cream p-5 shadow-card">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-green-light">
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
              Every application is reviewed with compassion and confidentiality. If
              this program is not the right fit, we will help connect you with a
              resource that is.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Your next chapter starts with a stable home
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Whether you are leaving treatment, supporting a loved one, or simply
              ready for a fresh start, reach out today. Applying is free,
              confidential, and the first step toward permanent stability.
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
                Fund Recovery Housing
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


