import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events — FAITH Foundation",
  description:
    "Join FAITH Foundation at upcoming events across Central Texas — financial-literacy workshops, volunteer days, donor gatherings, and community fundraisers supporting affordable instruction and tenancy hope.",
};

const EVENTS = [
  {
    title: "Financial Literacy Workshop: Building a Budget That Sticks",
    date: "July 12, 2026",
    time: "10:00 AM – 12:00 PM",
    location: "FAITH Foundation Office, 209 Surecast Drive, Burnet, TX",
    type: "Workshop",
    description:
      "A free, hands-on workshop led by our financial-literacy coaches. Families will learn how to build a realistic monthly budget, prioritize housing costs, and start an emergency cushion. Open to everyone in the community — no registration fee required.",
  },
  {
    title: "Community Volunteer Day",
    date: "July 26, 2026",
    time: "9:00 AM – 1:00 PM",
    location: "Burnet Community Center, Burnet, TX",
    type: "Volunteer",
    description:
      "Spend a morning serving alongside our team. Volunteers will help assemble welcome kits for families moving into stable housing, organize donated supplies, and prepare materials for our tutoring programs. Lunch is provided for all who serve.",
  },
  {
    title: "Tenancy Hope Benefit Dinner",
    date: "August 15, 2026",
    time: "6:00 PM – 9:00 PM",
    location: "Hill Country Event Hall, Burnet, TX",
    type: "Fundraiser",
    description:
      "Our annual benefit dinner celebrates the families served this year and raises funds for housing vouchers. The evening includes dinner, stories from the families we serve, and a chance to learn how the Bright Box Homes partnership turns each home purchase into lasting community uplift.",
  },
  {
    title: "Homeownership Readiness Information Night",
    date: "September 9, 2026",
    time: "6:30 PM – 8:00 PM",
    location: "Virtual (online) and FAITH Foundation Office",
    type: "Information Session",
    description:
      "An informal evening for anyone curious about the path to homeownership. Our counselors will walk through credit preparation, saving for a down payment, and how the Bright Box Homes give-back model works. Bring your questions — no commitment required.",
  },
  {
    title: "Back-to-School Family Resource Fair",
    date: "September 27, 2026",
    time: "11:00 AM – 3:00 PM",
    location: "Burnet, TX (location to be announced)",
    type: "Community",
    description:
      "A free family event connecting neighbors with housing assistance, financial coaching, and local partner organizations. Families can meet our team, learn about our programs, and find out how to apply for support in a welcoming, no-pressure setting.",
  },
];

const TYPE_STYLES: Record<string, string> = {
  Workshop: "bg-gold/20 text-gold-dark",
  Volunteer: "bg-navy/10 text-navy",
  Fundraiser: "bg-gold/20 text-gold-dark",
  "Information Session": "bg-navy/10 text-navy",
  Community: "bg-gold/20 text-gold-dark",
};

export default function EventsPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Get Involved
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Upcoming <span className="text-gold">events</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Throughout the year, FAITH Foundation gathers neighbors, volunteers,
            and supporters across Central Texas for workshops, service days, and
            celebrations. Our events are where instruction and tenancy hope become
            tangible — a place to learn a new skill, lend a hand, or simply meet
            the families your generosity helps. Everyone is welcome, regardless of
            background or belief.
          </p>
        </div>
      </section>

      {/* Why attend */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why come to an event
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Connection is part of the mission
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              We believe stability is built in community, not in isolation. Our
              events bring together the people who make our work possible — the
              families learning to budget, the volunteers assembling welcome kits,
              the donors who turn a single home purchase into housing for a
              neighbor in need. When we gather, the mission stops being an
              abstraction and becomes a room full of real people pulling in the
              same direction.
            </p>
            <p>
              Whether you are facing a housing challenge of your own, looking for a
              meaningful way to serve, or considering a gift, there is an event
              for you. Workshops equip families with practical skills, service days
              channel generosity into hands-on help, and our benefit gatherings
              fund the vouchers that keep families housed. Each one is an open door.
            </p>
            <p>
              All of our events are free to attend unless otherwise noted, and our
              fundraisers exist to support the families we serve. If you have a
              question about an event, need accommodations, or want to volunteer to
              help run one, please reach out — a real person on our team will be
              glad to help you take the next step.
            </p>
          </div>
        </div>
      </section>

      {/* Events list */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-10 text-center text-3xl font-extrabold text-navy">
            Mark your calendar
          </h2>
          <ul className="space-y-6">
            {EVENTS.map((event) => (
              <li
                key={event.title}
                className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                      TYPE_STYLES[event.type] ?? "bg-navy/10 text-navy"
                    }`}
                  >
                    {event.type}
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

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Want to be part of it?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Sign up to volunteer at an upcoming event, or reach out to confirm
            details and reserve your spot. We would love to see you there.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/volunteer"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
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
