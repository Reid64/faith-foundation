import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BackgroundSwirls from "@/components/BackgroundSwirls";
import { img } from "@/lib/images";
import { BOARD } from "@/lib/board";

export const metadata: Metadata = {
  title: "Our Team — FAITH Foundation",
  description:
    "Meet FAITH Foundation's board — Pastor Juan Valdez, Scott Ellis, and Reid Whitesides — leading our mission to help Texas families reach homeownership.",
  alternates: { canonical: "/team" },
};

const VALUES = [
  {
    letter: "F",
    title: "Foundation",
    body: "We are the financial foundation beneath a family's first home — closing the down payment gap that keeps ownership out of reach.",
  },
  {
    letter: "A",
    title: "Affordable",
    body: "We keep the path to ownership affordable, directing assistance where it removes the single biggest barrier to buying a home.",
  },
  {
    letter: "I",
    title: "Instruction",
    body: "We pair every voucher with homebuyer instruction so families buy with confidence and keep their homes for good.",
  },
  {
    letter: "T",
    title: "Tenancy",
    body: "We protect housing stability and tenancy today so a setback never derails a family's road to ownership.",
  },
  {
    letter: "H",
    title: "Hope",
    body: "Hope is the heartbeat of our work — we turn the hope of a home of one's own into keys in hand.",
  },
];

export default function TeamPage() {
  return (
    <>
      {/* ===== HERO — dark photo + overlay ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy text-white">
        <img
          src={img("teamMeeting", 2000)}
          alt="The FAITH Foundation leadership team meeting together"
          className="absolute inset-0 h-full w-full animate-slow-zoom object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-green-deep/40" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40 sm:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
                Our Team
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                The people behind <span className="text-gold">the mission</span>
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                FAITH Foundation is led by a dedicated board committed to helping
                families across Texas achieve homeownership with faith,
                accountability, and hope. Meet the leaders who make our work
                possible.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== LEADERSHIP DIRECTORY — photo cards ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8] py-24 sm:py-32">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Board of Directors
            </h2>
            <p className="heading-underline-center mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Leadership &amp; Board
            </p>
          </Reveal>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {BOARD.map((member, i) => {
              /* With an odd number of directors the last card would otherwise
                 sit in the left column with an empty half beside it — a hole
                 sitting exactly where a departed director's card used to be.
                 Centring it keeps the grid reading as deliberate at any roster
                 size. `gap-10` is 2.5rem, so half the gap is 1.25rem and the
                 centred card matches a normal column's width exactly. */
              const orphan = BOARD.length % 2 === 1 && i === BOARD.length - 1;
              return (
              <Reveal
                key={member.name}
                delay={i * 120}
                as="article"
                className={`card-team flex h-full flex-col overflow-hidden rounded-3xl${
                  orphan ? " lg:col-span-2 lg:mx-auto lg:w-[calc(50%-1.25rem)]" : ""
                }`}
              >
                <div className="relative h-96 overflow-hidden sm:h-[28rem]">
                  <img
                    src={member.photo}
                    alt={`${member.name}, ${member.role} at FAITH Foundation`}
                    className="h-full w-full object-contain bg-[#1B2A4A]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <h3 className="text-2xl font-extrabold text-gold-light">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-gold">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-8 text-base leading-relaxed text-charcoal/80 sm:p-10">
                  {member.bio.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== VALUES STRIP — join us ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
              What Guides Us
            </h2>
            <p className="mt-4 text-3xl font-extrabold sm:text-4xl">
              The values our team lives by
            </p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Foundation, Affordable, Instruction, Tenancy, and Hope — the five
              principles of the Foundation for Affordable Instruction and Tenancy
              Hope that give our Foundation its name and shape every decision our
              team makes.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {VALUES.map((value, i) => (
              <Reveal
                key={value.title}
                delay={i * 100}
                as="div"
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-card backdrop-blur"
              >
                <span
                  aria-hidden
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green text-2xl font-extrabold text-white shadow-green"
                >
                  {value.letter}
                </span>
                <h3 className="mt-4 text-lg font-bold text-green-light">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-snug text-white/75">
                  {value.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />
      <section className="bg-navy-dark py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Stand with our team
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Your generosity gives our team the resources to close the down
              payment gap and put families into homes of their own across Texas.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/donate"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                Donate Now
              </Link>
              <Link
                href="/about"
                className="rounded-full border-2 border-green px-8 py-3.5 text-base font-bold text-green-light transition-colors hover:bg-green hover:text-white"
              >
                Learn About Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
