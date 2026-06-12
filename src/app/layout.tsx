import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://faithfoundationsf.org"),
  title: "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope",
  description:
    "FAITH Foundation is a 501(c)(3) nonprofit in Burnet, Texas providing affordable instruction and tenancy hope through education and housing voucher programs.",
  alternates: { canonical: "/" },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "FAITH Foundation",
  legalName:
    "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope",
  alternateName: "Foundation for Affordable Instruction and Tenancy Hope",
  url: "https://faithfoundationsf.org",
  description:
    "FAITH Foundation is a 501(c)(3) nonprofit in Burnet, Texas providing affordable instruction and tenancy hope through education and housing voucher programs.",
  foundingLocation: "Burnet, Texas",
  nonprofitStatus: "Nonprofit501c3",
  email: "info@faithfoundationsf.org",
  telephone: "+1-888-497-6620",
  address: {
    "@type": "PostalAddress",
    streetAddress: "209 Surecast Drive, Suite 105",
    addressLocality: "Burnet",
    addressRegion: "TX",
    postalCode: "78611",
    addressCountry: "US",
  },
  areaServed: "Central Texas",
} as const;

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/partnership", label: "Partnership" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-white text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        <header className="sticky top-0 z-50 border-b-4 border-gold bg-navy text-white shadow-md">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gold font-bold text-navy"
              >
                F
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-wide text-gold">
                  FAITH Foundation
                </span>
                <span className="text-[11px] uppercase tracking-widest text-white/70">
                  Affordable Instruction &amp; Tenancy Hope
                </span>
              </span>
            </Link>
            <nav aria-label="Primary">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/donate"
                    className="rounded-md bg-gold px-4 py-2 font-semibold text-navy transition-colors hover:bg-gold-light"
                  >
                    Donate
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t-4 border-gold bg-navy text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h2 className="mb-3 text-lg font-bold text-gold">FAITH Foundation</h2>
              <p className="text-sm leading-relaxed text-white/80">
                Foundation for Affordable Instruction and Tenancy Hope — a
                501(c)(3) nonprofit organization dedicated to education and
                housing stability.
              </p>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-bold text-gold">Contact</h2>
              <address className="space-y-1 text-sm not-italic leading-relaxed text-white/80">
                <p>209 Surecast Drive, Suite 105</p>
                <p>Burnet, TX 78611</p>
                <p>
                  Phone:{" "}
                  <a href="tel:+18884976620" className="hover:text-gold">
                    888-497-6620
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:info@faithfoundationsf.org"
                    className="hover:text-gold"
                  >
                    info@faithfoundationsf.org
                  </a>
                </p>
                <p>
                  Web:{" "}
                  <a
                    href="https://faithfoundationsf.org"
                    className="hover:text-gold"
                  >
                    faithfoundationsf.org
                  </a>
                </p>
              </address>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-bold text-gold">Get Involved</h2>
              <ul className="space-y-1 text-sm text-white/80">
                <li>
                  <Link href="/donate" className="hover:text-gold">
                    Make a Donation
                  </Link>
                </li>
                <li>
                  <Link href="/apply" className="hover:text-gold">
                    Apply for Assistance
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-gold">
                    Volunteer With Us
                  </Link>
                </li>
                <li>
                  <Link href="/partnership" className="hover:text-gold">
                    Bright Box Homes Partnership
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-gold">
                    Upcoming Events
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-bold text-gold">Learn More</h2>
              <ul className="space-y-1 text-sm text-white/80">
                <li>
                  <Link href="/about" className="hover:text-gold">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-gold">
                    Programs
                  </Link>
                </li>
                <li>
                  <Link href="/impact" className="hover:text-gold">
                    Our Impact
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-gold">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-gold">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-gold">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-gold">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/financial-transparency" className="hover:text-gold">
                    Financial Transparency
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
            <p>
              © {new Date().getFullYear()} FAITH Foundation. A registered
              501(c)(3) nonprofit organization. All rights reserved.
            </p>
            <p className="mt-1">
              <Link href="/privacy-policy" className="hover:text-gold">
                Privacy Policy
              </Link>
              <span aria-hidden className="px-2">
                •
              </span>
              <Link href="/contact" className="hover:text-gold">
                Contact
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
