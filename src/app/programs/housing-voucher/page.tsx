import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Housing Voucher Program — FAITH Foundation",
  description:
    "FAITH Foundation's Housing Voucher Program turns the Bright Box Homes partnership — a $2,500 donation per home purchased — into rental assistance that keeps Central Texas families housed.",
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
      {/* Header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Programs / Assistance
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Housing Voucher Program
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Direct rental assistance funded by the Bright Box Homes partnership —
            where a $2,500 donation per home purchased becomes a voucher that
            keeps a neighboring family housed.
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
            Keeping families housed, one home at a time
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
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
        </div>
      </section>

      {/* Bright Box partnership */}
      <section className="bg-gold/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              The Bright Box Homes Partnership
            </h2>
            <h3 className="mb-5 text-3xl font-extrabold text-navy">
              Where the vouchers come from
            </h3>
            <p className="mb-4 text-lg leading-relaxed text-foreground/80">
              FAITH Foundation has partnered with Bright Box Homes to turn
              homeownership into community uplift. Through this partnership,{" "}
              <strong className="text-navy">
                every home purchased generates a $2,500 donation
              </strong>{" "}
              to FAITH Foundation — at no extra cost to the buyer.
            </p>
            <p className="mb-4 text-lg leading-relaxed text-foreground/80">
              Those donations are converted directly into housing vouchers for
              families who are struggling with rent. It is a simple, powerful
              idea: when one family puts down roots in a new home, another family
              gets the support they need to keep their home. Each purchase becomes
              a cycle of generosity that strengthens the entire Central Texas
              community.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              The model is transparent and sustainable. As Bright Box Homes grows,
              so does the pool of housing assistance — creating a steady,
              renewable source of funding for the families who need it most.
            </p>
          </div>
          <div className="rounded-2xl border-t-8 border-gold bg-navy p-10 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">
              How a purchase becomes a voucher
            </p>
            <ol className="mt-6 space-y-6">
              {STEPS.map((step) => (
                <li key={step.number} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy">
                    {step.number}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="mt-1 leading-relaxed text-white/85">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Who it helps */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            How the voucher system works
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Assistance with dignity and accountability
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
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
              Vouchers are most powerful when paired with our other programs. A
              family stabilized by rental assistance today can enroll in our
              Financial Literacy program to rebuild credit and retire debt, and
              one day complete Homeownership Counseling to buy a home of their
              own — a purchase that, through Bright Box Homes, helps fund the very
              vouchers that once kept them housed. This is the renewable cycle of
              uplift at the heart of FAITH Foundation: neighbors helping neighbors,
              rooted in faith, lifting Central Texas families one home at a time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
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
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Apply for Assistance
            </Link>
            <Link
              href="/donate"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Fund a Voucher
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
