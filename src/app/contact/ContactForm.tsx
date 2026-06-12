"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-extrabold text-navy">Thank you!</h3>
        <p className="mt-3 text-lg leading-relaxed text-foreground/80">
          Your message has been received. A member of the FAITH Foundation team
          will be in touch with you shortly. If your matter is urgent, please
          call us at{" "}
          <a href="tel:+18884976620" className="font-semibold text-gold-dark">
            888-497-6620
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          >
            <option>General inquiry</option>
            <option>Housing assistance</option>
            <option>Making a donation</option>
            <option>Volunteering</option>
            <option>Bright Box Homes partnership</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-semibold text-navy"
        >
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </div>
      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light sm:w-auto"
      >
        Send Message
      </button>
    </form>
  );
}
