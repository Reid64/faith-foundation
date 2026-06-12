import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Transparency — FAITH Foundation",
  description:
    "FAITH Foundation's commitment to financial transparency and accountability — how we steward every donation, our 501(c)(3) status, our reporting practices, and the standards that guide our use of your gifts.",
};

const COMMITMENTS = [
  {
    title: "Every dollar is stewarded with care",
    body: "We treat each gift as a sacred trust. Donations are directed toward measurable, local impact — housing vouchers, emergency rental and deposit assistance, and instruction programs — never toward waste or excess. Stewardship is not a slogan for us; it is one of the values our name is built on.",
  },
  {
    title: "We report our outcomes openly",
    body: "Accountability means showing our work. We measure our impact honestly and communicate it plainly to the families and donors who make our mission possible — including how many neighbors we serve and where assistance is directed. When we fall short, we say so.",
  },
  {
    title: "Donations are tax-deductible",
    body: "FAITH Foundation is a registered 501(c)(3) tax-exempt nonprofit organization. Contributions are tax-deductible to the fullest extent allowed by law, and we provide receipts for your records so you can give with confidence.",
  },
  {
    title: "The Bright Box model is transparent by design",
    body: "Our partnership with Bright Box Homes generates a $2,500 donation for every home purchased, which we convert directly into housing vouchers. Because the funding source is visible and renewable, donors can trace how the model sustains our work over time.",
  },
  {
    title: "Donor privacy is protected",
    body: "We never sell, rent, or trade donor information. The details you share with us are used only to process your gift, send receipts, and keep you informed about the impact you helped create — and only as you have permitted.",
  },
  {
    title: "Funds follow our charitable mission",
    body: "Gifts are used to advance our charitable purpose: affordable instruction and tenancy hope across Central Texas. We maintain appropriate separation of duties and oversight so that spending decisions align with our mission and our governing board's direction.",
  },
];

const DOCUMENTS = [
  {
    label: "501(c)(3) determination",
    detail:
      "FAITH Foundation is recognized by the IRS as a 501(c)(3) tax-exempt charitable organization. Our determination documentation is available on request.",
  },
  {
    label: "Annual reporting",
    detail:
      "As a tax-exempt organization, we file the required annual returns and make our reporting available to donors and the public consistent with applicable law.",
  },
  {
    label: "Financial statements",
    detail:
      "Summaries of how funds are raised and used are available on request. Contact our office and we will gladly walk you through where your support goes.",
  },
];

export default function FinancialTransparencyPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Financial Transparency
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Accountable with <span className="text-gold">every gift</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Generosity deserves transparency. When you give to FAITH Foundation,
            you are entrusting us with resources meant to keep families housed and
            equipped — and we take that trust seriously. This page lays out the
            commitments and standards that govern how we raise, steward, and
            report on every dollar.
          </p>
        </div>
      </section>

      {/* Why transparency matters */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Our Promise
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Why transparency is non-negotiable for us
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Accountability is the second letter in our name — and it is more
              than a value we list. We believe that the resources entrusted to a
              nonprofit are a sacred trust, and that the people we serve and the
              donors who fund our work both deserve to see, in plain terms, how
              their generosity is used. Transparency is how we earn and keep that
              trust over the long haul.
            </p>
            <p>
              Too often, families in crisis are wary of asking for help because
              they have been let down before, and donors hesitate to give because
              they cannot see where their money goes. We refuse to add to that
              skepticism. Instead, we hold ourselves to clear standards: direct
              gifts toward measurable, local impact; keep administrative costs
              lean; and report our outcomes honestly, including the hard parts.
            </p>
            <p>
              As a young and growing organization, we know our credibility is
              built one transparent decision at a time. That is why we publish our
              commitments here, make our governing documents available on request,
              and welcome any donor to ask exactly how their gift was used. If you
              ever have a question about our finances, we want you to ask — and we
              promise a straight answer.
            </p>
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Our Accountability Commitments
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              The standards we hold ourselves to
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              These commitments guide every financial decision we make, from how
              we accept a gift to how we put it to work for families in need.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {COMMITMENTS.map((commitment) => (
              <li
                key={commitment.title}
                className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <h4 className="text-xl font-bold text-navy">
                  {commitment.title}
                </h4>
                <p className="mt-3 text-lg leading-relaxed text-foreground/80">
                  {commitment.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Documents */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Records &amp; Reporting
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Available for your review
          </h3>
          <p className="mb-8 text-lg leading-relaxed text-foreground/80">
            We believe documentation should be available, not hidden behind a
            wall. The following records are available on request — just contact
            our office at 209 Surecast Drive, Suite 105, Burnet, TX 78611, or call{" "}
            <a href="tel:+18884976620" className="font-semibold text-navy hover:text-gold-dark">
              888-497-6620
            </a>
            .
          </p>
          <dl className="space-y-6">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.label}
                className="rounded-lg border border-foreground/10 bg-white p-6 shadow-sm"
              >
                <dt className="text-lg font-bold text-navy">{doc.label}</dt>
                <dd className="mt-2 text-lg leading-relaxed text-foreground/80">
                  {doc.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Give with confidence
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Your gift is stewarded with care and directed toward measurable,
            local impact. See the difference it makes, or give today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/impact"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              See Our Impact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
