import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import HeroVideo from "@/components/HeroVideo";
import ParallaxImage from "@/components/ParallaxImage";
import { img } from "@/lib/images";
import { HERO_VIDEOS, PHOTOS } from "@/lib/media";
import { Cite } from "@/components/Citations";
import BackgroundSwirls from "@/components/BackgroundSwirls";

export const metadata: Metadata = {
  description:
    "FAITH Foundation is a 501(c)(3) nonprofit in Burnet, Texas helping families statewide reach homeownership through down payment assistance vouchers.",
  alternates: { canonical: "/" },
};

const PILLARS = [
  {
    eyebrow: "Pillar One — Down Payment Assistance",
    title: "Voucher assistance that turns renters into owners",
    body: "Our down payment assistance vouchers bridge the single biggest barrier to homeownership — the cash to close. We help working families across Texas put a key in their own front door for the first time.",
    href: "/programs/homeownership",
    cta: "Explore homeownership assistance",
    image: PHOTOS.cabin,
    alt: "A warm timber home in an open Texas field — ownership made tangible",
    caption:
      "Pictured: An expandable modular container home — factory-built and placed on site, fully equipped with kitchen, full bath, and air conditioning. These affordable, customizable homes represent the type of permanent housing our down payment vouchers are designed to help Texas families achieve.",
    accent: "green" as const,
  },
  {
    eyebrow: "Pillar Two — Tenancy Hope",
    title: "Housing stability while families prepare to buy",
    body: "Down payment vouchers, housing assistance, and referrals to HUD-approved counseling partners keep Texas families securely housed today while they build toward ownership tomorrow.",
    href: "/programs/housing-voucher",
    cta: "Explore housing assistance",
    image: PHOTOS.yellow,
    alt: "A bright, freshly built family home under a clear Texas sky",
    caption:
      "Pictured: A modular assembly home — purpose-built for affordability and dignity. Expandable shipping container construction and modular design make these homes dramatically more affordable than traditional stick-built construction, putting permanent homeownership within real reach.",
    accent: "gold" as const,
  },
];

