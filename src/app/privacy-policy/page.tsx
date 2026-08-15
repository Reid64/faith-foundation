import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy — FAITH Foundation",
  description:
    "How FAITH Foundation collects, uses, and protects your personal information, including your rights under GDPR and the CCPA/CPRA. A Texas 501(c)(3).",
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS = [
  {
    id: "information-we-collect",
    heading: "1. Information We Collect",
    body: [
      "FAITH Foundation (“we,” “us,” or “our”) collects only the information needed to serve families, process donations, and respond to inquiries. When you contact us, apply for housing assistance, sign up to volunteer, or subscribe to our newsletter, you provide personal information such as your name, email address, phone number, and any message you choose to send. Our housing assistance application additionally asks for household details you choose to share — household size, number of children, approximate monthly household income, employment status, and your current housing situation — because we cannot assess an application without them.",
      "When you browse this website, our hosting provider records standard server log information such as your IP address, browser type, and the pages requested. We do not run any first-party analytics, advertising, or tracking service on this site, and this site sets no cookies of its own.",
      "We do not knowingly collect personal information from children under the age of 13. If you believe a child has provided us with personal information, please contact us so we can remove it.",
    ],
  },
  {
    id: "how-we-use",
    heading: "2. How We Use Your Information",
    body: [
      "We use the information you provide to deliver our programs and to operate as a transparent, accountable nonprofit. Specifically, we use it to review and respond to housing-assistance applications, coordinate volunteer opportunities, process and acknowledge donations, send tax receipts, answer questions you send us, and keep you informed about our work when you have asked to hear from us.",
      "We use server log data only to keep the site running securely and reliably. We do not sell your personal information, we do not share it for the purpose of targeted advertising, and we do not use it to build advertising profiles.",
    ],
  },
  {
    id: "legal-bases",
    heading: "3. Legal Bases for Processing (GDPR)",
    body: [
      "If you are located in the European Economic Area or the United Kingdom, we process your personal data only when we have a lawful basis to do so. Those bases include your consent (for example, when you opt in to receive updates), the performance of a request you have made (such as reviewing an assistance application you submitted), compliance with a legal obligation (such as maintaining donation records), and our legitimate interests in operating and improving our charitable mission in a way that does not override your rights.",
    ],
  },
  {
    id: "your-rights-gdpr",
    heading: "4. Your Rights Under the GDPR",
    body: [
      "If the GDPR applies to you, you have the right to access the personal data we hold about you, to request correction of inaccurate data, to request erasure of your data, to restrict or object to certain processing, to request data portability, and to withdraw consent at any time without affecting processing that already took place. You also have the right to lodge a complaint with your local data-protection authority. To exercise any of these rights, contact us using the details below and we will respond within the timeframes required by law.",
    ],
  },
  {
    id: "your-rights-ccpa",
    heading: "5. Your Rights Under the CCPA/CPRA (California)",
    body: [
      "If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act, gives you the right to know what personal information we collect and how we use it, the right to request deletion of your personal information, the right to correct inaccurate information, and the right not to be discriminated against for exercising these rights. FAITH Foundation does not sell or share your personal information as those terms are defined under California law. To submit a request, contact us using the information below; we will verify your request and respond as required.",
    ],
  },
  {
    id: "cookies",
    heading: "6. Cookies and Analytics",
    body: [
      "This website sets no cookies of its own and runs no first-party analytics or advertising technology. We deliberately kept it that way.",
      "Two pages embed content from other companies, and those embeds may set their own cookies once they load. Our Contact page embeds a Google Maps frame showing our office location, and our Donate page embeds a Zeffy donation form, which in turn loads its own payment and anti-fraud providers. Those embeds are governed by the privacy policies of Google and Zeffy respectively, not by this one. The Zeffy form is not loaded until you scroll to it or choose to open it, so simply visiting the Donate page does not hand your information to a payment provider. You can also set your browser to refuse cookies.",
    ],
  },
  {
    id: "sharing",
    heading: "7. How We Share Information and Who Processes It",
    body: [
      "We share personal information only as necessary to operate our programs, and only with service providers that need it to perform a function for us. We never sell your personal information.",
      "The specific providers involved in running this website are: Vercel, which hosts the site and records standard server logs; Formsubmit, which receives the contents of our contact, volunteer, housing-assistance, and newsletter forms and relays them by email to info@faithfoundationsf.org; Zeffy, which processes online donations and works with its own payment providers to do so; and Google, which serves the map embedded on our Contact page. Anything you type into a form on this site therefore passes through Formsubmit before it reaches us — including the household and income details on a housing-assistance application. If you would prefer not to use the online form for a sensitive application, call us at 888-497-6620 or write to us at the address below and we will take your information directly.",
      "We may also disclose information when required by law or to protect the rights, safety, and property of FAITH Foundation, the families we serve, or the public.",
    ],
  },
  {
    id: "retention-security",
    heading: "8. Data Retention and Security",
    body: [
      "We keep personal information only for as long as needed to fulfill the purposes described in this policy or to meet legal, accounting, and reporting requirements, after which we securely delete or anonymize it. We use reasonable administrative, technical, and physical safeguards to protect your information against loss, misuse, and unauthorized access. No method of transmission over the internet is completely secure, so while we work to protect your data, we cannot guarantee absolute security.",
    ],
  },
  {
    id: "changes-contact",
    heading: "9. Changes to This Policy and How to Contact Us",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or the law. When we do, we will revise the “last updated” date below. Your continued use of our website after an update means you accept the revised policy.",
      "If you have any questions about this policy or wish to exercise your privacy rights, please contact FAITH Foundation at 209 Surecast Drive, Suite 105, Burnet, TX 78611, by phone at 888-497-6620, or by email at info@faithfoundationsf.org.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* ===== HERO — dark navy with last-updated badge ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-dark" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              Your Privacy
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              FAITH Foundation respects your privacy and is committed to protecting
              the personal information you share with us. This policy explains what
              we collect, how we use it, and the rights you have under the GDPR and
              the California Consumer Privacy Act (CCPA/CPRA).
            </p>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold" aria-hidden />
              Last updated: June 12, 2026
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== LEGAL DOC + SECTION NAV ===== */}
      <section className="bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
            {/* Sticky section nav */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <nav aria-label="Privacy policy sections">
                <p className="mb-4 text-sm font-bold uppercase tracking-widest text-green-dark">
                  On this page
                </p>
                <ul className="space-y-1 border-l border-navy/10">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="-ml-px block border-l-2 border-transparent py-2 pl-4 text-sm font-medium leading-snug text-charcoal/70 transition-colors hover:border-green hover:text-navy"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Prose sections */}
            <div className="min-w-0">
              <div className="space-y-12">
                {SECTIONS.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                  >
                    <Reveal className="card-surface rounded-3xl p-8 sm:p-10">
                      <h2 className="mb-5 text-2xl font-extrabold text-navy">
                        {section.heading}
                      </h2>
                      <div className="space-y-4 text-lg leading-relaxed text-charcoal/80">
                        {section.body.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </Reveal>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== CTA ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Questions about your privacy?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Our team is happy to explain how we handle your information or to help
              you exercise your data rights.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-green px-8 py-3.5 text-base font-bold text-white shadow-green transition-colors hover:bg-green-dark"
              >
                Contact Us
              </Link>
              <Link
                href="/financial-transparency"
                className="rounded-full border-2 border-gold px-8 py-3.5 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Financial Transparency
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


