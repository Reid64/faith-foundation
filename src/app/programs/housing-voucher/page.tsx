import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import VideoSection from "@/components/VideoSection";
import { VIDEOS, PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Housing Voucher Program — FAITH Foundation",
  description:
    "FAITH Foundation's Housing Voucher Program turns donor generosity into down payment assistance that helps Texas families reach homeownership.",
};

const STEPS = [
  {
    number: "1",
    title: "Donors give",
    body: "Individuals, businesses, and community partners give to FAITH Foundation's charitable housing fund.",
  },
  {
    number: "2",
    title: "Gifts are pooled",
    body: "Every gift is pooled into our housing fund and stewarded with transparency and accountability.",
  },
  {
    number: "3",
    title: "A gift becomes a voucher",
    body: "FAITH Foundation converts those gifts into housing vouchers — direct down payment assistance that helps families achieve homeownership.",
  },
  {
    number: "4",
    title: "A family stays housed",
    body: "The voucher helps a struggling neighbor move toward homeownership, and the mission continues as more neighbors give.",
  },
];

export default function HousingVoucherPage() {
  return (
    <>
      {/* ===== HERO — 4K video ===== */}
      <VideoSection
        src={VIDEOS.housing}
        poster={PHOTOS.evening}
        overlay="navy"
        className="flex min-h-[70vh] items-center"
      >
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:px-8 sm:pt-44">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Flagship Program / Housing Assistance
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                Housing Voucher Program
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Direct down payment assistance funded by the generosity of
                individual and corporate donors — becoming vouchers that help
                neighboring families across Texas achieve homeownership.
              </p>
            </Reveal>
          </div>
        </div>
      </VideoSection>

      {/* ===== INTRO ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Why it matters
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="heading-underline mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Keeping families housed, one home at a time
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/80">
              <p>
                For a family living on the edge, the difference between stable
                housing and eviction can be a single month&apos;s rent. A reduced
                shift, a medical bill, or a car repair is all it takes to fall
                behind — and once a family loses their home, the road back is long
                and steep. FAITH Foundation&apos;s Housing Voucher Program exists to
                catch families before they fall. By providing direct housing
                assistance at the moment it is needed most, we help our neighbors
                hold on to the stability that everything else in their lives depends
                upon: their jobs, their children&apos;s schooling, their health, and
                their hope.
              </p>
              <p>
                What makes this program sustainable is the generosity of our
                community. Our vouchers are funded by individual and corporate
                donors, grants, and community fundraising — a broad base of
                support that grows as our community grows.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== VOUCHER-FUNDING STAT BAND ===== */}
      <section className="relative overflow-hidden bg-gold py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 text-center sm:px-8 lg:grid-cols-3 lg:text-left">
          <Reveal className="lg:col-span-1">
            <p className="text-7xl font-extrabold text-navy sm:text-8xl">
              <StatCounter value={100} suffix="%" />
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-navy/70">
              Of every gift designated to this program goes directly to housing
              voucher assistance.
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2">
            <p className="text-xl font-semibold leading-relaxed text-navy sm:text-2xl">
              When you designate your gift to the Housing Voucher Program, every
              dollar funds direct housing assistance for families in need. Gifts
              designated for operational support fund administration separately —
              so your housing gift does exactly what you intend.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== HOW IT FLOWS (dominant module — connected stepper) ===== */}
      <section className="bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
              Our Funding Model
            </p>
            <h2 className="heading-underline-center mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              How a gift becomes a voucher
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
              A simple, transparent flow turns community generosity into
              stability for families in need.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-6 sm:px-8">
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-4">
            {/* connecting flow line (desktop) */}
            <span
              aria-hidden
              className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30 md:block"
            />
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.number}
                delay={i * 120}
                className="relative flex flex-col items-center text-center"
              >
                <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy text-2xl font-extrabold text-gold shadow-card ring-4 ring-white">
                  {step.number}
                </span>
                <div className={`${i % 2 === 0 ? "card-feature-cream" : "card-feature-white"} mt-6 w-full rounded-2xl p-6`}>
                  <h3 className="text-lg font-extrabold text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== WHERE THE VOUCHERS COME FROM (image + text) ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
              <img
                src={PHOTOS.cabin}
                alt="A durable, affordable home made possible by the generosity of donors"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="gold-rule text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
                Funded by our community
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="heading-underline mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Where the vouchers come from
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                FAITH Foundation&apos;s housing vouchers are funded by the
                generosity of a broad community of supporters —{" "}
                <strong className="text-navy">
                  individual and corporate donors, grants, and community
                  fundraising
                </strong>{" "}
                — all directed to our charitable housing programs.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                Those gifts are converted directly into housing vouchers for
                families who are struggling with rent. It is a simple, powerful
                idea: neighbors and community partners sustaining charitable
                housing for families in need, so people get the support they need
                to keep their homes — a cycle of generosity that strengthens
                communities across Texas.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                The model is transparent and sustainable. As our community of
                supporters grows, so does the pool of housing assistance —
                creating a steady source of funding for the families who need it
                most.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== HOW THE VOUCHER SYSTEM WORKS ===== */}
      <section className="bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="gold-rule text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
              How the voucher system works
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="heading-underline mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Assistance with dignity and accountability
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/80">
              <p>
                Housing vouchers from FAITH Foundation provide targeted housing
                assistance to families facing a housing crisis. Funds are directed
                toward helping families reach homeownership — closing the gap between
                what a household can pay and what it owes so that a temporary
                hardship does not become a permanent loss. Every voucher is
                stewarded with the same accountability we promise our donors: real
                assistance, directed to real local need, with care and transparency.
              </p>
              <p>
                Vouchers are most powerful as a path to homeownership. A family
                stabilized by down payment assistance today can complete
                Homeownership Counseling to buy a home of their own — with supporting
                financial literacy guidance to help them prepare and sustain it.
                Because our programs are sustained by the ongoing generosity of
                donors and community partners, the very vouchers that once kept
                them housed are sustained. This is the cycle of uplift at the
                heart of FAITH Foundation: neighbors helping neighbors, rooted in
                faith, lifting families across Texas one home at a time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Apply for help — or help fund a voucher
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              If your family needs housing assistance, reach out today. If you want
              to keep neighbors housed, your gift funds the vouchers that make it
              possible.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-light hover:shadow-card-lg"
              >
                Apply for Assistance
              </Link>
              <Link
                href="/donate"
                className="rounded-full border-2 border-gold px-8 py-4 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Fund a Voucher
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


