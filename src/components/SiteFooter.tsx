"use client";

import Link from "next/link";
import { useState } from "react";

const PROGRAM_LINKS = [
  { href: "/programs/homeownership", label: "Homeownership" },
  { href: "/programs/housing-voucher", label: "Down Payment Vouchers" },
  { href: "/programs/veterans", label: "Veterans Path Home" },
  { href: "/programs/recovery", label: "Recovery Housing" },
  { href: "/programs/reentry", label: "Second Chance Reentry" },
  { href: "/programs/financial-literacy", label: "Financial Literacy" },
];

const GET_INVOLVED_LINKS = [
  { href: "/donate", label: "Make a Donation" },
  { href: "/apply", label: "Apply for Assistance" },
  { href: "/volunteer", label: "Volunteer With Us" },
  { href: "/partnership", label: "Bright Box Partnership" },
  { href: "/events", label: "Upcoming Events" },
];

const ORG_LINKS = [
  { href: "/about", label: "Our Mission" },
  { href: "/impact", label: "Our Impact" },
  { href: "/team", label: "Our Team" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/financial-transparency", label: "Financial Transparency" },
];

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 8.21a3.23 3.23 0 1 0 0-6.46 3.23 3.23 0 0 0 0 6.46Zm6.34-8.41a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.76V1.74C24 .78 23.2 0 22.22 0Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.27 3.6-6.27 3.6Z",
  },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute inset-0 bg-dotted opacity-40" aria-hidden />
      <div className="relative">
        {/* Newsletter band */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between sm:px-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-extrabold text-white">
                Stay connected to the mission
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Join our newsletter for stories of impact, upcoming events, and
                ways to help families across Texas reach homeownership.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubmitted(true);
              }}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-gold-light"
              >
                {submitted ? "Subscribed ✓" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5 sm:px-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-cream ring-1 ring-green/30">
                <img
                  src="/Images/faith-foundation-logo.png"
                  alt="FAITH Foundation logo"
                  className="h-full w-full object-contain p-1"
                />
              </span>
              <span className="font-display text-xl font-bold tracking-tightish text-white">FAITH Foundation</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Foundation for Affordable Instruction and Tenancy Hope — a
              501(c)(3) nonprofit helping families across Texas achieve
              homeownership through down payment assistance vouchers.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Programs" links={PROGRAM_LINKS} />
          <FooterColumn title="Get Involved" links={GET_INVOLVED_LINKS} />
          <FooterColumn title="Organization" links={ORG_LINKS} />

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold">
              Contact
            </h3>
            <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-white/70">
              <p>209 Surecast Drive, Suite 105</p>
              <p>Burnet, TX 78611</p>
              <p>
                <a href="tel:+18884976620" className="hover:text-gold">
                  888-497-6620
                </a>
              </p>
              <p>
                <a href="mailto:info@faithfoundationsf.org" className="hover:text-gold">
                  info@faithfoundationsf.org
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/60 sm:flex-row sm:px-8">
            <p>
              © {new Date().getFullYear()} FAITH Foundation. A registered
              501(c)(3) nonprofit. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-gold">
                Privacy Policy
              </Link>
              <Link href="/financial-transparency" className="hover:text-gold">
                Financial Transparency
              </Link>
              <Link href="/contact" className="hover:text-gold">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-gold">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


