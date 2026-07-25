import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Donor Privacy Policy — FAITH Foundation",
  description:
    "FAITH Foundation's Donor Privacy Policy — we never sell, rent, or trade donor data. Learn what we collect, how we use it, and the choices you have.",
  alternates: { canonical: "/governance/donor-privacy" },
};

const SECTIONS = [
  {
    title: "Our commitment",
    body: [
      "FAITH Foundation respects the privacy of every donor and is committed to protecting the personal information you share with us. We never sell, rent, trade, or otherwise share our donors' personal information with any third party for their marketing purposes.",
      "This policy explains what information we collect, how we use it, how we protect it, and the choices you have. It applies to information collected through our website, by mail, by phone, and in person.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "When you make a donation or interact with us, we may collect contact information such as your name, mailing address, email address, and phone number, along with the details necessary to process and acknowledge your gift.",
      "Payment information used to process a donation is handled by our secure third-party payment processors. FAITH Foundation does not store complete payment card numbers on its own systems.",
      "We may also collect information you voluntarily provide when you subscribe to our newsletter, register for an event, apply for assistance, or contact us with a question.",
    ],
  },
  {
    title: "How we use your information",
    body: [
      "We use donor information only to process and acknowledge your gift, provide tax receipts, deliver the communications you have requested, keep you informed about the impact of your support, and comply with legal and reporting obligations.",
      "We may use your information to contact you about your gift or our mission. You can opt out of non-essential communications at any time, and we will honor your request promptly.",
    ],
  },
  {
    title: "We never sell, rent, or trade your information",
    body: [
      "FAITH Foundation will never sell, rent, lease, trade, or share your personal information with outside organizations for their own marketing or solicitation. Your trust is essential to our mission, and we treat your information as a confidence, not a commodity.",
      "We do not send donor mailing lists to other charities, and we do not participate in list-exchange programs.",
    ],
  },
  {
    title: "When we may share information",
    body: [
      "We share personal information only with trusted service providers who help us operate — such as payment processors, email and mailing services, and technology vendors — and only to the extent necessary to perform those services on our behalf. These providers are obligated to protect your information and may not use it for any other purpose.",
      "We may disclose information when required by law, to comply with a legal process, to protect the rights, safety, or property of FAITH Foundation or others, or in connection with required charitable reporting.",
    ],
  },
  {
    title: "How we protect your information",
    body: [
      "We maintain administrative, technical, and physical safeguards designed to protect donor information against unauthorized access, disclosure, alteration, or destruction. Access to personal information is limited to staff and volunteers who need it to carry out our charitable work.",
    ],
  },
  {
    title: "Your choices and rights",
    body: [
      "You may request to review, correct, or update the personal information we hold about you, and you may ask to be removed from our mailing or email lists at any time.",
      "To make any request regarding your information, contact us using the details below and we will respond promptly.",
    ],
  },
  {
    title: "Anonymous giving",
    body: [
      "If you prefer to give anonymously or to limit how we recognize your gift, let us know and we will honor your wishes to the fullest extent permitted by law.",
    ],
  },
  {
    title: "Contact us",
    body: [
      "If you have questions about this Donor Privacy Policy or how your information is handled, please contact FAITH Foundation at 209 Surecast Drive, Suite 105, Burnet, TX 78611, call 888-497-6620, or email info@faithfoundationsf.org.",
    ],
  },
];

export default function DonorPrivacyPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
              Donor Privacy
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Your trust, <span className="text-gold">protected</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              FAITH Foundation never sells, rents, or trades donor information.
              This policy explains what we collect, how we use it, and the choices
              you have over your personal information.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== POLICY BODY ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <Reveal key={section.title} delay={i % 2 === 0 ? 0 : 80}>
                <div className="card-surface pl-6">
                  <h2 className="text-2xl font-extrabold text-navy">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-lg leading-relaxed text-charcoal/80">
                    {section.body.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/governance"
                className="rounded-full bg-navy px-8 py-3.5 text-center text-base font-bold text-white transition-colors hover:bg-navy-light"
              >
                View Governance Policies
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-navy/20 px-8 py-3.5 text-center text-base font-bold text-navy transition-colors hover:border-gold hover:text-gold-dark"
              >
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
