import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Literacy — FAITH Foundation",
  description:
    "FAITH Foundation's financial literacy program teaches budgeting, credit repair, and debt management to help Central Texas families build lasting financial stability.",
};

const FOCUS_AREAS = [
  {
    title: "Budgeting",
    body: "We start where every stable financial life begins: a budget that reflects real income and real expenses. Families learn to track spending, separate needs from wants, build an emergency cushion, and plan ahead for the bills that derail so many households. The goal is not a spreadsheet that gathers dust, but a living plan that puts families back in control of their money — and their future.",
  },
  {
    title: "Credit Repair",
    body: "A credit score quietly decides what a family can rent, borrow, and afford. We help participants read their credit reports, dispute errors, understand what drives their score, and build a step-by-step plan to rebuild it. From breaking the cycle of high-interest debt to establishing positive payment history, we walk alongside families until a damaged score becomes a door that opens.",
  },
  {
    title: "Debt Management",
    body: "Debt can feel like a weight that never lifts. Our debt management instruction helps families inventory what they owe, prioritize payoff strategies, negotiate with creditors, and avoid the predatory products that deepen the hole. We focus on durable progress — turning overwhelming balances into a clear, achievable plan that frees up income for savings and stability.",
  },
];

export default function FinancialLiteracyPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Education
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Financial Literacy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Practical instruction in budgeting, credit repair, and debt
            management — the skills that turn a financial crisis into lasting
            confidence and independence.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why it matters
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Knowledge is the foundation of stability
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              For many of the families FAITH Foundation serves, the gap between
              hardship and stability is not a matter of effort — it is a matter
              of access to knowledge and tools. A single unexpected expense, a
              misunderstood loan, or a credit score nobody ever explained can
              keep a hardworking household trapped in a cycle of stress and debt.
              Our Financial Literacy program exists to close that gap. We believe
              that when families understand how money works, they can change
              their trajectory for good.
            </p>
            <p>
              This is not abstract classroom theory. Our instruction is hands-on,
              judgment-free, and built around the real situations families face:
              stretching a paycheck to the end of the month, recovering from a
              setback, escaping high-interest debt, and saving toward a goal that
              once felt impossible. We meet participants where they are and walk
              with them step by step, because lasting change is built through
              instruction, encouragement, and accountability — three things we
              are committed to providing.
            </p>
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              What you&apos;ll learn
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Three pillars of financial health
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Our curriculum is organized around the three areas that most
              directly determine a family&apos;s financial stability.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {FOCUS_AREAS.map((area) => (
              <li
                key={area.title}
                className="rounded-xl border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <h4 className="text-xl font-bold text-navy">{area.title}</h4>
                <p className="mt-3 text-base leading-relaxed text-foreground/80">
                  {area.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it connects */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Part of a bigger plan
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            A step toward homeownership and stability
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Financial literacy does not stand alone. The budgeting skills,
              repaired credit, and reduced debt our participants achieve become
              the very foundation that makes other goals reachable — qualifying
              for an affordable mortgage through our Homeownership Counseling, or
              maintaining a stable tenancy with the support of our Housing Voucher
              Program. For a family receiving rental assistance today, this
              program is often the bridge to lasting independence tomorrow.
            </p>
            <p>
              That is the heart of FAITH Foundation&apos;s approach: we do not
              simply relieve a moment of crisis, we equip families to build
              durable, generational stability. Education and housing go hand in
              hand, and financial literacy is where the journey so often begins.
              No matter where you are starting from, there is a path forward — and
              we would be honored to walk it with you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Take control of your financial future
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Reach out to enroll in financial literacy instruction, or support the
            program so the next family can learn the skills that change
            everything.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Enroll or Ask a Question
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
