import Reveal from "@/components/Reveal";

/**
 * Applicant vetting transparency section, shared by the Recovery Housing and
 * Second Chance Reentry program pages. Sits directly above each page's CTA.
 */
const REQUIREMENTS = [
  {
    title: "Pastoral or Chaplain Recommendation",
    body: "A letter of support from a prison chaplain, church pastor, or licensed ministry leader who can speak to the applicant's character, conduct, and commitment to rehabilitation. This letter must address the applicant's specific progress and future intentions.",
  },
  {
    title: "Documented Rehabilitation Steps",
    body: "Evidence of active steps toward rehabilitation taken while incarcerated or in recovery — including but not limited to completion of substance abuse programs, vocational or educational training, GED attainment, faith-based discipleship programs, or other structured rehabilitation coursework.",
  },
  {
    title: "Letters of Support",
    body: "Supporting letters from parole officers, case workers, licensed counselors, or community leaders who can speak to the applicant's active reintegration efforts, compliance with supervision requirements, and readiness for independent housing.",
  },
  {
    title: "Personal Statement",
    body: "A written personal statement describing the applicant's journey, current circumstances, goals for stable housing, and commitment to the responsibilities of tenancy and community participation.",
  },
];

export default function VettingStandards() {
  return (
    <section className="bg-navy py-24 text-white sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
            Our Standards
          </h2>
          <h3 className="text-3xl font-extrabold sm:text-4xl">
            Accountability that protects the people we serve
          </h3>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            FAITH Foundation takes its responsibility to donors and the community
            seriously. Because our programs serve individuals in recovery and
            returning from incarceration, we apply a structured vetting process
            that prioritizes documented rehabilitation, faith community
            involvement, and demonstrated commitment to a new direction. We
            prioritize applicants with documented faith community support and
            pastoral recommendations — while remaining open to all who meet our
            standards regardless of background.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-8 sm:grid-cols-2">
          {REQUIREMENTS.map((requirement, i) => (
            <Reveal as="li" key={requirement.title} delay={(i % 2) * 100}>
              <article className="card-on-navy flex h-full flex-col rounded-2xl p-8">
                <span
                  aria-hidden
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-lg font-extrabold text-gold ring-1 ring-gold/30"
                >
                  {i + 1}
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  {requirement.title}
                </h4>
                <p className="mt-4 flex-1 text-base leading-relaxed text-white/75">
                  {requirement.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl border-l-[5px] border-gold bg-white/5 px-7 py-6">
            <p className="text-base leading-relaxed text-white/85">
              All applications are reviewed individually. Meeting these
              requirements does not guarantee assistance — it ensures every
              family we serve has been thoughtfully considered and that donor
              resources are directed where they will have lasting impact.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
