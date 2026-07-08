import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import VideoSection from "@/components/VideoSection";
import { VIDEOS, PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Bright Box Homes Partnership — FAITH Foundation",
  description:
    "The full Bright Box Homes partnership: every home purchased generates a $2,500 donation to FAITH Foundation, and FAITH issues vouchers back for down payments on discounted container homes for veterans, homeless single mothers, and people in recovery and reentry.",
};

const CYCLE = [
  {
    step: "1",
    title: "A home is purchased",
    body: "A family buys a home through Bright Box Homes. At no added cost to the buyer, $2,500 is donated to the FAITH Foundation for every Bright Box home purchased.",
  },
  {
    step: "2",
    title: "FAITH receives the gift",
    body: "Every $2,500 donation flows into FAITH Foundation's housing fund — a transparent, renewable source of assistance that grows as Bright Box Homes grows.",
  },
  {
    step: "3",
    title: "FAITH issues a voucher back",
    body: "FAITH directs those funds into down payment assistance vouchers that cover the down payment on a discounted container home for a neighbor who could never assemble that sum alone.",
  },
  {
    step: "4",
    title: "A new owner moves in",
    body: "A veteran, a single mother, or a person rebuilding after recovery or reentry becomes a homeowner — and the cycle begins again with the next purchase.",
  },
];

const RECIPIENTS = [
  {
    title: "Veterans",
    body: "Men and women who served our country and now face housing instability receive down-payment vouchers that turn earned dignity into a deed and a door key of their own.",
  },
  {
    title: "Homeless single mothers",
    body: "Mothers raising children without a stable address get a real path to ownership — an affordable container home and the voucher that makes the down payment possible.",
  },
  {
    title: "Recovery & reentry",
    body: "People rebuilding their lives after addiction or incarceration gain the stable foundation that research shows is the single strongest predictor of lasting success.",
  },
];

