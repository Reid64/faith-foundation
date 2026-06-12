import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News & Announcements — FAITH Foundation",
  description:
    "The latest news from FAITH Foundation — program milestones, Bright Box Homes partnership updates, grant announcements, and stories of families finding affordable instruction and tenancy hope in Central Texas.",
};

const NEWS = [
  {
    slug: "bright-box-partnership-funds-tenth-voucher",
    title: "Bright Box Homes Partnership Funds Its Tenth Housing Voucher",
    date: "June 5, 2026",
    category: "Partnership",
    summary:
      "A milestone for our renewable funding model: home purchases through Bright Box Homes have now generated enough in $2,500 gifts to fund ten housing vouchers for Central Texas families.",
    body: "Each time a family closes on a home through Bright Box Homes, a $2,500 donation flows to FAITH Foundation at no extra cost to the buyer. This month we crossed an encouraging threshold — those gifts have now funded our tenth housing voucher, helping ten families secure deposits, cover move-in costs, or stay current on rent during a hard season. We are grateful to every homebuyer whose decision quietly lifted a neighbor they may never meet, and we remain committed to reporting exactly where each voucher dollar lands.",
  },
  {
    slug: "fall-financial-literacy-cohort-open",
    title: "Registration Opens for the Fall Financial Literacy Cohort",
    date: "May 22, 2026",
    category: "Programs",
    summary:
      "Our free financial-literacy program returns this fall with new evening sessions designed to fit around work and family schedules.",
    body: "Stable housing starts with a stable budget, and our financial-literacy coaches are opening registration for the fall cohort. Over several weeks, participating families work one-on-one and in small groups on budgeting, credit repair, debt management, and saving for the unexpected. The program is completely free and open to anyone in Central Texas. New evening sessions make it easier for working parents to attend, and childcare considerations are part of how we plan each gathering. Contact us or visit our programs page to learn how to enroll.",
  },
  {
    slug: "new-volunteer-orientation-schedule",
    title: "New Monthly Volunteer Orientations Announced",
    date: "May 3, 2026",
    category: "Volunteers",
    summary:
      "Responding to growing community interest, FAITH Foundation is launching monthly orientation sessions for new volunteers.",
    body: "The response from neighbors wanting to serve has been humbling, and we are making it easier to get started. Beginning this spring, we are hosting a monthly orientation for new volunteers covering our mission, the families we serve, and the many ways to help — from tutoring in our financial-literacy program to assembling welcome kits and supporting events. No special experience is required, only a willingness to serve. If you have been considering volunteering, this is the perfect on-ramp; sign up through our volunteer page and we will follow up with the next available date.",
  },
  {
    slug: "annual-impact-report-published",
    title: "FAITH Foundation Publishes Its Annual Impact Summary",
    date: "April 18, 2026",
    category: "Accountability",
    summary:
      "In keeping with our commitment to transparency, we have published a plain-language summary of the past year's outcomes and how donations were stewarded.",
    body: "Accountability is one of the values our name stands for, and we take it seriously. Our annual impact summary lays out, in plain language, how many families we served, how housing vouchers were distributed, and how every category of giving was put to work. We believe donors and the families we serve deserve to see the results of their trust, not just hear about our intentions. The summary is available on request, and the highlights are reflected on our impact and financial-transparency pages. Thank you to everyone whose generosity made this year's work possible.",
  },
];

export default function NewsPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Newsroom
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            News &amp; <span className="text-gold">announcements</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Milestones from our programs, updates on the Bright Box Homes
            partnership, and announcements about how FAITH Foundation is serving
            families across Central Texas. We share our news openly because
            transparency is part of how we steward your trust — when the work
            moves forward, we want you to see it.
          </p>
        </div>
      </section>

      {/* News list */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-10">
            {NEWS.map((item) => (
              <article
                key={item.slug}
                className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/60">
                  <span className="font-bold uppercase tracking-widest text-gold-dark">
                    {item.category}
                  </span>
                  <span aria-hidden>•</span>
                  <span>{item.date}</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
                  {item.title}
                </h2>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-foreground/80">
                  {item.summary}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-foreground/80">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* More stories */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-navy">
            Looking for the full story?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-foreground/80">
            Our blog goes deeper on the families we serve and the lessons from our
            programs, and our impact page shares the measurable results behind
            these announcements.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/blog"
              className="rounded-md bg-navy px-8 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-navy-light"
            >
              Read the Blog
            </Link>
            <Link
              href="/impact"
              className="rounded-md border-2 border-navy px-8 py-3 text-base font-bold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              See Our Impact
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Help us write the next chapter
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Every milestone on this page started with someone who gave, served, or
            partnered with us. Your support keeps families learning and keeps
            families housed.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/donate"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Donate Now
            </Link>
            <Link
              href="/events"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              See Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
