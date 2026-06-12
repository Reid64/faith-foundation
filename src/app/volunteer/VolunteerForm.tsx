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
      <div className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-extrabold text-navy">
          Welcome to the team!
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-foreground/80">
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
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-t-4 border-gold bg-white p-8 shadow-sm"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="v-name"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Full name
          </label>
          <input
            id="v-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-email"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Email address
          </label>
          <input
            id="v-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-phone"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Phone (optional)
          </label>
          <input
            id="v-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div>
          <label
            htmlFor="v-interest"
            className="mb-1 block text-sm font-semibold text-navy"
          >
            Area of interest
          </label>
          <select
            id="v-interest"
            name="interest"
            className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
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
          className="mb-1 block text-sm font-semibold text-navy"
        >
          Tell us about your availability and skills
        </label>
        <textarea
          id="v-availability"
          name="availability"
          rows={4}
          className="w-full rounded-md border border-navy/20 px-4 py-2 text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </div>
      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-gold px-8 py-3 text-base font-bold text-navy shadow-lg transition-colors hover:bg-gold-light sm:w-auto"
      >
        Sign Up to Volunteer
      </button>
    </form>
  );
}
