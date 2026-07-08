import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import VideoSection from "@/components/VideoSection";
import { img } from "@/lib/images";
import { VIDEOS, PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Programs — FAITH Foundation",
  description:
    "Explore FAITH Foundation's programs: homeownership through down payment assistance vouchers, the Bright Box Homes partnership, and supporting services. Serving families across Texas.",
};

const PROGRAMS = [
  {
    href: "/programs/homeownership",
    eyebrow: "Flagship",
    title: "Homeownership Counseling",
    body: "Our flagship mission: helping families achieve homeownership. Pre-purchase counseling prepares first-time and returning buyers to navigate mortgages, down payments, and the path to lasting, affordable homeownership.",
    cta: "Explore Homeownership",
    // Featured large card with image
    span: "lg:col-span-4",
    featured: true,
    image: img("newKeys", 1200, 700),
    alt: "A hand receiving the keys to a new home",
  },
  {
    href: "/programs/housing-voucher",
    eyebrow: "Flagship",
    title: "Down Payment & Housing Vouchers",
    body: "Direct down payment and rental assistance funded by our Bright Box Homes partnership — a $2,500 donation per home purchased becomes a voucher that helps a neighboring family into stable housing.",
    cta: "Explore Housing Vouchers",
    span: "lg:col-span-2",
  },
  {
    href: "/programs/emergency",
    eyebrow: "Emergency",
    title: "Emergency Bridge Housing",
    body: "Fast, short-term rental and deposit assistance that carries families across Texas through a sudden crisis — stopping an eviction before it becomes homelessness.",
    cta: "Explore Emergency Bridge Housing",
    span: "lg:col-span-3",
  },
  {
    href: "/programs/veterans",
    eyebrow: "Veterans",
    title: "Veterans Path Home",
    body: "Rental assistance, benefits navigation, and case management that help veterans across Texas move from housing instability to a stable home of their own.",
    cta: "Explore Veterans Path Home",
    span: "lg:col-span-3",
  },
  {
    href: "/programs/recovery",
    eyebrow: "Recovery",
    title: "Recovery Housing",
    body: "A guided path from substance-free sober living through transitional housing to permanent, independent housing — with structure, accountability, and support at every stage.",
    cta: "Explore Recovery Housing",
    span: "lg:col-span-2",
  },
  {
    href: "/programs/reentry",
    eyebrow: "Reentry",
    title: "Second Chance Reentry",
    body: "Post-incarceration transitional housing, employment support, and case management that help Texans returning home rebuild on stability instead of setbacks.",
    cta: "Explore Second Chance Reentry",
    span: "lg:col-span-2",
  },
  {
    href: "/programs/single-parents",
    eyebrow: "Families",
    title: "Single Parent Stability",
    body: "Affordable housing assistance, childcare and resource navigation, and financial coaching that help single-parent families across Texas build a secure future.",
    cta: "Explore Single Parent Stability",
    span: "lg:col-span-2",
  },
  {
    href: "/programs/cornerstone-communities",
    eyebrow: "Initiative",
    title: "Cornerstone Communities",
    body: "Purpose-built residential communities on donated land with on-site recovery programs, resource centers, and wraparound services \u2014 creating the affordable housing inventory our voucher recipients need.",
    cta: "Explore Cornerstone Communities",
    span: "lg:col-span-2",
  },
  {
    href: "/programs/financial-literacy",
    eyebrow: "Supporting",
    title: "Financial Literacy",
    body: "A supporting service that helps families prepare for and sustain homeownership — light, hands-on guidance in budgeting, credit, and debt that complements our housing mission.",
    cta: "Explore Financial Literacy",
    span: "lg:col-span-2",
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* ===== HERO — full-bleed 4K video ===== */}
      <VideoSection
        src={VIDEOS.programs}
        poster={PHOTOS.modern}
        overlay="dark"
        className="flex min-h-[78vh] items-center text-white"
      >
        <div className="relative mx-auto w-full max-w-4xl px-6 pb-20 pt-40 text-center sm:px-8">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
              Our Programs
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Homeownership and housing that change trajectories
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              FAITH Foundation&apos;s mission is helping families across Texas
              achieve homeownership through down payment assistance vouchers and
              housing support. Every program below is built to move our neighbors
              from crisis to a home of their own — supported by services that keep
              them stable along the way.
            </p>
          </Reveal>
        </div>
      </VideoSection>

      {/* ===== PROGRAM BENTO GRID ===== */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              Choose your path
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy sm:text-4xl">
              One mission: a home of your own
            </h3>
            <p className="text-lg leading-relaxed text-charcoal/80">
              Whether you are preparing to buy a home, seeking down payment or
              rental assistance today, or finding stable housing as a veteran, a
              person in recovery, a returning citizen, or a single parent, there
              is a place for you here. Select a program to learn how it works and
              how to apply.
            </p>
          </Reveal>

          <ul className="mt-14 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {PROGRAMS.map((program, i) => (
              <Reveal
                as="li"
                key={program.href}
                delay={(i % 3) * 100}
                className={`${program.span ?? "lg:col-span-2"} ${
                  program.featured ? "sm:col-span-2" : ""
                }`}
              >
                {program.featured ? (
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-navy text-white shadow-card-lg ring-1 ring-green/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-green lg:flex-row">
                    <div className="relative lg:w-1/2">
                      <img
                        src={program.image}
                        alt={program.alt ?? ""}
                        className="h-56 w-full object-cover lg:h-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent lg:bg-gradient-to-r" />
                    </div>
                    <div className="flex flex-1 flex-col p-8 sm:p-10">
                      <span className="inline-flex w-fit items-center rounded-full border border-green/50 bg-green/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-light">
                        {program.eyebrow}
                      </span>
                      <h4 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                        {program.title}
                      </h4>
                      <p className="mt-4 flex-1 text-base leading-relaxed text-white/80">
                        {program.body}
                      </p>
                      <Link
                        href={program.href}
                        className="mt-6 inline-flex w-fit items-center justify-center rounded-full bg-green px-6 py-3 text-sm font-bold text-white shadow-green transition-colors hover:bg-green-light"
                      >
                        {program.cta}
                      </Link>
                    </div>
                  </article>
                ) : (
                  <article
                    className={`group flex h-full flex-col rounded-3xl border-t-4 bg-white p-8 shadow-card ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg ${
                      program.eyebrow === "Flagship"
                        ? "border-green"
                        : "border-gold"
                    }`}
                  >
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                        program.eyebrow === "Flagship"
                          ? "bg-green/15 text-green-dark"
                          : "bg-gold/10 text-gold-dark"
                      }`}
                    >
                      {program.eyebrow}
                    </span>
                    <h4 className="mt-4 text-2xl font-extrabold text-navy">
                      {program.title}
                    </h4>
                    <p className="mt-4 flex-1 text-base leading-relaxed text-charcoal/80">
                      {program.body}
                    </p>
                    <Link
                      href={program.href}
                      className={`mt-6 inline-flex w-fit items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition-colors ${
                        program.eyebrow === "Flagship"
                          ? "bg-green shadow-green hover:bg-green-light"
                          : "bg-navy hover:bg-navy-light"
                      }`}
                    >
                      {program.cta}
                    </Link>
                  </article>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== WHY THEY WORK TOGETHER — sticky text + image ===== */}
      <section className="bg-texture bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
                Why our programs work together
              </h2>
              <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
                Homeownership at the center
              </h3>
              <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
                <p>
                  FAITH Foundation&apos;s mission is helping families across Texas
                  reach homeownership through down payment assistance vouchers and
                  housing support. Every program orbits that goal — keeping families
                  housed today, steadying them through a crisis, and carrying them
                  toward a home they can own and keep tomorrow.
                </p>
                <p>
                  A family might enter through our Housing Voucher Program, find
                  steady footing with down payment and rental assistance, and one day
                  complete Homeownership Counseling to buy a home of their own.
                  Supporting services like financial literacy help them prepare for
                  and sustain that home. Each step builds on the last, and the gift of
                  one family&apos;s home purchase through Bright Box Homes helps fund
                  the very vouchers that keep the cycle turning — a renewable model of
                  community uplift, rooted in faith and powered by the generosity of
                  neighbors.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150} className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg ring-1 ring-navy/5">
              <img
                src={img("handshake", 1100, 1300)}
                alt="Two people shaking hands in agreement and partnership"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden h-28 w-28 rounded-3xl border-2 border-green/40 bg-cream sm:block" />
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
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
                className="rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-light hover:shadow-card-lg"
              >
                Donate Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-gold px-8 py-4 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Apply for Assistance
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}




