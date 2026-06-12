import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Homeownership Counseling — FAITH Foundation",
  description:
    "FAITH Foundation's pre-purchase homeownership counseling prepares Central Texas families to buy with confidence — covering mortgages, budgets, credit, and closing.",
};

const STEPS = [
  {
    number: "1",
    title: "Readiness Assessment",
    body: "We begin with an honest look at where you stand: income, savings, credit, and debt. Together we identify what is already working and what needs attention before you apply for a mortgage, so there are no surprises down the road.",
  },
  {
    number: "2",
    title: "Budget & Credit Preparation",
    body: "We help you build a homebuyer budget, understand your credit profile, and create a plan to strengthen it. For many families this step connects directly to our Financial Literacy program, where credit repair and debt management lay the groundwork.",
  },
  {
    number: "3",
    title: "Understanding the Mortgage",
    body: "Mortgages, interest rates, escrow, down payments, and closing costs can feel like a foreign language. We translate it — explaining loan options, what lenders look for, and how to compare offers so you can borrow wisely and avoid predatory products.",
  },
  {
    number: "4",
    title: "Path to Closing",
    body: "From pre-approval through inspection, appraisal, and the closing table, we prepare you for each milestone so you walk in informed and confident. We also help you plan for the responsibilities of ownership that begin the day you get the keys.",
  },
];

export default function HomeownershipPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Counseling
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Homeownership Counseling
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Pre-purchase counseling that prepares first-time and returning buyers
            to navigate the path to affordable, lasting homeownership — with
            confidence and clear eyes.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why pre-purchase counseling
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Buy with confidence, not crossed fingers
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Owning a home is one of the most powerful ways a family can build
              stability and generational wealth — but the path to the closing
              table is full of decisions that can make or break that dream. Too
              many hopeful buyers stretch beyond their means, accept a loan they
              do not fully understand, or are turned away because no one ever
              showed them how to prepare. FAITH Foundation&apos;s pre-purchase
              counseling exists to change that. We give families the knowledge
              and the plan to buy a home they can not only afford to purchase, but
              afford to keep.
            </p>
            <p>
              Our counseling is personal, practical, and free of pressure. We are
              not here to sell you a house or a loan — we are here to make sure
              that when you do buy, you do it on solid ground. Whether you are
              years away from being ready or just need a final push across the
              finish line, we meet you where you are and build a realistic plan
              from there. Homeownership should be a source of security, not
              stress, and good counseling is how we help ensure it is.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              How it works
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Your roadmap to the closing table
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              We guide you through four stages, at your own pace, until you are
              genuinely ready to buy.
            </p>
          </div>
          <ol className="mt-12 space-y-6">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="flex gap-5 rounded-xl border-l-4 border-gold bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-gold">
                  {step.number}
                </span>
                <div>
                  <h4 className="text-xl font-bold text-navy">{step.title}</h4>
                  <p className="mt-2 text-base leading-relaxed text-foreground/80">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bright Box connection */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            A purchase that gives back
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Your home, another family&apos;s hope
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              When you are ready to buy, your purchase can do more than build your
              own future. Through FAITH Foundation&apos;s partnership with Bright
              Box Homes, every home purchased generates a{" "}
              <strong className="text-navy">$2,500 donation</strong> to the
              Foundation — at no extra cost to you. Those donations fund housing
              vouchers that keep struggling families in their homes. In other
              words, the milestone of putting down roots becomes a gift that lifts
              a neighbor at the very same time.
            </p>
            <p>
              It is a fitting reflection of how our programs work together. The
              counseling that prepares you to buy, the financial literacy that
              strengthens your credit, and the voucher program that keeps families
              housed are all part of one renewable cycle of community uplift —
              rooted in faith and powered by neighbors helping neighbors. Your
              homeownership journey can be the spark that keeps it turning.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Start your path to homeownership
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Schedule pre-purchase counseling, or support the program that helps
            families across Central Texas buy with confidence.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Request Counseling
            </Link>
            <Link
              href="/programs"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Back to All Programs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
