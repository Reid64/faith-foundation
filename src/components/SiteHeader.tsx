"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/partnership", label: "Partnership" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[#F5F5F5] transition-shadow duration-300 ${
        solid ? "shadow-[0_6px_24px_-14px_rgba(0,0,0,0.45)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-0 sm:px-8">
        <Link href="/" className="group flex items-center" aria-label="FAITH Foundation home">
          <Image
            src="/Images/faith-foundation-logo.png"
            alt="FAITH Foundation logo"
            width={300}
            height={200}
            priority
            className="h-20 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-24 lg:h-28"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-green after:transition-all after:duration-300 hover:text-green ${
                  active
                    ? "text-green after:w-full"
                    : "text-charcoal after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/donate"
            className="rounded-full bg-green px-6 py-2.5 text-sm font-bold text-white shadow-green transition-all duration-300 hover:bg-green-dark hover:shadow-lg"
          >
            Donate
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-charcoal lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative block h-5 w-6">
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
                open ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-black/10 bg-[#F5F5F5] transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-black/5 py-3 text-sm font-semibold text-charcoal transition-colors hover:text-green"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="mt-4 rounded-full bg-green px-6 py-3 text-center text-sm font-bold text-white"
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}





