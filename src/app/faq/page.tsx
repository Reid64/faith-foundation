import type { Metadata } from "next";
import Link from "next/link";
import BackgroundSwirls from "@/components/BackgroundSwirls";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — FAITH Foundation",
  description:
    "Answers to common questions about FAITH Foundation — who we serve, how down payment assistance vouchers work, eligibility, donations, and volunteering.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    question: "What is FAITH Foundation?",
    answer:
      "FAITH Foundation is a 501(c)(3) nonprofit organization based in Burnet, Texas. Our name stands for Foundation for Affordable Instruction and Tenancy Hope, and we help families across Texas reach the milestone of homeownership — primarily through down payment assistance vouchers that turn the dream of owning a home into an achievable reality.",
  },
  {
    question: "What does the name FAITH stand for?",
    answer:
      "FAITH stands for \"Foundation for Affordable Instruction and Tenancy Hope.\" Each letter reflects our mission of helping families reach homeownership: F is the Foundation we provide as a launching point; A is the Affordable path to owning a home; I is the Instruction that prepares families to succeed; T is the Tenancy and ownership we help families secure; and H is the Hope of a permanent place to call their own. Together they describe what we do — putting families on the road to homeownership through down payment assistance.",
  },
  {
    question: "Who does FAITH Foundation serve?",
    answer:
      "We serve families and individuals across Texas who are working toward homeownership or facing housing instability. Our programs reach veterans, single parents, people in recovery, individuals reentering the community after incarceration, and families facing a housing emergency.",
  },
  {
    question: "How is FAITH Foundation funded?",
    answer:
      "FAITH Foundation is funded by the generosity of individual and corporate donors, grants, and community fundraising. One of our corporate donors is Bright Box Homes, a separate, independently operated company. Bright Box Homes honors FAITH Foundation down payment assistance vouchers — applying a $2,500 voucher as a direct discount to qualifying buyers — and makes an additional $2,500 charitable donation to FAITH Foundation for every home it sells, effectively reducing the purchase price by $5,000 for families we serve. The two organizations are completely separate entities — FAITH Foundation does not own or operate any homebuilding company. Every gift, from every source, is directed into down payment assistance vouchers and our charitable housing programs.",
  },
  {
    question: "What is a housing voucher and how do I qualify?",
    answer:
      "Our vouchers provide down payment assistance — direct financial help that closes the gap between a family and the keys to their own home. Vouchers can also help families secure or maintain stable housing during a transition. Eligibility generally requires that you live in Texas, demonstrate a need, and partner with our case-management process. Specific criteria vary by program; apply or contact us to review your situation.",
  },
  {
    question: "How do I apply for housing assistance?",
    answer:
      "You can apply directly through our Apply for Housing Assistance page, which walks you through a short multi-step application covering your information, household, and current housing situation. If you are facing an urgent housing crisis, contact us right away and a real person will help you understand your options.",
  },
  {
    question: "Is there a cost to receive help from FAITH Foundation?",
    answer:
      "No. Our programs and assistance are provided free of charge to the families we serve. We are funded by individual and corporate donations, grants, and the generosity of our community.",
  },
  {
    question: "Do I have to share your faith to receive help?",
    answer:
      "No. While FAITH Foundation is grounded in Christian conviction, our doors and programs are open to families of every background, belief, and circumstance, without condition or preference. We simply ask to be allowed to express our faith through the way we serve.",
  },
  {
    question: "What educational or instruction programs do you offer?",
    answer:
      "While down payment assistance toward homeownership is our primary mission, we offer supporting instruction to help families succeed as owners — including homeownership counseling and a financial-literacy program covering budgeting, credit repair, and debt management. These programs prepare families to buy and to keep the home they work so hard to reach.",
  },
  {
    question: "Are donations to FAITH Foundation tax-deductible?",
    answer:
      "Yes. FAITH Foundation is a registered 501(c)(3) tax-exempt nonprofit, so donations are tax-deductible to the fullest extent allowed by law. We provide receipts for your records and steward every gift with transparency.",
  },
  {
    question: "How is my donation used?",
    answer:
      "Donations fund down payment assistance vouchers, emergency rental and deposit assistance, and our supporting instruction programs. We direct gifts toward measurable impact for families across Texas and report our outcomes openly, because transparent stewardship is a commitment we take seriously.",
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
      "We love partnering with businesses, churches, and community organizations — through event sponsorships, volunteer teams, and community collaborations. Reach out through our Contact page and we will explore a partnership that fits your goals and multiplies impact for families in need.",
  },
  {
    question: "How do I qualify for down payment assistance in Texas?",
    answer:
      "To qualify for down payment assistance in Texas, you generally need to live in the state, demonstrate a genuine financial need, and be working toward stable homeownership. At FAITH Foundation, our down payment assistance vouchers are paired with a short application and a case-management conversation so we can understand your household, income, and goals. There is no cost to apply, and our team personally reviews every request. Start with our Apply for Housing Assistance page or call 888-497-6620 to learn what you may be eligible for.",
  },
  {
    question: "What is a housing voucher and how does it work?",
    answer:
      "A housing voucher is direct financial assistance that helps a family cover a specific housing cost — for FAITH Foundation, that most often means the down payment needed to close on a home, or rental and deposit help during a transition. Rather than a loan, our vouchers are funded by individual and corporate donors and directed straight toward the gap standing between a family and stable housing. Each voucher is paired with case management and, where helpful, homebuyer instruction so families are set up to succeed. You can learn more on our Housing Voucher Program page.",
  },
  {
    question: "Can felons get housing assistance in Texas?",
    answer:
      "Yes. FAITH Foundation serves people reentering the community after incarceration, and having a record does not automatically disqualify you from our housing assistance. Our Second Chance Reentry program provides post-incarceration transitional housing, case management, and employment support designed specifically for returning citizens rebuilding their lives. We serve families of every background and circumstance without condition or preference. Reach out through our Apply page and a real person will help you understand your options.",
  },
  {
    question: "How do single mothers get help buying a home?",
    answer:
      "Single mothers can get help buying a home through FAITH Foundation's down payment assistance vouchers combined with our Single Parent Stability program. Together they provide the cash-to-close support that is often the biggest barrier to ownership, along with childcare navigation, resource connections, and financial coaching. We also offer homeownership counseling so single-parent families can buy with confidence and keep their home for the long term. Apply online or call 888-497-6620 to talk through your situation.",
  },
  {
    question: "What is the difference between a housing voucher and Section 8?",
    answer:
      "Section 8 is a federal rental-assistance program run by public housing authorities, with long waitlists and strict federal rules. FAITH Foundation's housing vouchers are privately funded by donors, which lets us move faster and direct help where it is needed most — including down payment assistance that Section 8 does not provide. Our focus is on homeownership and lasting housing stability, not only subsidized rent. Because we are a nonprofit rather than a government agency, we can tailor support to each family through personal case management.",
  },
  {
    question: "How do I apply for first-time homebuyer programs in Texas?",
    answer:
      "To apply for first-time homebuyer help through FAITH Foundation, start with our Apply for Housing Assistance page, which walks you through a short, confidential multi-step application. From there, our team pairs you with homeownership counseling and, if eligible, a down payment assistance voucher to help you close on your first home. We personally review every application — typically within three business days — and guide you on next steps. There is no cost to apply, and you can call 888-497-6620 with any questions.",
  },
  {
    question: "Are there housing programs for veterans in Texas?",
    answer:
      "Yes. FAITH Foundation's Veterans Path Home program helps Texas veterans secure stable, affordable housing through rental assistance, case management, and connection to the benefits they have earned. For veterans working toward ownership, we also offer down payment assistance vouchers and homeownership counseling. Our goal is to move veterans from housing instability to a home of their own, honoring their service with practical support. Visit our Veterans Path Home page or apply online to get started.",
  },
  {
    question: "What does a homeownership counselor do?",
    answer:
      "A homeownership counselor guides you through every step of buying and keeping a home — reviewing your budget and credit, explaining mortgages and closing costs, and helping you build a realistic plan to become a homeowner. At FAITH Foundation, our homeownership counseling is paired with down payment assistance so families are both prepared and financially supported. Counselors also help you avoid common pitfalls so you can hold onto your home for the long term. It is a free service designed to make ownership attainable and lasting.",
  },
];