export default function PartnershipPage() {
  return (
    <>
      {/* Hero — 4K video background */}
      <VideoSection src={VIDEOS.partnership} poster={PHOTOS.modern} overlay="gold" className="text-white">
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pb-32">
          <Reveal>
            <span className="inline-block rounded-full border border-green/60 bg-green/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-green-light backdrop-blur">
              Partnership
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              The Bright Box Homes Partnership
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              One purchase lifts two families. $2,500 is donated to the FAITH
              Foundation for every Bright Box home purchased — and those funds
              become down payment assistance vouchers on a discounted container
              home for a neighbor in need. It is a renewable cycle of ownership
              and uplift.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex justify-center">
              <Link
                href="/donate"
                className="inline-block rounded-full bg-green px-10 py-4 text-lg font-bold text-white shadow-green transition-colors hover:bg-green-dark"
              >
                Support the Cycle
              </Link>
            </div>
          </Reveal>
        </div>
      </VideoSection>

      {/* Stat band */}
      <section className="bg-navy-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-3">
            <Reveal className="text-center sm:border-r sm:border-white/15">
              <p className="text-5xl font-extrabold text-gold sm:text-6xl">
                <StatCounter value={2500} prefix="$" />
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
                Donated per home purchased
              </p>
            </Reveal>
            <Reveal delay={100} className="text-center sm:border-r sm:border-white/15">
              <p className="text-5xl font-extrabold text-gold sm:text-6xl">
                <StatCounter value={2} />
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
                Families lifted per purchase
              </p>
            </Reveal>
            <Reveal delay={200} className="text-center">
              <p className="text-5xl font-extrabold text-gold sm:text-6xl">
                <StatCounter value={4} />
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
                Steps in the renewable cycle
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <h2 className="text-sm font-bold uppercase tracking-widest text-green-dark">
              The full model
            </h2>
            <h3 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              A two-way partnership that builds owners, not just renters
            </h3>
          </Reveal>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/80">
            <Reveal as="p" delay={100}>
              Most charitable housing models move in one direction: a donor gives,
              and a family receives temporary relief. The Bright Box Homes
              partnership is different because it moves in a circle. FAITH
              Foundation and Bright Box Homes have built a relationship in which
              generosity flows out and comes right back, compounding with every
              transaction. When a buyer purchases a home through Bright Box Homes,{" "}
              <strong>$2,500 is donated to the FAITH Foundation for every Bright
              Box home purchased</strong> — at no extra cost to the buyer. It is
              built into the model, not added on top.
            </Reveal>
            <Reveal as="p" delay={150}>
              Here is what makes the partnership full and not merely philanthropic:
              FAITH does not simply bank those gifts. We{" "}
              <strong>issue vouchers back</strong> — directing the donated funds
              into <strong>down payment assistance vouchers</strong> on{" "}
              <strong>discounted container homes</strong>. Container homes are
              durable, efficient, and dramatically more affordable than
              traditional construction, which means a modest voucher can unlock
              something most assistance programs never reach: actual ownership.
              Instead of subsidizing rent month after month, a single down-payment
              voucher helps a family cross the threshold from renting to owning —
              and an owner builds equity, stability, and a permanent stake in the
              community.
            </Reveal>
            <Reveal as="p" delay={200}>
              Those vouchers are aimed squarely at the neighbors who need them
              most: <strong>veterans</strong> who served and came home to
              instability, <strong>homeless single mothers</strong> raising
              children without a stable address, and people rebuilding their lives
              through <strong>recovery and reentry</strong>. For each of these
              families, an affordable container home plus a down-payment voucher is
              not a handout — it is a hand up onto the ladder of ownership. And
              because every new Bright Box home purchase refills the fund, the
              partnership sustains itself: the more homes the community buys, the
              more neighbors FAITH can move from crisis into keys of their own. It
              is a transparent, renewable engine of uplift, rooted in faith and
              powered by the generosity of ordinary buyers.
            </Reveal>
          </div>
        </div>
      </section>

      {/* The cycle — horizontal connected stepper */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold-dark">
              How the cycle works
            </h2>
            <h3 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              From one purchase to a new homeowner
            </h3>
          </Reveal>

          <ol className="relative mt-16 grid gap-12 lg:grid-cols-4 lg:gap-8">
            {/* Connecting line (desktop) */}
            <div
              className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30 lg:block"
              aria-hidden="true"
            />
            {CYCLE.map((item, i) => (
              <Reveal
                as="li"
                key={item.step}
                delay={i * 120}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-extrabold text-gold shadow-card ring-4 ring-white">
                  {item.step}
                </span>
                <h4 className="mt-6 text-xl font-extrabold text-navy">
                  {item.title}
                </h4>
                <p className="mt-3 text-base leading-relaxed text-charcoal/80">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Alternating image-text narrative */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl space-y-20 px-6 sm:px-8 lg:space-y-28">
          {/* Block 1 */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-3xl shadow-card-lg">
                <img
                  src={PHOTOS.yellow}
                  alt="A bright family home purchased through Bright Box Homes"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                It starts with a purchase
              </h3>
              <p className="mt-3 text-2xl font-extrabold leading-snug text-navy sm:text-3xl">
                Every Bright Box home sold refills the fund
              </p>
              <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                When a family buys through Bright Box Homes, a $2,500 donation
                flows automatically into FAITH Foundation&apos;s housing fund — at
                no extra cost to the buyer. The more homes the community buys, the
                more neighbors FAITH can move from crisis into keys of their own. It
                is generosity built into the model, not added on top.
              </p>
            </Reveal>
          </div>

          {/* Block 2 (reversed) */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <div className="overflow-hidden rounded-3xl shadow-card-lg">
                <img
                  src={PHOTOS.evening}
                  alt="A discounted container home glowing at dusk — a new owner moves in"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Reveal>
            <Reveal delay={100} className="lg:order-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-dark">
                It ends with a key
              </h3>
              <p className="mt-3 text-2xl font-extrabold leading-snug text-navy sm:text-3xl">
                A voucher turns renting into owning
              </p>
              <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
                FAITH directs those gifts into down-payment vouchers on discounted
                container homes — durable, efficient, and dramatically more
                affordable than traditional construction. Instead of subsidizing
                rent month after month, a single voucher helps a family cross the
                threshold from renting to owning, building equity, stability, and a
                permanent stake in the community.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Who it serves */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-green-dark">
              Who the vouchers serve
            </h2>
            <h3 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Down payments for neighbors who need them most
            </h3>
          </Reveal>
          <ul className="mt-16 grid gap-8 lg:grid-cols-3">
            {RECIPIENTS.map((recipient, i) => (
              <Reveal
                as="li"
                key={recipient.title}
                delay={i * 100}
                className="flex h-full flex-col rounded-3xl bg-cream p-8 shadow-card ring-1 ring-navy/5"
              >
                <h4 className="text-xl font-extrabold text-navy">
                  {recipient.title}
                </h4>
                <p className="mt-4 flex-1 text-base leading-relaxed text-charcoal/80">
                  {recipient.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Be part of the cycle of ownership
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
              Buy through Bright Box Homes, give to the fund, or apply for a
              down-payment voucher. However you take part, you help turn one
              family&apos;s new home into another family&apos;s first home.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-green px-10 py-4 text-lg font-bold text-white shadow-green transition-colors hover:bg-green-dark"
              >
                Donate Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-gold px-10 py-4 text-lg font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Apply for a Voucher
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


