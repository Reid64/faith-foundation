import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BackgroundSwirls from "@/components/BackgroundSwirls";
import StatCounter from "@/components/StatCounter";
import ZeffyEmbed from "@/components/ZeffyEmbed";

export const metadata: Metadata = {
  title: "Donate — FAITH Foundation",
  description:
    "Donate to FAITH Foundation and help Texas families become homeowners through down payment assistance vouchers. Make a tax-deductible 501(c)(3) gift today.",
};

const TIERS = [
  {
    amount: "$25",
    name: "Friend",
    body: "Provides learning materials for a financial-literacy workshop, helping one family build the budgeting skills that prevent the next housing crisis.",
  },
  {
    amount: "$50",
    name: "Neighbor",
    body: "Covers an application or background-check fee that can stand between a struggling family and an approved lease — a small cost with an outsized impact.",
  },
  {
    amount: "$100",
    name: "Advocate",
    body: "Helps build a down payment assistance voucher that moves a family closer to owning a discounted home of their own.",
    featured: true,
  },
  {
    amount: "$250",
    name: "Steward",
    body: "Adds meaningful weight to a down payment voucher, helping a household cross the threshold from renting toward lasting ownership and independence.",
  },
  {
    amount: "$500",
    name: "Guardian",
    body: "Underwrites a significant share of a down payment assistance voucher, helping a family cross the threshold from renting toward lasting ownership.",
  },
  {
    amount: "Custom",
    name: "Your Choice",
    body: "Give any amount that fits your heart and your budget. Every dollar is stewarded with transparency and directed toward measurable, local impact.",
  },
];

