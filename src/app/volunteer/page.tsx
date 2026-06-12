import type { Metadata } from "next";
import VolunteerForm from "./VolunteerForm";

export const metadata: Metadata = {
  title: "Volunteer — FAITH Foundation",
  description:
    "Volunteer with FAITH Foundation in Burnet, Texas. Tutor financial literacy, coach tenancy skills, support events, or serve as a community ambassador. Sign up to give your time and talents.",
};

const OPPORTUNITIES = [
  {
    title: "Financial-Literacy Tutor",
    commitment: "2–4 hours / month",
    body: "Share practical money skills — budgeting, saving, credit, and planning — with families working toward stability. No finance degree required, just patience and a willingness to teach what you know.",
  },
  {
    title: "Tenancy & Life-Skills Coach",
    commitment: "Flexible",
    body: "Walk alongside a household navigating leases, landlord relationships, and the day-to-day skills of keeping a stable home. You provide encouragement and accountability through the hard seasons.",
  },
  {
    title: "Event & Fundraising Volunteer",
    commitment: "Seasonal",
    body: "Help plan and staff the community events and campaigns that fund our housing vouchers. From setup to greeting guests, your energy keeps our fundraising mission moving forward.",
  },
  {
    title: "Office & Administrative Helper",
    commitment: "Weekly or monthly",
    body: "Lend a hand with data entry, mailings, scheduling, and the behind-the-scenes work that keeps a lean nonprofit running. Detail-oriented helpers make an outsized difference.",
  },
  {
    title: "Community Ambassador",
    commitment: "As available",
    body: "Be the face of FAITH Foundation in your circles — churches, workplaces, and neighborhoods. Spread the word about our mission and connect families in need with the help we offer.",
  },
  {
    title: "Skilled Professional",
    commitment: "Project-based",
    body: "Offer pro-bono expertise in law, accounting, marketing, construction, or counseling. Your professional skills extend our reach far beyond what our budget alone could ever fund.",
  },
];

export default function VolunteerPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Give Your Time
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Volunteer with <span className="text-gold">FAITH</span> Foundation
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Generosity is not measured only in dollars. Some of the most
            powerful gifts our neighbors receive are an hour of your time, a
            lesson well taught, and the assurance that someone in the community
            is walking alongside them.
          </p>
        </div>
      </section>

      {/* Why volunteer */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            Why Volunteer
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            Your time changes trajectories
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              At FAITH Foundation, volunteers are not an afterthought — they are
              the heartbeat of our mission. Every family we serve is supported
              not just by a voucher or a workshop, but by real people who choose
              to show up, teach a skill, and offer encouragement when it is
              needed most. When you volunteer, you become part of a community
              that refuses to let a neighbor fall through the cracks.
            </p>
            <p>
              You do not need special qualifications to make a difference. Our
              opportunities range from teaching practical budgeting skills to
              greeting guests at a fundraiser, from lending administrative
              support to offering professional expertise. Whatever your gifts,
              there is a place for you here. We provide orientation and ongoing
              support so that every volunteer feels equipped, confident, and
              valued in their role.
            </p>
            <p>
              The impact runs both ways. Volunteers consistently tell us that
              serving with FAITH Foundation gives them purpose, connection, and a
              front-row seat to transformation — watching a family move from
              crisis to confidence, from uncertainty to a stable home. Give a
              little of your time, and you may find it changes your own life as
              much as it changes someone else&apos;s.
            </p>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Volunteer Opportunities
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Find the role that fits you
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              From hands-on coaching to behind-the-scenes support, there is a way
              for everyone to serve. Explore the opportunities below and tell us
              where you would like to help.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OPPORTUNITIES.map((opp) => (
              <li
                key={opp.title}
                className="flex flex-col rounded-lg border-t-4 border-gold bg-white p-6 shadow-sm"
              >
                <h4 className="text-lg font-bold text-navy">{opp.title}</h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gold-dark">
                  {opp.commitment}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/80">
                  {opp.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Signup */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Sign Up to Volunteer
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Ready to get started?
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Fill out the form below and our volunteer coordinator will be in
              touch to match you with an opportunity that fits your interests and
              schedule.
            </p>
          </div>
          <VolunteerForm />
        </div>
      </section>
    </>
  );
}
