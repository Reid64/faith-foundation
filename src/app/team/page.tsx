import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Team — FAITH Foundation",
  description:
    "Meet the board and leadership of FAITH Foundation — Pastor Juan Valdez, Secretary & Protector; Scott Ellis, Treasurer & Board Chair; and Reid Whitesides, Founder & Executive Director — helping families across Texas achieve homeownership.",
};

const BOARD = [
  {
    name: "Reid Whitesides",
    role: "Founder & President",
    initials: "RW",
    photo: "/Images/team/reid-whitesides.jpg",
    bio: [
      "Reid Whitesides is the Founder and President of The Faith Foundation, an organization dedicated to helping individuals experiencing homelessness, recovery, and reentry build stable, self-sufficient futures through affordable housing, education, and supportive opportunities.",
      "With more than 20 years of experience in construction, roofing, project management, housing-related industries, sales, and consulting, Reid brings practical expertise and real-world insight to the Foundation\u0027s mission of creating sustainable pathways to stability and independence. He also has a passion for technology and spends much of his spare time developing websites, software applications, and automation tools that support nonprofit, housing, and community-focused initiatives.",
      "His commitment to this work is deeply personal. During a prolonged struggle with addiction, Reid spent nearly twenty years incarcerated in the State of Texas. Those experiences gave him firsthand insight into the barriers many individuals face when attempting to rebuild their lives after addiction, incarceration, and homelessness. Today, he has been sober for more than fifteen years and remains committed to helping others overcome similar challenges and create lasting change.",
      "Reid credits his Christian faith and God\u0027s transformative work in his life as the foundation of his recovery, purpose, and leadership. He believes that stable housing is often the first step toward restoring hope, rebuilding lives, and creating opportunities for long-term success. His vision for the Foundation is rooted in the conviction that every person deserves the opportunity to move beyond their circumstances and build a better future.",
    ],
  },
  {
    name: "Pastor Juan Valdez",
    role: "Secretary & Protector",
    initials: "JV",
    photo: "/Images/team/pastor-juan-valdez.jpg",
    bio: [
      "Pastor Juan Valdez serves as Secretary and Protector of the Faith Foundation, providing spiritual oversight, governance accountability, and mission stewardship for the organization. With more than 40 years of Christian faith and nearly 30 years of ordained ministry experience, Pastor Valdez offers a lifetime of leadership grounded in biblical principles, service, and integrity.",
      "His ministry has extended across the United States, South America, Central America, the Caribbean, and Africa, where he has taught, preached, and supported faith-based outreach initiatives. Known for his wisdom, humility, and commitment to discipleship, Pastor Valdez has dedicated his life to helping individuals and families discover hope, purpose, and restoration through faith.",
      "Beyond ministry, Pastor Valdez and his wife, Martha, demonstrated an extraordinary commitment to their community through business ownership, operating a successful hair studio in the same San Antonio location for 34 years. Such longevity reflects the consistency, reliability, and stewardship that have characterized both his professional and ministry endeavors throughout his life.",
      "Pastor Valdez currently serves as an Associate Pastor at Temple of Praise and resides in Texas with his wife, Martha. Together they have built a legacy of faith that spans generations, including three daughters, six grandchildren, and two great-grandchildren.",
    ],
  },
  {
    name: "Scott Ellis",
    role: "Treasurer & Board Chair",
    initials: "SE",
    photo: "/Images/team/scott-ellis.jpg",
    bio: [
      "Scott Ellis serves as Treasurer and Board Chair of the Faith Foundation, providing financial oversight, strategic guidance, and leadership in support of the Foundation\u0027s mission to expand affordable housing opportunities and strengthen communities through faith-based service.",
      "Scott is the owner of E4 Roofing and Construction, a Georgetown, Texas-based company he has successfully led for more than 15 years. His experience as a business owner provides the Foundation with valuable expertise in financial management, operations, project coordination, and organizational leadership. He also brings extensive construction and housing industry knowledge that helps support the Foundation\u0027s affordable housing initiatives.",
      "A longtime Georgetown resident of more than 24 years, Scott and his wife, Christy, have been married for 37 years and have raised two daughters together. Scott and Christy are active members of their local church, where they serve through ministry, fellowship, and community engagement. Scott has also participated in mission work in Mexico, demonstrating a commitment to serving others both locally and abroad.",
    ],
  },
];

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
      <section className="bg-cream bg-texture py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-dark">
              Board of Directors
            </h2>
            <p className="mt-4 text-3xl font-extrabold text-navy sm:text-4xl">
              Leadership &amp; Board
            </p>
          </Reveal>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {BOARD.map((member, i) => (
              <Reveal
                key={member.name}
                delay={i * 120}
                as="article"
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card-lg ring-1 ring-navy/5"
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
                    <span
                      aria-hidden
                      className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-lg font-extrabold text-navy shadow-card"
                    >
                      {member.initials}
                    </span>
                    <h3 className="text-2xl font-extrabold text-white">
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
            ))}
          </div>
        </div>
      </section>

      {/* ===== VALUES STRIP — join us ===== */}
      <section className="bg-navy py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gold">
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
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light"
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