export default function DonatePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <img
          src="/Images/donate-hero.jpg"
          alt="Volunteers joining hands in support of Texas families"
          className="absolute inset-0 -z-10 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-green-deep/40" />
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pb-32">
          <Reveal>
            <span className="inline-block rounded-full border border-green/60 bg-green/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-green-light backdrop-blur">
              Support Our Mission
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Your gift helps families become{" "}
              <span className="text-gold">homeowners</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas.
              Every donation is tax-deductible and goes directly toward down
              payment assistance vouchers that help families across Texas buy a
              home of their own.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10">
              <Link
                href="#give"
                className="inline-block rounded-full bg-green px-10 py-4 text-lg font-bold text-white shadow-green transition-colors hover:bg-green-dark"
              >
                Give Now
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why your gift matters — pull quote + asymmetric two-column */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal>
            <h2 className="text-sm font-bold uppercase tracking-widest text-green-dark">
              Why Your Gift Matters
            </h2>
            <h3 className="heading-underline mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Stability begins with generosity
            </h3>
          </Reveal>

          <div className="mt-12 grid items-start gap-12 lg:grid-cols-12">
            {/* Oversized statement */}
            <Reveal className="lg:col-span-7" delay={100}>
              <blockquote className="border-l-4 border-green pl-6 text-2xl font-bold leading-snug text-navy sm:text-3xl">
                Too many of our neighbors are forced to choose between paying
                rent and investing in their future.
              </blockquote>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/80">
                <p>
                  A single missed paycheck or an unexpected medical bill can push
                  a hardworking family toward eviction in a matter of weeks. FAITH
                  Foundation exists to make that impossible choice unnecessary.
                  When you give, you provide the bridge a family needs to stay in
                  their home while they get back on their feet.
                </p>
                <p>
                  Your generosity does double duty. It funds the down payment
                  assistance vouchers that turn renters into homeowners, and it
                  is reinforced by supporting financial-literacy and tenancy
                  coaching that help those same families hold onto and build on
                  what they own. We believe that when ownership and durable skills
                  go hand in hand, generational change becomes possible. A gift to
                  FAITH Foundation is not charity that ends at the check; it is an
                  investment in a family&apos;s long-term ability to thrive.
                </p>
                <p>
                  We hold ourselves to the highest standards of stewardship and
                  accountability. We measure our impact honestly, report our
                  outcomes openly, and direct every dollar toward measurable
                  results. When you give to FAITH Foundation, you can be
                  confident your generosity stays in Texas and reaches the
                  neighbors who need it most.
                </p>
              </div>
            </Reveal>

            {/* Supporting image */}
            <Reveal className="lg:col-span-5 lg:sticky lg:top-28" delay={200}>
              <div className="overflow-hidden rounded-3xl shadow-card-lg">
                <img
                  src="/Images/donate-finance.jpg"
                  alt="A family planning a household budget together"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2">
            <Reveal className="text-center sm:border-r sm:border-white/15">
              <p className="text-5xl font-extrabold text-gold sm:text-6xl">
                <StatCounter value={100} suffix="%" />
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
                Of every designated housing gift directly supports the program you choose
              </p>
            </Reveal>
            <Reveal delay={100} className="text-center">
              <p className="text-5xl font-extrabold text-gold sm:text-6xl">
                <StatCounter value={100} suffix="%" />
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
                Stays local across Texas
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Donation tiers — pricing cards */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section id="give" className="relative overflow-hidden scroll-mt-24 bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <BackgroundSwirls variant="bottom-right" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
              Choose a Donation Tier
            </h2>
            <h3 className="heading-underline-center mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Every level changes a life
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
              Pick the giving level that fits you. Whether you give once or
              monthly, your support translates directly into down payment
              assistance and homeownership for families across Texas.
            </p>
          </Reveal>

          <ul className="mt-16 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TIERS.map((tier, i) => (
              <Reveal
                as="li"
                key={tier.name}
                delay={(i % 3) * 100}
                className={tier.featured ? "lg:-translate-y-4" : ""}
              >
                <div
                  className={`card-surface relative flex h-full flex-col rounded-3xl p-8 transition-transform duration-300 ${
                    tier.featured
                      ? "bg-navy text-white ring-2 ring-gold"
                      : ""
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-navy shadow-card">
                      Most Popular
                    </span>
                  )}
                  <p
                    className={`text-4xl font-extrabold ${
                      tier.featured ? "text-gold" : "text-navy"
                    }`}
                  >
                    {tier.amount}
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold uppercase tracking-widest ${
                      tier.featured ? "text-gold" : "text-gold-dark"
                    }`}
                  >
                    {tier.name}
                  </p>
                  <p
                    className={`mt-4 flex-1 text-sm leading-relaxed ${
                      tier.featured ? "text-white/85" : "text-charcoal/80"
                    }`}
                  >
                    {tier.body}
                  </p>
                  <Link
                    href="#give-now"
                    className={`mt-8 rounded-full px-6 py-3 text-center text-base font-bold transition-colors shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30 ${
                      tier.featured
                        ? "bg-gold text-navy hover:bg-gold-light"
                        : "border-2 border-gold text-gold-dark hover:bg-gold hover:text-navy"
                    }`}
                  >
                    Give {tier.amount === "Custom" ? "Now" : tier.amount}
                  </Link>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Give Now CTA */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section
        id="give-now"
        className="scroll-mt-24 bg-navy-dark py-24 text-white sm:py-32"
      >
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
              Click below to make your secure, tax-deductible donation. Prefer to
              give by mail or have questions about a larger gift? Reach our team
              and we will personally help you give in the way that works best for
              you.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              Checks may be mailed to FAITH Foundation, 209 Surecast Drive, Suite
              105, Burnet, TX 78611. Call us at 888-497-6620 with any questions.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-white/80">
              No goods or services were provided in exchange for your
              contribution. FAITH Foundation is a 501(c)(3) nonprofit and your
              gift is tax-deductible to the fullest extent allowed by law.
            </p>
            <ZeffyEmbed
              src="https://www.zeffy.com/embed/donation-form/help-a-family-come-home"
              title="FAITH Foundation Donation Form"
            />
            <div className="mt-8 flex justify-center">
              <Link
                href="/programs"
                className="rounded-full border-2 border-gold px-10 py-4 text-lg font-bold text-gold transition-colors hover:bg-gold hover:text-navy shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                Explore Our Programs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== DESIGNATED-GIFT DISCLOSURE ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f0ede4] py-12 sm:py-16">
        <BackgroundSwirls variant="diagonal" />
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="rounded-2xl border-l-[5px] border-gold bg-cream px-7 py-6 shadow-card">
            <p className="text-sm leading-relaxed text-navy">
              Donations designated for our Housing Mission are used exclusively
              to advance that mission. Executive leadership and administrative
              operations are funded through separately designated operational
              support.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}


