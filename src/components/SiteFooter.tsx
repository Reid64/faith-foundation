"use client";

import Link from "next/link";
import { useState } from "react";
import { openMailto } from "@/lib/mailto";
import { submitForm } from "@/lib/web3forms";

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

/**
 * Official FAITH Foundation social profiles.
 *
 * INTENTIONALLY EMPTY. This array previously held four icons linking to
 * https://facebook.com, https://instagram.com, https://linkedin.com and
 * https://youtube.com — the platforms' own home pages, not FAITH Foundation
 * profiles. Those were placeholder links: they sent visitors off-site to
 * nothing related to the organization, and they are exactly the kind of
 * irrelevant outbound link a Google Ad Grants review flags.
 *
 * TO RE-ENABLE: add entries only for accounts FAITH Foundation actually
 * controls, using the full profile URL (e.g. https://www.facebook.com/<page>).
 * Once real profiles exist they should ALSO be added to `sameAs` in the
 * organization schema in src/app/layout.tsx so the two never disagree.
 */
const SOCIALS: {
  label: string;
  href: string;
  path: string;
  /** Brand color used as the icon fill. */
  fill: string;
}[] = [];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              onSubmit={async (e) => {
                e.preventDefault();
                const address = email.trim();
                if (!address || submitting) return;

                setError(null);
                setSubmitting(true);
                const result = await submitForm(
                  "FAITH Foundation — Newsletter Signup",
                  { email: address, list: "Newsletter" }
                );
                setSubmitting(false);

                if (result.ok) setSubmitted(true);
                else setError(result.error);
              }}
              className="flex w-full max-w-md flex-col gap-3"
            >
              <div className="flex w-full flex-col gap-3 sm:flex-row">
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
                  disabled={submitting}
                  className="shrink-0 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Sending…"
                    : submitted
                      ? "Subscribed ✓"
                      : "Subscribe"}
                </button>
              </div>
              {error && (
                <p role="alert" className="text-sm leading-relaxed text-gold-light">
                  {error}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      openMailto(
                        "Newsletter Signup",
                        [["Email", email.trim()]],
                        "Please add this email address to the FAITH Foundation newsletter list."
                      )
                    }
                    className="font-bold underline underline-offset-2 hover:text-white"
                  >
                    Sign up by email instead
                  </button>
                  .
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5 sm:px-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              {/* WebP (22 KB) rather than the 407 KB PNG that was here: this
                  mark renders in the footer of every page, so the PNG was the
                  single heaviest avoidable download on the site. The PNG is
                  still the Open Graph image, where format support matters more
                  than transfer size. */}
              <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-cream ring-1 ring-green/30">
                <img
                  src="/Images/faith-foundation-logo.webp"
                  alt="FAITH Foundation logo"
                  width={80}
                  height={80}
                  loading="lazy"
                  decoding="async"
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
            {SOCIALS.length > 0 && (
              <div className="mt-5 flex gap-4">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={`FAITH Foundation on ${s.label}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
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
            )}
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              EIN 33-2640449 · Headquarters: Burnet, Texas
            </p>
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


