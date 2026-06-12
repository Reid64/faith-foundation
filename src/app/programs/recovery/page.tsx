import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recovery Housing — FAITH Foundation",
  description:
    "FAITH Foundation's Recovery Housing program guides Central Texas residents from sober living into permanent, independent housing with structure, accountability, and long-term support.",
};

const ELIGIBILITY = [
  "Currently in recovery from substance use and committed to a sober lifestyle, with a minimum period of demonstrated sobriety as assessed during intake.",
  "Resident of, or relocating to, Central Texas and able to participate in the Burnet-area recovery community.",
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
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Recovery
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Recovery Housing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            A clear path from sober living to permanent housing. Recovery Housing
            gives Central Texans in recovery the stable, substance-free home and
            the steady support they need to rebuild a life — one milestone at a
            time.
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
            Recovery needs a stable place to stand
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
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
            <p>
              Like all of our programs, Recovery Housing is sustained in part by
              the Bright Box Homes partnership, where every home purchased
              generates a $2,500 donation that funds direct housing assistance.
              That renewable model lets us help neighbors reclaim their lives
              while strengthening the whole Central Texas community.
            </p>
          </div>
        </div>
      </section>

      {/* The path */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            The path
          </h2>
          <h3 className="mb-10 text-3xl font-extrabold text-navy">
            From sober living to a home of your own
          </h3>
          <ol className="space-y-6">
            {STAGES.map((stage) => (
              <li
                key={stage.number}
                className="flex gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-lg font-bold text-navy">
                  {stage.number}
                </span>
                <div>
                  <p className="text-xl font-extrabold text-navy">
                    {stage.title}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-foreground/80">
                    {stage.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Eligibility
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Who Recovery Housing serves
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            Recovery Housing is for people who are ready to commit to sobriety and
            to the structure that protects it. You may be a strong fit if you meet
            the following criteria — and our intake team is here to talk through
            any questions before you apply.
          </p>
          <ul className="space-y-4">
            {ELIGIBILITY.map((item) => (
              <li
                key={item}
                className="flex gap-4 rounded-lg border-l-4 border-gold bg-gold/5 p-5"
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
            Every application is reviewed with compassion and confidentiality. If
            this program is not the right fit, we will help connect you with a
            resource that is.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
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
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Apply Now
            </Link>
            <Link
              href="/donate"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Fund Recovery Housing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
