import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — FAITH Foundation",
  description:
    "Learn about FAITH Foundation's mission, vision, core values, history, and statement of faith. A 501(c)(3) nonprofit serving Central Texas through affordable instruction and tenancy hope.",
};

const CORE_VALUES = [
  {
    letter: "F",
    title: "Faith",
    body: "We believe lasting change begins with faith — faith in God, faith in our neighbors, and faith that no family is beyond hope. Faith is the foundation on which every program and partnership we build stands.",
  },
  {
    letter: "A",
    title: "Accountability",
    body: "Every dollar entrusted to us is stewarded with transparency and care. We measure our impact honestly, report our outcomes openly, and hold ourselves accountable to the families and donors who make our work possible.",
  },
  {
    letter: "I",
    title: "Instruction",
    body: "Education opens doors that stay open. We invest in instruction — financial literacy, life skills, and learning opportunities — so families gain the knowledge to build durable, independent futures.",
  },
  {
    letter: "T",
    title: "Tenacity",
    body: "Stability is rarely won in a single step. We walk with families through setbacks and seasons of struggle, refusing to give up on anyone, because perseverance is what turns crisis into confidence.",
  },
  {
    letter: "H",
    title: "Hope",
    body: "Hope is the heartbeat of everything we do. Through housing assistance and education, we offer tangible hope — a roof, a lesson, a fresh start — to the neighbors who need it most.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            About FAITH Foundation
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Who we are and why we serve
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation is a faith-driven 501(c)(3) nonprofit based in
            Burnet, Texas, dedicated to strengthening families across Central
            Texas through affordable instruction and lasting tenancy hope.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Our Mission
            </h2>
            <p className="text-xl font-semibold leading-relaxed text-navy">
              To strengthen communities by removing the barriers between people
              and two essentials of a dignified life: quality instruction and
              stable, affordable housing.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">
              Too many families are forced to choose between paying rent and
              investing in their future. FAITH Foundation exists to make that
              choice unnecessary. Through education programs, financial literacy
              support, and direct housing voucher assistance, we help our
              neighbors move from crisis to confidence — keeping families housed
              today while equipping them with the skills to thrive tomorrow.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Our Vision
            </h2>
            <p className="text-xl font-semibold leading-relaxed text-navy">
              A Central Texas where every family has a stable home, access to
              the instruction they need to flourish, and a community that
              refuses to let them fall through the cracks.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">
              We envision neighborhoods where generational poverty gives way to
              generational stability — where the gift of a single home purchase
              ripples outward to keep another family housed, and where
              education and opportunity are within reach of all. We believe this
              vision is achievable when faith, generosity, and accountability
              work hand in hand.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Our Core Values
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              The values behind our name
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              The name FAITH is more than a label — each letter names a value
              that guides how we serve: Faith, Accountability, Instruction,
              Tenacity, and Hope.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {CORE_VALUES.map((value) => (
              <li
                key={value.title}
                className="rounded-lg border-t-4 border-gold bg-white p-6 shadow-sm"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-2xl font-extrabold text-gold"
                >
                  {value.letter}
                </span>
                <h4 className="mt-4 text-lg font-bold text-navy">
                  {value.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* History */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Our History
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            From a calling to a foundation
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              FAITH Foundation was born out of a simple but persistent
              conviction: that no family in our community should have to choose
              between keeping a roof overhead and building a better future. What
              began as a ministry-rooted response to the housing pressures
              facing families in Burnet and the surrounding Hill Country grew
              into a formal 501(c)(3) nonprofit dedicated to affordable
              instruction and tenancy hope.
            </p>
            <p>
              Our founders saw firsthand how quickly a missed paycheck or an
              unexpected expense could push a hardworking family toward
              eviction. They also saw how education — practical instruction in
              budgeting, tenancy, and life skills — could change a family&apos;s
              trajectory for good. Rather than treat housing and learning as
              separate problems, FAITH Foundation was created to address them
              together.
            </p>
            <p>
              A turning point came with our partnership with Bright Box Homes,
              through which every home purchased generates a $2,500 donation that
              funds housing vouchers for families in need. This sustainable model
              turned the act of homeownership into a renewable source of
              community uplift — one purchase lifting two families. Today we
              continue to grow that mission, guided by faith and powered by the
              generosity of neighbors who believe stability should be within
              everyone&apos;s reach.
            </p>
          </div>
        </div>
      </section>

      {/* Statement of Faith */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
            Our Statement of Faith
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold">
            Rooted in faith, open to all
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-white/85">
            <p>
              FAITH Foundation is a faith-based organization. We believe that
              every person is created with inherent dignity and worth, and that
              we are called to love our neighbors through tangible acts of
              service — feeding the hungry, sheltering the vulnerable, and
              lifting up those in need. Our faith is the wellspring of our
              compassion and the reason we persevere when the work is hard.
            </p>
            <p>
              While our work is grounded in Christian conviction, our doors and
              our programs are open to all. We serve families of every
              background, belief, and circumstance without condition or
              preference. We do not require those we help to share our faith; we
              simply ask that we be allowed to express ours through the way we
              serve. Compassion, integrity, and respect for the dignity of every
              person guide every interaction.
            </p>
            <p>
              We hold ourselves to the highest standards of stewardship and
              accountability, believing that the resources entrusted to us are a
              sacred trust. In all things, we strive to reflect the love,
              humility, and hope that first called us to this mission.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Be part of the mission
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Whether you give, partner, or apply for assistance, you help keep
            families learning and keep families housed.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/team"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Meet Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