// Grouped views over the FAQS data — every question + answer is rendered
// verbatim, organized into topical accordion sections.
const CATEGORIES = [
  {
    name: "About FAITH Foundation",
    questions: [
      "What is FAITH Foundation?",
      "What does the name FAITH stand for?",
      "Who does FAITH Foundation serve?",
      "How is FAITH Foundation funded?",
    ],
  },
  {
    name: "Getting Help",
    questions: [
      "What is a housing voucher and how do I qualify?",
      "How do I apply for housing assistance?",
      "Is there a cost to receive help from FAITH Foundation?",
      "Do I have to share your faith to receive help?",
      "What educational or instruction programs do you offer?",
    ],
  },
  {
    name: "Giving & Donations",
    questions: [
      "Are donations to FAITH Foundation tax-deductible?",
      "How is my donation used?",
      "Can I donate by mail or do I have to give online?",
    ],
  },
  {
    name: "Get Involved & Visit",
    questions: [
      "How can I volunteer with FAITH Foundation?",
      "Where is FAITH Foundation located and what are your hours?",
      "How can my business or church partner with FAITH Foundation?",
    ],
  },
  {
    name: "Housing Assistance in Texas",
    questions: [
      "How do I qualify for down payment assistance in Texas?",
      "What is a housing voucher and how does it work?",
      "Can felons get housing assistance in Texas?",
      "How do single mothers get help buying a home?",
      "What is the difference between a housing voucher and Section 8?",
      "How do I apply for first-time homebuyer programs in Texas?",
      "Are there housing programs for veterans in Texas?",
      "What does a homeownership counselor do?",
    ],
  },
];