export default function Home() {
  return (
    <>
      {/* ===== HERO (cycles through every clip) ===== */}
      <HeroVideo sources={HERO_VIDEOS} poster={PHOTOS.modern}>
        <div className="mx-auto w-full max-w-7xl px-6 pb-28 pt-44 sm:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <h1 className="mt-2 text-balance text-5xl font-bold leading-[1.02] text-white sm:text-7xl lg:text-[5.4rem]">
                Opening the door to{" "}
                <span className="text-gradient-green">homeownership</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
                FAITH Foundation is a 501(c)(3) nonprofit helping families across
                Texas become homeowners through down payment assistance vouchers
                — turning years of renting into a place of their own.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/donate"
                  className="rounded-full bg-green px-8 py-4 text-center text-base font-bold text-white shadow-green ring-1 ring-gold/60 transition-all duration-300 hover:bg-green-dark hover:ring-2 hover:ring-gold hover:shadow-card-lg"
                >
                  Donate Now
                </Link>
                <Link
                  href="/apply"
                  className="rounded-full border-2 border-white/40 px-8 py-4 text-center text-base font-bold text-white backdrop-blur transition-all duration-300 hover:border-green-light hover:text-green-light"
                >
                  Apply for Assistance
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </HeroVideo>

      {/* ===== STAT CARDS =====
          These used to pull up into the hero with `-mt-16`, but the section is
          `overflow-hidden` (required — BackgroundSwirls draws well outside its
          box), so the top 4rem of the grid was clipped and the stat figures were
          cut off. Do not reintroduce a negative top margin here without first
          moving the swirl clipping to its own wrapper. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-8">
          <div className="grid gap-px overflow-hidden rounded-3xl bg-navy/10 shadow-card-lg sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 100, prefix: "", suffix: "%", label: "Of donations directed to our charitable housing mission" },
              { value: 100, prefix: "", suffix: "%", label: "Of vouchers directed to down payment assistance" },
              { value: 6, prefix: "", suffix: "", label: "Programs opening the door to homeownership" },
              { value: 1, prefix: "", suffix: "", label: "501(c)(3) nonprofit serving families across Texas" },
            ].map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 90}
                className="card-stat px-7 py-9 text-center"
              >
                <p className="card-stat-figure text-4xl font-extrabold">
                  <StatCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-3 text-sm leading-snug text-white/80">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MISSION (asymmetric image + text) ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <BackgroundSwirls variant="bottom-right" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <ParallaxImage
              src={PHOTOS.evening}
              alt="An expandable modular container home — fully equipped with kitchen, bath, and AC — the type of affordable home FAITH Foundation aims to place through Cornerstone Communities"
              className="aspect-[4/5]"
              strength={48}
              framed
            />
            <div className="absolute -bottom-8 -right-4 hidden rounded-2xl border-l-4 border-green bg-navy px-7 py-6 text-white shadow-card-lg sm:block">
              <p className="text-3xl font-extrabold text-green-light">Renter → Owner</p>
              <p className="mt-1 text-sm text-white/75">Every family, every step</p>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
                Our Mission
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="heading-underline mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Removing the barriers between families and a home of their own
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="drop-cap mt-6 text-lg leading-relaxed text-charcoal/80">
                For most families the hardest part of buying a home isn&apos;t
                the monthly payment — it&apos;s the down payment. FAITH
                Foundation exists to close that gap. Through down payment
                assistance vouchers and housing support, we help our neighbors
                move from renting to owning.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                Every dollar we raise is stewarded with care and directed toward
                measurable, local impact — putting families into homes they own
                and equipping them to keep them for generations.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-4 border-l-4 border-green/40 pl-5 text-base leading-relaxed text-charcoal/70">
                Our housing vouchers are funded by the generosity of individual
                and corporate donors whose gifts are directed entirely toward
                down payment assistance for Texas families working toward
                homeownership.
              </p>
            </Reveal>
            <Reveal delay={340}>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="rounded-full bg-navy px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-light"
                >
                  Learn Our Story
                </Link>
                <Link
                  href="/impact"
                  className="rounded-full border-2 border-navy/20 px-7 py-3.5 text-sm font-bold text-navy transition-colors hover:border-green hover:text-green-dark"
                >
                  See Our Impact
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== TWO PILLARS (alternating image-text) ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-28">
        <BackgroundSwirls variant="diagonal" />
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              How We Help
            </p>
            <h2 className="heading-underline-center mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Two pillars, one foundation
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
              Down payment assistance and housing stability are stronger
              together. Here is how each pillar lifts a family toward ownership.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-7xl space-y-20 px-6 sm:px-8">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="grid items-center gap-12 lg:grid-cols-2"
            >
              <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
                  <img
                    src={pillar.image}
                    alt={pillar.alt}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 border-l-2 border-green/30 pl-3 text-xs italic leading-relaxed text-charcoal/60">
                  {pillar.caption}
                </p>
              </Reveal>
              <Reveal delay={120} className={i % 2 === 1 ? "lg:order-1" : ""}>
                <p
                  className={`text-sm font-bold uppercase tracking-[0.2em] ${
                    pillar.accent === "green" ? "text-green-dark" : "text-[#4A7C59]"
                  }`}
                >
                  {pillar.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
                  {pillar.title}
                </h3>
                <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                  {pillar.body}
                  {i === 0 && (
                    <Cite
                      label="NAR"
                      href="https://www.nar.realtor/news/economists-outlook/top-10-takeaways-from-nars-2025-profile-of-home-buyers-and-sellers"
                    />
                  )}
                </p>
                <Link
                  href={pillar.href}
                  className={`mt-7 inline-flex items-center gap-2 text-sm font-bold text-navy transition-colors ${
                    pillar.accent === "green"
                      ? "hover:text-green-dark"
                      : "hover:text-gold-dark"
                  }`}
                >
                  {pillar.cta}
                  <span aria-hidden>→</span>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ILLUSTRATIVE SCENARIO =====
          NOT a testimonial. FAITH Foundation is newly established and has no
          completed beneficiary outcomes to quote yet, so this section describes
          the outcome the programs are designed to produce and is labelled as an
          illustrative scenario in the eyebrow, the body, and the caption. Do not
          reintroduce a named "recipient" here unless a real, verified,
          consent-given beneficiary story is available to replace it. */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-28">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal className="card-surface relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16">
            <span
              aria-hidden
              className="absolute -left-2 -top-10 select-none font-serif text-[12rem] leading-none text-green/15"
            >
              &ldquo;
            </span>
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
                Illustrative Family Story
              </p>
              <p className="mt-5 text-balance text-2xl font-semibold leading-relaxed text-navy sm:text-3xl">
                A family who could afford the monthly payment but never the cash
                to close, crossing the threshold into a home they own — with the
                down payment gap covered and a yard for their kids.
              </p>
              <p className="mt-8 border-t border-navy/10 pt-6 text-base leading-relaxed text-charcoal/70">
                This is an example of the families FAITH Foundation is designed
                to serve, not an account of a past recipient. We are a newly
                established 501(c)(3) building our programs, and we will publish
                verified family outcomes here as they occur.{" "}
                <Link
                  href="/impact"
                  className="font-semibold text-gold-dark underline underline-offset-2 hover:text-navy"
                >
                  See how we report results
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-navy-dark py-28 text-white">
        <img
          src={img("communityGathering", 1800)}
          alt="A community of neighbors gathered together"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/85 to-green-deep/40" />
        <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Help a family open the door to homeownership
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Whether you give, partner, or apply for assistance, you become part
              of a community that refuses to let a neighbor fall through the
              cracks.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green ring-1 ring-gold/60 transition-all hover:bg-green-dark hover:ring-2 hover:ring-gold hover:shadow-card-lg"
              >
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="rounded-full border-2 border-white/40 px-8 py-4 text-base font-bold text-white transition-all hover:border-green-light hover:text-green-light"
              >
                Volunteer With Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


