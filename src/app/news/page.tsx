import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "News & Announcements — FAITH Foundation",
  description:
    "The latest from FAITH Foundation — program milestones, donor and grant announcements, and stories of Texas families reaching homeownership.",
  alternates: { canonical: "/news" },
};

const NEWS = [
  {
    slug: "community-donations-grow-housing-fund",
    title: "Community Donations Grow FAITH Foundation's Housing Fund",
    date: "June 5, 2026",
    category: "Impact",
    summary:
      "A sustainable engine for our mission: gifts from individual donors and corporate partners fund down payment assistance vouchers for families across Texas.",
    body: "Our housing fund is made possible by the generosity of donors and community partners, and designated housing donations directly support our charitable housing mission. This funding model is designed to grow the pool of down payment assistance available to families working toward a home of their own, helping neighbors cover the down payment that puts homeownership within reach. As a brand-new organization, we are building this engine with care, and we remain committed to reporting openly to the donors who make it possible.",
  },
  {
    slug: "new-volunteer-orientation-schedule",
    title: "New Monthly Volunteer Orientations Announced",
    date: "May 3, 2026",
    category: "Volunteers",
    summary:
      "Responding to growing community interest, FAITH Foundation is launching monthly orientation sessions for new volunteers.",
    body: "The response from neighbors wanting to serve has been humbling, and we are making it easier to get started. Beginning this spring, we are hosting a monthly orientation for new volunteers covering our mission, the families we serve, and the many ways to help — from coaching a family through the responsibilities of tenancy to assembling welcome kits and supporting events. No special experience is required, only a willingness to serve. If you have been considering volunteering, this is the perfect on-ramp; sign up through our volunteer page and we will follow up with the next available date.",
  },
  {
    slug: "annual-impact-report-published",
    title: "FAITH Foundation Publishes Its Annual Impact Summary",
    date: "April 18, 2026",
    category: "Transparency",
    summary:
      "In keeping with our commitment to transparency, we have published a plain-language summary of the past year's outcomes and how donations were stewarded.",
    body: "Transparent stewardship is a commitment we take seriously. Our annual impact summary lays out, in plain language, how many families we served, how down payment assistance vouchers were distributed, and how every category of giving was put to work. We believe donors and the families we serve deserve to see the results of their trust, not just hear about our intentions. The summary is available on request, and the highlights are reflected on our impact and financial-transparency pages. Thank you to everyone whose generosity made this year's work possible.",
  },
];

export default function NewsPage() {
  const [featured, ...rest] = NEWS;

  return (
    <>
      {/* ===== HERO — dark photo + navy overlay ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("peopleTalking", 1900, 1100)}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              Newsroom
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              News &amp; <span className="text-gold">announcements</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Milestones from our programs, updates on how community donations
              fund our work, and announcements about how FAITH Foundation is helping
              families across Texas reach homeownership. We share our news openly because
              transparency is part of how we steward your trust — when the work
              moves forward, we want you to see it.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== FEATURED ANNOUNCEMENT ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Latest announcement
            </span>
          </Reveal>
          <Reveal delay={100}>
            <article className="mt-6 overflow-hidden rounded-[2rem] bg-navy text-white shadow-card-lg">
              <div className="grid lg:grid-cols-5">
                <div className="relative aspect-[4/3] overflow-hidden lg:col-span-2 lg:aspect-auto">
                  <img
                    src={img("newKeys", 800, 900)}
                    alt={featured.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r" />
                </div>
                <div className="p-8 sm:p-12 lg:col-span-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="rounded-full bg-gold px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-navy">
                      {featured.category}
                    </span>
                    <span className="font-medium text-white/70">
                      {featured.date}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-5 text-lg font-semibold leading-relaxed text-gold-light">
                    {featured.summary}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-white/85">
                    {featured.body}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== NEWSROOM TIMELINE — vertical dated rail ===== */}
      <section className="bg-gradient-to-b from-white to-[#f0ede4] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <Reveal>
            <h2 className="heading-underline text-3xl font-extrabold text-navy sm:text-4xl">
              The newsroom timeline
            </h2>
          </Reveal>
          <div className="mt-14 space-y-12">
            {rest.map((item, i) => {
              const [month, day, year] = item.date.replace(",", "").split(" ");
              return (
                <Reveal key={item.slug} delay={i * 100}>
                  <article className="relative grid gap-6 sm:grid-cols-[10rem_1fr] sm:gap-10">
                    {/* Left rail: date + dot */}
                    <div className="relative sm:text-right">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-green-dark">
                        {month} {year}
                      </div>
                      <div className="mt-1 text-4xl font-extrabold leading-none text-navy">
                        {day}
                      </div>
                      {/* connector dot, anchored to the divider on desktop */}
                      <span
                        aria-hidden
                        className="absolute right-[-2.55rem] top-1.5 hidden h-4 w-4 rounded-full border-4 border-cream bg-green sm:block"
                      />
                    </div>

                    {/* Right: vertical line + content */}
                    <div className="relative border-navy/10 pb-2 sm:border-l sm:pl-10">
                      <span className="inline-flex items-center rounded-full bg-navy/5 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-navy">
                        {item.category}
                      </span>
                      <h3 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-lg font-semibold leading-relaxed text-charcoal/80">
                        {item.summary}
                      </p>
                      <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                        {item.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== More stories ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="heading-underline-center text-3xl font-extrabold text-navy sm:text-4xl">
              Looking for the full story?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/80">
              Our blog goes deeper on the families we serve and the lessons from our
              programs, and our impact page shares the measurable results behind
              these announcements.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/blog"
                className="rounded-md bg-navy px-8 py-3 text-base font-bold text-white shadow-card transition-colors hover:bg-navy-light"
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
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      {/* ===== CTA ===== */}
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Help us write the next chapter
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Every milestone on this page started with someone who gave, served, or
              partnered with us. Your support helps more families across Texas reach
              the milestone of homeownership.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
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
          </Reveal>
        </div>
      </section>
    </>
  );
}


