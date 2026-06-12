import Link from "next/link";

const IMPACT_STATS = [
  { value: "$2,500", label: "Donated per Bright Box home purchased" },
  { value: "100%", label: "Of vouchers directed to local housing assistance" },
  { value: "501(c)(3)", label: "Tax-exempt nonprofit status" },
  { value: "Burnet, TX", label: "Proudly serving Central Texas" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Foundation for Affordable Instruction &amp; Tenancy Hope
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Building <span className="text-gold">stability</span> through
            education and housing hope
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas. We
            open doors to affordable instruction and lasting tenancy so that
            families across Central Texas can learn, grow, and keep a roof over
            their heads.
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/programs"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Apply for Assistance
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Our Mission
          </h2>
          <p className="text-balance text-2xl font-semibold leading-relaxed text-navy">
            To strengthen communities by removing the barriers between people
            and two essentials of a dignified life: quality instruction and
            stable, affordable housing.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-foreground/80">
            Too many families are forced to choose between paying rent and
            investing in their future. FAITH Foundation exists to make that
            choice unnecessary. Through education programs, financial literacy
            support, and direct housing voucher assistance, we help our
            neighbors move from crisis to confidence. Every dollar we raise is
            stewarded with care and directed toward measurable, local impact —
            keeping families housed today while equipping them with the skills to
            thrive tomorrow. We believe that when instruction and tenancy hope go
            hand in hand, generational change becomes possible.
          </p>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-center text-sm font-bold uppercase tracking-widest text-gold">
            Our Impact
          </h2>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {IMPACT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center"
              >
                <dt className="text-3xl font-extrabold text-gold">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm leading-snug text-white/80">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bright Box Homes partnership */}
      <section className="bg-gold/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Partnership Spotlight
            </h2>
            <h3 className="mb-5 text-3xl font-extrabold text-navy">
              The Bright Box Homes Partnership
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
              Those donations fund housing vouchers that help families who are
              struggling with rent secure and maintain stable housing. It is a
              simple, powerful idea: when one family puts down roots in a new
              home, another family gets the support they need to keep their home.
              Each purchase becomes a cycle of generosity that strengthens the
              entire Central Texas community.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              The model is transparent and sustainable. As Bright Box Homes
              grows, so does the pool of housing assistance — creating a steady,
              renewable source of funding for the families who need it most.
            </p>
          </div>
          <div className="rounded-2xl border-t-8 border-gold bg-navy p-10 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">
              How it works
            </p>
            <ol className="mt-6 space-y-6">
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy">
                  1
                </span>
                <p className="leading-relaxed text-white/85">
                  A family purchases a home through Bright Box Homes.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy">
                  2
                </span>
                <p className="leading-relaxed text-white/85">
                  Bright Box Homes donates <strong>$2,500</strong> to FAITH
                  Foundation for that purchase.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy">
                  3
                </span>
                <p className="leading-relaxed text-white/85">
                  FAITH Foundation converts that gift into housing vouchers for
                  families in need.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-navy">
                  4
                </span>
                <p className="leading-relaxed text-white/85">
                  Vouchers keep neighbors housed — one purchase lifts two
                  families.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Join us in offering instruction and tenancy hope
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Whether you give, partner, or apply for assistance, you become part
            of a community that refuses to let a neighbor fall through the
            cracks. Your generosity keeps families learning and keeps families
            housed.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/programs"
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
