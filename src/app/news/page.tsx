import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "News & Announcements — FAITH Foundation",
  description:
    "Organizational announcements from FAITH Foundation, a newly established Texas 501(c)(3) — how our down payment assistance model works, volunteer orientation, and our transparency reporting commitments.",
  alternates: { canonical: "/news" },
};

/**
 * Organizational announcements written by FAITH Foundation.
 *
 * CREDIBILITY RULE — read before editing:
 * FAITH Foundation is newly established and has no completed program outcomes
 * yet. Nothing on this page may claim a result that has not happened. Every
 * forward-looking item here must stay consistent with the confirmed dates on
 * /events (volunteer orientation: October 11, 2026; first annual impact
 * summary: November 24, 2026) and with /impact, which reports targets rather
 * than results. This page is our own newsroom — it is not press coverage, and
 * it must never be presented as such.
 */
const NEWS = [
  {
    slug: "how-community-giving-funds-down-payment-assistance",
    title: "How Community Giving Funds Our Down Payment Assistance",
    date: "June 5, 2026",
    category: "Our Model",
    summary:
      "An explanation of the funding model we are building: gifts designated for down payment assistance are pooled to help Texas families cover the cash needed to close.",
    body: "Down payment assistance is the core of our charitable purpose, and this announcement explains how we intend to fund it. Gifts designated for down payment assistance are pooled so that families who can afford a monthly mortgage but cannot save a lump sum have a path to closing. Gifts designated for operational support separately fund administration and organizational expenses, which is how we can say that 100% of every gift designated for down payment assistance is used for the program it was designated for. As a newly established organization we are building this model deliberately rather than promising results we have not yet produced, and we will report what it accomplishes as families are served.",
  },
  {
    slug: "first-volunteer-orientation-scheduled",
    title: "Our First Volunteer Orientation Is Scheduled for October 11, 2026",
    date: "May 3, 2026",
    category: "Volunteers",
    summary:
      "FAITH Foundation has scheduled its first volunteer orientation session, to be held online via Zoom.",
    body: "We are opening the door to neighbors who want to serve. Our first volunteer orientation is confirmed for October 11, 2026, held online via Zoom, and it will cover our mission, the families our programs are designed to serve, and the ways to get involved — from coaching tenancy and life skills to supporting events and helping families navigate the path to homeownership. No special experience is required, only a willingness to serve. Sign up through our volunteer page and we will send the Zoom link and details ahead of the session. Additional sessions will be announced here and on our events page as our volunteer program grows.",
  },
  {
    slug: "first-annual-impact-summary-commitment",
    title: "We Will Publish Our First Annual Impact Summary in November 2026",
    date: "April 18, 2026",
    category: "Transparency",
    summary:
      "FAITH Foundation has committed to publishing its first annual impact summary on November 24, 2026 — reporting actual results, not intentions.",
    body: "Transparent stewardship means publishing what actually happened, on a date we commit to in advance. FAITH Foundation will publish its first annual impact summary on November 24, 2026. It will lay out in plain language how many families were served, how down payment assistance was distributed, and how each category of giving was put to work. Because we are a newly established 501(c)(3), that first summary will report our earliest results honestly — including where we fell short of our Year One targets. Until it is published, the figures on our impact page are clearly labelled as targets and standards rather than outcomes, and our financial transparency page explains how gifts are designated and used.",
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
              Announcements written by FAITH Foundation about how our programs
              are being built, how community giving funds down payment
              assistance, and what we have committed to publish. We are a newly
              established 501(c)(3), so this page reports what we are doing and
              what we have scheduled — not outcomes we have not yet produced.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
              These are our own organizational announcements. They are not press
              coverage and are not published by any third-party outlet.
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
              Our blog goes deeper on how down payment assistance works and what
              our programs are designed to do, and our impact page sets out our
              Year One targets and how we will report results against them.
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
              Everything announced on this page depends on people who give, serve,
              or partner with us. Your support is what turns these commitments
              into families across Texas reaching homeownership.
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


