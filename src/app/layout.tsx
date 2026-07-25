import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
  alternates: { canonical: "/" },
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

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "FAITH Foundation",
  legalName:
    "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope",
  alternateName: "Foundation for Affordable Instruction and Tenancy Hope",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  foundingLocation: "Burnet, Texas",
  foundingDate: "2024",
  taxID: "EIN: 33-2640449",
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
  areaServed: "Texas",
  knowsAbout: [
    "affordable housing",
    "down payment assistance",
    "housing vouchers",
    "veteran housing",
    "reentry housing",
    "recovery housing",
  ],
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
        {/* Warm up the connection to the remote image host before any
            eager hero image on interior pages is discovered. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
            __html: JSON.stringify(BREADCRUMB_SCHEMA),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}