const byQuestion = (q: string) => FAQS.find((f) => f.question === q)!;

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

      {/* ===== HERO — dark photo + navy overlay ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("peopleTalking", 1900, 1100)}
          alt="Two people in conversation"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              Frequently Asked Questions
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Answers to your <span className="text-gold">questions</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              Whether you are seeking housing assistance, considering a gift, or
              hoping to volunteer, you probably have questions — and we want to make
              the answers easy to find. Below are the questions we hear most often
              about who we are, how our programs work, and how you can get involved.
              If you do not see your question here, reach out and a real person will
              help.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== ACCORDION FAQ — grouped by category ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF5] to-[#e8e4d8]">
        <BackgroundSwirls variant="top-left" />
        <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8 sm:py-32">
          <div className="space-y-16">
            {CATEGORIES.map((category) => (
              <div key={category.name}>
                <Reveal>
                  <div className="mb-8 flex items-center gap-4">
                    <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">
                      {category.name}
                    </h2>
                    <span className="h-px flex-1 bg-gradient-to-r from-green/60 to-transparent" />
                  </div>
                </Reveal>
                <div className="space-y-4">
                  {category.questions.map((q, i) => {
                    const faq = byQuestion(q);
                    return (
                      <Reveal key={faq.question} delay={i * 80}>
                        <details className="card-surface group overflow-hidden rounded-2xl transition-shadow">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 text-left text-lg font-bold text-navy transition-colors hover:bg-gold/5 sm:px-8 sm:text-xl [&::-webkit-details-marker]:hidden">
                            <span>{faq.question}</span>
                            <span
                              aria-hidden
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-2xl font-light leading-none text-gold transition-transform duration-300 group-open:rotate-45"
                            >
                              +
                            </span>
                          </summary>
                          <div className="border-t border-navy/5 px-6 pb-6 pt-5 text-lg leading-relaxed text-charcoal/80 sm:px-8">
                            {faq.answer}
                          </div>
                        </details>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C8A951] to-transparent" aria-hidden />

      {/* ===== CTA — still have questions ===== */}
      <section className="bg-navy-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Still have questions?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/85">
              Our team is here to help — no phone trees, no run-around. Reach out
              and a real person will respond.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-gold px-8 py-3.5 text-base font-bold text-navy shadow-card transition-colors hover:bg-gold-light shadow-lg hover:shadow-xl ring-2 ring-[#C8A951]/30"
              >
                Contact Us
              </Link>
              <Link
                href="/apply"
                className="rounded-full border-2 border-green px-8 py-3.5 text-base font-bold text-green-light transition-colors hover:bg-green hover:text-white"
              >
                Apply for Assistance
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}


