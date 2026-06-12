import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — FAITH Foundation",
  description:
    "Answers to common questions about FAITH Foundation — who we serve, how housing vouchers and the Bright Box Homes partnership work, eligibility, donations, tax-deductibility, and how to volunteer in Central Texas.",
};

const FAQS = [
  {
    question: "What is FAITH Foundation?",
    answer:
      "FAITH Foundation is a 501(c)(3) nonprofit organization based in Burnet, Texas. Our name stands for Foundation for Affordable Instruction and Tenancy Hope, and we strengthen families across Central Texas by removing the barriers between people and two essentials of a dignified life: quality instruction and stable, affordable housing.",
  },
  {
    question: "What does the name FAITH stand for?",
    answer:
      "FAITH is an acronym for our five core values: Faith, Accountability, Instruction, Tenacity, and Hope. Each value guides how we serve, from how we steward donations to how we walk alongside families through setbacks.",
  },
  {
    question: "Who does FAITH Foundation serve?",
    answer:
      "We serve families and individuals across Burnet and the surrounding Central Texas Hill Country who are facing housing instability or who need instruction to build a more stable future. Our programs reach veterans, single parents, people in recovery, individuals reentering the community after incarceration, and families facing a housing emergency.",
  },
  {
    question: "How does the Bright Box Homes partnership work?",
    answer:
      "Through our partnership with Bright Box Homes, every home purchased generates a $2,500 donation to FAITH Foundation at no extra cost to the buyer. We convert that gift into housing vouchers for families in need. It is a renewable cycle: one family putting down roots helps another family keep their home.",
  },
  {
    question: "What is a housing voucher and how do I qualify?",
    answer:
      "A housing voucher is direct financial assistance that helps a family secure or maintain stable housing — for example, covering a security deposit, move-in costs, or short-term rental help. Eligibility generally requires that you live in Central Texas, demonstrate a housing need, and partner with our case-management process. Specific criteria vary by program; apply or contact us to review your situation.",
  },
  {
    question: "How do I apply for housing assistance?",
    answer:
      "You can apply directly through our Apply for Housing Assistance page, which walks you through a short multi-step application covering your information, household, and current housing situation. If you are facing an urgent housing crisis, contact us right away and a real person will help you understand your options.",
  },
  {
    question: "Is there a cost to receive help from FAITH Foundation?",
    answer:
      "No. Our programs and assistance are provided free of charge to the families we serve. We are funded by donations, the Bright Box Homes partnership, and the generosity of our community.",
  },
  {
    question: "Do I have to share your faith to receive help?",
    answer:
      "No. While FAITH Foundation is grounded in Christian conviction, our doors and programs are open to families of every background, belief, and circumstance, without condition or preference. We simply ask to be allowed to express our faith through the way we serve.",
  },
  {
    question: "What educational or instruction programs do you offer?",
    answer:
      "Our instruction programs include financial literacy — budgeting, credit repair, and debt management — along with homeownership counseling, tenancy coaching, and life-skills support. We believe education opens doors that stay open, so instruction is woven through everything we do.",
  },
  {
    question: "Are donations to FAITH Foundation tax-deductible?",
    answer:
      "Yes. FAITH Foundation is a registered 501(c)(3) tax-exempt nonprofit, so donations are tax-deductible to the fullest extent allowed by law. We provide receipts for your records and steward every gift with transparency.",
  },
  {
    question: "How is my donation used?",
    answer:
      "Donations fund housing vouchers, emergency rental and deposit assistance, and our instruction programs. We direct gifts toward measurable, local impact and report our outcomes openly, because accountability is one of our core values.",
  },
  {
    question: "Can I donate by mail or do I have to give online?",
    answer:
      "You can do either. Online giving is available on our Donate page, and you are also welcome to mail a check to FAITH Foundation at 209 Surecast Drive, Suite 105, Burnet, TX 78611. Call us at 888-497-6620 if you have questions about a gift.",
  },
  {
    question: "How can I volunteer with FAITH Foundation?",
    answer:
      "We welcome volunteers as financial-literacy tutors, tenancy coaches, event and fundraising helpers, office and administrative support, community ambassadors, and skilled professionals. Visit our Volunteer page to see opportunities and sign up; we will match you with a role that fits your time and gifts.",
  },
  {
    question: "Where is FAITH Foundation located and what are your hours?",
    answer:
      "Our office is at 209 Surecast Drive, Suite 105, Burnet, TX 78611. We are open Monday through Friday, 9:00 AM to 5:00 PM Central, with evenings and weekends available by appointment. You can reach us by phone at 888-497-6620 or by email at info@faithfoundationsf.org.",
  },
  {
    question: "How can my business or church partner with FAITH Foundation?",
    answer:
      "We love partnering with businesses, churches, and community organizations — from the Bright Box Homes give-back model to event sponsorships and volunteer teams. Reach out through our Contact page and we will explore a partnership that fits your goals and multiplies impact for families in need.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      {/* JSON-LD FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Frequently Asked Questions
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Answers to your <span className="text-gold">questions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Whether you are seeking housing assistance, considering a gift, or
            hoping to volunteer, you probably have questions — and we want to make
            the answers easy to find. Below are the questions we hear most often
            about who we are, how our programs work, and how you can get involved.
            If you do not see your question here, reach out and a real person will
            help.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <dl className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-lg border border-foreground/10 bg-white shadow-sm"
              >
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold text-navy transition-colors hover:bg-gold/10 [&::-webkit-details-marker]:hidden">
                    <dt>{faq.question}</dt>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-bold text-gold transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <dd className="border-t border-foreground/10 px-6 py-5 text-lg leading-relaxed text-foreground/80">
                    {faq.answer}
                  </dd>
                </details>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold">Still have questions?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Our team is here to help — no phone trees, no run-around. Reach out
            and a real person will respond.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Contact Us
            </Link>
            <Link
              href="/apply"
              className="rounded-md border-2 border-gold px-8 py-3 text-base font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              Apply for Assistance
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
