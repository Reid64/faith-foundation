"use client";

import { useState } from "react";

const STEPS = [
  { id: 1, label: "Your Information" },
  { id: 2, label: "Household" },
  { id: 3, label: "Housing Situation" },
  { id: 4, label: "Review & Submit" },
];

const inputClass =
  "w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40";
const labelClass = "mb-1 block text-sm font-semibold text-navy";

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-extrabold text-navy">
          Application received
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-foreground/80">
          Thank you for trusting FAITH Foundation with your story. Your housing
          assistance application has been submitted. A caseworker will review
          your information and contact you within three business days. If you are
          facing an immediate emergency, please call us right away at{" "}
          <a href="tel:+18884976620" className="font-semibold text-gold-dark">
            888-497-6620
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm">
      {/* Step indicator */}
      <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-3">
        {STEPS.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step >= s.id
                  ? "bg-gold text-navy"
                  : "bg-navy/10 text-navy/50"
              }`}
            >
              {s.id}
            </span>
            <span
              className={`text-sm font-semibold ${
                step >= s.id ? "text-navy" : "text-navy/40"
              }`}
            >
              {s.label}
            </span>
            {s.id < STEPS.length && (
              <span aria-hidden className="mx-1 hidden text-navy/30 sm:inline">
                —
              </span>
            )}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <fieldset className="space-y-6">
            <legend className="mb-2 text-xl font-extrabold text-navy">
              Step 1: Your Information
            </legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="a-first" className={labelClass}>
                  First name
                </label>
                <input id="a-first" name="firstName" type="text" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-last" className={labelClass}>
                  Last name
                </label>
                <input id="a-last" name="lastName" type="text" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-email" className={labelClass}>
                  Email address
                </label>
                <input id="a-email" name="email" type="email" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-phone" className={labelClass}>
                  Phone number
                </label>
                <input id="a-phone" name="phone" type="tel" required className={inputClass} />
              </div>
            </div>
          </fieldset>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <fieldset className="space-y-6">
            <legend className="mb-2 text-xl font-extrabold text-navy">
              Step 2: Household
            </legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="a-size" className={labelClass}>
                  Household size
                </label>
                <input id="a-size" name="householdSize" type="number" min={1} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-children" className={labelClass}>
                  Number of children
                </label>
                <input id="a-children" name="children" type="number" min={0} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-income" className={labelClass}>
                  Approximate monthly household income
                </label>
                <input id="a-income" name="income" type="text" className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-employment" className={labelClass}>
                  Employment status
                </label>
                <select id="a-employment" name="employment" className={inputClass}>
                  <option>Employed full-time</option>
                  <option>Employed part-time</option>
                  <option>Unemployed</option>
                  <option>Retired</option>
                  <option>Unable to work</option>
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <fieldset className="space-y-6">
            <legend className="mb-2 text-xl font-extrabold text-navy">
              Step 3: Housing Situation
            </legend>
            <div>
              <label htmlFor="a-status" className={labelClass}>
                Current housing status
              </label>
              <select id="a-status" name="housingStatus" className={inputClass}>
                <option>Renting, behind on payments</option>
                <option>Facing eviction</option>
                <option>Temporarily staying with others</option>
                <option>Currently unhoused</option>
                <option>Renting, at risk of falling behind</option>
              </select>
            </div>
            <div>
              <label htmlFor="a-need" className={labelClass}>
                What type of assistance do you need?
              </label>
              <select id="a-need" name="assistanceType" className={inputClass}>
                <option>Rent / housing voucher</option>
                <option>Help avoiding eviction</option>
                <option>Deposit or move-in assistance</option>
                <option>Financial-literacy / budgeting support</option>
                <option>Not sure — please advise</option>
              </select>
            </div>
            <div>
              <label htmlFor="a-describe" className={labelClass}>
                Briefly describe your situation
              </label>
              <textarea id="a-describe" name="description" rows={5} className={inputClass} />
            </div>
          </fieldset>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <fieldset className="space-y-5">
            <legend className="mb-2 text-xl font-extrabold text-navy">
              Step 4: Review &amp; Submit
            </legend>
            <p className="text-lg leading-relaxed text-foreground/80">
              Please review the information you entered using the{" "}
              <strong className="text-navy">Back</strong> button. When you are
              ready, submit your application below. Everything you share is kept
              confidential and used only to determine how FAITH Foundation can
              best help your household.
            </p>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-1 h-4 w-4 rounded border-navy/30 text-gold focus:ring-gold"
              />
              <span>
                I certify that the information provided is accurate to the best of
                my knowledge and consent to FAITH Foundation contacting me about
                my application.
              </span>
            </label>
          </fieldset>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="rounded-md border-2 border-navy/30 px-6 py-3 text-base font-bold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
