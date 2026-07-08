import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Financial Transparency — FAITH Foundation",
  description:
    "FAITH Foundation's commitment to financial transparency and stewardship — how we steward every donation, our 501(c)(3) status, our reporting practices, and the standards that guide our use of your gifts.",
};

const COMMITMENTS = [
  {
    title: "Every dollar is stewarded with care",
    body: "We treat each gift as a sacred trust. Donations are directed toward measurable impact — down payment assistance vouchers, emergency rental and deposit assistance, and supporting instruction programs — never toward waste or excess. Stewardship is not a slogan for us; it is a commitment that shapes every financial decision we make.",
  },
  {
    title: "We report our outcomes openly",
    body: "Transparency means showing our work. We measure our impact honestly and communicate it plainly to the families and donors who make our mission possible — including how many neighbors we serve and where assistance is directed. When we fall short, we say so.",
  },
  {
    title: "Donations are tax-deductible",
    body: "FAITH Foundation is a registered 501(c)(3) tax-exempt nonprofit organization. Contributions are tax-deductible to the fullest extent allowed by law, and we provide receipts for your records so you can give with confidence.",
  },
  {
    title: "The Bright Box model is transparent by design",
    body: "Our partnership with Bright Box Homes generates a $2,500 donation for every home purchased, which we convert directly into down payment assistance vouchers. Because the funding source is visible and renewable, donors can trace how the model sustains our work over time.",
  },
  {
    title: "Donor privacy is protected",
    body: "We never sell, rent, or trade donor information. The details you share with us are used only to process your gift, send receipts, and keep you informed about the impact you helped create — and only as you have permitted.",
  },
  {
    title: "Funds follow our charitable mission",
    body: "Gifts are used to advance our charitable purpose: helping families reach homeownership through down payment assistance across Texas. We maintain appropriate separation of duties and oversight so that spending decisions align with our mission and our governing board's direction.",
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

// Program areas the copy names as where donations are directed. No invented
// figures — these are the qualitative funding focuses described in the copy,
// presented as allocation-style bars.
const FUND_DIRECTION = [
  {
    label: "Down payment assistance vouchers",
    note: "Direct assistance that helps families buy a home.",
  },
  {
    label: "Emergency rental & deposit assistance",
    note: "Help at the moment a housing crisis hits.",
  },
  {
    label: "Supporting instruction programs",
    note: "Homeownership counseling and financial literacy.",
  },
];

export default function FinancialTransparencyPage() {
  return (
    <>
      {/* ===== HERO — dark photo + navy overlay ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("finance", 1900, 1100)}
          alt="Reviewing financial documents"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              Financial Transparency
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Transparent with <span className="text-gold">every gift</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Generosity deserves transparency. When you give to FAITH Foundation,
              you are entrusting us with resources meant to keep families housed and
              equipped — and we take that trust seriously. This page lays out the
              commitments and standards that govern how we raise, steward, and
              report on every dollar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== STAT CARDS — at a glance ===== */}
      <section className="relative -mt-px bg-cream bg-texture">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                node: <StatCounter value={2500} prefix="$" />,
                label: "Donated to FAITH for every Bright Box home purchased",
              },
              {
                node: <>501(c)(3)</>,
                label: "IRS-recognized tax-exempt charitable status",
              },
              {
                node: (
                  <>
                    <StatCounter value={100} suffix="%" />
                  </>
                ),
                label: "Tax-deductible to the fullest extent allowed by law",
              },
              {
                node: <StatCounter value={0} />,
                label: "Donor records sold, rented, or traded — ever",
              },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="h-full rounded-3xl border-t-4 border-gold bg-white p-8 text-center shadow-card">
                  <div className="text-4xl font-extrabold text-navy sm:text-5xl">
                    {stat.node}
                  </div>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-charcoal/70">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY TRANSPARENCY MATTERS ===== */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Our Promise
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Why transparency is non-negotiable for us
            </h3>
          </Reveal>
          <Reveal delay={200}>
            <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
              <p>
                The second letter in our name stands for Affordable — the promise
                that owning a home should be within reach — and keeping that promise
                requires transparent stewardship. We believe that the resources
                entrusted to a nonprofit are a sacred trust, and that the people we
                serve and the donors who fund our work both deserve to see, in plain
                terms, how their generosity is used. Transparency is how we earn and
                keep that trust over the long haul.
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
          </Reveal>
        </div>
      </section>

      {/* ===== WHERE FUNDS GO — allocation bars (qualitative) ===== */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
                Where Your Gift Goes
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="mb-4 text-3xl font-extrabold sm:text-4xl">
                Directed toward measurable, local impact
              </h3>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-lg leading-relaxed text-white/80">
                Donations are directed toward the work that keeps families housed
                and equipped. Every gift moves through these three program areas.
              </p>
            </Reveal>
          </div>
          <div className="mt-14 space-y-7">
            {FUND_DIRECTION.map((item, i) => (
              <Reveal key={item.label} delay={i * 120}>
                <div>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-lg font-bold text-white">
                      {item.label}
                    </span>
                    <span className="text-sm text-white/70">{item.note}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                      style={{ width: `${100 - i * 6}%` }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMITMENTS ===== */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
                Our Stewardship Commitments
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="mb-4 text-3xl font-extrabold text-navy sm:text-4xl">
                The standards we hold ourselves to
              </h3>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-lg leading-relaxed text-charcoal/80">
                These commitments guide every financial decision we make, from how
                we accept a gift to how we put it to work for families in need.
              </p>
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2">
            {COMMITMENTS.map((commitment, i) => (
              <Reveal as="li" key={commitment.title} delay={(i % 2) * 100}>
                <div className="h-full rounded-3xl border-t-4 border-green bg-white p-8 shadow-card">
                  <h4 className="text-xl font-bold text-navy">
                    {commitment.title}
                  </h4>
                  <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
                    {commitment.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== DOCUMENTS ===== */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Records &amp; Reporting
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              Available for your review
            </h3>
          </Reveal>
          <Reveal delay={200}>
            <p className="mb-10 text-lg leading-relaxed text-charcoal/80">
              We believe documentation should be available, not hidden behind a
              wall. The following records are available on request — just contact
              our office at 209 Surecast Drive, Suite 105, Burnet, TX 78611, or call{" "}
              <a
                href="tel:+18884976620"
                className="font-semibold text-navy underline-offset-2 hover:text-gold-dark hover:underline"
              >
                888-497-6620
              </a>
              .
            </p>
          </Reveal>
          <div className="space-y-5">
            {DOCUMENTS.map((doc, i) => (
              <Reveal key={doc.label} delay={i * 100}>
                <div className="flex gap-5 rounded-3xl border border-navy/5 bg-cream/60 p-7 shadow-card">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="text-lg font-bold text-navy">{doc.label}</h4>
                    <p className="mt-2 text-lg leading-relaxed text-charcoal/80">
                      {doc.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Give with confidence
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Your gift is stewarded with care and directed toward measurable,
              local impact. See the difference it makes, or give today.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light"
              >
                Donate Now
              </Link>
              <Link
                href="/impact"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                See Our Impact
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


