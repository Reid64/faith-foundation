import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { img } from "@/lib/images";
import ApplicationForm from "./ApplicationForm";

export const metadata: Metadata = {
  title: "Apply for Housing Assistance — FAITH Foundation",
  description:
    "Apply for housing assistance from FAITH Foundation, a 501(c)(3) nonprofit in Burnet, Texas. Complete our confidential multi-step application for rent vouchers and eviction-prevention support.",
};

const STEPS_OVERVIEW = [
  {
    number: "1",
    title: "Your Information",
    body: "Tell us who you are and how to reach you. We respond to every applicant personally.",
  },
  {
    number: "2",
    title: "Household",
    body: "Share details about your household size, income, and employment so we can understand your needs.",
  },
  {
    number: "3",
    title: "Housing Situation",
    body: "Describe your current housing situation and the type of assistance that would help most.",
  },
  {
    number: "4",
    title: "Review & Submit",
    body: "Confirm your information, consent to be contacted, and submit your confidential application.",
  },
];

export default function ApplyPage() {
  return (
    <>
      {/* ===== HERO — dark photo + navy overlay ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("newKeys", 1900)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-green-deep/40" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-40 text-center sm:px-8 sm:pt-44">
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-green/50 bg-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-green-light backdrop-blur">
              Housing Assistance Application
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Apply for <span className="text-gold">assistance</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              If you are struggling to keep a roof over your head, you are not
              alone — and you do not have to face it alone. FAITH Foundation
              provides down payment assistance, housing vouchers, and
              eviction-prevention support to families across Texas. Start your
              application below.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== WHAT TO EXPECT + STEPS ===== */}
      <section className="bg-texture bg-cream">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-dark">
              What to Expect
            </h2>
            <h3 className="mb-6 text-3xl font-extrabold text-navy sm:text-4xl">
              A simple, confidential process
            </h3>
          </Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80">
            <Reveal delay={80} as="p">
              We have designed our housing assistance application to be as
              straightforward and dignified as possible. We know that reaching
              out for help can feel difficult, so we have broken the process into
              four short steps that you can complete in just a few minutes.
              Everything you share is held in strict confidence and used only to
              determine how we can best support your household.
            </Reveal>
            <Reveal delay={140} as="p">
              Once you submit your application, a FAITH Foundation caseworker
              will personally review your information and reach out — typically
              within three business days — to learn more about your situation and
              walk you through the options available to you. Depending on your
              circumstances, assistance may include rent or housing vouchers,
              help avoiding an eviction, deposit and move-in support, or
              enrollment in our financial-literacy and tenancy coaching programs.
            </Reveal>
            <Reveal delay={200} as="p">
              FAITH Foundation serves families of every background, belief, and
              circumstance without condition or preference. There is no cost to
              apply. If you are facing an emergency that cannot wait, please call
              us directly at <strong className="text-navy">888-497-6620</strong>{" "}
              so we can respond as quickly as possible.
            </Reveal>
          </div>

          {/* Numbered step cards with connector */}
          <ol className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 lg:block"
            />
            {STEPS_OVERVIEW.map((s, i) => (
              <li key={s.number} className="relative">
                <Reveal delay={i * 100}>
                  <div className="h-full rounded-3xl border border-navy/10 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                    <span
                      aria-hidden
                      className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-xl font-extrabold text-gold ring-4 ring-cream"
                    >
                      {s.number}
                    </span>
                    <h4 className="mt-5 text-base font-bold text-navy">
                      {s.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== APPLICATION FORM ===== */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img
          src={img("familyOutdoors", 1900)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/95 to-navy-dark" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal className="mb-10 text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-green-light">
              Begin Your Application
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold sm:text-4xl">
              Let&apos;s take the first step together
            </h3>
            <p className="text-lg leading-relaxed text-white/85">
              Complete each step below. Your progress is shown at the top of the
              form. You can move back at any time to review what you have entered.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <ApplicationForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}


