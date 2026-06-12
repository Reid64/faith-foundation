import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bright Box Homes Partnership — FAITH Foundation",
  description:
    "The full Bright Box Homes partnership: every home purchased generates a $2,500 donation to FAITH Foundation, and FAITH issues vouchers back for down payments on discounted container homes for veterans, homeless single mothers, and people in recovery and reentry.",
};

const CYCLE = [
  {
    step: "1",
    title: "A home is purchased",
    body: "A family buys a home through Bright Box Homes. At no added cost to the buyer, that purchase triggers a $2,500 donation to FAITH Foundation.",
  },
  {
    step: "2",
    title: "FAITH receives the gift",
    body: "Every $2,500 donation flows into FAITH Foundation's housing fund — a transparent, renewable source of assistance that grows as Bright Box Homes grows.",
  },
  {
    step: "3",
    title: "FAITH issues a voucher back",
    body: "FAITH directs those funds into vouchers that cover the down payment on a discounted container home for a neighbor who could never assemble that sum alone.",
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
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Partnership
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            The Bright Box Homes Partnership
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            One purchase lifts two families. Every home bought through Bright Box
            Homes gives $2,500 to FAITH Foundation — and FAITH gives it back as a
            down-payment voucher on a discounted container home for a neighbor in
            need. It is a renewable cycle of ownership and uplift.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Support the Cycle
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            The full model
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            A two-way partnership that builds owners, not just renters
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              Most charitable housing models move in one direction: a donor
              gives, and a family receives temporary relief. The Bright Box Homes
              partnership is different because it moves in a circle. FAITH
              Foundation and Bright Box Homes have built a relationship in which
              generosity flows out and comes right back, compounding with every
              transaction. When a buyer purchases a home through Bright Box Homes,
              that purchase generates a <strong>$2,500 donation</strong> to FAITH
              Foundation — at no extra cost to the buyer. It is built into the
              model, not added on top.
            </p>
            <p>
              Here is what makes the partnership full and not merely
              philanthropic: FAITH does not simply bank those gifts. We{" "}
              <strong>issue vouchers back</strong> — directing the donated funds
              into down-payment assistance on{" "}
              <strong>discounted container homes</strong>. Container homes are
              durable, efficient, and dramatically more affordable than
              traditional construction, which means a modest voucher can unlock
              something most assistance programs never reach: actual ownership.
              Instead of subsidizing rent month after month, a single
              down-payment voucher helps a family cross the threshold from renting
              to owning — and an owner builds equity, stability, and a permanent
              stake in the community.
            </p>
            <p>
              Those vouchers are aimed squarely at the neighbors who need them
              most: <strong>veterans</strong> who served and came home to
              instability, <strong>homeless single mothers</strong> raising
              children without a stable address, and people rebuilding their
              lives through <strong>recovery and reentry</strong>. For each of
              these families, an affordable container home plus a down-payment
              voucher is not a handout — it is a hand up onto the ladder of
              ownership. And because every new Bright Box home purchase refills
              the fund, the partnership sustains itself: the more homes the
              community buys, the more neighbors FAITH can move from crisis into
              keys of their own. It is a transparent, renewable engine of uplift,
              rooted in faith and powered by the generosity of ordinary buyers.
            </p>
          </div>
        </div>
      </section>

      {/* The cycle */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-gold-dark">
            How the cycle works
          </h2>
          <h3 className="mb-12 text-center text-3xl font-extrabold text-navy">
            From one purchase to a new homeowner
          </h3>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CYCLE.map((item) => (
              <li
                key={item.step}
                className="flex flex-col rounded-xl border-t-4 border-gold bg-white p-8 shadow-md ring-1 ring-navy/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-lg font-bold text-gold">
                  {item.step}
                </span>
                <h4 className="mt-5 text-xl font-extrabold text-navy">
                  {item.title}
                </h4>
                <p className="mt-3 flex-1 text-base leading-relaxed text-foreground/80">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who it serves */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-gold-dark">
            Who the vouchers serve
          </h2>
          <h3 className="mb-12 text-center text-3xl font-extrabold text-navy">
            Down payments for neighbors who need them most
          </h3>
          <ul className="grid gap-8 lg:grid-cols-3">
            {RECIPIENTS.map((recipient) => (
              <li
                key={recipient.title}
                className="flex flex-col rounded-xl border-t-4 border-gold bg-white p-8 shadow-md ring-1 ring-navy/5"
              >
                <h4 className="text-xl font-extrabold text-navy">
                  {recipient.title}
                </h4>
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/80">
                  {recipient.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Be part of the cycle of ownership
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Buy through Bright Box Homes, give to the fund, or apply for a
            down-payment voucher. However you take part, you help turn one
            family&apos;s new home into another family&apos;s first home.
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
              Apply for a Voucher
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
