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

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "");

    const fields = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      subject_choice: get("subject"),
      message: get("message"),
    };

    setAttempt(fields);
    setError(null);
    setSubmitting(true);

    const result = await submitForm(
      FORM_SUBJECTS.contact,
      fields,
      token
    );

    setSubmitting(false);

    // A Turnstile token is single use. Reset after every attempt, or a retry
    // after a failure would send a token the server has already consumed.
    turnstile.current?.reset();
    setToken(null);

    // Success is shown only on a confirmed delivery, never optimistically.
    if (result.ok) setSubmitted(true);
    else setError(result.error);
  }

  function emailFallback() {
    openMailto(
      `Website enquiry — ${attempt.subject_choice || "General inquiry"}`,
      [
        ["Name", attempt.name ?? ""],
        ["Email", attempt.email ?? ""],
        ["Phone", attempt.phone ?? ""],
        ["Subject", attempt.subject_choice ?? ""],
        ["Message", attempt.message ?? ""],
      ],
      "Sent from the FAITH Foundation website contact form."
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
        <h3 className="text-2xl font-extrabold text-navy">Message sent!</h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
          Your message has been delivered to the FAITH Foundation team and a
          real person will respond shortly. If your matter is urgent, call us at{" "}
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
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/40"
          >
            <option>General inquiry</option>
            <option>Housing assistance</option>
            <option>Making a donation</option>
            <option>Volunteering</option>
            <option>Corporate giving</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-semibold text-navy"
        >
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
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
      <TurnstileWidget
        ref={turnstile}
        onVerify={setToken}
        className="mt-6"
      />
      <button
        type="submit"
        disabled={submitting || (TURNSTILE_ENABLED && !token)}
        className="mt-6 w-full rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Sending…"
          : TURNSTILE_ENABLED && !token
            ? "Complete the spam check"
            : "Send Message"}
      </button>
      {error && (
        <FormErrorNotice message={error} onEmailFallback={emailFallback} />
      )}
    </form>
  );
}


