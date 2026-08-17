"use client";

import { useRef, useState } from "react";
import { openMailto } from "@/lib/mailto";
import { submitForm } from "@/lib/web3forms";
import { FORM_SUBJECTS } from "@/lib/formSubjects";
import FormErrorNotice from "@/components/FormErrorNotice";
import {
  TURNSTILE_ENABLED,
  TurnstileWidget,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";

const STEPS = [
  { id: 1, label: "Your Information" },
  { id: 2, label: "Household" },
  { id: 3, label: "Housing Situation" },
  { id: 4, label: "Review & Submit" },
];

const inputClass =
  "w-full rounded-xl border border-gray-400 bg-white px-4 py-3 font-medium text-[#1B2A4A] placeholder:text-gray-500 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40";
const labelClass = "mb-2 block text-sm font-semibold text-navy";

export default function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Each step unmounts when you move off it, so its inputs leave the DOM. The
  // answers are captured into state on every step change; without this, a
  // submission would only ever contain step 4's fields, and pressing Back would
  // wipe everything already typed.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  function capture() {
    const el = formRef.current;
    if (!el) return;
    const fd = new FormData(el);
    const found: Record<string, string> = {};
    fd.forEach((value, key) => {
      found[key] = String(value);
    });
    setAnswers((prev) => ({ ...prev, ...found }));
  }

  function next() {
    capture();
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    capture();
    setStep((s) => Math.max(s - 1, 1));
  }

  /**
   * Merges every step's answers, not just the step on screen.
   *
   * Steps 1–3 are unmounted by the time this runs, so their inputs are gone
   * from the DOM. `answers` holds what was captured on each step change and the
   * live FormData supplies step 4. Reading only `event.currentTarget` here
   * would submit an application containing nothing but the consent checkbox.
   */
  function collectAll(form: HTMLFormElement): Record<string, string> {
    const fd = new FormData(form);
    const finalStep: Record<string, string> = {};
    fd.forEach((value, key) => {
      finalStep[key] = String(value);
    });
    return { ...answers, ...finalStep };
  }

  function toFields(all: Record<string, string>) {
    const get = (k: string) => all[k] ?? "";
    return {
      first_name: get("firstName"),
      last_name: get("lastName"),
      email: get("email"),
      phone: get("phone"),
      household_size: get("householdSize"),
      children: get("children"),
      monthly_household_income: get("income"),
      employment_status: get("employment"),
      current_housing_status: get("housingStatus"),
      assistance_needed: get("assistanceType"),
      description_of_situation: get("description"),
      certified_and_consented: get("consent") ? "Yes" : "No",
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const all = collectAll(event.currentTarget);
    const fields = toFields(all);

    setAttempt(fields);
    setError(null);
    setSubmitting(true);

    const result = await submitForm(FORM_SUBJECTS.apply, fields, token);

    setSubmitting(false);

    // Single-use token: reset after success and after failure alike, so a
    // retry on this four-step form does not send a spent one.
    turnstile.current?.reset();
    setToken(null);

    if (result.ok) setSubmitted(true);
    else setError(result.error);
  }

  function emailFallback() {
    const a = attempt;
    openMailto(
      `Housing assistance application — ${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
      [
        ["First name", a.first_name ?? ""],
        ["Last name", a.last_name ?? ""],
        ["Email", a.email ?? ""],
        ["Phone", a.phone ?? ""],
        ["Household size", a.household_size ?? ""],
        ["Number of children", a.children ?? ""],
        ["Approximate monthly household income", a.monthly_household_income ?? ""],
        ["Employment status", a.employment_status ?? ""],
        ["Current housing status", a.current_housing_status ?? ""],
        ["Assistance needed", a.assistance_needed ?? ""],
        ["Description of situation", a.description_of_situation ?? ""],
        ["Certified accurate and consented to contact", a.certified_and_consented ?? ""],
      ],
      "Sent from the FAITH Foundation website housing assistance application."
    );
  }

  if (submitted) {
    return (
      <div className="card-surface rounded-3xl p-8 sm:p-10">
        <span
          aria-hidden
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 className="text-2xl font-extrabold text-navy">
          Application received
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
          Thank you for trusting FAITH Foundation with your story. Your housing
          assistance application has been delivered to our team. A caseworker
          will review your information and contact you within three business
          days.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-charcoal/80">
          If you are facing an immediate emergency, please call us right away at{" "}
          <a href="tel:+18884976620" className="font-semibold text-gold-dark">
            888-497-6620
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface rounded-3xl p-8 sm:p-10">
      {/* Step indicator */}
      <ol className="mb-8 flex flex-wrap gap-x-2 gap-y-3">
        {STEPS.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
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

      <form ref={formRef} onSubmit={handleSubmit}>
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
                <input id="a-first" name="firstName" type="text" required autoComplete="given-name" defaultValue={answers.firstName ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-last" className={labelClass}>
                  Last name
                </label>
                <input id="a-last" name="lastName" type="text" required autoComplete="family-name" defaultValue={answers.lastName ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-email" className={labelClass}>
                  Email address
                </label>
                <input id="a-email" name="email" type="email" required autoComplete="email" inputMode="email" defaultValue={answers.email ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-phone" className={labelClass}>
                  Phone number
                </label>
                <input id="a-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={answers.phone ?? ""} className={inputClass} />
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
                <input id="a-size" name="householdSize" type="number" min={1} defaultValue={answers.householdSize ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-children" className={labelClass}>
                  Number of children
                </label>
                <input id="a-children" name="children" type="number" min={0} defaultValue={answers.children ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-income" className={labelClass}>
                  Approximate monthly household income
                </label>
                <input id="a-income" name="income" type="text" defaultValue={answers.income ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="a-employment" className={labelClass}>
                  Employment status
                </label>
                <select id="a-employment" name="employment" defaultValue={answers.employment} className={inputClass}>
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
              <select id="a-status" name="housingStatus" defaultValue={answers.housingStatus} className={inputClass}>
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
              <select id="a-need" name="assistanceType" defaultValue={answers.assistanceType} className={inputClass}>
                <option>Rent / housing voucher</option>
                <option>Help avoiding eviction</option>
                <option>Deposit or move-in assistance</option>
                <option>Not sure — please advise</option>
              </select>
            </div>
            <div>
              <label htmlFor="a-describe" className={labelClass}>
                Briefly describe your situation
              </label>
              <textarea id="a-describe" name="description" rows={5} defaultValue={answers.description ?? ""} className={inputClass} />
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
                className="mt-1 h-4 w-4 rounded border-navy/30 text-green focus:ring-green"
              />
              <span>
                I certify that the information provided is accurate to the best of
                my knowledge and consent to FAITH Foundation contacting me about
                my application.
              </span>
            </label>
            {/* This form collects income, household and housing-status details.
                Telling applicants where that goes — and offering a non-web
                route — is both the honest thing and a Google Ad Grants
                expectation for pages that gather sensitive information. */}
            <p className="rounded-2xl border-l-4 border-navy/20 bg-navy/[0.03] px-5 py-4 text-sm leading-relaxed text-charcoal/80">
              <strong className="text-navy">How your information is handled.</strong>{" "}
              What you submit here is sent by email to our team through our form
              provider and used only to review your application. We never sell
              your information. See our{" "}
              <a
                href="/privacy-policy/"
                className="font-semibold text-gold-dark underline underline-offset-2 hover:text-navy"
              >
                Privacy Policy
              </a>{" "}
              for details. If you would rather not send these details through a
              web form, call us at{" "}
              <a
                href="tel:+18884976620"
                className="font-semibold text-gold-dark underline underline-offset-2 hover:text-navy"
              >
                888-497-6620
              </a>{" "}
              and we will take your application directly.
            </p>
          </fieldset>
        )}

        {step === STEPS.length ? (
          <TurnstileWidget ref={turnstile} onVerify={setToken} className="mt-8" />
        ) : null}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="rounded-full border-2 border-navy/20 px-6 py-3 text-base font-bold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-green px-8 py-3 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || (TURNSTILE_ENABLED && !token)}
              className="rounded-full bg-green px-8 py-3 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting…"
                : TURNSTILE_ENABLED && !token
                  ? "Complete the spam check"
                  : "Submit Application"}
            </button>
          )}
        </div>
        {/* Spam honeypot — hidden from people. Its value is not forwarded;
            toFields() builds the submission body from the named fields only. */}
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          style={{ display: "none" }}
        />
        {error && (
          <FormErrorNotice message={error} onEmailFallback={emailFallback} />
        )}
      </form>
    </div>
  );
}


