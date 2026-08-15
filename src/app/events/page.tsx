import type { Metadata } from "next";
import Link from "next/link";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Events — FAITH Foundation",
  description:
    "Confirmed upcoming events from FAITH Foundation — a volunteer orientation on Zoom and the publication of our first annual impact summary.",
  alternates: { canonical: "/events" },
};

const EVENTS = [
  {
    date: "October 11, 2026",
    time: "Time TBD",
    category: "Volunteer",
    title: "Volunteer Orientation — Zoom",
    location: "Online (Zoom)",
    description:
      "Join us for our first volunteer orientation on Zoom. This session covers our mission, the families we serve, and the many ways to get involved — from coaching tenancy and life skills to helping families navigate the path to homeownership. No special experience required, only a willingness to serve. Sign up through our volunteer page and we will send you the Zoom link and details ahead of the event.",
  },
  {
    date: "November 24, 2026",
    time: "Online",
    category: "Transparency",
    title: "Annual Impact Summary Published",
    location: "faithfoundationsf.org",
    description:
      "FAITH Foundation publishes its first annual impact summary — a plain-language account of families served, down payment assistance vouchers distributed, and how every category of giving was put to work. Available on our impact and financial-transparency pages the moment it is published.",
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  Volunteer: "bg-navy/10 text-navy",
  Transparency: "bg-gold/20 text-gold-dark",
};

export default function EventsPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("communityGathering", 2000)}
          alt="Community members gathering together at a FAITH Foundation event"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy-light/80" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Get Involved
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Upcoming <span className="text-gold">events</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation is a young organization, and our calendar is just
            beginning. Below are the gatherings we have confirmed so far — an
            open invitation to learn about the mission, lend a hand, or see
            exactly how your generosity is put to work. More will be announced
            here as our programs grow. Everyone is welcome, regardless of
            background or belief.
          </p>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* Why attend */}
      <section className="bg-gradient-to-b from-white to-[#f0ede4]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
            Why come to an event
          </h2>
          <h3 className="heading-underline mb-6 text-3xl font-extrabold text-navy">
            Connection is part of the mission
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              We believe stability is built in community, not in isolation. When
              we gather, the mission stops being an abstraction and becomes a
              room full of real people pulling in the same direction — the
              families working toward stable housing, the volunteers who serve
              alongside them, and the donors whose generosity makes the work
              possible.
            </p>
            <p>
              We are early in our story. Rather than fill a calendar for the sake
              of appearances, we would rather host a small number of gatherings
              we can do well and stand behind. Every event listed on this page is
              confirmed, and as our programs grow we will announce new ones here
              first.
            </p>
            <p>
              Our events are free to attend unless otherwise noted. If you have a
              question, need accommodations, or want to help us run a future
              gathering, please reach out — a real person on our team will be
              glad to help you take the next step.
            </p>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* Events list */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="heading-underline-center mb-10 text-center text-3xl font-extrabold text-navy">
            Confirmed events
          </h2>
          <ul className="space-y-6">
            {EVENTS.map((event) => (
              <li
                key={event.title}
                className="card-surface rounded-lg p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                      CATEGORY_STYLES[event.category] ?? "bg-navy/10 text-navy"
                    }`}
                  >
                    {event.category}
                  </span>
                  <span className="text-sm font-semibold text-foreground/70">
                    {event.date} • {event.time}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-navy">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-foreground/60">
                  {event.location}
                </p>
                <p className="mt-4 text-lg leading-relaxed text-foreground/80">
                  {event.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Want to be part of it?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Sign up to volunteer, or reach out with a question about an upcoming
            event. We would love to see you there.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/volunteer"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light hover:shadow-xl ring-2 ring-[#C8A951]/30"
            >
              Volunteer With Us
            </Link>
            <Link
              href="/contact"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
