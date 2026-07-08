import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Impact — FAITH Foundation",
  description:
    "See the measurable impact of FAITH Foundation across Texas — down payment assistance vouchers funded, families served, dollars stewarded, and the real stories of neighbors who became homeowners.",
};

const METRICS = [
  { value: "$2,500", label: "Donated to FAITH for every Bright Box home purchased" },
  { value: "100%", label: "Of vouchers directed to down payment assistance" },
  { value: "8", label: "Distinct programs serving families across Texas" },
  { value: "501(c)(3)", label: "Tax-exempt nonprofit, accountable and transparent" },
];

const STORIES = [
  {
    name: "A single mother in Burnet",
    quote:
      "I was three days from losing our apartment when FAITH Foundation stepped in. The deposit assistance and a coach who actually listened gave me room to breathe — and a plan I could follow.",
    body: "After a sudden job loss, Maria (name changed for privacy) fell behind on rent with two children at home. A down payment assistance voucher put homeownership within reach while our coach helped her rebuild a budget and an emergency cushion. Today she is on a clear path toward owning a home of her own for the first time.",
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

// Numeric stats parsed from METRICS for animated counters; non-numeric
// values (e.g. "501(c)(3)") are rendered as styled text instead.
const STAT_COUNTERS = [
  { prefix: "$", value: 2500, suffix: "", label: METRICS[0].label },
  { prefix: "", value: 100, suffix: "%", label: METRICS[1].label },
  { prefix: "", value: 8, suffix: "", label: METRICS[2].label },
  { text: "501(c)(3)", label: METRICS[3].label },
];

const NARRATIVE = [
  {
    eyebrow: "Families kept housed",
    title: "We step in before crisis takes hold",
    body: "Through emergency rental and deposit assistance, we step in before a missed paycheck becomes an eviction — keeping families in their homes and out of crisis.",
    image: "familyTogether" as const,
    alt: "A family together inside the home they were able to keep",
  },
  {
    eyebrow: "Neighbors equipped",
    title: "Skills that outlast any single gift",
    body: "Our financial-literacy and homeownership instruction gives families durable skills — budgeting, credit repair, tenancy know-how — that outlast any single gift.",
    image: "classroom" as const,
    alt: "Neighbors learning financial-literacy skills in a classroom",
  },
  {
    eyebrow: "Generosity multiplied",
    title: "One purchase lifting two families",
    body: "The Bright Box Homes partnership turns each home purchase into a renewable $2,500 gift, so our capacity to help grows right alongside our community.",
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
                Impact is more than a number — it is a family that crossed the
                threshold into homeownership, a veteran handed the keys to a home
                of their own, a down payment finally within reach. We measure our
                work honestly and report it openly,
                because the families and donors who make this mission possible deserve
                to see exactly what their trust accomplishes.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== BY THE NUMBERS — animated stat counters ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
              By the Numbers
            </h2>
            <p className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Stewardship you can count on
            </p>
          </Reveal>
          <dl className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_COUNTERS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 100}
                as="div"
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-card backdrop-blur"
              >
                <dt className="text-5xl font-extrabold tracking-tight text-gold sm:text-6xl">
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
              As a young and growing 501(c)(3), our most important metric is trust.
              Every dollar we raise is stewarded with care and directed toward
              measurable, local outcomes — keeping families housed today while
              equipping them with the skills to thrive tomorrow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IMPACT HAPPENS — alternating image-text blocks ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              How Impact Happens
            </h2>
            <p className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Three ways your support changes lives
            </p>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
              Our model is simple and sustainable: keep families housed, equip
              them with instruction that lasts, and multiply generosity through
              the Bright Box Homes partnership so the cycle keeps growing.
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
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
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
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
              Stories of Hope
            </h2>
            <p className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              The neighbors behind the numbers
            </p>
            <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
              Names and details have been changed to protect privacy, but every
              story reflects the real work happening across Texas because
              of supporters like you.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {STORIES.map((story, i) => (
              <Reveal
                key={story.name}
                delay={i * 100}
                as="figure"
                className="flex h-full flex-col rounded-3xl bg-cream p-8 shadow-card ring-1 ring-navy/5"
              >
                <span
                  aria-hidden
                  className="text-5xl font-extrabold leading-none text-gold"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-2 text-lg font-semibold leading-relaxed text-navy">
                  {story.quote}
                </blockquote>
                <p className="mt-5 flex-1 text-base leading-relaxed text-charcoal/80">
                  {story.body}
                </p>
                <figcaption className="mt-6 border-t border-navy/10 pt-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
                  {story.name}
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHT BAND ===== */}
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
              One family putting down roots, another family keeping the roof
              overhead. <span className="text-gold">That is the cycle in action.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
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
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
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


