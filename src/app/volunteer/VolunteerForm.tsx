"use client";

import { useState } from "react";
import { openMailto } from "@/lib/mailto";
import { submitForm } from "@/lib/web3forms";
import FormErrorNotice from "@/components/FormErrorNotice";

const INTERESTS = [
  "Tenancy & life-skills coaching",
  "Event & fundraising support",
  "Administrative & office help",
  "Outreach & community ambassador",
  "Wherever I'm needed most",
];

export default function VolunteerForm() {
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "");

    const fields = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      interest: get("interest"),
      availability: get("availability"),
    };

    setAttempt(fields);
    setError(null);
    setSubmitting(true);

    const result = await submitForm(
      "FAITH Foundation — Volunteer Application",
      fields
    );

    setSubmitting(false);

    if (result.ok) setSubmitted(true);
    else setError(result.error);
  }

  function emailFallback() {
    openMailto(
      "Volunteer signup",
      [
        ["Name", attempt.name ?? ""],
        ["Email", attempt.email ?? ""],
        ["Phone", attempt.phone ?? ""],
        ["Area of interest", attempt.interest ?? ""],
        ["Availability and skills", attempt.availability ?? ""],
      ],
      "Sent from the FAITH Foundation website volunteer form."
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-8">
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
          Welcome to the team!
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
          Thank you for offering your time and talents to FAITH Foundation. Your
          signup has been delivered, and a member of our volunteer coordination
          team will reach out soon with next steps. Questions in the meantime?
          Call us at{" "}
          <a href="tel:+18884976620" className="font-semibold text-gold-dark">
            888-497-6620
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="v-name"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Full name
          </label>
          <input
            id="v-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-email"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Email address
          </label>
          <input
            id="v-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-phone"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Phone (optional)
          </label>
          <input
            id="v-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-interest"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Area of interest
          </label>
          <select
            id="v-interest"
            name="interest"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          >
            {INTERESTS.map((interest) => (
              <option key={interest}>{interest}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6">
        <label
          htmlFor="v-availability"
          className="mb-2 block text-sm font-semibold text-navy"
        >
          Tell us about your availability and skills
        </label>
        <textarea
          id="v-availability"
          name="availability"
          rows={4}
          className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
        />
      </div>
      {/* Spam honeypot — hidden from people. Its value is not forwarded; the
          submission body is built from the named fields above. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        style={{ display: "none" }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Sign Up to Volunteer"}
      </button>
      {error && (
        <FormErrorNotice message={error} onEmailFallback={emailFallback} />
      )}
    </form>
  );
}


