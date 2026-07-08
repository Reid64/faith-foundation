import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Body / UI typeface — clean, highly legible humanist sans.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display typeface — high-contrast didone serif for premium editorial headlines.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://faithfoundationsf.org"),
  title: "FAITH Foundation — Foundation for Affordable Instruction and Tenancy Hope",
  description:
    "FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas helping families across Texas achieve homeownership through down payment assistance vouchers.",
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
    "FAITH Foundation is a 501(c)(3) nonprofit based in Burnet, Texas helping families across Texas achieve homeownership through down payment assistance vouchers.",
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
  areaServed: "Texas",
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased flex min-h-screen flex-col bg-cream text-charcoal`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}


