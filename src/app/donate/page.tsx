import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donate — FAITH Foundation",
  description:
    "Give to FAITH Foundation and keep Central Texas families housed and learning. Choose a donation tier and make a tax-deductible gift to a 501(c)(3) nonprofit in Burnet, Texas.",
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
    body: "Helps fund a partial rent voucher that keeps a family in their home through a hard month, turning a looming eviction into a fresh start.",
    featured: true,
  },
  {
    amount: "$250",
    name: "Steward",
    body: "Sponsors a full month of tenancy coaching and instruction for a household working its way from crisis toward lasting stability and independence.",
  },
  {
    amount: "$500",
    name: "Guardian",
    body: "Underwrites a significant share of a housing voucher, directly matching the spirit of our $2,500 Bright Box Homes gifts that lift two families at once.",
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
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Support Our Mission
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Your gift keeps families <span className="text-gold">housed</span>{" "}
            and learning
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas.
            Every donation is tax-deductible and goes directly toward affordable
            instruction and housing voucher assistance for Central Texas
            families who need it most.
          </p>
          <div className="mt-8">
            <Link
              href="#give"
              className="rounded-md bg-gold px-10 py-4 text-lg font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Give Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why give */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why Your Gift Matters
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Stability begins with generosity
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Too many of our neighbors are forced to choose between paying rent
              and investing in their future. A single missed paycheck or an
              unexpected medical bill can push a hardworking family toward
              eviction in a matter of weeks. FAITH Foundation exists to make that
              impossible choice unnecessary. When you give, you provide the
              bridge a family needs to stay in their home while they get back on
              their feet.
            </p>
            <p>
              Your generosity does double duty. It funds direct housing voucher
              assistance that keeps families housed today, and it powers the
              education programs — financial literacy, tenancy coaching, and life
              skills — that help those same families build durable, independent
              futures. We believe that when instruction and tenancy hope go hand
              in hand, generational change becomes possible. A gift to FAITH
              Foundation is not charity that ends at the check; it is an
              investment in a family&apos;s long-term ability to thrive.
            </p>
            <p>
              We hold ourselves to the highest standards of stewardship and
              accountability. We measure our impact honestly, report our outcomes
              openly, and direct every dollar toward measurable, local results.
              When you give to FAITH Foundation, you can be confident your
              generosity stays in Central Texas and reaches the neighbors who
              need it most.
            </p>
          </div>
        </div>
      </section>

      {/* Donation tiers */}
      <section id="give" className="scroll-mt-24 bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Choose a Donation Tier
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Every level changes a life
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Pick the giving level that fits you. Whether you give once or
              monthly, your support translates directly into instruction and
              housing hope for families across the Hill Country.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <li
                key={tier.name}
                className={`flex flex-col rounded-lg border-t-4 p-8 shadow-sm ${
                  tier.featured
                    ? "border-gold bg-navy text-white shadow-xl"
                    : "border-gold bg-white"
                }`}
              >
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
                    tier.featured ? "text-white/85" : "text-foreground/80"
                  }`}
                >
                  {tier.body}
                </p>
                <Link
                  href="#give-now"
                  className={`mt-6 rounded-md px-6 py-3 text-center text-base font-bold transition-colors ${
                    tier.featured
                      ? "bg-gold text-navy hover:bg-gold-light"
                      : "border-2 border-gold text-gold-dark hover:bg-gold hover:text-navy"
                  }`}
                >
                  Give {tier.amount === "Custom" ? "Now" : tier.amount}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Give Now CTA */}
      <section id="give-now" className="scroll-mt-24 bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Ready to make a difference?
          </h2>
          <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Click below to make your secure, tax-deductible donation. Prefer to
            give by mail or have questions about a larger gift? Reach our team
            and we will personally help you give in the way that works best for
            you.
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/70">
            Checks may be mailed to FAITH Foundation, 209 Surecast Drive, Suite
            105, Burnet, TX 78611. Call us at 888-497-6620 with any questions.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-10 py-4 text-lg font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Give Now
            </Link>
            <Link
              href="/partnership"
              className="rounded-md border-2 border-gold px-10 py-4 text-lg font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Explore Partnership
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
