"use client";

import { useState } from "react";
import { openMailto } from "@/lib/mailto";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "");

    openMailto(
      `Website enquiry — ${get("subject") || "General inquiry"}`,
      [
        ["Name", get("name")],
        ["Email", get("email")],
        ["Phone", get("phone")],
        ["Subject", get("subject")],
        ["Message", get("message")],
      ],
      "Sent from the FAITH Foundation website contact form."
    );

    setSubmitted(true);
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
        <h3 className="text-2xl font-extrabold text-navy">Almost there!</h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
          Your email app should now be open with your message ready to go —{" "}
          <strong className="text-navy">press send to deliver it</strong>. Once
          it arrives, a member of the FAITH Foundation team will be in touch
          shortly. If your email app did not open, or you would rather not use
          email, call us at{" "}
          <a href="tel:+18884976620" className="font-semibold text-gold-dark">
            888-497-6620
          </a>{" "}
          or write to{" "}
          <a
            href="mailto:info@faithfoundationsf.org"
            className="font-semibold text-gold-dark"
          >
            info@faithfoundationsf.org
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
      <button
        type="submit"
        className="mt-8 w-full rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg"
      >
        Send Message
      </button>
    </form>
  );
}


