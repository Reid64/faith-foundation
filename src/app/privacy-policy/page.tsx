import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — FAITH Foundation",
  description:
    "How FAITH Foundation collects, uses, and protects your personal information, including your rights under the GDPR and the California Consumer Privacy Act (CCPA/CPRA). A 501(c)(3) nonprofit in Burnet, Texas.",
};

const SECTIONS = [
  {
    id: "information-we-collect",
    heading: "1. Information We Collect",
    body: [
      "FAITH Foundation (“we,” “us,” or “our”) collects only the information needed to serve families, process donations, and respond to inquiries. When you contact us, apply for housing assistance, sign up to volunteer, or make a donation, you may provide personal information such as your name, email address, phone number, mailing address, household details relevant to an assistance application, and any message you choose to send. When you simply browse our website, we may automatically collect limited technical information such as your IP address, browser type, and the pages you visit, through standard server logs and analytics.",
      "We do not knowingly collect personal information from children under the age of 13. If you believe a child has provided us with personal information, please contact us so we can remove it.",
    ],
  },
  {
    id: "how-we-use",
    heading: "2. How We Use Your Information",
    body: [
      "We use the information you provide to deliver our programs and to operate as a transparent, accountable nonprofit. Specifically, we use it to review and respond to housing-assistance applications, coordinate volunteer opportunities, process and acknowledge donations, send tax receipts, answer questions you send us, and keep you informed about our work when you have asked to hear from us.",
      "We use limited technical and analytics data to understand how visitors use our site so we can improve its content and accessibility. We do not sell your personal information, and we do not share it for the purpose of targeted advertising.",
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
      "Our website may use cookies and similar technologies to remember your preferences and to gather aggregate, anonymous statistics about how the site is used. You can set your browser to refuse cookies or to alert you when cookies are being sent; some parts of the site may not function as intended if you disable them. Any analytics we use is configured to respect your privacy and is not used to build advertising profiles.",
    ],
  },
  {
    id: "sharing",
    heading: "7. How We Share Information",
    body: [
      "We share personal information only as necessary to operate our programs and only with service providers bound to protect it — for example, a payment processor that handles a donation or an email provider that delivers a receipt. We may also disclose information when required by law or to protect the rights, safety, and property of FAITH Foundation, the families we serve, or the public. We never sell your personal information.",
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
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Your Privacy
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            FAITH Foundation respects your privacy and is committed to protecting
            the personal information you share with us. This policy explains what
            we collect, how we use it, and the rights you have under the GDPR and
            the California Consumer Privacy Act (CCPA/CPRA).
          </p>
        </div>
      </section>

      {/* Policy body */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="mb-10 text-sm font-medium text-foreground/60">
            Last updated: June 12, 2026
          </p>
          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id}>
                <h2 className="mb-4 text-2xl font-extrabold text-navy">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-foreground/80">
                  {section.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">
            Questions about your privacy?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Our team is happy to explain how we handle your information or to help
            you exercise your data rights.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Contact Us
            </Link>
            <Link
              href="/financial-transparency"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Financial Transparency
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
