import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import IntakeChat from "@/components/IntakeChat";

// Body / UI typeface — clean, highly legible humanist sans. Used in the
// above-the-fold hero headline, so it stays on the preload critical path.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display typeface — only renders in below-the-fold / decorative spots
// (drop-caps, oversized quote marks, footer wordmark, error pages), so we
// keep it OFF the preload critical path and ship only the weights we use.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "700", "900"],
  preload: false,
});

const SITE_URL = "https://www.faithfoundationsf.org";
const SITE_TITLE =
  "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope";
const SITE_DESCRIPTION =
  "FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas helping families across Texas achieve homeownership through down payment assistance vouchers.";
const OG_IMAGE = "/Images/faith-foundation-logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "FAITH Foundation",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FAITH Foundation logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/**
 * Organization schema.
 *
 * TRUTHFULNESS RULE: every field here must be independently verifiable — the
 * EIN against IRS Tax Exempt Organization Search, the address against the
 * Contact page and footer, the phone and email against what a visitor can
 * actually reach. Do not add `sameAs`, `award`, `member`, or aggregate rating
 * fields unless the underlying fact is real and public. `sameAs` is
 * deliberately absent: FAITH Foundation has no verified public social profiles
 * (see the SOCIALS note in src/components/SiteFooter.tsx).
 *
 * `taxID` carries the bare EIN. It previously read "EIN: 33-2640449", which put
 * a human label inside a machine-readable identifier field.
 */
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["NGO", "NonprofitOrganization"],
  "@id": `${SITE_URL}/#organization`,
  name: "FAITH Foundation",
  legalName:
    "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope",
  alternateName: "Foundation for Affordable Instruction and Tenancy Hope",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/Images/faith-foundation-logo.png`,
    caption: "FAITH Foundation logo",
  },
  image: `${SITE_URL}/Images/faith-foundation-logo.png`,
  foundingLocation: "Burnet, Texas",
  foundingDate: "2024",
  taxID: "33-2640449",
  naics: "624229",
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
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+1-888-497-6620",
      email: "info@faithfoundationsf.org",
      areaServed: "US-TX",
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "Housing assistance applications",
      telephone: "+1-888-497-6620",
      email: "info@faithfoundationsf.org",
      url: `${SITE_URL}/apply/`,
      areaServed: "US-TX",
      availableLanguage: ["English"],
    },
  ],
  areaServed: {
    "@type": "State",
    name: "Texas",
  },
  knowsAbout: [
    "affordable housing",
    "down payment assistance",
    "housing vouchers",
    "veteran housing",
    "reentry housing",
    "recovery housing",
  ],
} as const;

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "FAITH Foundation",
  description: SITE_DESCRIPTION,
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#organization` },
} as const;

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload the header logo — it is the LCP-adjacent brand mark on
            every page, so fetch it at high priority right away. */}
        <meta name="google-site-verification" content="MFmAYirdT2b-A8fwBlQZYA0I2NAPON88ebDLday6ww0" />
        <link rel="preload" as="image" href="/Images/faith-foundation-logo.webp" fetchPriority="high" />
        {/* The Unsplash preconnect/dns-prefetch hints were removed on
            2026-08-14: all photography is now self-hosted under /photos, so
            warming a connection to images.unsplash.com only cost a handshake
            for a host the site never contacts. */}
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased flex min-h-screen flex-col bg-cream text-charcoal`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(BREADCRUMB_SCHEMA),
          }}
        />
        {/* Keyboard users land here first; the header is a fixed overlay, so
            without this the only way to reach page content is to tab through
            the entire navigation on every route. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gold"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/* Public only — IntakeChat consults isInternalRoute and renders
            nothing on /admin and /login, like SiteHeader and SiteFooter. */}
        <IntakeChat />
      </body>
    </html>
  );
}



