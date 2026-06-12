import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Impact — FAITH Foundation",
  description:
    "See the measurable impact of FAITH Foundation across Central Texas — housing vouchers funded, families served, dollars stewarded, and the real stories of neighbors who found instruction and tenancy hope.",
};

const METRICS = [
  { value: "$2,500", label: "Donated to FAITH for every Bright Box home purchased" },
  { value: "100%", label: "Of vouchers directed to local housing assistance" },
  { value: "8", label: "Distinct programs serving families across the Hill Country" },
  { value: "501(c)(3)", label: "Tax-exempt nonprofit, accountable and transparent" },
];

const OUTCOMES = [
  {
    title: "Families kept housed",
    body: "Through emergency rental and deposit assistance, we step in before a missed paycheck becomes an eviction — keeping families in their homes and out of crisis.",
  },
  {
    title: "Neighbors equipped",
    body: "Our financial-literacy and homeownership instruction gives families durable skills — budgeting, credit repair, tenancy know-how — that outlast any single gift.",
  },
  {
    title: "Generosity multiplied",
    body: "The Bright Box Homes partnership turns each home purchase into a renewable $2,500 gift, so our capacity to help grows right alongside our community.",
  },
];

const STORIES = [
  {
    name: "A single mother in Burnet",
    quote:
      "I was three days from losing our apartment when FAITH Foundation stepped in. The deposit assistance and a coach who actually listened gave me room to breathe — and a plan I could follow.",
    body: "After a sudden job loss, Maria (name changed for privacy) fell behind on rent with two children at home. A housing voucher covered the gap while our financial-literacy coach helped her rebuild a budget and an emergency cushion. Six months later she is current on rent and has savings for the first time in years.",
  },
  {
    name: "A veteran finding stability",
    quote:
      "Somebody finally treated my situation like it mattered. The case manager walked me through my VA benefits and helped me get into a place I could afford.",
    body: "James (name changed) served his country but struggled to navigate the benefits and housing systems after discharge. Through our Veterans Path Home program, he received rental assistance and wraparound case management. Today he has stable housing and is mentoring other veterans facing the same uphill climb.",
  },
  {
    name: "A family putting down roots",
    quote:
      "We bought our home through Bright Box Homes — and learning that our purchase helped another family stay housed made it mean even more.",
    body: "When the Carter family (name changed) closed on their first home, the $2,500 give-back from Bright Box Homes funded a voucher for a family they will never meet. That is the cycle in action: one family putting down roots, another family keeping the roof overhead.",
  },
];

export default function ImpactPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Our Impact
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Real change, <span className="text-gold">measured honestly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Impact is more than a number — it is a family that stayed in their
            home, a neighbor who learned to build a budget, a veteran who found
            stable footing. We measure our work honestly and report it openly,
            because the families and donors who make this mission possible deserve
            to see exactly what their trust accomplishes.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-center text-sm font-bold uppercase tracking-widest text-gold">
            By the Numbers
          </h2>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center"
              >
                <dt className="text-3xl font-extrabold text-gold">
                  {metric.value}
                </dt>
                <dd className="mt-2 text-sm leading-snug text-white/80">
                  {metric.label}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mx-auto mt-10 max-w-3xl text-center text-base leading-relaxed text-white/75">
            As a young and growing 501(c)(3), our most important metric is trust.
            Every dollar we raise is stewarded with care and directed toward
            measurable, local outcomes — keeping families housed today while
            equipping them with the skills to thrive tomorrow.
          </p>
        </div>
      </section>

      {/* Outcomes */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              How Impact Happens
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Three ways your support changes lives
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Our model is simple and sustainable: keep families housed, equip
              them with instruction that lasts, and multiply generosity through
              the Bright Box Homes partnership so the cycle keeps growing.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <li
                key={outcome.title}
                className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <h4 className="text-xl font-bold text-navy">{outcome.title}</h4>
                <p className="mt-3 text-lg leading-relaxed text-foreground/80">
                  {outcome.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stories */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Stories of Hope
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              The neighbors behind the numbers
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Names and details have been changed to protect privacy, but every
              story reflects the real work happening across Central Texas because
              of supporters like you.
            </p>
          </div>
          <div className="space-y-8">
            {STORIES.map((story) => (
              <figure
                key={story.name}
                className="rounded-2xl border-l-8 border-gold bg-white p-8 shadow-sm"
              >
                <blockquote className="text-xl font-semibold leading-relaxed text-navy">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
                  {story.name}
                </figcaption>
                <p className="mt-5 text-lg leading-relaxed text-foreground/80">
                  {story.body}
                </p>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Be the next chapter in someone&apos;s story
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Your gift becomes a voucher, a budgeting lesson, a roof kept
            overhead. Join us in offering instruction and tenancy hope.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/financial-transparency"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              See Our Transparency
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
