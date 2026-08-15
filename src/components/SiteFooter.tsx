"use client";

import Link from "next/link";
import { useState } from "react";
import { openMailto } from "@/lib/mailto";

const PROGRAM_LINKS = [
  { href: "/programs/homeownership", label: "Homeownership" },
  { href: "/programs/housing-voucher", label: "Down Payment Vouchers" },
  { href: "/programs/veterans", label: "Veterans Path Home" },
  { href: "/programs/recovery", label: "Recovery Housing" },
  { href: "/programs/reentry", label: "Second Chance Reentry" },
  { href: "/programs/cornerstone-communities", label: "Cornerstone Communities" },
];

const GET_INVOLVED_LINKS = [
  { href: "/donate", label: "Make a Donation" },
  { href: "/apply", label: "Apply for Assistance" },
  { href: "/volunteer", label: "Volunteer With Us" },
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
  { href: "/governance", label: "Governance" },
];

const SOCIALS: {
  label: string;
  href: string;
  path: string;
  /** Brand color used as the icon fill. */
  fill: string;
}[] = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    fill: "#1877F2",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    fill: "#E1306C",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    fill: "#0A66C2",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    fill: "#FF0000",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z M9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      {/* Warm gold accent bar across the top of the footer. */}
      <div className="h-1 w-full bg-gold-gradient" aria-hidden />
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
                const address = email.trim();
                if (!address) return;
                openMailto(
                  "Newsletter Signup",
                  [["Email", address]],
                  "Please add this email address to the FAITH Foundation newsletter list."
                );
                setSubmitted(true);
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
            <div className="mt-5 flex gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform duration-300 hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-6 w-6"
                    fill={s.fill}
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
              501(c)(3) nonprofit.{" "}
              EIN: 33-2640449. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/privacy-policy" className="hover:text-gold">
                Privacy Policy
              </Link>
              <Link href="/governance/donor-privacy" className="hover:text-gold">
                Donor Privacy
              </Link>
              <Link href="/governance" className="hover:text-gold">
                Governance
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


