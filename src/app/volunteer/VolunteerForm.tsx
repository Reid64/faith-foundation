"use client";

import { useState } from "react";

const INTERESTS = [
  "Financial-literacy tutoring",
  "Tenancy & life-skills coaching",
  "Event & fundraising support",
  "Administrative & office help",
  "Outreach & community ambassador",
  "Wherever I'm needed most",
];

export default function VolunteerForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        <h3 className="text-2xl font-extrabold text-navy">
          Welcome to the team!
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-charcoal/80">
          Thank you for offering your time and talents to FAITH Foundation. A
          member of our volunteer coordination team will reach out soon with next
          steps. Questions in the meantime? Call us at{" "}
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
      <button
        type="submit"
        className="mt-8 w-full rounded-full bg-green px-8 py-4 text-base font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-card-lg"
      >
        Sign Up to Volunteer
      </button>
    </form>
  );
}


