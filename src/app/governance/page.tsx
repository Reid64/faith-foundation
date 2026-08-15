import type { Metadata } from "next";
import Link from "next/link";
import BackgroundSwirls from "@/components/BackgroundSwirls";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Governance & Policies — FAITH Foundation",
  description:
    "FAITH Foundation's governance policies — conflict of interest, whistleblower, document retention, and gift acceptance — overseen by a lean, mission-driven board committed to keeping every dollar working for Texas families.",
  alternates: { canonical: "/governance" },
};

const BOARD = [
  { name: "Ron Landers", role: "President & Executive Director" },
  { name: "Pastor Juan Valdez", role: "Secretary" },
  { name: "Scott Ellis", role: "Treasurer / Board Chair" },
  { name: "Reid Whitesides", role: "Founder & Chief Strategy Officer" },
];

const POLICIES = [
  {
    id: "conflict-of-interest",
    title: "Conflict of Interest Policy",
    intro:
      "This policy protects FAITH Foundation's charitable interests when a transaction or arrangement might benefit the private interest of an officer, director, or key employee, or might result in impermissible private benefit.",
    points: [
      "Every director, officer, and member of a committee with governing-board-delegated powers is an \"interested person\" who must disclose, in writing, any actual or potential conflict of interest — including any financial interest in an entity or transaction with which FAITH Foundation does business.",
      "An interested person may make a presentation at a board or committee meeting, but after the presentation must leave the meeting during the discussion of, and the vote on, the transaction or arrangement giving rise to the conflict.",
      "The remaining board or committee members decide whether a conflict of interest exists and, if so, whether the proposed transaction is fair, reasonable, and in the organization's best interest. Where appropriate, the board investigates alternatives that would not give rise to a conflict.",
      "Any transaction between FAITH Foundation and a related business, vendor, or donor is governed by this policy. No officer, director, founder, or private individual may receive private benefit from such a transaction, and all resources are directed solely to FAITH Foundation's charitable purposes.",
      "The minutes of any meeting where a conflict is considered record the names of persons who disclosed or were found to have a conflict, the nature of the conflict, the board's decision, and the votes taken.",
      "Directors and officers annually sign a statement affirming they have received, read, understood, and agreed to comply with this policy, and that they will act in the best interest of the organization.",
    ],
  },
  {
    id: "whistleblower",
    title: "Whistleblower Policy",
    intro:
      "FAITH Foundation requires directors, officers, employees, and volunteers to observe high standards of business and personal ethics and encourages the reporting of suspected wrongdoing without fear of retaliation.",
    points: [
      "Anyone who in good faith reports a suspected violation of law, financial impropriety, or a breach of FAITH Foundation policy — including misuse of charitable assets — is protected from retaliation of any kind.",
      "Reports may be made confidentially to the Board Chair or Treasurer. Concerns about financial matters or the conduct of an officer may be directed to any board member, or in writing to FAITH Foundation, 209 Surecast Drive, Suite 105, Burnet, TX 78611.",
      "The organization will investigate all good-faith reports promptly and take appropriate corrective action. Reported concerns about accounting, internal controls, or auditing are referred to the Treasurer / Board Chair and, where warranted, an audit committee of the board.",
      "No director, officer, employee, or volunteer who in good faith reports a concern will suffer harassment, retaliation, or adverse employment or volunteer consequence. Anyone who retaliates against a good-faith reporter is subject to discipline, up to and including removal.",
      "An individual who knowingly makes a false or malicious report is not protected by this policy and may be subject to discipline.",
    ],
  },
  {
    id: "document-retention",
    title: "Document Retention & Destruction Policy",
    intro:
      "This policy governs the retention and destruction of documents received or created by FAITH Foundation in the course of its charitable operations and ensures records are preserved as required by law.",
    points: [
      "Corporate and governing records — articles of incorporation, bylaws, IRS determination letter, board and committee minutes, and conflict-of-interest disclosures — are retained permanently.",
      "Financial and tax records, including annual information returns (Form 990), audit reports, and general ledgers, are retained for a minimum of seven years.",
      "Donor and grant records, including gift documentation and acknowledgment letters, are retained for a minimum of seven years to support accurate reporting and receipting.",
      "Employment and volunteer records are retained for the period required by applicable federal and state law after the end of the relationship.",
      "No officer, director, employee, or volunteer will knowingly destroy, alter, or conceal a document with the intent to obstruct or influence any investigation, audit, or legal proceeding. Document destruction is suspended immediately upon notice of any actual or anticipated litigation or investigation.",
    ],
  },
  {
    id: "gift-acceptance",
    title: "Gift Acceptance Policy",
    intro:
      "FAITH Foundation is grateful for charitable gifts that advance its mission of helping families reach stable, affordable housing. This policy guides the acceptance of gifts so that they serve the charitable purpose and protect both the donor and the organization.",
    points: [
      "FAITH Foundation accepts unrestricted gifts, and gifts restricted to specific programs or purposes, provided the restriction is consistent with the organization's charitable mission and capabilities.",
      "Cash, checks, and electronic gifts are accepted. Gifts of securities, real property, or other non-cash assets may be accepted after review by the Treasurer and, where appropriate, the full board, considering any costs, liabilities, or restrictions involved.",
      "FAITH Foundation will not accept a gift that is inconsistent with its mission, that would jeopardize its tax-exempt status, that is too restrictive in purpose, or that would expose the organization to undue liability.",
      "No goods or services are provided in exchange for a charitable contribution unless clearly disclosed, and donors receive written acknowledgment consistent with IRS substantiation requirements.",
      "Charitable assistance is awarded to applicants based on charitable eligibility, housing need, income, readiness, and program criteria — never for the private benefit of any officer, director, insider, or outside company.",
      "The organization protects donor privacy and never sells, rents, or trades donor information. See our Donor Privacy Policy for details.",
    ],
  },
];

