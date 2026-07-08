import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";
import { VIDEOS, PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Homeownership Counseling — FAITH Foundation",
  description:
    "FAITH Foundation's flagship homeownership counseling prepares families across Texas to buy with confidence through down payment assistance — covering mortgages, budgets, credit, and closing.",
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
    body: "We help you build a homebuyer budget, understand your credit profile, and create a plan to strengthen it. Our supporting financial literacy guidance is available to help with credit and debt along the way, keeping the focus squarely on getting you home-ready.",
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
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-navy">
        <img
          src={img("newKeys", 2000)}
          alt="A hand receiving the keys to a new home"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-green-deep/40" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:px-8 sm:pt-44">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Flagship Program / Homeownership
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                Homeownership Counseling
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Pre-purchase counseling that prepares first-time and returning buyers
                to navigate the path to affordable, lasting homeownership — with
                confidence and clear eyes.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== INTRO (text + side image: handshake) ===== */}
      <section className="bg-texture bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="green-rule text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
                Why pre-purchase counseling
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Buy with confidence, not crossed fingers
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
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
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                Our counseling is personal, practical, and free of pressure. We are
                not here to sell you a house or a loan — we are here to make sure
                that when you do buy, you do it on solid ground. Whether you are
                years away from being ready or just need a final push across the
                finish line, we meet you where you are and build a realistic plan
                from there. Homeownership should be a source of security, not
                stress, and good counseling is how we help ensure it is.
              </p>
            </Reveal>
          </div>

          <Reveal delay={150} className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] shadow-card-lg">
              <img
                src={img("handshake", 900)}
                alt="Two people shaking hands over a counseling table"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 hidden rounded-2xl border-l-4 border-green bg-navy px-7 py-6 text-white shadow-green sm:block">
              <p className="text-3xl font-extrabold text-green-light">No pressure</p>
              <p className="mt-1 text-sm text-white/75">Always on your side</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== JOURNEY ROADMAP (dominant module — horizontal stepper) ===== */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Your roadmap to the closing table
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-charcoal/75">
              We guide you through four stages, at your own pace, until you are
              genuinely ready to buy.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-6 sm:px-8">
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {/* connecting line (desktop) */}
            <span
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30 md:block"
            />
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.number}
                delay={i * 120}
                className="relative flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-extrabold text-gold shadow-card ring-4 ring-white">
                  {step.number}
                </span>
                <div className="mt-6 rounded-2xl border-t-4 border-gold bg-cream p-6 shadow-card">
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

      {/* ===== BRIGHT BOX CONNECTION ===== */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2rem] shadow-card-lg ring-1 ring-navy/10">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={PHOTOS.modern}
                className="aspect-[9/16] w-full object-cover"
              >
                <source src={VIDEOS.vertical} type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden rounded-2xl border-l-4 border-green bg-navy px-7 py-6 text-white shadow-green sm:block">
              <p className="text-3xl font-extrabold text-green-light">$2,500</p>
              <p className="mt-1 text-sm text-white/75">Donated per home</p>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="gold-rule text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">
                A purchase that gives back
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
                Your home, another family&apos;s hope
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                When you are ready to buy, your purchase can do more than build your
                own future. Through FAITH Foundation&apos;s partnership with Bright
                Box Homes, every home purchased generates a{" "}
                <strong className="text-navy">$2,500 donation</strong> to the
                Foundation — at no extra cost to you. Those donations fund housing
                vouchers that keep struggling families in their homes. In other
                words, the milestone of putting down roots becomes a gift that lifts
                a neighbor at the very same time.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                It is a fitting reflection of how our programs work together. The
                counseling that prepares you to buy and the voucher program that
                provides down payment and rental assistance — supported by financial
                literacy guidance along the way — are all part of one renewable cycle
                of community uplift —
                rooted in faith and powered by neighbors helping neighbors. Your
                homeownership journey can be the spark that keeps it turning.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Start your path to homeownership
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Schedule pre-purchase counseling, or support the flagship program that
              helps families across Texas buy with confidence.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-light hover:shadow-card-lg"
              >
                Request Counseling
              </Link>
              <Link
                href="/programs"
                className="rounded-full border-2 border-gold px-8 py-4 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Back to All Programs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


