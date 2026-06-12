import type { Metadata } from "next";
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
      {/* Page header */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Housing Assistance Application
          </span>
          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
            Apply for <span className="text-gold">assistance</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            If you are struggling to keep a roof over your head, you are not
            alone — and you do not have to face it alone. FAITH Foundation
            provides housing voucher assistance and eviction-prevention support
            to families across Central Texas. Start your application below.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
            What to Expect
          </h2>
          <h3 className="mb-6 text-3xl font-extrabold text-navy">
            A simple, confidential process
          </h3>
          <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
            <p>
              We have designed our housing assistance application to be as
              straightforward and dignified as possible. We know that reaching
              out for help can feel difficult, so we have broken the process into
              four short steps that you can complete in just a few minutes.
              Everything you share is held in strict confidence and used only to
              determine how we can best support your household.
            </p>
            <p>
              Once you submit your application, a FAITH Foundation caseworker
              will personally review your information and reach out — typically
              within three business days — to learn more about your situation and
              walk you through the options available to you. Depending on your
              circumstances, assistance may include rent or housing vouchers,
              help avoiding an eviction, deposit and move-in support, or
              enrollment in our financial-literacy and tenancy coaching programs.
            </p>
            <p>
              FAITH Foundation serves families of every background, belief, and
              circumstance without condition or preference. There is no cost to
              apply. If you are facing an emergency that cannot wait, please call
              us directly at <strong className="text-navy">888-497-6620</strong>{" "}
              so we can respond as quickly as possible.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS_OVERVIEW.map((s) => (
              <li
                key={s.number}
                className="rounded-lg border-t-4 border-gold bg-gold/5 p-6 shadow-sm"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-gold"
                >
                  {s.number}
                </span>
                <h4 className="mt-4 text-base font-bold text-navy">
                  {s.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Application form */}
      <section className="bg-gold/10">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gold-dark">
              Begin Your Application
            </h2>
            <h3 className="mb-4 text-3xl font-extrabold text-navy">
              Let&apos;s take the first step together
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80">
              Complete each step below. Your progress is shown at the top of the
              form. You can move back at any time to review what you have entered.
            </p>
          </div>
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
