import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import VideoSection from "@/components/VideoSection";
import { VIDEOS, PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Housing Voucher Program — FAITH Foundation",
  description:
    "FAITH Foundation's flagship Housing Voucher Program turns the Bright Box Homes partnership — a $2,500 donation per home purchased — into down payment and rental assistance that helps families across Texas into stable housing.",
};

const STEPS = [
  {
    number: "1",
    title: "A home is purchased",
    body: "A family buys a home through Bright Box Homes, our homebuilder partner committed to community uplift.",
  },
  {
    number: "2",
    title: "$2,500 is donated",
    body: "For that purchase, Bright Box Homes donates $2,500 to FAITH Foundation — at no additional cost to the buyer.",
  },
  {
    number: "3",
    title: "The gift becomes a voucher",
    body: "FAITH Foundation converts that donation into housing vouchers — direct rental assistance for families at risk of losing their homes.",
  },
  {
    number: "4",
    title: "A family stays housed",
    body: "The voucher helps a struggling neighbor keep stable housing. One purchase lifts two families, and the cycle renews with every new home.",
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
                Direct down payment and rental assistance funded by the Bright Box
                Homes partnership — where a $2,500 donation per home purchased becomes
                a voucher that helps a neighboring family into stable housing.
              </p>
            </Reveal>
          </div>
        </div>
      </VideoSection>

      {/* ===== INTRO ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Why it matters
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
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
                catch families before they fall. By providing direct rental
                assistance at the moment it is needed most, we help our neighbors
                hold on to the stability that everything else in their lives depends
                upon: their jobs, their children&apos;s schooling, their health, and
                their hope.
              </p>
              <p>
                What makes this program sustainable is the partnership behind it.
                Rather than depending on unpredictable fundraising alone, our
                vouchers are funded by a renewable model that grows as our community
                grows — the Bright Box Homes partnership.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== BRIGHT $2,500 STAT BAND ===== */}
      <section className="relative overflow-hidden bg-gold py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 text-center sm:px-8 lg:grid-cols-3 lg:text-left">
          <Reveal className="lg:col-span-1">
            <p className="text-7xl font-extrabold text-navy sm:text-8xl">
              <StatCounter value={2500} prefix="$" />
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-navy/70">
              Donated per home purchased
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2">
            <p className="text-xl font-semibold leading-relaxed text-navy sm:text-2xl">
              Every home purchased through Bright Box Homes generates a $2,500
              donation — at no extra cost to the buyer — that FAITH Foundation
              converts directly into housing vouchers for a neighbor in need.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IT FLOWS (dominant module — connected stepper) ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
              The Bright Box Homes Partnership
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              How a purchase becomes a voucher
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
              A simple, renewable flow turns one family&apos;s new home into
              stability for another.
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
                <div className="mt-6 w-full rounded-2xl border-t-4 border-gold bg-cream p-6 shadow-card">
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

      {/* ===== WHERE THE VOUCHERS COME FROM (image + text) ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
              <img
                src={PHOTOS.cabin}
                alt="A discounted, durable home funded through the Bright Box Homes partnership"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="gold-rule text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
                The Bright Box Homes Partnership
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Where the vouchers come from
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                FAITH Foundation has partnered with Bright Box Homes to turn
                homeownership into community uplift. Through this partnership,{" "}
                <strong className="text-navy">
                  every home purchased generates a $2,500 donation
                </strong>{" "}
                to FAITH Foundation — at no extra cost to the buyer.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                Those donations are converted directly into housing vouchers for
                families who are struggling with rent. It is a simple, powerful
                idea: when one family puts down roots in a new home, another family
                gets the support they need to keep their home. Each purchase becomes
                a cycle of generosity that strengthens communities across Texas.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                The model is transparent and sustainable. As Bright Box Homes grows,
                so does the pool of housing assistance — creating a steady,
                renewable source of funding for the families who need it most.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== HOW THE VOUCHER SYSTEM WORKS ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="gold-rule text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
              How the voucher system works
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Assistance with dignity and accountability
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal/80">
              <p>
                Housing vouchers from FAITH Foundation provide targeted rental
                assistance to families facing a housing crisis. Funds are directed
                toward keeping families in stable housing — closing the gap between
                what a household can pay and what it owes so that a temporary
                hardship does not become a permanent loss. Every voucher is
                stewarded with the same accountability we promise our donors: real
                assistance, directed to real local need, with care and transparency.
              </p>
              <p>
                Vouchers are most powerful as a path to homeownership. A family
                stabilized by down payment and rental assistance today can complete
                Homeownership Counseling to buy a home of their own — with supporting
                financial literacy guidance to help them prepare and sustain it. That
                purchase, through Bright Box Homes, helps fund the very vouchers that
                once kept them housed. This is the renewable cycle of uplift at the
                heart of FAITH Foundation: neighbors helping neighbors, rooted in
                faith, lifting families across Texas one home at a time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Apply for help — or help fund a voucher
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              If your family needs rental assistance, reach out today. If you want
              to keep neighbors housed, your gift — or your next home purchase
              through Bright Box Homes — funds the vouchers that make it possible.
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