export default function GovernancePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
              Governance &amp; Accountability
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Governed with <span className="text-gold">integrity</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Strong governance is how a charitable organization keeps faith with
              the families it serves and the donors who make its work possible.
              Below are the core policies that govern FAITH Foundation and the
              board that oversees our 501(c)(3) mission.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== BOARD ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-green-dark">
              Board of Directors
            </h2>
            <h3 className="heading-underline-center mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              Mission-driven leadership, accountable oversight
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-charcoal/80">
              FAITH Foundation is governed by a lean board of directors that
              sets policy, oversees finances, and ensures every decision advances
              our charitable mission. Gifts designated for a program are used for
              that program, and administration is funded through separately
              designated operational support — a separation the board maintains
              deliberately so donors always know which they are giving to.
            </p>
          </Reveal>
          <ul className="mt-14 grid gap-8 sm:grid-cols-3">
            {BOARD.map((member, i) => (
              <Reveal
                as="li"
                key={member.name}
                delay={i * 100}
                className="card-surface rounded-3xl p-8 text-center"
              >
                <p className="text-xl font-extrabold text-navy">{member.name}</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
                  {member.role}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== POLICIES ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f0ede4]">
        <BackgroundSwirls variant="bottom-right" />
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7C59]">
              Our Policies
            </h2>
            <h3 className="heading-underline-center mt-3 text-3xl font-extrabold text-navy sm:text-4xl">
              The standards that govern our work
            </h3>
          </Reveal>

          <div className="mt-16 space-y-14">
            {POLICIES.map((policy, i) => (
              <Reveal key={policy.id} delay={i % 2 === 0 ? 0 : 100}>
                <article
                  id={policy.id}
                  className="card-surface scroll-mt-28 rounded-3xl p-8 sm:p-10"
                >
                  <h4 className="text-2xl font-extrabold text-navy">
                    {policy.title}
                  </h4>
                  <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
                    {policy.intro}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {policy.points.map((point, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold"
                        />
                        <span className="text-base leading-relaxed text-charcoal/80">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-14 rounded-3xl bg-navy px-8 py-8 text-center text-base leading-relaxed text-white/85">
              These policies are available in full on request. To request a copy,
              or to raise a governance concern, contact our office at 209 Surecast
              Drive, Suite 105, Burnet, TX 78611, or call{" "}
              <a href="tel:+18884976620" className="font-semibold text-gold hover:underline">
                888-497-6620
              </a>
              . For how we protect the information you share, see our{" "}
              <Link href="/governance/donor-privacy" className="font-semibold text-gold hover:underline">
                Donor Privacy Policy
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Transparency you can verify
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Read how we steward every gift, and see the programs your generosity
              makes possible for families across Texas.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/financial-transparency"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                Financial Transparency
              </Link>
              <Link
                href="/programs"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Explore Our Programs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
