import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programs — FAITH Foundation",
  description:
    "Explore FAITH Foundation's programs: financial literacy, homeownership counseling, and housing voucher assistance through the Bright Box Homes partnership. Serving families across Central Texas.",
};

const PROGRAMS = [
  {
    href: "/programs/financial-literacy",
    eyebrow: "Education",
    title: "Financial Literacy",
    body: "Hands-on instruction in budgeting, credit repair, and debt management that helps families take control of their money and build a stable financial foundation.",
    cta: "Explore Financial Literacy",
  },
  {
    href: "/programs/homeownership",
    eyebrow: "Counseling",
    title: "Homeownership Counseling",
    body: "Pre-purchase counseling that prepares first-time and returning buyers to navigate mortgages, closing costs, and the path to lasting, affordable homeownership.",
    cta: "Explore Homeownership",
  },
  {
    href: "/programs/housing-voucher",
    eyebrow: "Assistance",
    title: "Housing Voucher Program",
    body: "Direct rental assistance funded by our Bright Box Homes partnership — a $2,500 donation per home purchased becomes a voucher that keeps a neighboring family housed.",
    cta: "Explore Housing Vouchers",
  },
  {
    href: "/programs/emergency",
    eyebrow: "Emergency",
    title: "Emergency Bridge Housing",
    body: "Fast, short-term rental and deposit assistance that carries Central Texas families across a sudden crisis — stopping an eviction before it becomes homelessness.",
    cta: "Explore Emergency Bridge Housing",
  },
  {
    href: "/programs/veterans",
    eyebrow: "Veterans",
    title: "Veterans Path Home",
    body: "Rental assistance, benefits navigation, and case management that help Central Texas veterans move from housing instability to a stable home of their own.",
    cta: "Explore Veterans Path Home",
  },
  {
    href: "/programs/recovery",
    eyebrow: "Recovery",
    title: "Recovery Housing",
    body: "A guided path from substance-free sober living through transitional housing to permanent, independent housing — with structure, accountability, and support at every stage.",
    cta: "Explore Recovery Housing",
  },
  {
    href: "/programs/reentry",
    eyebrow: "Reentry",
    title: "Second Chance Reentry",
    body: "Post-incarceration transitional housing, employment support, and case management that help Central Texans returning home rebuild on stability instead of setbacks.",
    cta: "Explore Second Chance Reentry",
  },
  {
    href: "/programs/single-parents",
    eyebrow: "Families",
    title: "Single Parent Stability",
    body: "Affordable housing assistance, childcare and resource navigation, and financial coaching that help single-parent families across Central Texas build a secure future.",
    cta: "Explore Single Parent Stability",
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Our Programs
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Instruction and assistance that change trajectories
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation builds stability on two pillars: education that
            equips families to thrive, and housing assistance that keeps a roof
            overhead while they grow. Every program below is designed to move our
            neighbors from crisis to confidence — and they are stronger together.
          </p>
        </div>
      </section>

      {/* Program cards */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Choose your path
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Eight programs, one mission
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Whether you need to rebuild credit, prepare to buy a home, secure
              rental assistance today, or find stable housing as a veteran, a
              person in recovery, a returning citizen, or a single parent, there
              is a place for you here. Select a program to learn how it works and
              how to apply.
            </p>
          </div>
          <ul className="mt-12 grid gap-8 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <li
                key={program.href}
                className="flex flex-col rounded-xl border-t-4 border-gold bg-white p-8 shadow-md ring-1 ring-navy/5"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                  {program.eyebrow}
                </span>
                <h4 className="mt-3 text-2xl font-extrabold text-navy">
                  {program.title}
                </h4>
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/80">
                  {program.body}
                </p>
                <Link
                  href={program.href}
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-light"
                >
                  {program.cta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why it works together */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why our programs work together
          </h2>
          <h3 className="mb-6 text-center text-3xl font-extrabold text-navy">
            Education and housing, hand in hand
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Housing instability and financial hardship rarely arrive alone.
              A missed paycheck can spiral into late rent; a low credit score
              can lock a family out of an affordable mortgage; mounting debt can
              make every month feel like a crisis. That is why FAITH Foundation
              refuses to treat these challenges in isolation. Our programs are
              built to reinforce one another — instruction that strengthens
              long-term financial health, and direct assistance that provides
              the breathing room families need to put that instruction to work.
            </p>
            <p>
              A family might enter through our Housing Voucher Program, find
              steady footing with rental assistance, then enroll in Financial
              Literacy to rebuild credit and retire debt — and one day complete
              Homeownership Counseling to buy a home of their own. Each step
              builds on the last, and the gift of one family&apos;s home purchase
              through Bright Box Homes helps fund the very vouchers that keep the
              cycle turning. It is a renewable model of community uplift, rooted
              in faith and powered by the generosity of neighbors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Apply for assistance, or help us keep these programs running for the
            next family who needs them. Every gift and every enrollment moves the
            mission forward.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Apply for Assistance
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
